/**
 * Test Runner Utility
 * Provides utilities for running and reporting test results
 */

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
  duration: number;
}

/**
 * Run a test and return the result
 */
export async function runTest(
  name: string,
  testFn: () => Promise<void> | void
): Promise<TestResult> {
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
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Run a test suite and return results
 */
export async function runTestSuite(
  name: string,
  tests: Array<{ name: string; fn: () => Promise<void> | void }>
): Promise<TestSuite> {
  const startTime = performance.now();
  const results: TestResult[] = [];
  
  for (const test of tests) {
    const result = await runTest(test.name, test.fn);
    results.push(result);
  }
  
  return {
    name,
    tests: results,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    duration: performance.now() - startTime,
  };
}

/**
 * Format test results for console output
 */
export function formatTestResults(suite: TestSuite): string {
  const lines: string[] = [];
  
  lines.push(`\n📋 ${suite.name}`);
  lines.push(`${'─'.repeat(40)}`);
  
  for (const test of suite.tests) {
    const icon = test.passed ? '✅' : '❌';
    const duration = test.duration.toFixed(2);
    lines.push(`${icon} ${test.name} (${duration}ms)`);
    
    if (test.error) {
      lines.push(`   └─ Error: ${test.error}`);
    }
  }
  
  lines.push(`${'─'.repeat(40)}`);
  lines.push(`Passed: ${suite.passed} | Failed: ${suite.failed} | Duration: ${suite.duration.toFixed(2)}ms`);
  
  return lines.join('\n');
}

/**
 * Log test results to console
 */
export function logTestSuiteResults(suite: TestSuite): void {
  console.log(formatTestResults(suite));
}

/**
 * Assert helper for tests
 */
export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Assert equality helper
 */
export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

/**
 * Assert truthy helper
 */
export function assertTruthy(value: unknown, message?: string): void {
  if (!value) {
    throw new Error(message || `Expected truthy value, got ${value}`);
  }
}

/**
 * Assert array contains helper
 */
export function assertContains<T>(array: T[], item: T, message?: string): void {
  if (!array.includes(item)) {
    throw new Error(message || `Expected array to contain ${JSON.stringify(item)}`);
  }
}
