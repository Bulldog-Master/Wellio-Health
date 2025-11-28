import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes } from "react-router-dom";
import { Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAppKeyboardShortcuts } from "@/hooks/useKeyboardNavigation";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { SkipToContent } from "@/components/SkipToContent";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { AppRoutes } from "@/routes";

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

/**
 * Main app content component with hooks for notifications, keyboard shortcuts, and offline detection
 */
const AppContent = () => {
  usePushNotifications();
  useAppKeyboardShortcuts();
  useOfflineStatus();
  
  return (
    <>
      <SkipToContent />
      <KeyboardShortcutsHelp />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <AppRoutes />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
