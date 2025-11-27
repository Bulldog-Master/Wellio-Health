import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OnlineUser {
  user_id: string;
  online_at: string;
}

export const useOnlineStatus = (userIds: string[]) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userIds.length === 0) return;

    const channel = supabase.channel("online-users", {
      config: { presence: { key: "" } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<OnlineUser>();
        const online = new Set(
          Object.values(state)
            .flat()
            .map((u) => u.user_id)
        );
        setOnlineUsers(online);
      })
      .subscribe();

    // Track current user's online status
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userIds.join(",")]);

  const isOnline = (userId: string) => onlineUsers.has(userId);

  return { onlineUsers, isOnline };
};
