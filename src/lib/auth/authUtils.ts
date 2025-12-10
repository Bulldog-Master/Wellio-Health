import { supabase } from "@/integrations/supabase/client";

/**
 * Pre-fetch and cache subscription status for instant Premium Hub display
 */
export const prefetchSubscriptionStatus = async (userId: string): Promise<void> => {
  try {
    // Run both RPC calls in parallel for speed
    const [vipResult, adminResult] = await Promise.all([
      supabase.rpc('has_active_vip', { _user_id: userId }),
      supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })
    ]);
    
    const hasVIP = vipResult.data || false;
    const hasAdmin = adminResult.data || false;
    
    // Cache for instant display on navigation
    localStorage.setItem('subscription_isVIP', String(hasVIP));
    localStorage.setItem('subscription_isAdmin', String(hasAdmin));
    
    // Also fetch tier
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single();
    
    localStorage.setItem('subscription_tier', subData?.tier || 'free');
  } catch (error) {
    console.error('Error prefetching subscription:', error);
  }
};

/**
 * Helper to prefetch with timeout (max 400ms wait)
 */
export const prefetchWithTimeout = (userId: string): Promise<void> => {
  return Promise.race([
    prefetchSubscriptionStatus(userId),
    new Promise<void>(resolve => setTimeout(resolve, 400))
  ]);
};
