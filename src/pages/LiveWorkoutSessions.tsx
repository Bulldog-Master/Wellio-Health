import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Video, Calendar, Users, Clock, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { useTranslation } from "react-i18next";

interface Session {
  id: string;
  title: string;
  description: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  workout_type: string;
  difficulty_level: string;
  max_participants: number;
  is_private: boolean;
  host_id: string;
  participants_count?: number;
}

const LiveWorkoutSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation(['live', 'common']);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduled_start: "",
    scheduled_end: "",
    workout_type: "strength",
    difficulty_level: "intermediate",
    max_participants: 20,
    is_private: false,
  });

  useEffect(() => {
    fetchSessions();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('live-workout-sessions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_workout_sessions'
      }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: sessionsData, error } = await supabase
        .from('live_workout_sessions')
        .select('*')
        .order('scheduled_start', { ascending: true });

      if (error) throw error;

      // Fetch participant counts
      const sessionsWithCounts = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { count } = await supabase
            .from('session_participants')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id)
            .eq('is_active', true);

          return { ...session, participants_count: count || 0 };
        })
      );

      setSessions(sessionsWithCounts);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: t('live:error'),
        description: t('live:failed_to_load'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('live_workout_sessions')
        .insert([{
          ...formData,
          host_id: user.id,
        }]);

      if (error) throw error;

      toast({
        title: t('live:success'),
        description: t('live:session_created'),
      });

      setShowCreateForm(false);
      setFormData({
        title: "",
        description: "",
        scheduled_start: "",
        scheduled_end: "",
        workout_type: "strength",
        difficulty_level: "intermediate",
        max_participants: 20,
        is_private: false,
      });
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: t('live:error'),
        description: t('live:failed_to_create'),
        variant: "destructive",
      });
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('session_participants')
        .insert([{
          session_id: sessionId,
          user_id: user.id,
        }]);

      if (error) throw error;

      navigate(`/live-session/${sessionId}`);
    } catch (error: any) {
      if (error?.code === '23505') {
        navigate(`/live-session/${sessionId}`);
      } else {
        toast({
          title: t('live:error'),
          description: t('live:failed_to_join'),
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-destructive text-destructive-foreground';
      case 'scheduled': return 'bg-primary text-primary-foreground';
      case 'ended': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Layout>
      <SubscriptionGate feature="live_sessions">
        <div className="container mx-auto p-6 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/premium")}
          className="gap-2 mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('live:back_to_premium')}
        </Button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('live:live_workout_sessions')}</h1>
            <p className="text-muted-foreground">{t('live:join_or_host')}</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="mr-2 h-4 w-4" />
            {showCreateForm ? t('live:cancel') : t('live:create_session')}
          </Button>
        </div>

        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>{t('live:create_new_session')}</CardTitle>
              <CardDescription>{t('live:schedule_live_session')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t('live:session_title')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="HIIT Cardio Blast"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('live:description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="High intensity interval training session..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">{t('live:start_time')}</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={formData.scheduled_start}
                    onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">{t('live:end_time')}</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={formData.scheduled_end}
                    onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workout_type">{t('live:workout_type')}</Label>
                  <Select value={formData.workout_type} onValueChange={(value) => setFormData({ ...formData, workout_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">{t('live:strength')}</SelectItem>
                      <SelectItem value="cardio">{t('live:cardio')}</SelectItem>
                      <SelectItem value="yoga">{t('live:yoga')}</SelectItem>
                      <SelectItem value="hiit">{t('live:hiit')}</SelectItem>
                      <SelectItem value="mobility">{t('live:mobility')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">{t('live:difficulty')}</Label>
                  <Select value={formData.difficulty_level} onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">{t('live:beginner')}</SelectItem>
                      <SelectItem value="intermediate">{t('live:intermediate')}</SelectItem>
                      <SelectItem value="advanced">{t('live:advanced')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_participants">{t('live:max_participants')}</Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                />
              </div>

              <Button onClick={createSession} className="w-full">
                {t('live:create_session')}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-muted-foreground">{t('live:loading_sessions')}</p>
          ) : sessions.length === 0 ? (
            <p className="text-muted-foreground">{t('live:no_sessions')}</p>
          ) : (
            sessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{session.title}</CardTitle>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(session.status)}`}>
                      {session.status.toUpperCase()}
                    </span>
                  </div>
                  <CardDescription>{session.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(session.scheduled_start), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(session.scheduled_start), 'hh:mm a')} - {format(new Date(session.scheduled_end), 'hh:mm a')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {session.participants_count}/{session.max_participants} {t('live:participants')}
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                      {session.workout_type}
                    </span>
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                      {session.difficulty_level}
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => joinSession(session.id)}
                    disabled={session.status === 'ended' || (session.participants_count || 0) >= session.max_participants}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    {session.status === 'live' ? t('live:join_now') : t('live:join_session')}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      </SubscriptionGate>
    </Layout>
  );
};

export default LiveWorkoutSessions;