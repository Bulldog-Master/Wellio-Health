/**
 * Unified Monitoring Module
 * Combines performance, analytics, and error tracking
 */

import { initPerformanceMonitoring, getWebVitals, logPerformanceSummary } from './performanceMonitoring';
import { initAnalytics, trackEvent, trackPageView, identifyUser, resetIdentity } from './analytics';
import { logError, setupGlobalErrorHandlers } from './errorTracking';

export interface MonitoringConfig {
  enablePerformance: boolean;
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  debug: boolean;
}

const defaultConfig: MonitoringConfig = {
  enablePerformance: true,
  enableAnalytics: true,
  enableErrorTracking: true,
  debug: import.meta.env.DEV,
};

let initialized = false;

/**
 * Initialize all monitoring systems
 */
export function initMonitoring(config: Partial<MonitoringConfig> = {}): void {
  if (initialized) return;
  
  const mergedConfig = { ...defaultConfig, ...config };
  
  if (mergedConfig.debug) {
    console.log('🔍 Initializing monitoring systems...');
  }
  
  // Performance monitoring
  if (mergedConfig.enablePerformance) {
    initPerformanceMonitoring();
    if (mergedConfig.debug) {
      console.log('✓ Performance monitoring enabled');
    }
  }
  
  // Analytics
  if (mergedConfig.enableAnalytics) {
    initAnalytics();
    if (mergedConfig.debug) {
      console.log('✓ Analytics enabled');
    }
  }
  
  // Error tracking
  if (mergedConfig.enableErrorTracking) {
    setupGlobalErrorHandlers();
    if (mergedConfig.debug) {
      console.log('✓ Error tracking enabled');
    }
  }
  
  initialized = true;
  
  if (mergedConfig.debug) {
    console.log('✓ All monitoring systems initialized');
  }
}

/**
 * Get current health status
 */
export function getHealthStatus(): {
  performance: 'good' | 'needs-improvement' | 'poor' | 'unknown';
  errorRate: 'low' | 'medium' | 'high';
  vitals: ReturnType<typeof getWebVitals>;
} {
  const vitals = getWebVitals();
  
  // Determine overall performance status
  let performance: 'good' | 'needs-improvement' | 'poor' | 'unknown' = 'unknown';
  
  const ratings = Object.values(vitals)
    .filter(v => v !== undefined)
    .map(v => v!.rating);
  
  if (ratings.length > 0) {
    const goodCount = ratings.filter(r => r === 'good').length;
    const poorCount = ratings.filter(r => r === 'poor').length;
    
    if (poorCount > ratings.length / 2) {
      performance = 'poor';
    } else if (goodCount > ratings.length / 2) {
      performance = 'good';
    } else {
      performance = 'needs-improvement';
    }
  }
  
  return {
    performance,
    errorRate: 'low', // Would be calculated from error logs in production
    vitals,
  };
}

/**
 * Log a performance summary to console
 */
export function logMonitoringSummary(): void {
  console.group('📊 Monitoring Summary');
  
  const health = getHealthStatus();
  console.log('Overall Performance:', health.performance);
  console.log('Error Rate:', health.errorRate);
  
  logPerformanceSummary();
  
  console.groupEnd();
}

// Re-export commonly used functions
export {
  trackEvent,
  trackPageView,
  identifyUser,
  resetIdentity,
  logError,
  getWebVitals,
};

// Export Analytics helper object
export { Analytics } from './analytics';
