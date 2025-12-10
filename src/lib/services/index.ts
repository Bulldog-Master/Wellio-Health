/**
 * Services Module - Barrel Export
 * 
 * Application-level services for monitoring, analytics, and error tracking
 */

// Performance monitoring
export {
  trackWebVital,
  initPerformanceMonitoring,
  getWebVitals,
  logPerformanceSummary,
} from './performanceMonitoring';

// Analytics
export {
  initAnalytics,
  trackEvent,
  trackPageView,
  identifyUser,
  resetIdentity,
} from './analytics';

// Error tracking (database logging)
export {
  logError as logErrorToDatabase,
  setupGlobalErrorHandlers,
  type ErrorReport,
} from './errorTracking';

// Error handler utilities
export {
  handleApiError,
  handleNetworkError,
  logError as logErrorBoundary,
} from './errorHandler';

// Unified monitoring
export {
  initMonitoring,
  type MonitoringConfig,
} from './monitoring';
