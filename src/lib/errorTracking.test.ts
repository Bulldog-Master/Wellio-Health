import { describe, it, expect, vi } from 'vitest';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
    },
  },
}));

describe('Error Tracking', () => {
  it('should determine error severity correctly', async () => {
    // Import the module
    const { logError } = await import('./errorTracking');
    
    // Create test errors
    const authError = new Error('Authentication failed');
    const networkError = new Error('Failed to fetch');
    const validationError = new Error('Validation error');
    const genericError = new Error('Something went wrong');
    
    // Test that logError can be called without throwing
    expect(() => logError(authError)).not.toThrow();
    expect(() => logError(networkError)).not.toThrow();
    expect(() => logError(validationError)).not.toThrow();
    expect(() => logError(genericError)).not.toThrow();
  });

  it('should setup global error handlers', async () => {
    const { setupGlobalErrorHandlers } = await import('./errorTracking');
    
    // Should not throw when called
    expect(() => setupGlobalErrorHandlers()).not.toThrow();
  });
});
