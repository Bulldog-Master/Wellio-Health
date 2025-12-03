import { SubscriptionTier, CACHE_KEY_VIP, CACHE_KEY_ADMIN, CACHE_KEY_TIER } from './types';

export const getCachedBoolean = (key: string): boolean => {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
};

export const getCachedTier = (): SubscriptionTier => {
  try {
    const cached = localStorage.getItem(CACHE_KEY_TIER);
    if (cached === 'pro' || cached === 'enterprise') return cached;
    return 'free';
  } catch {
    return 'free';
  }
};

export const setCachedBoolean = (key: string, value: boolean): void => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Ignore localStorage errors
  }
};

export const setCachedTier = (tier: SubscriptionTier): void => {
  try {
    localStorage.setItem(CACHE_KEY_TIER, tier);
  } catch {
    // Ignore localStorage errors
  }
};

export const clearSubscriptionCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY_VIP);
    localStorage.removeItem(CACHE_KEY_ADMIN);
    localStorage.removeItem(CACHE_KEY_TIER);
  } catch {
    // Ignore localStorage errors
  }
};
