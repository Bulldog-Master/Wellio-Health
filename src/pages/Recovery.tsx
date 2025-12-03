import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Snowflake, 
  Flame, 
  Wind, 
  Waves, 
  Zap, 
  Heart,
  Plus,
  Clock,
  Calendar,
  TrendingUp,
  Crown,
  Sparkles,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionGate } from '@/components/SubscriptionGate';

interface RecoverySession {
  id: string;
  user_id: string;
  therapy_type: string;
  duration_minutes: number;
  intensity: string | null;
  temperature: string | null;
  location: string | null;
  cost: number | null;
  notes: string | null;
  session_date: string;
  created_at: string;
}
import { toast } from 'sonner';
import { format } from 'date-fns';

const Recovery = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['recovery', 'common']);
  const { hasFullAccess, isLoading: subscriptionLoading } = useSubscription();
  const [sessions, setSessions] = useState<RecoverySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTherapy, setSelectedTherapy] = useState<string | null>(null);
  
  // Form state
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('medium');
  const [temperature, setTemperature] = useState('');
  const [location, setLocation] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  const therapies = [
    { id: 'massage', icon: Heart, color: 'text-pink-500 bg-pink-500/10', nameKey: 'massage_therapy', descKey: 'massage_description' },
    { id: 'red_light', icon: Zap, color: 'text-red-500 bg-red-500/10', nameKey: 'red_light_therapy', descKey: 'red_light_description' },
    { id: 'cold_plunge', icon: Snowflake, color: 'text-cyan-500 bg-cyan-500/10', nameKey: 'cold_plunge', descKey: 'cold_plunge_description' },
    { id: 'sauna', icon: Flame, color: 'text-orange-500 bg-orange-500/10', nameKey: 'sauna', descKey: 'sauna_description' },
    { id: 'oxygen', icon: Wind, color: 'text-blue-500 bg-blue-500/10', nameKey: 'oxygen_therapy', descKey: 'oxygen_description' },
    { id: 'cryotherapy', icon: Snowflake, color: 'text-indigo-500 bg-indigo-500/10', nameKey: 'cryotherapy', descKey: 'cryo_description' },
    { id: 'float_tank', icon: Waves, color: 'text-teal-500 bg-teal-500/10', nameKey: 'float_tank', descKey: 'float_description' },
    { id: 'compression', icon: Activity, color: 'text-purple-500 bg-purple-500/10', nameKey: 'compression_therapy', descKey: 'compression_description' },
    { id: 'infrared', icon: Flame, color: 'text-amber-500 bg-amber-500/10', nameKey: 'infrared_therapy', descKey: 'infrared_description' },
    { id: 'stretching', icon: Heart, color: 'text-green-500 bg-green-500/10', nameKey: 'stretching_mobility', descKey: 'stretching_description' },
  ];

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('recovery_sessions' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSessions((data as unknown as RecoverySession[]) || []);
    } catch (error) {
      console.error('Error fetching recovery sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogSession = async () => {
    if (!selectedTherapy || !duration) {
      toast.error(t('common:validation_error'));
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('recovery_sessions' as any)
        .insert({
          user_id: user.id,
          therapy_type: selectedTherapy,
          duration_minutes: parseInt(duration),
          intensity,
          temperature: temperature || null,
          location: location || null,
          cost: cost ? parseFloat(cost) : null,
          notes: notes || null,
        });

      if (error) throw error;

      toast.success(t('session_logged'), { description: t('session_logged_desc') });
      setDialogOpen(false);
      resetForm();
      fetchSessions();
    } catch (error) {
      console.error('Error logging session:', error);
      toast.error(t('common:error'));
    }
  };

  const resetForm = () => {
    setSelectedTherapy(null);
    setDuration('');
    setIntensity('medium');
    setTemperature('');
    setLocation('');
    setCost('');
    setNotes('');
  };

  const getTherapyInfo = (therapyId: string) => {
    return therapies.find(t => t.id === therapyId);
  };

  const getTherapyName = (therapyId: string) => {
    const therapy = getTherapyInfo(therapyId);
    return therapy ? t(therapy.nameKey) : therapyId;
  };

  // Calculate stats
  const thisWeekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.session_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  });

  const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SubscriptionGate feature="recovery_tracking">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{t('recovery_hub')}</h1>
                <Badge variant="secondary" className="gap-1">
                  <Crown className="h-3 w-3" />
                  VIP
                </Badge>
              </div>
              <p className="text-muted-foreground">{t('recovery_description')}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{sessions.length}</div>
              <div className="text-xs text-muted-foreground">{t('total_sessions')}</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{thisWeekSessions.length}</div>
              <div className="text-xs text-muted-foreground">{t('this_week')}</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{Math.round(totalMinutes / 60)}h</div>
              <div className="text-xs text-muted-foreground">{t('total_time')}</div>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto text-success mb-1" />
              <div className="text-xs text-muted-foreground">{t('stats')}</div>
            </Card>
          </div>

          {/* Therapy Types Grid */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('recovery_therapies')}</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t('log_session')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('log_session')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Therapy Selection */}
                    <div className="space-y-2">
                      <Label>{t('recovery_therapies')}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {therapies.map((therapy) => {
                          const Icon = therapy.icon;
                          return (
                            <button
                              key={therapy.id}
                              onClick={() => setSelectedTherapy(therapy.id)}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                selectedTherapy === therapy.id
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <Icon className={`h-5 w-5 mb-1 ${therapy.color.split(' ')[0]}`} />
                              <div className="text-xs font-medium">{t(therapy.nameKey)}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <Label htmlFor="duration">{t('duration_minutes')}</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="30"
                      />
                    </div>

                    {/* Intensity */}
                    <div className="space-y-2">
                      <Label>{t('intensity')}</Label>
                      <Select value={intensity} onValueChange={setIntensity}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{t('low')}</SelectItem>
                          <SelectItem value="medium">{t('medium')}</SelectItem>
                          <SelectItem value="high">{t('high')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Temperature (optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="temperature">{t('temperature')}</Label>
                      <Input
                        id="temperature"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        placeholder={t('temperature_placeholder')}
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location">{t('location')}</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={t('location_placeholder')}
                      />
                    </div>

                    {/* Cost */}
                    <div className="space-y-2">
                      <Label htmlFor="cost">{t('cost')}</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder={t('cost_placeholder')}
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">{t('notes')}</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t('notes_placeholder')}
                        rows={3}
                      />
                    </div>

                    <Button onClick={handleLogSession} className="w-full">
                      {t('log_session')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {therapies.map((therapy) => {
                const Icon = therapy.icon;
                return (
                  <Card 
                    key={therapy.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedTherapy(therapy.id);
                      setDialogOpen(true);
                    }}
                  >
                    <div className={`w-10 h-10 rounded-full ${therapy.color} flex items-center justify-center mb-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{t(therapy.nameKey)}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t(therapy.descKey)}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Sessions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">{t('recent_sessions')}</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </Card>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <Card className="p-8 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">{t('no_sessions')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('start_tracking')}</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('log_session')}
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const therapyInfo = getTherapyInfo(session.therapy_type);
                  const Icon = therapyInfo?.icon || Activity;
                  return (
                    <Card key={session.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full ${therapyInfo?.color || 'bg-muted'} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{getTherapyName(session.therapy_type)}</h3>
                            <Badge variant="outline" className="text-xs">
                              {session.intensity}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.duration_minutes} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(session.session_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {session.notes && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{session.notes}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </SubscriptionGate>
  );
};

export default Recovery;
