import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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

  const showNotification = (
    title: string, 
    options?: NotificationOptions & { data?: { postId?: string; userId?: string; path?: string } }
  ) => {
    if (permission !== "granted") return;

    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        requireInteraction: false,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        if (options?.data?.path) {
          window.location.href = options.data.path;
        } else if (options?.data?.postId) {
          window.location.href = `/feed?post=${options.data.postId}`;
        } else if (options?.data?.userId) {
          window.location.href = `/profile/${options.data.userId}`;
        }
        notification.close();
      };
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

export const useUnreadNotificationCount = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const query = useQuery({
    queryKey: ["unread-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });

  // Real-time subscription for notification count
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("notifications-count-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["unread-count"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return query;
};
