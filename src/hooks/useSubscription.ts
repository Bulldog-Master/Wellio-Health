import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
}

export interface SubscriptionFeature {
  feature_key: string;
  feature_value: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [features, setFeatures] = useState<SubscriptionFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
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
    const feature = features.find(f => f.feature_key === featureKey);
    return feature?.feature_value === 'true';
  };

  const getFeatureValue = (featureKey: string): string | null => {
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
    refetch: fetchSubscription,
  };
};
