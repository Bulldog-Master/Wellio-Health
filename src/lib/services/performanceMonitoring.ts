/**
 * Performance Monitoring Utility
 * Tracks Core Web Vitals and custom metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface WebVitals {
  LCP?: PerformanceMetric; // Largest Contentful Paint
  FID?: PerformanceMetric; // First Input Delay
  CLS?: PerformanceMetric; // Cumulative Layout Shift
  FCP?: PerformanceMetric; // First Contentful Paint
  TTFB?: PerformanceMetric; // Time to First Byte
  INP?: PerformanceMetric; // Interaction to Next Paint
}

const webVitals: WebVitals = {};

// Rating thresholds based on Google's recommendations
const thresholds = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(name: keyof typeof thresholds, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Track a web vital metric
 */
export function trackWebVital(name: keyof WebVitals, value: number): void {
  const metric: PerformanceMetric = {
    name,
    value,
    rating: getRating(name as keyof typeof thresholds, value),
    timestamp: Date.now(),
  };
  
  webVitals[name] = metric;
  
  // Log in development
  if (import.meta.env.DEV) {
    const color = metric.rating === 'good' ? '🟢' : metric.rating === 'needs-improvement' ? '🟡' : '🔴';
    console.log(`${color} ${name}: ${value.toFixed(2)} (${metric.rating})`);
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Track TTFB
  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigationEntry) {
    trackWebVital('TTFB', navigationEntry.responseStart - navigationEntry.requestStart);
  }

  // Track FCP
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        trackWebVital('FCP', entry.startTime);
      }
    }
  });
  
  try {
    observer.observe({ type: 'paint', buffered: true });
  } catch {
    // Browser doesn't support this observer type
  }

  // Track LCP
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      trackWebVital('LCP', lastEntry.startTime);
    }
  });
  
  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // Browser doesn't support this observer type
  }

  // Track CLS
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    trackWebVital('CLS', clsValue);
  });
  
  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // Browser doesn't support this observer type
  }

  // Track FID/INP
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      trackWebVital('FID', (entry as any).processingStart - entry.startTime);
    }
  });
  
  try {
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch {
    // Browser doesn't support this observer type
  }
}

/**
 * Get all collected web vitals
 */
export function getWebVitals(): WebVitals {
  return { ...webVitals };
}

/**
 * Track custom timing metric
 */
export function trackTiming(name: string, duration: number): void {
  if (import.meta.env.DEV) {
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
  }
}

/**
 * Create a performance mark for measuring durations
 */
export function startMeasure(name: string): () => void {
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    trackTiming(name, duration);
    return duration;
  };
}

/**
 * Log a performance summary
 */
export function logPerformanceSummary(): void {
  console.group('📊 Performance Summary');
  
  Object.entries(webVitals).forEach(([name, metric]) => {
    if (metric) {
      const color = metric.rating === 'good' ? '🟢' : metric.rating === 'needs-improvement' ? '🟡' : '🔴';
      console.log(`${color} ${name}: ${metric.value.toFixed(2)} (${metric.rating})`);
    }
  });
  
  console.groupEnd();
}
