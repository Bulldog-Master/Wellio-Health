import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  Trash2,
  Sparkles,
  Dumbbell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SubscriptionGate } from "@/components/common";
import { useToast } from "@/hooks/ui";
import { supabase } from "@/integrations/supabase/client";
import { useStreamingChat } from "@/hooks/ai/useStreamingChat";
import { ChatMessage } from "@/components/chat/ChatMessage";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const FitnessChat = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['chat', 'common']);
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('welcome_message'),
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { streamMessage, isStreaming } = useStreamingChat({
    onError: (error) => {
      toast({
        title: t('common:error'),
        description: error,
        variant: "destructive"
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const exampleQuestions = [
    t('example_1'),
    t('example_2'),
    t('example_3'),
    t('example_4')
  ];

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    const assistantMessageId = (Date.now() + 1).toString();
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setStreamingMessageId(assistantMessageId);

    // Add empty assistant message that will be filled by streaming
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      let assistantContent = '';
      
      await streamMessage({
        message: userMessage.content,
        conversationHistory: messages.filter(m => m.id !== '1').map(m => ({
          role: m.role,
          content: m.content
        })),
        accessToken: session?.access_token || null,
        onDelta: (delta) => {
          assistantContent += delta;
          setMessages(prev => prev.map(m => 
            m.id === assistantMessageId 
              ? { ...m, content: assistantContent }
              : m
          ));
        },
        onDone: () => {
          setStreamingMessageId(null);
          // If no content was received, show fallback
          if (!assistantContent) {
            setMessages(prev => prev.map(m => 
              m.id === assistantMessageId 
                ? { ...m, content: "I'm sorry, I couldn't process your request. Please try again." }
                : m
            ));
          }
        }
      });
    } catch (error) {
      console.error('Chat error:', error);
      setStreamingMessageId(null);
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: t('welcome_message'),
      timestamp: new Date()
    }]);
    toast({ title: t('chat_cleared') });
  };

  const handleExampleClick = (question: string) => {
    setInputValue(question);
  };

  const ChatContent = () => (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/activity')}
            className="shrink-0"
            aria-label={t('common:back')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t('fitness_assistant')}</h1>
              <p className="text-muted-foreground">{t('fitness_assistant_desc')}</p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleClearChat} disabled={isStreaming}>
          <Trash2 className="w-4 h-4 mr-2" />
          {t('clear_chat')}
        </Button>
      </div>

      {/* Messages */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              isStreaming={message.id === streamingMessageId}
            />
          ))}
          
          {isStreaming && streamingMessageId && messages.find(m => m.id === streamingMessageId)?.content === '' && (
            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium mb-1">{t('ai_assistant')}</p>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse text-primary" />
                  <span className="text-muted-foreground">{t('thinking')}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Example Questions */}
        {messages.length <= 1 && (
          <div className="p-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">{t('example_questions')}</p>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleClick(question)}
                  className="text-xs"
                >
                  <Dumbbell className="w-3 h-3 mr-1" />
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              placeholder={t('type_message')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="min-h-[44px] max-h-[120px] resize-none"
              rows={1}
              disabled={isStreaming}
            />
            <Button 
              onClick={handleSend} 
              disabled={!inputValue.trim() || isStreaming}
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <SubscriptionGate feature="ai_chat">
      <ChatContent />
    </SubscriptionGate>
  );
};

export default FitnessChat;
