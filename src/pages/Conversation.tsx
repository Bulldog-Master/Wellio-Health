import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, User, Check, CheckCheck, Lock, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useUserPresence } from "@/hooks/useUserPresence";
import { useE2EEncryption } from "@/hooks/useE2EEncryption";
import { formatDistanceToNow } from "date-fns";
import { rateLimiter, RATE_LIMITS } from "@/lib/rateLimit";
import { useTranslation } from "react-i18next";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  content_encrypted?: string;
  encryption_version?: number;
  created_at: string;
  is_read: boolean;
}

const Conversation = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation(['messages', 'common']);
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [decryptedMessages, setDecryptedMessages] = useState<Map<string, string>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { 
    hasKeyPair, 
    isGenerating, 
    generateAndStoreKeyPair, 
    encryptForPeer, 
    decryptFromPeer,
    getPeerPublicKey 
  } = useE2EEncryption();

  const { typingUsers, setTyping } = useTypingIndicator(conversationId, currentUserId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  // Fetch conversation details
  const { data: conversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (error) throw error;

      const otherUserId = data.participant1_id === currentUserId ? data.participant2_id : data.participant1_id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", otherUserId)
        .single();

      return {
        ...data,
        other_user: profile,
      };
    },
    enabled: !!conversationId && !!currentUserId,
  });

  // Check if peer has E2E encryption enabled
  const { data: peerHasE2E } = useQuery({
    queryKey: ["peer-e2e", conversation?.other_user?.id],
    queryFn: async () => {
      if (!conversation?.other_user?.id) return false;
      const publicKey = await getPeerPublicKey(conversation.other_user.id);
      return !!publicKey;
    },
    enabled: !!conversation?.other_user?.id && hasKeyPair,
  });

  const canUseE2E = hasKeyPair && peerHasE2E;

  const { isOnline } = useUserPresence(
    conversation?.other_user?.id ? [conversation.other_user.id] : []
  );

  // Fetch messages
  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
    staleTime: 0,
  });

  // Decrypt encrypted messages
  useEffect(() => {
    if (!messages || !conversation?.other_user?.id || !hasKeyPair) return;

    const decryptMessages = async () => {
      const newDecrypted = new Map(decryptedMessages);
      
      for (const msg of messages) {
        if (msg.content_encrypted && !decryptedMessages.has(msg.id)) {
          try {
            const peerId = msg.sender_id === currentUserId 
              ? conversation.other_user.id 
              : msg.sender_id;
            const decrypted = await decryptFromPeer(msg.content_encrypted, peerId);
            if (decrypted) {
              newDecrypted.set(msg.id, decrypted);
            }
          } catch (error) {
            console.error('Failed to decrypt message:', msg.id, error);
            newDecrypted.set(msg.id, '[Unable to decrypt]');
          }
        }
      }
      
      if (newDecrypted.size !== decryptedMessages.size) {
        setDecryptedMessages(newDecrypted);
      }
    };

    decryptMessages();
  }, [messages, conversation?.other_user?.id, hasKeyPair, currentUserId, decryptFromPeer, decryptedMessages]);

  // Mark messages as read
  useEffect(() => {
    if (!conversationId || !currentUserId || !messages) return;

    const unreadMessages = messages.filter((m) => !m.is_read && m.sender_id !== currentUserId);

    if (unreadMessages.length > 0) {
      supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", unreadMessages.map((m) => m.id))
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        });
    }
  }, [messages, conversationId, currentUserId, queryClient]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async () => {
          await refetchMessages();
          await queryClient.invalidateQueries({ 
            queryKey: ["messages", conversationId],
            refetchType: 'active'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient, refetchMessages]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUserId || !conversationId) throw new Error("Not authenticated");

      // Rate limiting for message sending
      const rateLimitKey = `message:${currentUserId}`;
      const rateLimit = await rateLimiter.check(rateLimitKey, RATE_LIMITS.MESSAGE_SEND);

      if (!rateLimit.allowed) {
        throw new Error(`${t('messages:sending_too_fast')} ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)}s`);
      }

      // Auto-generate keys if not present (E2E enforcement)
      let localHasKeyPair = hasKeyPair;
      if (!localHasKeyPair) {
        const success = await generateAndStoreKeyPair();
        if (success) {
          localHasKeyPair = true;
          toast({
            title: t('messages:e2e_enabled'),
            description: t('messages:e2e_auto_enabled_desc'),
          });
        }
      }

      // Build message data
      let messageData: any = {
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: content,
      };

      // If E2E is available (both parties have keys), encrypt the message
      const peerKey = conversation?.other_user?.id ? await getPeerPublicKey(conversation.other_user.id) : null;
      if (localHasKeyPair && peerKey && conversation?.other_user?.id) {
        try {
          const encrypted = await encryptForPeer(content, conversation.other_user.id);
          if (encrypted) {
            messageData.content_encrypted = encrypted;
            messageData.encryption_version = 2;
            messageData.is_encrypted = true;
            // DB trigger will replace content with '[encrypted]' placeholder
          }
        } catch (error) {
          console.error('Failed to encrypt message:', error);
          // Continue with plaintext if encryption fails
        }
      }

      const { error } = await supabase.from("messages").insert(messageData);

      if (error) throw error;
    },
    onSuccess: async () => {
      await refetchMessages();
      await queryClient.invalidateQueries({ 
        queryKey: ["messages", conversationId],
        refetchType: 'active'
      });
      await queryClient.invalidateQueries({ 
        queryKey: ["conversations"],
        refetchType: 'active'
      });
      setNewMessage("");
    },
    onError: (error) => {
      toast({
        title: t('messages:error_sending'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage.mutate(newMessage);
      setTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    setTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  const handleEnableE2E = async () => {
    const success = await generateAndStoreKeyPair();
    if (success) {
      toast({
        title: t('messages:e2e_enabled'),
        description: t('messages:e2e_enabled_desc'),
      });
    } else {
      toast({
        title: t('messages:e2e_failed'),
        description: t('messages:e2e_failed_desc'),
        variant: "destructive",
      });
    }
  };

  const getMessageContent = (message: Message): string => {
    if (message.content_encrypted && decryptedMessages.has(message.id)) {
      return decryptedMessages.get(message.id) || message.content;
    }
    return message.content;
  };

  const isMessageEncrypted = (message: Message): boolean => {
    return !!message.content_encrypted && !!message.encryption_version;
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/messages")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {conversation?.other_user && (
          <>
            <Avatar
              className="h-10 w-10 cursor-pointer"
              onClick={() => navigate(`/user/${conversation.other_user.id}`)}
            >
              <AvatarImage src={conversation.other_user.avatar_url || ""} />
              <AvatarFallback>
                {conversation.other_user.full_name?.[0] ||
                  conversation.other_user.username?.[0] || (
                    <User className="h-5 w-5" />
                  )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p
                  className="font-semibold cursor-pointer hover:underline"
                  onClick={() => navigate(`/user/${conversation.other_user.id}`)}
                >
                  {conversation.other_user.full_name || conversation.other_user.username || t('messages:anonymous')}
                </p>
                <div className={`w-2 h-2 rounded-full ${isOnline(conversation.other_user.id) ? "bg-green-500" : "bg-gray-400"}`} />
              </div>
              <p className="text-xs text-muted-foreground">
                {isOnline(conversation.other_user.id) ? t('messages:online') : t('messages:offline')}
              </p>
            </div>
            
            {/* E2E Status Indicator */}
            <div className="flex items-center gap-2">
              {canUseE2E ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                  <Lock className="w-3 h-3 mr-1" />
                  {t('messages:e2e_active')}
                </Badge>
              ) : hasKeyPair && !peerHasE2E ? (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {t('messages:peer_no_e2e')}
                </Badge>
              ) : !hasKeyPair ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEnableE2E}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {isGenerating ? t('common:loading') : t('messages:enable_e2e')}
                </Button>
              ) : null}
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <Card className="flex-1 overflow-hidden mb-4">
        <CardContent className="h-full overflow-y-auto p-4 space-y-4">
          {messages && messages.length > 0 ? (
            messages.map((message) => {
              const isOwn = message.sender_id === currentUserId;
              const encrypted = isMessageEncrypted(message);
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="break-words">{getMessageContent(message)}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {encrypted && (
                        <Lock className={`w-3 h-3 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`} />
                      )}
                      <p className={`text-xs ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                      {isOwn && (
                        message.is_read ? (
                          <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                        ) : (
                          <Check className="w-3 h-3 text-primary-foreground/70" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>{t('messages:no_messages_yet')}</p>
            </div>
          )}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <Badge variant="secondary" className="animate-pulse">
                {t('messages:typing')}
              </Badge>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <Textarea
          placeholder={t('messages:type_message')}
          value={newMessage}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="min-h-[44px] max-h-[120px] resize-none"
          rows={1}
        />
        <Button onClick={handleSend} disabled={!newMessage.trim() || sendMessage.isPending} className="h-[44px]">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Conversation;