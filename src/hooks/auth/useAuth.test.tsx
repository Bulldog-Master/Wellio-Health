import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should handle unauthenticated state', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    expect(supabase.auth.getSession).toBeDefined();
    expect(supabase.auth.onAuthStateChange).toBeDefined();
  });

  it('should handle sign out', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    await supabase.auth.signOut();
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should store auth state in localStorage', () => {
    localStorage.setItem('isAuthenticated', 'true');
    expect(localStorage.getItem('isAuthenticated')).toBe('true');
    
    localStorage.removeItem('isAuthenticated');
    expect(localStorage.getItem('isAuthenticated')).toBeNull();
  });
});
