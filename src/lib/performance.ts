/**
 * Performance monitoring utilities
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initObservers();
  }

  private initObservers() {
    // Monitor Core Web Vitals
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        this.observers.push(lcpObserver);

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as PerformanceEventTiming;
            this.recordMetric('FID', fidEntry.processingStart - fidEntry.startTime);
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
        this.observers.push(fidObserver);

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              this.recordMetric('CLS', clsValue);
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('Performance observers not fully supported:', e);
      }
    }
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
    };
    
    this.metrics.push(metric);
    console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);

    // In production, send to analytics service
    if (import.meta.env.PROD) {
      // TODO: Send to analytics service
    }
  }

  /**
   * Measure execution time of a function
   */
  async measure<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration);
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Cleanup observers
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook-friendly wrapper for measuring component render time
 */
export const measureRender = (componentName: string) => {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    performanceMonitor.recordMetric(`render_${componentName}`, duration);
  };
};
