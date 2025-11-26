import { useEffect, useState } from "react";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission !== "granted") return;

    try {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  };

  const scheduleReminder = (title: string, body: string, time: string) => {
    if (permission !== "granted") return;

    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilReminder = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      showNotification(title, { body });
    }, timeUntilReminder);
  };

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    scheduleReminder,
  };
};
