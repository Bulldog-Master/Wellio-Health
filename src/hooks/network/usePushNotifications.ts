import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "../social/useNotifications";

export const usePushNotifications = () => {
  const { permission, showNotification } = useNotifications();

  useEffect(() => {
    if (permission !== "granted") return;

    const setupRealtimeListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel("push-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            const notification = payload.new as {
              type: string;
              actor_id: string;
              post_id?: string;
              comment_id?: string;
            };

            // Fetch actor profile for name
            const { data: profile } = await supabase
              .from("profiles")
              .select("username, full_name")
              .eq("id", notification.actor_id)
              .single();

            const actorName = profile?.full_name || profile?.username || "Someone";

            let title = "";
            let body = "";
            let data: { postId?: string; userId?: string; path?: string } = {};

            switch (notification.type) {
              case "like":
                title = "New Like";
                body = `${actorName} liked your post`;
                data = { postId: notification.post_id };
                break;
              case "comment":
                title = "New Comment";
                body = `${actorName} commented on your post`;
                data = { postId: notification.post_id };
                break;
              case "follow":
                title = "New Follower";
                body = `${actorName} started following you`;
                data = { userId: notification.actor_id };
                break;
              case "mention":
                title = "You were mentioned";
                body = `${actorName} mentioned you in a post`;
                data = { postId: notification.post_id };
                break;
              case "follow_request":
                title = "Follow Request";
                body = `${actorName} wants to follow you`;
                data = { path: "/notifications" };
                break;
              default:
                title = "New Notification";
                body = `You have a new notification from ${actorName}`;
            }

            showNotification(title, { body, data });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeListener();
  }, [permission, showNotification]);
};
