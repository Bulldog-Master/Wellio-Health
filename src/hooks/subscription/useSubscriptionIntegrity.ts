import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CACHE_KEY_VIP = 'subscription_isVIP';
const CACHE_KEY_ADMIN = 'subscription_isAdmin';
const CACHE_KEY_TIER = 'subscription_tier';
const INTEGRITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to validate localStorage subscription cache integrity
 * Compares cached values against backend and corrects any tampering
 * Defense-in-depth: Backend RLS policies are the primary enforcement
 */
export const useSubscriptionIntegrity = () => {
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    const validateIntegrity = async () => {
      const now = Date.now();
      
      // Throttle checks to avoid excessive API calls
      if (now - lastCheckRef.current < INTEGRITY_CHECK_INTERVAL) {
        return;
      }
      lastCheckRef.current = now;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get cached values
        const cachedVIP = localStorage.getItem(CACHE_KEY_VIP) === 'true';
        const cachedAdmin = localStorage.getItem(CACHE_KEY_ADMIN) === 'true';
        const cachedTier = localStorage.getItem(CACHE_KEY_TIER);

        // Validate against backend (parallel queries)
        const [vipResult, adminResult, subResult] = await Promise.all([
          supabase.rpc('has_active_vip', { _user_id: user.id }),
          supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
          supabase
            .from('subscriptions')
            .select('tier')
            .eq('user_id', user.id)
            .maybeSingle()
        ]);

        const actualVIP = vipResult.data || false;
        const actualAdmin = adminResult.data || false;
        const actualTier = subResult.data?.tier || 'free';

        // Detect and correct tampering
        let tamperingDetected = false;

        if (cachedVIP !== actualVIP) {
          console.warn('[Security] VIP status cache integrity check failed - correcting');
          localStorage.setItem(CACHE_KEY_VIP, String(actualVIP));
          tamperingDetected = true;
        }

        if (cachedAdmin !== actualAdmin) {
          console.warn('[Security] Admin status cache integrity check failed - correcting');
          localStorage.setItem(CACHE_KEY_ADMIN, String(actualAdmin));
          tamperingDetected = true;
        }

        if (cachedTier !== actualTier) {
          console.warn('[Security] Tier cache integrity check failed - correcting');
          localStorage.setItem(CACHE_KEY_TIER, actualTier);
          tamperingDetected = true;
        }

        if (tamperingDetected) {
          // Force page reload to reflect corrected values
          window.location.reload();
        }
      } catch (error) {
        // Silent fail - backend enforcement is primary security
        console.error('Integrity check error:', error);
      }
    };

    // Run on mount
    validateIntegrity();

    // Run periodically
    const interval = setInterval(validateIntegrity, INTEGRITY_CHECK_INTERVAL);

    // Run on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        validateIntegrity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};
