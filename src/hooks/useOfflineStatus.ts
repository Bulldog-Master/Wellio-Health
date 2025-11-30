import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

/**
 * Hook to monitor and handle offline/online status
 */
export const useOfflineStatus = () => {
  const { t } = useTranslation();
  
  useEffect(() => {
    const handleOnline = () => {
      toast.success(t('youre_back_online'));
    };

    const handleOffline = () => {
      toast.error(t('youre_offline_limited'), {
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
