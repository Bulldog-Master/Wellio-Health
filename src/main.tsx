import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { setupGlobalErrorHandlers } from "./lib/errorTracking";
import { initPerformanceMonitoring } from "./lib/performanceMonitoring";
import { initAnalytics } from "./lib/analytics";

// FORCE dark mode immediately
document.documentElement.classList.add('dark');
document.documentElement.style.backgroundColor = '#1e2433';
document.documentElement.style.colorScheme = 'dark';

// Setup global error handlers for unhandled errors
setupGlobalErrorHandlers();

// Initialize performance monitoring
initPerformanceMonitoring();

// Initialize analytics
initAnalytics();

// Clear ALL service worker caches and force update
if ('serviceWorker' in navigator) {
  // Clear all caches first
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }

  // Unregister old service workers and register fresh
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Force update check
      registration.update();
      
      // Skip waiting if there's a new version
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          });
        }
      });
    }).catch(() => {
      // Service worker registration failed
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);