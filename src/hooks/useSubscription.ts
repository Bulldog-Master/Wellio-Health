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

export interface UserAddon {
  addon_key: string;
  status: string;
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
  const [userAddons, setUserAddons] = useState<UserAddon[]>([]);
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

      // Run all queries in parallel for faster loading
      const [vipResult, adminResult, subResult, addonsResult] = await Promise.all([
        supabase.rpc('has_active_vip', { _user_id: user.id }),
        supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
        supabase
          .from('subscriptions')
          .select('id, user_id, tier, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('user_addons')
          .select('addon_id, status, subscription_addons(addon_key)')
          .eq('user_id', user.id)
          .eq('status', 'active')
      ]);
      
      // Set user addons - transform to include addon_key from joined table
      if (addonsResult.data) {
        const transformedAddons = addonsResult.data
          .filter((a: any) => a.subscription_addons?.addon_key)
          .map((a: any) => ({
            addon_key: a.subscription_addons.addon_key,
            status: a.status || 'active'
          }));
        setUserAddons(transformedAddons);
      }

      const vipStatus = vipResult.data || false;
      const adminStatus = adminResult.data || false;
      
      setIsVIP(vipStatus);
      setIsAdmin(adminStatus);

      // Cache the values for instant UI on next mount
      try {
        localStorage.setItem(CACHE_KEY_VIP, String(vipStatus));
        localStorage.setItem(CACHE_KEY_ADMIN, String(adminStatus));
      } catch {}

      if (subResult.error && subResult.error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subResult.error);
      }

      if (subResult.data) {
        setSubscription(subResult.data as Subscription);
        setTier(subResult.data.tier as SubscriptionTier);
        
        // Cache tier
        try {
          localStorage.setItem(CACHE_KEY_TIER, subResult.data.tier);
        } catch {}

        const { data: featuresData } = await supabase
          .from('subscription_features')
          .select('feature_key, feature_value')
          .eq('tier', subResult.data.tier);

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

  const hasAddon = (addonKey: string): boolean => {
    // VIP and Admin users have access to all addons
    if (isVIP || isAdmin) return true;
    
    return userAddons.some(a => a.addon_key === addonKey && a.status === 'active');
  };

  const hasAddonAccess = (addonKey: string): boolean => {
    // Check if user has addon OR has premium tier OR is VIP/Admin
    if (isVIP || isAdmin) return true;
    if (tier === 'pro' || tier === 'enterprise') return true;
    return hasAddon(addonKey);
  };

  return {
    subscription,
    features,
    userAddons,
    isLoading,
    hasFeature,
    getFeatureValue,
    hasAddon,
    hasAddonAccess,
    tier,
    isVIP,
    isAdmin,
    hasFullAccess: isVIP || isAdmin,
    refetch: fetchSubscription,
  };
};
