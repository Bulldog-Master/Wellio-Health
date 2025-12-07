import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Loader2, 
  Send, 
  Volume2, 
  VolumeX,
  Sparkles,
  Crown
} from 'lucide-react';
import { SubscriptionGate } from '@/components/SubscriptionGate';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIVoiceCompanionProps {
  onWorkoutComplete?: (summary: string) => void;
}

const AIVoiceCompanion: React.FC<AIVoiceCompanionProps> = ({ onWorkoutComplete }) => {
  const { t } = useTranslation(['voice', 'fitness', 'common', 'premium']);
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const chatRef = useRef<RealtimeChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentTranscript]);

  const handleMessage = useCallback((event: any) => {
    console.log('Voice companion event:', event.type);
    
    switch (event.type) {
      case 'response.audio.delta':
        setIsSpeaking(true);
        break;
        
      case 'response.audio.done':
        setIsSpeaking(false);
        break;
        
      case 'response.audio_transcript.delta':
        if (event.delta) {
          setCurrentTranscript(prev => prev + event.delta);
        }
        break;
        
      case 'response.audio_transcript.done':
        if (currentTranscript) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: currentTranscript,
            timestamp: new Date()
          }]);
          setCurrentTranscript('');
        }
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          setMessages(prev => [...prev, {
            role: 'user',
            content: event.transcript,
            timestamp: new Date()
          }]);
        }
        break;
        
      case 'response.done':
        setIsSpeaking(false);
        if (currentTranscript) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: currentTranscript,
            timestamp: new Date()
          }]);
          setCurrentTranscript('');
        }
        break;
        
      case 'error':
        console.error('Realtime API error:', event);
        toast({
          title: t('common:error'),
          description: event.error?.message || 'An error occurred',
          variant: 'destructive'
        });
        break;
    }
  }, [currentTranscript, t, toast]);

  const handleStatusChange = useCallback((newStatus: 'connecting' | 'connected' | 'disconnected' | 'error') => {
    console.log('Status changed to:', newStatus);
    if (newStatus === 'disconnected') {
      setStatus('idle');
    } else {
      setStatus(newStatus as any);
    }
    
    if (newStatus === 'connected') {
      toast({
        title: t('voice:connected'),
        description: t('voice:coach_ready'),
      });
      // Send initial greeting prompt
      setTimeout(() => {
        chatRef.current?.sendTextMessage("Hello! I'm ready to start my workout. Please greet me and ask what exercise I'd like to do today.");
      }, 1000);
    } else if (newStatus === 'error') {
      toast({
        title: t('common:error'),
        description: t('voice:connection_failed'),
        variant: 'destructive'
      });
    }
  }, [t, toast]);

  const startSession = async () => {
    try {
      setStatus('connecting');
      chatRef.current = new RealtimeChat(handleMessage, handleStatusChange);
      await chatRef.current.init();
    } catch (error) {
      console.error('Error starting session:', error);
      setStatus('error');
      toast({
        title: t('common:error'),
        description: error instanceof Error ? error.message : t('voice:connection_failed'),
        variant: 'destructive'
      });
    }
  };

  const endSession = () => {
    chatRef.current?.disconnect();
    setStatus('idle');
    setMessages([]);
    setCurrentTranscript('');
    setIsSpeaking(false);
    
    toast({
      title: t('voice:session_ended'),
      description: t('voice:great_workout'),
    });
    
    if (onWorkoutComplete && messages.length > 0) {
      const summary = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      onWorkoutComplete(summary);
    }
  };

  const sendTextMessage = () => {
    if (!textInput.trim() || !chatRef.current?.getIsConnected()) return;
    
    setMessages(prev => [...prev, {
      role: 'user',
      content: textInput,
      timestamp: new Date()
    }]);
    
    chatRef.current.sendTextMessage(textInput);
    setTextInput('');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Note: Full mute implementation would require accessing the audio track
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <SubscriptionGate feature="ai_voice_companion">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t('voice:ai_voice_coach')}
              <Badge variant="secondary" className="ml-2">
                <Crown className="w-3 h-3 mr-1" />
                VIP
              </Badge>
            </CardTitle>
            {status === 'connected' && (
              <Badge variant={isSpeaking ? "default" : "outline"} className="animate-pulse">
                {isSpeaking ? (
                  <><Volume2 className="w-3 h-3 mr-1" /> {t('voice:speaking')}</>
                ) : (
                  <><Mic className="w-3 h-3 mr-1" /> {t('voice:listening')}</>
                )}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('voice:coach_description')}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'idle' && (
            <div className="flex flex-col items-center py-8 space-y-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="w-12 h-12 text-primary" />
              </div>
              <p className="text-center text-muted-foreground max-w-xs">
                {t('voice:start_session_prompt')}
              </p>
              <Button 
                size="lg" 
                onClick={startSession}
                className="gap-2"
              >
                <Phone className="w-5 h-5" />
                {t('voice:start_session')}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t('voice:cost_notice')}
              </p>
            </div>
          )}

          {status === 'connecting' && (
            <div className="flex flex-col items-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-muted-foreground">{t('voice:connecting')}</p>
            </div>
          )}

          {(status === 'connected' || messages.length > 0) && status !== 'idle' && (
            <>
              <ScrollArea className="h-64 rounded-md border p-4">
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {currentTranscript && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                        <p className="text-sm">{currentTranscript}</p>
                        <Loader2 className="w-3 h-3 animate-spin mt-1" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                  placeholder={t('voice:type_message')}
                  disabled={status !== 'connected'}
                />
                <Button 
                  onClick={sendTextMessage} 
                  disabled={!textInput.trim() || status !== 'connected'}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                  className={isMuted ? 'bg-destructive/10' : ''}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={endSession}
                  className="gap-2 px-6"
                >
                  <PhoneOff className="w-5 h-5" />
                  {t('voice:end_session')}
                </Button>
              </div>
            </>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <PhoneOff className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-center text-muted-foreground">
                {t('voice:connection_error')}
              </p>
              <Button onClick={startSession}>
                {t('common:retry')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </SubscriptionGate>
  );
};

export default AIVoiceCompanion;
