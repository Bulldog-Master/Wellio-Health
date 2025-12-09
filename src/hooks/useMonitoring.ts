import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackEvent } from '@/lib/monitoring';

/**
 * Hook to automatically track page views and provide event tracking
 */
export function useMonitoring() {
  const location = useLocation();

  // Track page views on route change
  useEffect(() => {
    const title = document.title || 'Wellio Health';
    trackPageView(location.pathname, title);
  }, [location.pathname]);

  return {
    trackEvent,
    trackPageView,
  };
}

/**
 * Hook for tracking component-level performance
 */
export function useComponentPerformance(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      if (duration > 100) {
        trackEvent('slow_component_mount', {
          component: componentName,
          duration: Math.round(duration),
        });
      }
    };
  }, [componentName]);
}
