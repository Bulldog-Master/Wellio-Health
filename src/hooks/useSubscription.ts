import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

// SECURITY: Never expose Stripe IDs to client code
export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionFeature {
  feature_key: string;
  feature_value: string;
}

// Cache keys for localStorage
const CACHE_KEY_VIP = 'subscription_isVIP';
const CACHE_KEY_ADMIN = 'subscription_isAdmin';
const CACHE_KEY_TIER = 'subscription_tier';

// Read cached values for instant UI
const getCachedBoolean = (key: string): boolean => {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
};

const getCachedTier = (): SubscriptionTier => {
  try {
    const cached = localStorage.getItem(CACHE_KEY_TIER);
    if (cached === 'pro' || cached === 'enterprise') return cached;
    return 'free';
  } catch {
    return 'free';
  }
};

export const useSubscription = () => {
  // Initialize from cache for instant UI
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [features, setFeatures] = useState<SubscriptionFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVIP, setIsVIP] = useState(() => getCachedBoolean(CACHE_KEY_VIP));
  const [isAdmin, setIsAdmin] = useState(() => getCachedBoolean(CACHE_KEY_ADMIN));
  const [tier, setTier] = useState<SubscriptionTier>(() => getCachedTier());

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Clear cache on logout
        try {
          localStorage.removeItem(CACHE_KEY_VIP);
          localStorage.removeItem(CACHE_KEY_ADMIN);
          localStorage.removeItem(CACHE_KEY_TIER);
        } catch {}
        setIsVIP(false);
        setIsAdmin(false);
        setTier('free');
        setIsLoading(false);
        return;
      }

      // Check VIP/Admin status using secure database function
      const { data: hasVIP } = await supabase.rpc('has_active_vip', {
        _user_id: user.id
      });
      const vipStatus = hasVIP || false;
      setIsVIP(vipStatus);

      // Check admin status
      const { data: hasAdmin } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      const adminStatus = hasAdmin || false;
      setIsAdmin(adminStatus);

      // Cache the values for instant UI on next mount
      try {
        localStorage.setItem(CACHE_KEY_VIP, String(vipStatus));
        localStorage.setItem(CACHE_KEY_ADMIN, String(adminStatus));
      } catch {}

      // SECURITY: Only select safe fields, never expose Stripe IDs
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('id, user_id, tier, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
      }

      if (subData) {
        setSubscription(subData as Subscription);
        setTier(subData.tier as SubscriptionTier);
        
        // Cache tier
        try {
          localStorage.setItem(CACHE_KEY_TIER, subData.tier);
        } catch {}

        const { data: featuresData } = await supabase
          .from('subscription_features')
          .select('feature_key, feature_value')
          .eq('tier', subData.tier);

        if (featuresData) {
          setFeatures(featuresData);
        }
      } else {
        setTier('free');
        try {
          localStorage.setItem(CACHE_KEY_TIER, 'free');
        } catch {}
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeature = (featureKey: string): boolean => {
    // VIP and Admin users have access to all features
    if (isVIP || isAdmin) return true;
    
    const feature = features.find(f => f.feature_key === featureKey);
    return feature?.feature_value === 'true';
  };

  const getFeatureValue = (featureKey: string): string | null => {
    // VIP and Admin users get unlimited/max values
    if (isVIP || isAdmin) return 'unlimited';
    
    const feature = features.find(f => f.feature_key === featureKey);
    return feature?.feature_value || null;
  };

  return {
    subscription,
    features,
    isLoading,
    hasFeature,
    getFeatureValue,
    tier,
    isVIP,
    isAdmin,
    hasFullAccess: isVIP || isAdmin,
    refetch: fetchSubscription,
  };
};
