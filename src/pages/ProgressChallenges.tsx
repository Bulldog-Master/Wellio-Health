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
import { Trophy, Plus, Users, Calendar, Target, Award, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { useTranslation } from "react-i18next";

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  target_unit: string;
  start_date: string;
  end_date: string;
  difficulty_level: string;
  points_reward: number;
  creator_id: string;
  participants_count?: number;
}

const ProgressChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasFeature } = useSubscription();
  const { t } = useTranslation(['challenges', 'common']);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    challenge_type: "workout_count",
    target_value: 30,
    target_unit: "workouts",
    start_date: "",
    end_date: "",
    difficulty_level: "medium",
    points_reward: 100,
    is_public: true,
    max_participants: 100,
  });

  useEffect(() => {
    fetchChallenges();
    
    const channel = supabase
      .channel('progress-challenges')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'custom_challenges'
      }, () => {
        fetchChallenges();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data: challengesData, error } = await supabase
        .from('custom_challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const challengesWithCounts = await Promise.all(
        (challengesData || []).map(async (challenge) => {
          const { count } = await supabase
            .from('challenge_participants')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challenge.id)
            .eq('status', 'active');

          return { ...challenge, participants_count: count || 0 };
        })
      );

      setChallenges(challengesWithCounts);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast({
        title: t('challenges:error'),
        description: t('challenges:failed_to_load'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('custom_challenges')
        .insert([{
          ...formData,
          creator_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: t('challenges:success'),
        description: t('challenges:challenge_created'),
      });

      setShowCreateForm(false);
      setFormData({
        title: "",
        description: "",
        challenge_type: "workout_count",
        target_value: 30,
        target_unit: "workouts",
        start_date: "",
        end_date: "",
        difficulty_level: "medium",
        points_reward: 100,
        is_public: true,
        max_participants: 100,
      });

      if (data) {
        navigate(`/progress-challenge/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: t('challenges:error'),
        description: t('challenges:failed_to_create'),
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'hard': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'extreme': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/premium')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t('challenges:progress_challenges')}</h1>
              <p className="text-muted-foreground">{t('challenges:progress_challenges_desc')}</p>
            </div>
          </div>
          <Button 
            onClick={() => {
              if (!hasFeature('custom_challenges')) {
                navigate('/subscription');
                return;
              }
              setShowCreateForm(!showCreateForm);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {showCreateForm ? t('challenges:cancel') : t('challenges:create_challenge')}
          </Button>
        </div>

        {showCreateForm && !hasFeature('custom_challenges') && (
          <UpgradePrompt feature="Custom Challenges" />
        )}

        {showCreateForm && hasFeature('custom_challenges') && (
          <Card>
            <CardHeader>
              <CardTitle>{t('challenges:create_new_challenge')}</CardTitle>
              <CardDescription>{t('challenges:setup_custom_challenge')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t('challenges:challenge_title')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('challenges:challenge_title_placeholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('challenges:description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('challenges:description_placeholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="challenge_type">{t('challenges:challenge_type')}</Label>
                  <Select value={formData.challenge_type} onValueChange={(value) => setFormData({ ...formData, challenge_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workout_count">{t('challenges:workout_count')}</SelectItem>
                      <SelectItem value="distance">{t('challenges:distance')}</SelectItem>
                      <SelectItem value="weight_loss">{t('challenges:weight_loss')}</SelectItem>
                      <SelectItem value="streak">{t('challenges:streak')}</SelectItem>
                      <SelectItem value="custom">{t('challenges:custom')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">{t('challenges:difficulty')}</Label>
                  <Select value={formData.difficulty_level} onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">{t('challenges:easy')}</SelectItem>
                      <SelectItem value="medium">{t('challenges:medium')}</SelectItem>
                      <SelectItem value="hard">{t('challenges:hard')}</SelectItem>
                      <SelectItem value="extreme">{t('challenges:extreme')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_value">{t('challenges:target_value')}</Label>
                  <Input
                    id="target_value"
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_unit">{t('challenges:unit')}</Label>
                  <Input
                    id="target_unit"
                    value={formData.target_unit}
                    onChange={(e) => setFormData({ ...formData, target_unit: e.target.value })}
                    placeholder={t('challenges:unit_placeholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">{t('challenges:start_date')}</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">{t('challenges:end_date')}</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points_reward">{t('challenges:points_reward')}</Label>
                <Input
                  id="points_reward"
                  type="number"
                  value={formData.points_reward}
                  onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) })}
                />
              </div>

              <Button onClick={createChallenge} className="w-full">
                {t('challenges:create_challenge')}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-muted-foreground">{t('challenges:loading_challenges')}</p>
          ) : challenges.length === 0 ? (
            <p className="text-muted-foreground">{t('challenges:no_challenges')}</p>
          ) : (
            challenges.map((challenge) => (
              <Card key={challenge.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/progress-challenge/${challenge.id}`)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{challenge.title}</CardTitle>
                    <Badge className={getDifficultyColor(challenge.difficulty_level)}>
                      {t(`challenges:${challenge.difficulty_level}`)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>{challenge.target_value} {challenge.target_unit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(challenge.start_date), 'MMM dd')} - {format(new Date(challenge.end_date), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {challenge.participants_count} {t('challenges:participants')}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{challenge.points_reward} {t('challenges:points')}</span>
                  </div>
                  <div className="pt-2">
                    <Badge variant="outline" className="capitalize">
                      {challenge.challenge_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProgressChallenges;