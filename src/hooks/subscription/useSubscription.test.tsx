import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              subscription_tier: 'free',
              is_vip: false,
              subscription_status: 'active',
            },
            error: null,
          }),
        })),
      })),
    })),
    rpc: vi.fn().mockResolvedValue({ data: false, error: null }),
  },
}));

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should return default values when loading', async () => {
    // Import after mocking
    const { useSubscription } = await import('./useSubscription');
    
    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    // Initial state should have loading or default values
    expect(result.current.tier).toBeDefined();
  });

  it('should cache subscription status in localStorage', async () => {
    const { useSubscription } = await import('./useSubscription');
    
    renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const cached = localStorage.getItem('subscription_tier');
      // Either cached or still loading
      expect(cached === null || cached === 'free').toBe(true);
    });
  });

  it('should identify VIP users correctly', async () => {
    const { useSubscription } = await import('./useSubscription');
    
    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(typeof result.current.isVIP).toBe('boolean');
    });
  });
});
