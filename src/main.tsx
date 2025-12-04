// CRITICAL: Force dark mode BEFORE any imports to prevent flash
(function() {
  document.documentElement.classList.add('dark');
  document.documentElement.classList.remove('light');
  document.documentElement.style.colorScheme = 'dark';
  localStorage.setItem('theme', 'dark');
})();

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { setupGlobalErrorHandlers } from "./lib/errorTracking";

// Setup global error handlers for unhandled errors
setupGlobalErrorHandlers();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Check for updates immediately
      registration.update();
      
      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }).catch(() => {
      // Service worker registration failed, PWA features won't be available
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
