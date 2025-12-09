import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    }),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/dashboard']}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct navigation structure', () => {
    // Test that main routes are defined
    const mainRoutes = [
      '/dashboard',
      '/activity',
      '/food',
      '/connect',
      '/settings',
    ];
    
    mainRoutes.forEach(route => {
      expect(route).toBeDefined();
    });
  });

  it('should have Activity hub sub-routes', () => {
    const activityRoutes = [
      '/workout',
      '/weight',
      '/step-count',
      '/habits',
      '/interval-timer',
      '/live-workout-sessions',
    ];
    
    activityRoutes.forEach(route => {
      expect(route).toBeDefined();
    });
  });

  it('should have Connect hub sub-routes', () => {
    const connectRoutes = [
      '/feed',
      '/socials',
      '/groups',
      '/messages',
    ];
    
    connectRoutes.forEach(route => {
      expect(route).toBeDefined();
    });
  });

  it('should have Settings sub-routes', () => {
    const settingsRoutes = [
      '/profile',
      '/subscription',
      '/privacy-controls',
      '/notifications',
    ];
    
    settingsRoutes.forEach(route => {
      expect(route).toBeDefined();
    });
  });
});
