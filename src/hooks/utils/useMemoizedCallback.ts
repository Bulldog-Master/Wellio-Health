import { useCallback, useRef } from 'react';

/**
 * Custom hook that returns a memoized callback that only changes when dependencies change
 * Optimized for performance-critical scenarios
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef<T>(callback);
  
  // Update ref when callback changes
  callbackRef.current = callback;
  
  // Return stable callback reference
  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    deps
  );
}

/**
 * Debounced callback hook for search/filter operations
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

/**
 * Throttled callback hook for scroll/resize operations
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const lastRunRef = useRef<number>(0);
  const lastArgsRef = useRef<any[]>([]);
  
  return useCallback(
    ((...args) => {
      const now = Date.now();
      lastArgsRef.current = args;
      
      if (now - lastRunRef.current >= limit) {
        lastRunRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, limit]
  );
}
