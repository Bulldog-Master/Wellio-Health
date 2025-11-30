import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Wifi } from "lucide-react";

/**
 * Displays network status to users with online/offline indicator
 */
export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineNotification, setShowOnlineNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && !showOnlineNotification) {
      setShowOnlineNotification(true);
      const timer = setTimeout(() => setShowOnlineNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (isOnline && !showOnlineNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80 animate-in slide-in-from-top">
      <Alert variant={isOnline ? "default" : "destructive"}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <AlertDescription>You're back online!</AlertDescription>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <AlertDescription>You're offline. Changes will sync when reconnected.</AlertDescription>
            </>
          )}
        </div>
      </Alert>
    </div>
  );
};
