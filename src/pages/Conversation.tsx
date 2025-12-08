import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send } from 'lucide-react';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useConversation } from '@/hooks/conversation';
import { MessageBubble, ConversationHeader } from '@/components/conversation';

const Conversation = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { t } = useTranslation(['messages', 'common']);

  const {
    currentUserId,
    conversation,
    messages,
    newMessage,
    setNewMessage,
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
  } = useConversation(conversationId);

  const { isOnline } = useUserPresence(
    conversation?.other_user?.id ? [conversation.other_user.id] : []
  );

  return (
    <div className="container max-w-4xl mx-auto p-4 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <ConversationHeader
        conversation={conversation}
        isOnline={isOnline}
        canUseE2E={canUseE2E}
        hasKeyPair={hasKeyPair}
        peerHasE2E={peerHasE2E}
        isGenerating={isGenerating}
        onEnableE2E={handleEnableE2E}
      />

      {/* Messages */}
      <Card className="flex-1 overflow-hidden mb-4">
        <CardContent className="h-full overflow-y-auto p-4 space-y-4">
          {messages && messages.length > 0 ? (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
                content={getMessageContent(message)}
                isEncrypted={isMessageEncrypted(message)}
              />
            ))
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
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
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
