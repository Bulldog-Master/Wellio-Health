import { ReactElement } from 'react';
import { render, RenderOptions, renderHook } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a fresh query client for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

// Wrapper with all providers
interface WrapperProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: WrapperProps) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function that wraps components with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { screen, waitFor } from '@testing-library/dom';
export { customRender as render };
