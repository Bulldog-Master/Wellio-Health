import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserPreferencesState {
  // Cookie consent
  cookieConsent: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  } | null;
  
  // Age verification
  ageVerified: {
    is_over_13: boolean;
    is_over_18: boolean;
    verified_at: string;
  } | null;
  
  // UI preferences
  lastCheckedRewards: number | null;
  installPromptDismissed: boolean;
  
  // Actions
  setCookieConsent: (consent: { essential: boolean; analytics: boolean; marketing: boolean }) => void;
  setAgeVerified: (verification: { is_over_13: boolean; is_over_18: boolean; verified_at: string }) => void;
  setLastCheckedRewards: (timestamp: number) => void;
  setInstallPromptDismissed: (dismissed: boolean) => void;
  clearPreferences: () => void;
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      cookieConsent: null,
      ageVerified: null,
      lastCheckedRewards: null,
      installPromptDismissed: false,
      
      setCookieConsent: (consent) => {
        set({ cookieConsent: consent });
      },
      
      setAgeVerified: (verification) => {
        set({ ageVerified: verification });
      },
      
      setLastCheckedRewards: (timestamp) => {
        set({ lastCheckedRewards: timestamp });
      },
      
      setInstallPromptDismissed: (dismissed) => {
        set({ installPromptDismissed: dismissed });
      },
      
      clearPreferences: () => {
        set({
          cookieConsent: null,
          ageVerified: null,
          lastCheckedRewards: null,
          installPromptDismissed: false,
        });
      },
    }),
    {
      name: 'user-preferences-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
