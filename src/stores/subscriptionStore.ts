import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

interface SubscriptionState {
  tier: SubscriptionTier;
  isVIP: boolean;
  isAdmin: boolean;
  lastFetched: number | null;
  
  // Actions
  setSubscription: (tier: SubscriptionTier, isVIP: boolean, isAdmin: boolean) => void;
  hasPremiumAccess: () => boolean;
  clearSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      tier: 'free',
      isVIP: false,
      isAdmin: false,
      lastFetched: null,
      
      setSubscription: (tier, isVIP, isAdmin) => {
        set({ 
          tier, 
          isVIP, 
          isAdmin, 
          lastFetched: Date.now() 
        });
      },
      
      hasPremiumAccess: () => {
        const state = get();
        return state.isVIP || state.isAdmin || state.tier === 'pro' || state.tier === 'enterprise';
      },
      
      clearSubscription: () => {
        set({ 
          tier: 'free', 
          isVIP: false, 
          isAdmin: false, 
          lastFetched: null 
        });
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tier: state.tier,
        isVIP: state.isVIP,
        isAdmin: state.isAdmin,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
