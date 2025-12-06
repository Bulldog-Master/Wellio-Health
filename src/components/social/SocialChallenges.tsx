import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Trophy, 
  Target,
  Calendar,
  Medal,
  Flame,
  Crown,
  UserPlus,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  target_unit: string;
  start_date: string;
  end_date: string;
  points_reward: number;
  participants_count?: number;
  creator?: {
    username: string;
    avatar_url: string;
  };
  user_progress?: number;
  is_joined?: boolean;
}

interface Participant {
  user_id: string;
  current_progress: number;
  rank?: number;
  profile?: {
    username: string;
    avatar_url: string;
  };
}

export const SocialChallenges = () => {
  const { t } = useTranslation(['challenges', 'common']);
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [user]);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_challenges')
        .select(`
          *,
          challenge_participants(count)
        `)
        .eq('is_public', true)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Check if user is participating
      if (user && data) {
        const { data: participations } = await supabase
          .from('challenge_participants')
          .select('challenge_id, current_progress')
          .eq('user_id', user.id);

        const participationMap = new Map(
          participations?.map(p => [p.challenge_id, p.current_progress]) || []
        );

        const enrichedChallenges = data.map(challenge => ({
          ...challenge,
          participants_count: challenge.challenge_participants?.[0]?.count || 0,
          is_joined: participationMap.has(challenge.id),
          user_progress: participationMap.get(challenge.id) || 0
        }));

        setChallenges(enrichedChallenges);
      } else {
        setChallenges(data || []);
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) {
      toast.error(t('common:login_required'));
      return;
    }

    setJoiningId(challengeId);
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          current_progress: 0,
          is_public: true
        });

      if (error) throw error;

      toast.success(t('challenges:joined_success'));
      fetchChallenges();
    } catch (err) {
      console.error('Error joining challenge:', err);
      toast.error(t('challenges:join_error'));
    } finally {
      setJoiningId(null);
    }
  };

  const fetchLeaderboard = async (challengeId: string) => {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('user_id, current_progress')
        .eq('challenge_id', challengeId)
        .eq('is_public', true)
        .order('current_progress', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch profiles separately
      const userIds = data?.map(p => p.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, { username: p.username, avatar_url: p.avatar_url }]) || []);

      const ranked: Participant[] = data?.map((p, index) => ({
        user_id: p.user_id,
        current_progress: p.current_progress || 0,
        rank: index + 1,
        profile: profileMap.get(p.user_id) as { username: string; avatar_url: string } | undefined
      })) || [];

      setLeaderboard(ranked);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  const viewChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    fetchLeaderboard(challenge.id);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  if (selectedChallenge) {
    const progress = (selectedChallenge.user_progress || 0) / selectedChallenge.target_value * 100;

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedChallenge(null)}>
          ← {t('common:back')}
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  {selectedChallenge.title}
                </CardTitle>
                <p className="text-muted-foreground mt-2">{selectedChallenge.description}</p>
              </div>
              <Badge variant="secondary">
                <Flame className="h-3 w-3 mr-1" />
                {selectedChallenge.points_reward} {t('challenges:points')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedChallenge.is_joined && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('challenges:your_progress')}</span>
                  <span>{selectedChallenge.user_progress} / {selectedChallenge.target_value} {selectedChallenge.target_unit}</span>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-3" />
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {getDaysRemaining(selectedChallenge.end_date)} {t('challenges:days_remaining')}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {selectedChallenge.participants_count} {t('challenges:participants')}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                {t('challenges:leaderboard')}
              </h4>
              <div className="space-y-2">
                {leaderboard.map((participant) => (
                  <div 
                    key={participant.user_id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      participant.user_id === user?.id ? 'bg-primary/10' : 'bg-secondary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">
                        {getRankIcon(participant.rank || 0)}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.profile?.avatar_url} />
                        <AvatarFallback>
                          {participant.profile?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {participant.profile?.username || t('common:anonymous')}
                      </span>
                    </div>
                    <span className="text-sm font-semibold">
                      {participant.current_progress} {selectedChallenge.target_unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {t('challenges:social_challenges')}
        </h2>
      </div>

      {challenges.length === 0 ? (
        <Card className="p-8 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('challenges:no_challenges')}</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {challenges.map((challenge) => (
            <Card 
              key={challenge.id} 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => viewChallenge(challenge)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {challenge.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    <Flame className="h-3 w-3 mr-1" />
                    {challenge.points_reward}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {challenge.target_value} {challenge.target_unit}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {getDaysRemaining(challenge.end_date)}d
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {challenge.participants_count}
                  </div>
                </div>

                {challenge.is_joined ? (
                  <div className="space-y-1">
                    <Progress 
                      value={(challenge.user_progress || 0) / challenge.target_value * 100} 
                      className="h-2" 
                    />
                    <p className="text-xs text-muted-foreground">
                      {challenge.user_progress} / {challenge.target_value} {challenge.target_unit}
                    </p>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      joinChallenge(challenge.id);
                    }}
                    disabled={joiningId === challenge.id}
                  >
                    {joiningId === challenge.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    {t('challenges:join_challenge')}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
