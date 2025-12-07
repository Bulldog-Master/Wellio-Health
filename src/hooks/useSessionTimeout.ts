import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useSecurityAudit } from './useSecurityAudit';

interface SessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: () => void;
}

const DEFAULT_TIMEOUT_MINUTES = 30;
const DEFAULT_WARNING_MINUTES = 5;

export const useSessionTimeout = (options: SessionTimeoutOptions = {}) => {
  const {
    timeoutMinutes = DEFAULT_TIMEOUT_MINUTES,
    warningMinutes = DEFAULT_WARNING_MINUTES,
    onTimeout,
    onWarning,
  } = options;

  const { toast } = useToast();
  const { logSecurityEvent } = useSecurityAudit();
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const hasWarnedRef = useRef<boolean>(false);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }, []);

  const handleTimeout = useCallback(async () => {
    clearTimers();
    
    // Log security event
    await logSecurityEvent({
      action: 'session_timeout',
      resource_type: 'auth',
      severity: 'medium',
      metadata: {
        inactivity_minutes: timeoutMinutes,
        last_activity: new Date(lastActivityRef.current).toISOString(),
      },
    });

    // Clear session data
    sessionStorage.clear();
    localStorage.removeItem('subscription_isVIP');
    localStorage.removeItem('subscription_isAdmin');
    localStorage.removeItem('subscription_tier');

    toast({
      title: 'Session Expired',
      description: 'You have been logged out due to inactivity.',
      variant: 'destructive',
    });

    // Sign out
    await supabase.auth.signOut();
    
    onTimeout?.();
  }, [clearTimers, logSecurityEvent, timeoutMinutes, toast, onTimeout]);

  const handleWarning = useCallback(() => {
    if (hasWarnedRef.current) return;
    hasWarnedRef.current = true;

    toast({
      title: 'Session Expiring Soon',
      description: `Your session will expire in ${warningMinutes} minutes due to inactivity. Move your mouse or click to stay logged in.`,
    });

    onWarning?.();
  }, [warningMinutes, toast, onWarning]);

  const resetTimers = useCallback(() => {
    clearTimers();
    hasWarnedRef.current = false;
    lastActivityRef.current = Date.now();

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

    warningRef.current = setTimeout(handleWarning, warningMs);
    timeoutRef.current = setTimeout(handleTimeout, timeoutMs);
  }, [clearTimers, timeoutMinutes, warningMinutes, handleWarning, handleTimeout]);

  const extendSession = useCallback(() => {
    resetTimers();
    if (hasWarnedRef.current) {
      toast({
        title: 'Session Extended',
        description: 'Your session has been extended.',
      });
      hasWarnedRef.current = false;
    }
  }, [resetTimers, toast]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      const now = Date.now();
      // Only reset if at least 10 seconds have passed (debounce)
      if (now - lastActivityRef.current > 10000) {
        resetTimers();
      }
    };

    // Start timers
    resetTimers();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check session on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const inactiveTime = Date.now() - lastActivityRef.current;
        if (inactiveTime > timeoutMinutes * 60 * 1000) {
          handleTimeout();
        } else {
          resetTimers();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimers();
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [clearTimers, resetTimers, handleTimeout, timeoutMinutes]);

  return {
    extendSession,
    resetTimers,
    getTimeRemaining: () => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = (timeoutMinutes * 60 * 1000) - elapsed;
      return Math.max(0, Math.floor(remaining / 1000));
    },
  };
};
