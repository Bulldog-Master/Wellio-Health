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

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [features, setFeatures] = useState<SubscriptionFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVIP, setIsVIP] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check VIP/Admin status using secure database function
      const { data: hasVIP } = await supabase.rpc('has_active_vip', {
        _user_id: user.id
      });
      setIsVIP(hasVIP || false);

      // Check admin status
      const { data: hasAdmin } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      setIsAdmin(hasAdmin || false);

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

        const { data: featuresData } = await supabase
          .from('subscription_features')
          .select('feature_key, feature_value')
          .eq('tier', subData.tier);

        if (featuresData) {
          setFeatures(featuresData);
        }
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
    tier: subscription?.tier || 'free',
    isVIP,
    isAdmin,
    hasFullAccess: isVIP || isAdmin,
    refetch: fetchSubscription,
  };
};
