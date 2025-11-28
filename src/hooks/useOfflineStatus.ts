import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Hook to monitor and handle offline/online status
 */
export const useOfflineStatus = () => {
  useEffect(() => {
    const handleOnline = () => {
      toast.success("You're back online!");
    };

    const handleOffline = () => {
      toast.error("You're offline. Some features may be limited.", {
        duration: Infinity,
        id: "offline-status",
      });
    };

    // Check initial status
    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      toast.dismiss("offline-status");
    };
  }, []);
};
