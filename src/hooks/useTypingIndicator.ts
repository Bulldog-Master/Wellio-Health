import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TypingState {
  typing?: boolean;
  user_id?: string;
}

export const useTypingIndicator = (conversationId: string | undefined, currentUserId: string | null) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const channel = supabase.channel(`typing:${conversationId}`, {
      config: { presence: { key: currentUserId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<TypingState>();
        const typing = Object.keys(state)
          .filter((key) => key !== currentUserId && state[key]?.[0]?.typing)
          .map((key) => key);
        setTypingUsers(typing);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  const setTyping = async (isTyping: boolean) => {
    if (!conversationId || !currentUserId) return;

    const channel = supabase.channel(`typing:${conversationId}`);
    await channel.track({ typing: isTyping, user_id: currentUserId });
  };

  return { typingUsers, setTyping };
};
