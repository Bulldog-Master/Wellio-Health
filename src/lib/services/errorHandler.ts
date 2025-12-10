import { toast } from "sonner";

/**
 * Global error handler for API and edge function errors
 */
export const handleApiError = (error: unknown, customMessage?: string) => {
  console.error("API Error:", error);

  if (error instanceof Response) {
    if (error.status === 429) {
      toast.error("Rate limit exceeded. Please try again later.");
      return;
    }
    if (error.status === 402) {
      toast.error("Service temporarily unavailable. Please contact support.");
      return;
    }
  }

  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  toast.error(customMessage || message);
};

/**
 * Handle network errors and offline state
 */
export const handleNetworkError = () => {
  if (!navigator.onLine) {
    toast.error("You're offline. Some features may be limited.");
    return true;
  }
  return false;
};

/**
 * Global error boundary handler
 */
export const logError = (error: Error, errorInfo: { componentStack: string }) => {
  console.error("Error Boundary caught:", error, errorInfo);
  
  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // TODO: Send to error tracking service (e.g., Sentry)
  }
};
