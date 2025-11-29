import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConversationWithDetails {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string | null;
  other_user: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  last_message: {
    content: string;
    sender_id: string;
  } | null;
  unread_count: number;
}

export const MessagesSidebar = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  const { data: conversations, isLoading, refetch: refetchConversations } = useQuery({
    queryKey: ["sidebar-conversations"],
    queryFn: async () => {
      if (!currentUserId) return [];

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant1_id.eq.${currentUserId},participant2_id.eq.${currentUserId}`)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(5);

      if (error) throw error;

      // Fetch other participants' profiles
      const otherUserIds = data.map((conv) =>
        conv.participant1_id === currentUserId ? conv.participant2_id : conv.participant1_id
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", otherUserIds);

      // Fetch last messages for each conversation
      const conversationIds = data.map((c) => c.id);
      const { data: lastMessages } = await supabase
        .from("messages")
        .select("conversation_id, content, sender_id, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false });

      // Fetch unread counts
      const { data: unreadMessages } = await supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", conversationIds)
        .eq("is_read", false)
        .neq("sender_id", currentUserId);

      const lastMessageMap = new Map();
      lastMessages?.forEach((msg) => {
        if (!lastMessageMap.has(msg.conversation_id)) {
          lastMessageMap.set(msg.conversation_id, msg);
        }
      });

      const unreadCountMap = new Map();
      unreadMessages?.forEach((msg) => {
        unreadCountMap.set(msg.conversation_id, (unreadCountMap.get(msg.conversation_id) || 0) + 1);
      });

      return data.map((conv) => {
        const otherUserId = conv.participant1_id === currentUserId ? conv.participant2_id : conv.participant1_id;
        const otherUser = profiles?.find((p) => p.id === otherUserId);

        return {
          ...conv,
          other_user: otherUser || {
            id: otherUserId,
            username: null,
            full_name: null,
            avatar_url: null,
          },
          last_message: lastMessageMap.get(conv.id) || null,
          unread_count: unreadCountMap.get(conv.id) || 0,
        };
      }) as ConversationWithDetails[];
    },
    enabled: !!currentUserId,
    staleTime: 0,
  });

  // Real-time subscription
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("sidebar-conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        async () => {
          await refetchConversations();
          await queryClient.invalidateQueries({ 
            queryKey: ["sidebar-conversations"],
            refetchType: 'active'
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async () => {
          await refetchConversations();
          await queryClient.invalidateQueries({ 
            queryKey: ["sidebar-conversations"],
            refetchType: 'active'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient, refetchConversations]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Active Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Active Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No active conversations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Active Conversations
          </CardTitle>
          <button
            onClick={() => navigate("/messages")}
            className="text-sm text-primary hover:underline"
          >
            View all
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="p-3 rounded-lg border bg-card cursor-pointer transition-colors hover:bg-accent/50"
            onClick={() => navigate(`/messages/${conversation.id}`)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversation.other_user.avatar_url || ""} />
                <AvatarFallback>
                  {conversation.other_user.full_name?.[0] ||
                    conversation.other_user.username?.[0] || (
                      <User className="h-4 w-4" />
                    )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm truncate">
                    {conversation.other_user.full_name || conversation.other_user.username || "Anonymous"}
                  </p>
                  {conversation.last_message_at && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                {conversation.last_message && (
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${conversation.unread_count > 0 ? "font-semibold" : "text-muted-foreground"}`}>
                      {conversation.last_message.sender_id === currentUserId && "You: "}
                      {conversation.last_message.content}
                    </p>
                    {conversation.unread_count > 0 && (
                      <Badge variant="default" className="text-xs h-5 px-1.5">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
