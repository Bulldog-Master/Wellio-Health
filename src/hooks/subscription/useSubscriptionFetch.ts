import { supabase } from '@/integrations/supabase/client';
import { 
  Subscription, 
  SubscriptionFeature, 
  UserAddon, 
  SubscriptionTier,
  CACHE_KEY_VIP,
  CACHE_KEY_ADMIN 
} from './types';
import { setCachedBoolean, setCachedTier, clearSubscriptionCache } from './useSubscriptionCache';

interface FetchResult {
  subscription: Subscription | null;
  features: SubscriptionFeature[];
  userAddons: UserAddon[];
  isVIP: boolean;
  isAdmin: boolean;
  tier: SubscriptionTier;
}

export const fetchSubscriptionData = async (): Promise<FetchResult | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    clearSubscriptionCache();
    return {
      subscription: null,
      features: [],
      userAddons: [],
      isVIP: false,
      isAdmin: false,
      tier: 'free'
    };
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

  // Transform user addons
  let userAddons: UserAddon[] = [];
  if (addonsResult.data) {
    userAddons = addonsResult.data
      .filter((a: any) => a.subscription_addons?.addon_key)
      .map((a: any) => ({
        addon_key: a.subscription_addons.addon_key,
        status: a.status || 'active'
      }));
  }

  const vipStatus = vipResult.data || false;
  const adminStatus = adminResult.data || false;

  // Cache the values
  setCachedBoolean(CACHE_KEY_VIP, vipStatus);
  setCachedBoolean(CACHE_KEY_ADMIN, adminStatus);

  let subscription: Subscription | null = null;
  let features: SubscriptionFeature[] = [];
  let tier: SubscriptionTier = 'free';

  if (subResult.error && subResult.error.code !== 'PGRST116') {
    console.error('Error fetching subscription:', subResult.error);
  }

  if (subResult.data) {
    subscription = subResult.data as Subscription;
    tier = subResult.data.tier as SubscriptionTier;
    setCachedTier(tier);

    const { data: featuresData } = await supabase
      .from('subscription_features')
      .select('feature_key, feature_value')
      .eq('tier', subResult.data.tier);

    if (featuresData) {
      features = featuresData;
    }
  } else {
    setCachedTier('free');
  }

  return {
    subscription,
    features,
    userAddons,
    isVIP: vipStatus,
    isAdmin: adminStatus,
    tier
  };
};
