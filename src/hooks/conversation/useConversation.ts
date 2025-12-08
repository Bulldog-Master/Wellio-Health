import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useE2EEncryption } from '@/hooks/useE2EEncryption';
import { rateLimiter, RATE_LIMITS } from '@/lib/rateLimit';
import { useTranslation } from 'react-i18next';
import { Message, ConversationDetails } from '@/components/conversation/types';

export const useConversation = (conversationId: string | undefined) => {
  const { toast } = useToast();
  const { t } = useTranslation(['messages', 'common']);
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [decryptedMessages, setDecryptedMessages] = useState<Map<string, string>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    hasKeyPair,
    isGenerating,
    generateAndStoreKeyPair,
    encryptForPeer,
    decryptFromPeer,
    getPeerPublicKey,
  } = useE2EEncryption();

  const { typingUsers, setTyping } = useTypingIndicator(conversationId, currentUserId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  // Fetch conversation details
  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      const otherUserId = data.participant1_id === currentUserId ? data.participant2_id : data.participant1_id;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', otherUserId)
        .single();

      return {
        ...data,
        other_user: profile,
      } as ConversationDetails;
    },
    enabled: !!conversationId && !!currentUserId,
  });

  // Check if peer has E2E encryption enabled
  const { data: peerHasE2E } = useQuery({
    queryKey: ['peer-e2e', conversation?.other_user?.id],
    queryFn: async () => {
      if (!conversation?.other_user?.id) return false;
      const publicKey = await getPeerPublicKey(conversation.other_user.id);
      return !!publicKey;
    },
    enabled: !!conversation?.other_user?.id && hasKeyPair,
  });

  const canUseE2E = hasKeyPair && peerHasE2E;

  // Fetch messages
  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

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
              ? conversation.other_user!.id
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
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadMessages.map((m) => m.id))
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        });
    }
  }, [messages, conversationId, currentUserId, queryClient]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async () => {
          await refetchMessages();
          await queryClient.invalidateQueries({
            queryKey: ['messages', conversationId],
            refetchType: 'active',
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
      if (!currentUserId || !conversationId) throw new Error('Not authenticated');

      const rateLimitKey = `message:${currentUserId}`;
      const rateLimit = await rateLimiter.check(rateLimitKey, RATE_LIMITS.MESSAGE_SEND);

      if (!rateLimit.allowed) {
        throw new Error(`${t('messages:sending_too_fast')} ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)}s`);
      }

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

      let messageData: any = {
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: content,
      };

      const peerKey = conversation?.other_user?.id ? await getPeerPublicKey(conversation.other_user.id) : null;
      if (localHasKeyPair && peerKey && conversation?.other_user?.id) {
        try {
          const encrypted = await encryptForPeer(content, conversation.other_user.id);
          if (encrypted) {
            messageData.content_encrypted = encrypted;
            messageData.encryption_version = 2;
            messageData.is_encrypted = true;
          }
        } catch (error) {
          console.error('Failed to encrypt message:', error);
        }
      }

      const { error } = await supabase.from('messages').insert(messageData);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refetchMessages();
      await queryClient.invalidateQueries({ queryKey: ['messages', conversationId], refetchType: 'active' });
      await queryClient.invalidateQueries({ queryKey: ['conversations'], refetchType: 'active' });
      setNewMessage('');
    },
    onError: (error) => {
      toast({
        title: t('messages:error_sending'),
        description: error.message,
        variant: 'destructive',
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
        variant: 'destructive',
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

  return {
    currentUserId,
    conversation,
    messages,
    newMessage,
    setNewMessage: handleTyping,
    messagesEndRef,
    typingUsers,
    hasKeyPair,
    isGenerating,
    peerHasE2E,
    canUseE2E,
    sendMessage,
    handleSend,
    handleEnableE2E,
    getMessageContent,
    isMessageEncrypted,
  };
};
