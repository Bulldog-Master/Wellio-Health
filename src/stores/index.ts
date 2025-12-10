/**
 * Centralized Store Exports
 * 
 * This module exports all Zustand stores used throughout the application.
 * Using centralized state management provides:
 * - Consistent state access patterns
 * - Automatic localStorage persistence
 * - Type-safe state management
 * - Easy debugging with Zustand devtools
 * 
 * Usage:
 * import { useCartStore, useSubscriptionStore } from '@/stores';
 */

export { useCartStore } from './cartStore';
export type { CartItem, CartItemType } from './cartStore';

export { useSubscriptionStore } from './subscriptionStore';
export type { SubscriptionTier } from './subscriptionStore';

export { useSessionStore } from './sessionStore';

export { useUserPreferencesStore } from './userPreferencesStore';
