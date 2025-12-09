import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useVIPStatus } from './useVIPStatus';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

import { supabase } from '@/integrations/supabase/client';

describe('useVIPStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return isVIP false when no user is logged in', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { result } = renderHook(() => useVIPStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isVIP).toBe(false);
    expect(result.current.vipPass).toBeNull();
  });

  it('should return isVIP true when user has active VIP pass', async () => {
    const mockUser = { id: 'test-user-id' };
    
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: true,
      error: null,
    } as any);

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'vip-pass-1',
              user_id: 'test-user-id',
              is_active: true,
              expires_at: null,
            },
            error: null,
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useVIPStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isVIP).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(supabase.auth.getUser).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useVIPStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isVIP).toBe(false);
  });
});
