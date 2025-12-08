import { useCallback } from 'react';
import { useToast } from '../ui/use-toast';
import { logError } from '@/lib/errorTracking';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  toastTitle?: string;
  context?: Record<string, any>;
  onError?: (error: Error) => void;
}

/**
 * Hook for consistent error handling across the application
 * Logs errors and optionally shows user-friendly toast messages
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { toast } = useToast();
  const {
    showToast = true,
    toastTitle = 'Error',
    context,
    onError,
  } = options;

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      const err = error instanceof Error ? error : new Error(String(error));

      // Log error to backend
      logError(err, undefined, context);

      // Call custom error handler
      onError?.(err);

      // Show toast notification
      if (showToast) {
        toast({
          title: toastTitle,
          description: customMessage || err.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
      }

      // Log to console in development
      if (import.meta.env.DEV) {
        console.error('[useErrorHandler]', err);
      }
    },
    [toast, showToast, toastTitle, context, onError]
  );

  /**
   * Wraps an async function with error handling
   */
  const wrapAsync = useCallback(
    <T extends (...args: any[]) => Promise<any>>(fn: T): T => {
      return (async (...args: Parameters<T>) => {
        try {
          return await fn(...args);
        } catch (error) {
          handleError(error);
          throw error; // Re-throw to allow caller to handle if needed
        }
      }) as T;
    },
    [handleError]
  );

  /**
   * Safely executes an async function with error handling
   * Returns [error, data] tuple similar to Go error handling
   */
  const safeAsync = useCallback(
    async <T>(
      fn: () => Promise<T>
    ): Promise<[Error | null, T | null]> => {
      try {
        const data = await fn();
        return [null, data];
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        handleError(err);
        return [err, null];
      }
    },
    [handleError]
  );

  return {
    handleError,
    wrapAsync,
    safeAsync,
  };
}
