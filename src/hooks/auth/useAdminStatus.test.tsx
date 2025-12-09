import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAdminStatus } from './useAdminStatus';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    rpc: vi.fn(),
  },
}));

import { supabase } from '@/integrations/supabase/client';

describe('useAdminStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return isAdmin false when no user is logged in', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { result } = renderHook(() => useAdminStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAdmin).toBe(false);
  });

  it('should return isAdmin true when user has admin role', async () => {
    const mockUser = { id: 'admin-user-id' };
    
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: true,
      error: null,
    } as any);

    const { result } = renderHook(() => useAdminStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAdmin).toBe(true);
    expect(supabase.rpc).toHaveBeenCalledWith('has_role', {
      _user_id: 'admin-user-id',
      _role: 'admin',
    });
  });

  it('should return isAdmin false when user does not have admin role', async () => {
    const mockUser = { id: 'regular-user-id' };
    
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useAdminStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAdmin).toBe(false);
  });

  it('should handle RPC errors gracefully', async () => {
    const mockUser = { id: 'test-user-id' };
    
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    vi.mocked(supabase.rpc).mockRejectedValue(new Error('RPC error'));

    const { result } = renderHook(() => useAdminStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAdmin).toBe(false);
  });
});
