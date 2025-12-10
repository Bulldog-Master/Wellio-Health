import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SessionState {
  sessionId: string | null;
  deviceFingerprint: string | null;
  lastActivity: number | null;
  
  // Actions
  setSessionId: (sessionId: string) => void;
  setDeviceFingerprint: (fingerprint: string) => void;
  updateLastActivity: () => void;
  clearSession: () => void;
  getOrCreateSessionId: () => string;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      deviceFingerprint: null,
      lastActivity: null,
      
      setSessionId: (sessionId) => {
        set({ sessionId });
      },
      
      setDeviceFingerprint: (fingerprint) => {
        set({ deviceFingerprint: fingerprint });
      },
      
      updateLastActivity: () => {
        set({ lastActivity: Date.now() });
      },
      
      clearSession: () => {
        set({ 
          sessionId: null, 
          deviceFingerprint: null, 
          lastActivity: null 
        });
      },
      
      getOrCreateSessionId: () => {
        const state = get();
        if (state.sessionId) return state.sessionId;
        
        const newSessionId = crypto.randomUUID();
        set({ sessionId: newSessionId });
        return newSessionId;
      },
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        deviceFingerprint: state.deviceFingerprint,
        lastActivity: state.lastActivity,
      }),
    }
  )
);
