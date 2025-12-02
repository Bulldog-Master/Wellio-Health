import { useEffect, useRef, useState, useMemo } from 'react';

/**
 * Hook to track component render counts (dev only)
 */
export function useRenderCount(componentName: string): number {
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug(`[Render] ${componentName}: ${renderCount.current}`);
    }
  });
  
  return renderCount.current;
}

/**
 * Hook to defer non-critical updates for better perceived performance
 */
export function useDeferredValue<T>(value: T, delay: number = 100): T {
  const [deferredValue, setDeferredValue] = useState(value);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDeferredValue(value);
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [value, delay]);
  
  return deferredValue;
}

/**
 * Hook to batch state updates for performance
 */
export function useBatchedState<T extends Record<string, any>>(
  initialState: T
): [T, (updates: Partial<T>) => void] {
  const [state, setState] = useState(initialState);
  
  const batchedSetState = useMemo(() => {
    return (updates: Partial<T>) => {
      setState(prev => ({ ...prev, ...updates }));
    };
  }, []);
  
  return [state, batchedSetState];
}

/**
 * Hook to detect if component is in viewport for lazy rendering
 */
export function useInViewport(threshold: number = 0.1): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold }
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [threshold]);
  
  return [ref, isInViewport];
}

/**
 * Hook to track and report slow renders
 */
export function useSlowRenderWarning(componentName: string, threshold: number = 16): void {
  const startTime = useRef<number>(performance.now());
  
  useEffect(() => {
    if (import.meta.env.DEV) {
      const duration = performance.now() - startTime.current;
      if (duration > threshold) {
        console.warn(`[SlowRender] ${componentName} took ${duration.toFixed(2)}ms`);
      }
    }
  });
  
  startTime.current = performance.now();
}
