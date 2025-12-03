export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

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

export interface SubscriptionState {
  subscription: Subscription | null;
  features: SubscriptionFeature[];
  userAddons: UserAddon[];
  isLoading: boolean;
  isVIP: boolean;
  isAdmin: boolean;
  tier: SubscriptionTier;
}

// Cache keys for localStorage
export const CACHE_KEY_VIP = 'subscription_isVIP';
export const CACHE_KEY_ADMIN = 'subscription_isAdmin';
export const CACHE_KEY_TIER = 'subscription_tier';
