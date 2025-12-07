import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MicroChallengeCard } from './MicroChallengeCard';
import { CreateMicroChallenge } from './CreateMicroChallenge';
import { Zap, Flame, Users, Trophy, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface MicroChallenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_value: number;
  target_unit: string;
  duration_minutes: number;
  points_reward: number;
  total_completions: number;
  viral_score: number;
  share_code: string | null;
  creator_id: string;
}

export const MicroChallengeHub = () => {
  const { t } = useTranslation(['challenges', 'common']);
  const [challenges, setChallenges] = useState<MicroChallenge[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');

  const fetchChallenges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: challengesData, error } = await supabase
        .from('micro_challenges')
        .select('*')
        .eq('is_active', true)
        .order('viral_score', { ascending: false });

      if (error) throw error;
      setChallenges(challengesData || []);

      if (user) {
        const { data: completions } = await supabase
          .from('micro_challenge_completions')
          .select('challenge_id')
          .eq('user_id', user.id);

        setCompletedIds(completions?.map(c => c.challenge_id) || []);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const filterChallenges = (type?: string) => {
    let filtered = challenges;
    if (type) {
      filtered = challenges.filter(c => c.challenge_type === type);
    }
    return filtered;
  };

  const stats = {
    total: challenges.length,
    completed: completedIds.length,
    trending: challenges.filter(c => c.viral_score > 10).length
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-gradient-card">
          <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">{t('active_challenges')}</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-card">
          <Trophy className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">{stats.completed}</p>
          <p className="text-xs text-muted-foreground">{t('completed')}</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-card">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <p className="text-2xl font-bold">{stats.trending}</p>
          <p className="text-xs text-muted-foreground">{t('trending')}</p>
        </Card>
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        <CreateMicroChallenge onCreated={fetchChallenges} />
      </div>

      {/* Challenge Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trending">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t('trending')}</span>
          </TabsTrigger>
          <TabsTrigger value="quick_burst">
            <Zap className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t('micro_quick_burst')}</span>
          </TabsTrigger>
          <TabsTrigger value="daily_dare">
            <Flame className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t('micro_daily_dare')}</span>
          </TabsTrigger>
          <TabsTrigger value="friend_face_off">
            <Users className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t('micro_friend_face_off')}</span>
          </TabsTrigger>
          <TabsTrigger value="community_wave">
            <Trophy className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t('micro_community_wave')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4 mt-4">
          {filterChallenges().length > 0 ? (
            filterChallenges().map(challenge => (
              <MicroChallengeCard
                key={challenge.id}
                challenge={challenge}
                isCompleted={completedIds.includes(challenge.id)}
                onComplete={fetchChallenges}
              />
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">{t('no_challenges')}</p>
            </Card>
          )}
        </TabsContent>

        {['quick_burst', 'daily_dare', 'friend_face_off', 'community_wave'].map(type => (
          <TabsContent key={type} value={type} className="space-y-4 mt-4">
            {filterChallenges(type).length > 0 ? (
              filterChallenges(type).map(challenge => (
                <MicroChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isCompleted={completedIds.includes(challenge.id)}
                  onComplete={fetchChallenges}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">{t('no_challenges')}</p>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
