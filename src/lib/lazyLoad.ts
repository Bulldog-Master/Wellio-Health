import { lazy, ComponentType } from 'react';

/**
 * Enhanced lazy loading with retry logic for better reliability
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3,
  delay = 1000
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | undefined;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Import failed');
        
        // Wait before retrying (exponential backoff)
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  });
}

/**
 * Preload a component for faster navigation
 */
export function preloadComponent(importFn: () => Promise<{ default: ComponentType<any> }>): void {
  // Use requestIdleCallback if available, otherwise setTimeout
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => importFn());
  } else {
    setTimeout(importFn, 100);
  }
}

/**
 * Create a preloadable lazy component
 */
export function createPreloadableComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  const LazyComponent = lazyWithRetry(importFn);
  
  return {
    Component: LazyComponent,
    preload: () => preloadComponent(importFn),
  };
}
