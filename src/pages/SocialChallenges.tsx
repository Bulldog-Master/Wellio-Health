import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Trophy,
  Users,
  Target,
  Calendar,
  Medal,
  Loader2,
  TrendingUp,
  Crown
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow, format } from "date-fns";

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
  difficulty_level: string;
  is_public: boolean;
  participants_count: number;
  user_joined: boolean;
  user_progress: number;
}

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  progress: number;
  points_earned: number;
  rank: number;
}

const SocialChallenges = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['challenges', 'common']);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [joinedChallenges, setJoinedChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all public challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('custom_challenges')
        .select('*')
        .eq('is_public', true)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (challengesError) throw challengesError;

      // Fetch user's participations
      const { data: participations } = await supabase
        .from('challenge_participants')
        .select('challenge_id, current_progress')
        .eq('user_id', user.id);

      const participationMap = new Map(
        participations?.map(p => [p.challenge_id, p.current_progress]) || []
      );

      // Get participant counts
      const enrichedChallenges = await Promise.all(
        (challengesData || []).map(async (challenge) => {
          const { count } = await supabase
            .from('challenge_participants')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challenge.id);

          return {
            ...challenge,
            participants_count: count || 0,
            user_joined: participationMap.has(challenge.id),
            user_progress: participationMap.get(challenge.id) || 0,
          };
        })
      );

      const joined = enrichedChallenges.filter(c => c.user_joined);
      const available = enrichedChallenges.filter(c => !c.user_joined);

      setChallenges(available);
      setJoinedChallenges(joined);

      // Fetch leaderboards for joined challenges
      for (const challenge of joined) {
        await fetchLeaderboard(challenge.id);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error(t('challenges:failed_to_load'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async (challengeId: string) => {
    try {
      const { data } = await supabase
        .from('challenge_leaderboard')
        .select(`
          user_id,
          progress,
          points_earned,
          rank
        `)
        .eq('challenge_id', challengeId)
        .order('rank', { ascending: true })
        .limit(10);

      if (data) {
        // Fetch user profiles
        const userIds = data.map(e => e.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const enrichedLeaderboard = data.map(entry => ({
          ...entry,
          username: profileMap.get(entry.user_id)?.username || 'Anonymous',
          avatar_url: profileMap.get(entry.user_id)?.avatar_url,
        }));

        setLeaderboard(prev => ({
          ...prev,
          [challengeId]: enrichedLeaderboard
        }));
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    setJoiningId(challengeId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          is_public: true,
        });

      if (error) throw error;

      toast.success(t('challenges:joined_success'));
      fetchChallenges();
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error(t('challenges:join_error'));
    } finally {
      setJoiningId(null);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'hard': return 'text-orange-500 bg-orange-500/10';
      case 'extreme': return 'text-red-500 bg-red-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  const ChallengeCard = ({ challenge, showJoin = false }: { challenge: Challenge; showJoin?: boolean }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{challenge.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(challenge.difficulty_level || 'medium')}`}>
                {challenge.difficulty_level || 'medium'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{challenge.description}</p>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {challenge.participants_count}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span>{challenge.target_value} {challenge.target_unit}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>{challenge.points_reward} {t('challenges:points')}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t('challenges:ends')} {formatDistanceToNow(new Date(challenge.end_date), { addSuffix: true })}
            </span>
          </div>
        </div>

        {challenge.user_joined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{t('challenges:your_progress')}</span>
              <span>{Math.round((challenge.user_progress / challenge.target_value) * 100)}%</span>
            </div>
            <Progress value={(challenge.user_progress / challenge.target_value) * 100} />
          </div>
        )}

        {showJoin ? (
          <Button 
            onClick={() => handleJoinChallenge(challenge.id)}
            disabled={joiningId === challenge.id}
            className="w-full gap-2"
          >
            {joiningId === challenge.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            {t('challenges:join_challenge')}
          </Button>
        ) : (
          <Button 
            variant="outline"
            onClick={() => navigate(`/progress-challenges/${challenge.id}`)}
            className="w-full gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            {t('challenges:view_details')}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/activity')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            {t('challenges:social_challenges')}
          </h1>
          <p className="text-muted-foreground">{t('challenges:compete_with_community')}</p>
        </div>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available" className="gap-2">
            <Target className="w-4 h-4" />
            {t('challenges:available')} ({challenges.length})
          </TabsTrigger>
          <TabsTrigger value="joined" className="gap-2">
            <Users className="w-4 h-4" />
            {t('challenges:my_challenges')} ({joinedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {challenges.length === 0 ? (
            <Card className="p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">{t('challenges:no_challenges_available')}</h3>
              <p className="text-muted-foreground">{t('challenges:check_back_later')}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} showJoin />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="joined" className="space-y-6">
          {joinedChallenges.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">{t('challenges:no_joined_challenges')}</h3>
              <p className="text-muted-foreground">{t('challenges:join_challenge_to_start')}</p>
            </Card>
          ) : (
            joinedChallenges.map((challenge) => (
              <div key={challenge.id} className="space-y-4">
                <ChallengeCard challenge={challenge} />
                
                {/* Leaderboard */}
                {leaderboard[challenge.id] && leaderboard[challenge.id].length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Medal className="w-5 h-5 text-yellow-500" />
                        {t('challenges:leaderboard')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {leaderboard[challenge.id].map((entry, index) => (
                          <div 
                            key={entry.user_id}
                            className={`flex items-center gap-4 p-3 rounded-lg ${
                              index < 3 ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="w-8 text-center">
                              {index === 0 ? (
                                <Crown className="w-6 h-6 text-yellow-500 mx-auto" />
                              ) : index === 1 ? (
                                <Medal className="w-6 h-6 text-gray-400 mx-auto" />
                              ) : index === 2 ? (
                                <Medal className="w-6 h-6 text-amber-600 mx-auto" />
                              ) : (
                                <span className="font-semibold text-muted-foreground">
                                  #{entry.rank}
                                </span>
                              )}
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={entry.avatar_url || undefined} />
                              <AvatarFallback>
                                {entry.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{entry.username}</p>
                              <p className="text-sm text-muted-foreground">
                                {entry.points_earned} {t('challenges:points')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">
                                {Math.round((entry.progress / challenge.target_value) * 100)}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialChallenges;
