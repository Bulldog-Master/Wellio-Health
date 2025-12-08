import { useState, useCallback } from 'react';

interface LoadingStates {
  [key: string]: boolean;
}

/**
 * Hook for managing multiple loading states with unique keys
 * Useful for tracking loading states of different operations simultaneously
 */
export function useLoadingState() {
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);

  const isLoading = useCallback(
    (key: string): boolean => {
      return loadingStates[key] || false;
    },
    [loadingStates]
  );

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(loadingStates).some(state => state);
  }, [loadingStates]);

  /**
   * Wraps an async function with automatic loading state management
   * @param key - Unique key for this loading state
   * @param fn - Async function to execute
   */
  const withLoading = useCallback(
    async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
      setLoading(key, true);
      try {
        return await fn();
      } finally {
        setLoading(key, false);
      }
    },
    [setLoading]
  );

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    withLoading,
    loadingStates,
  };
}

/**
 * Simple loading state hook for a single operation
 */
export function useSimpleLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      setIsLoading(true);
      try {
        return await fn();
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    setIsLoading,
    withLoading,
  };
}
