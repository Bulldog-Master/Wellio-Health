import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n/config";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAppKeyboardShortcuts } from "@/hooks/useKeyboardNavigation";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useBackgroundSync } from "@/hooks/useBackgroundSync";
import { SkipToContent } from "@/components/SkipToContent";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { InstallPrompt } from "@/components/InstallPrompt";
import { NetworkStatus } from "@/components/NetworkStatus";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { SessionTimeoutProvider } from "@/components/SessionTimeoutProvider";
import { AppRoutes } from "@/routes";
import { 
  CookieConsent, 
  AgeVerification, 
  BreachNotification, 
  HealthDisclaimer,
  TermsAcceptance
} from "@/components/compliance";

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

const AppContent = () => {
  usePushNotifications();
  useAppKeyboardShortcuts();
  useOfflineStatus();
  useBackgroundSync();
  
  return (
    <>
      <SkipToContent />
      <KeyboardShortcutsHelp />
      <InstallPrompt />
      <NetworkStatus />
      <OfflineIndicator />
      <CookieConsent />
      <BreachNotification />
      <HealthDisclaimer />
      <TermsAcceptance />
      
      <AgeVerification>
        <SessionTimeoutProvider timeoutMinutes={30} warningMinutes={5}>
          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
          </Suspense>
        </SessionTimeoutProvider>
      </AgeVerification>
    </>
  );
};

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Suspense fallback={<PageLoader />}>
              <AppContent />
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
};

export default App;
