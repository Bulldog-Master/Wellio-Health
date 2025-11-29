import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, MessageSquare } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
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

const Messages = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  const { data: conversations, isLoading, refetch: refetchConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!currentUserId) return [];

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant1_id.eq.${currentUserId},participant2_id.eq.${currentUserId}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });

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

  const otherUserIds = conversations?.map((c) => c.other_user.id) || [];
  const { isOnline } = useOnlineStatus(otherUserIds);

  // Real-time subscription
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("conversations-changes")
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
            queryKey: ["conversations"],
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
            queryKey: ["conversations"],
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
      <div className="container max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      {!conversations || conversations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm mt-2">Start a conversation by visiting a user's profile</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => navigate(`/messages/${conversation.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.other_user.avatar_url || ""} />
                      <AvatarFallback>
                        {conversation.other_user.full_name?.[0] ||
                          conversation.other_user.username?.[0] || (
                            <User className="h-5 w-5" />
                          )}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline(conversation.other_user.id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold truncate">
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
                        <p className={`text-sm truncate ${conversation.unread_count > 0 ? "font-semibold" : "text-muted-foreground"}`}>
                          {conversation.last_message.sender_id === currentUserId && "You: "}
                          {conversation.last_message.content}
                        </p>
                        {conversation.unread_count > 0 && (
                          <Badge variant="default" className="ml-auto">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
