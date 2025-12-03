import { SubscriptionFeature, UserAddon, SubscriptionTier } from './types';

export const createFeatureAccessHelpers = (
  features: SubscriptionFeature[],
  userAddons: UserAddon[],
  tier: SubscriptionTier,
  isVIP: boolean,
  isAdmin: boolean
) => {
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
    hasFeature,
    getFeatureValue,
    hasAddon,
    hasAddonAccess,
    hasFullAccess: isVIP || isAdmin
  };
};
