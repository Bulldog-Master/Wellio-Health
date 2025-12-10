import { supabase } from "@/integrations/supabase/client";

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: Date;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

/**
 * Log errors to the backend for monitoring and debugging
 */
export async function logError(error: Error, errorInfo?: { componentStack?: string }, context?: Record<string, any>): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      userId: user?.id,
      severity: determineSeverity(error),
      context,
    };

    // Log to backend
    await supabase.from('error_logs').insert({
      user_id: user?.id || null,
      error_message: errorReport.message,
      error_stack: errorReport.stack,
      component_stack: errorReport.componentStack,
      url: errorReport.url,
      user_agent: errorReport.userAgent,
      severity: errorReport.severity,
      context: errorReport.context || {},
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[Error Tracking]', errorReport);
    }
  } catch (loggingError) {
    // Fail silently to not disrupt user experience
    console.error('[Error Tracking Failed]', loggingError);
  }
}

/**
 * Determine error severity based on error type and message
 */
function determineSeverity(error: Error): ErrorReport['severity'] {
  const message = error.message.toLowerCase();
  
  // Critical errors that break core functionality
  if (
    message.includes('auth') ||
    message.includes('network') ||
    message.includes('failed to fetch') ||
    error.name === 'TypeError' ||
    error.name === 'ReferenceError'
  ) {
    return 'critical';
  }
  
  // High severity errors
  if (
    message.includes('database') ||
    message.includes('payment') ||
    message.includes('security')
  ) {
    return 'high';
  }
  
  // Medium severity errors
  if (
    message.includes('validation') ||
    message.includes('not found') ||
    message.includes('permission')
  ) {
    return 'medium';
  }
  
  // Default to low severity
  return 'low';
}

/**
 * Handle global unhandled promise rejections
 */
export function setupGlobalErrorHandlers(): void {
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    logError(error, undefined, {
      type: 'unhandledRejection',
      promise: 'Promise rejection not caught',
    });
  });

  window.addEventListener('error', (event) => {
    logError(
      new Error(event.message),
      undefined,
      {
        type: 'windowError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  });
}
