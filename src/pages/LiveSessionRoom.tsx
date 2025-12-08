import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/ui";
import { Users, Send, Video, LogOut } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Participant {
  id: string;
  user_id: string;
  joined_at: string;
  is_active: boolean;
  profiles?: {
    username: string;
    full_name: string;
  };
}

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string;
  };
}

interface Session {
  id: string;
  title: string;
  description: string;
  status: string;
  host_id: string;
}

const LiveSessionRoom = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('session');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const initSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setCurrentUserId(user.id);
      
      await fetchSessionData();
      await fetchParticipants();
      await fetchMessages();
      setupRealtimeSubscriptions();
    };

    initSession();

    return () => {
      leaveSession();
    };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const setupRealtimeSubscriptions = () => {
    // Subscribe to participants changes
    const participantsChannel = supabase
      .channel(`participants-${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'session_participants',
        filter: `session_id=eq.${sessionId}`
      }, () => {
        fetchParticipants();
      })
      .subscribe();

    // Subscribe to messages
    const messagesChannel = supabase
      .channel(`messages-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'session_messages',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(messagesChannel);
    };
  };

  const fetchSessionData = async () => {
    try {
      const { data, error } = await supabase
        .from('live_workout_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      setSession(data);
    } catch (error) {
      console.error('Error fetching session:', error);
      toast({
        title: t('error'),
        description: t('failed_to_load'),
        variant: "destructive",
      });
    }
  };

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('session_participants')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true);

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = data.map(p => p.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .in('id', userIds);

        const participantsWithProfiles = data.map(participant => ({
          ...participant,
          profiles: profilesData?.find(p => p.id === participant.user_id) || undefined
        }));

        setParticipants(participantsWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('session_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(m => m.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .in('id', userIds);

        const messagesWithProfiles = data.map(message => ({
          ...message,
          profiles: profilesData?.find(p => p.id === message.user_id) || undefined
        }));

        setMessages(messagesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('session_messages')
        .insert([{
          session_id: sessionId,
          user_id: user.id,
          message: newMessage,
        }]);

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('error'),
        description: t('failed_to_send'),
        variant: "destructive",
      });
    }
  };

  const leaveSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('session_participants')
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  const handleLeaveSession = async () => {
    await leaveSession();
    navigate('/live-workout-sessions');
  };

  if (!session) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <p>{t('loading_session')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Main Session Area */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-2xl">{session.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{session.description}</p>
                </div>
                <Button variant="destructive" onClick={handleLeaveSession}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('leave')}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">{t('video_coming_soon')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>{t('live_chat')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4 mb-4">
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {(msg.profiles?.username || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {msg.profiles?.username || t('unknown')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={t('type_message')}
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Participants Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('participants')} ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {(participant.profiles?.username || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {participant.profiles?.username || t('unknown')}
                          </p>
                          {session.host_id === participant.user_id && (
                            <span className="text-xs text-muted-foreground">{t('host')}</span>
                          )}
                        </div>
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LiveSessionRoom;
