// Testing utilities for critical flow validation

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  totalDuration: number;
}

/**
 * Run a simple health check on core app functionality
 */
export async function runHealthCheck(): Promise<TestSuite> {
  const results: TestResult[] = [];
  const startTime = performance.now();

  // Test 1: LocalStorage availability
  results.push(await runTest('LocalStorage Available', async () => {
    localStorage.setItem('_healthcheck', 'test');
    const value = localStorage.getItem('_healthcheck');
    localStorage.removeItem('_healthcheck');
    if (value !== 'test') throw new Error('LocalStorage not working');
  }));

  // Test 2: IndexedDB availability (for PWA)
  results.push(await runTest('IndexedDB Available', async () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('_healthcheck', 1);
      request.onerror = () => reject(new Error('IndexedDB not available'));
      request.onsuccess = () => {
        request.result.close();
        indexedDB.deleteDatabase('_healthcheck');
        resolve();
      };
    });
  }));

  // Test 3: Service Worker registration
  results.push(await runTest('Service Worker Supported', async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }
  }));

  // Test 4: Fetch API
  results.push(await runTest('Fetch API Available', async () => {
    if (typeof fetch !== 'function') {
      throw new Error('Fetch API not available');
    }
  }));

  // Test 5: Crypto API (for encryption)
  results.push(await runTest('Crypto API Available', async () => {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Crypto API not available');
    }
  }));

  const endTime = performance.now();
  const passed = results.filter(r => r.passed).length;

  return {
    name: 'Health Check',
    tests: results,
    passed,
    failed: results.length - passed,
    totalDuration: endTime - startTime,
  };
}

/**
 * Run a single test with timing and error handling
 */
async function runTest(name: string, testFn: () => Promise<void> | void): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    await testFn();
    return {
      name,
      passed: true,
      duration: performance.now() - startTime,
    };
  } catch (error) {
    return {
      name,
      passed: false,
      duration: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Log test results to console in a formatted way
 */
export function logTestResults(suite: TestSuite): void {
  console.group(`📋 ${suite.name}`);
  console.log(`Total: ${suite.tests.length} | ✅ Passed: ${suite.passed} | ❌ Failed: ${suite.failed}`);
  console.log(`Duration: ${suite.totalDuration.toFixed(2)}ms`);
  
  suite.tests.forEach(test => {
    if (test.passed) {
      console.log(`  ✅ ${test.name} (${test.duration.toFixed(2)}ms)`);
    } else {
      console.error(`  ❌ ${test.name}: ${test.error}`);
    }
  });
  
  console.groupEnd();
}

/**
 * Check if the app is running in a capable environment
 */
export function checkBrowserCapabilities(): Record<string, boolean> {
  return {
    localStorage: typeof localStorage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    indexedDB: typeof indexedDB !== 'undefined',
    serviceWorker: 'serviceWorker' in navigator,
    webCrypto: !!(window.crypto && window.crypto.subtle),
    webGL: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    })(),
    notifications: 'Notification' in window,
    geolocation: 'geolocation' in navigator,
    mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
  };
}
