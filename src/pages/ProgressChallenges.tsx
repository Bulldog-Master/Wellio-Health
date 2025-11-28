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
import { Trophy, Plus, Users, Calendar, Target, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";

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
        title: "Error",
        description: "Failed to load challenges",
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
        title: "Success",
        description: "Challenge created successfully",
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
        title: "Error",
        description: "Failed to create challenge",
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
          <div>
            <h1 className="text-3xl font-bold">Progress Challenges</h1>
            <p className="text-muted-foreground">Create and join custom fitness challenges with milestones</p>
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
            {showCreateForm ? "Cancel" : "Create Challenge"}
          </Button>
        </div>

        {showCreateForm && !hasFeature('custom_challenges') && (
          <UpgradePrompt feature="Custom Challenges" />
        )}

        {showCreateForm && hasFeature('custom_challenges') && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Challenge</CardTitle>
              <CardDescription>Set up a custom challenge with milestones and rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Challenge Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="30 Day Workout Challenge"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Complete 30 workouts in 30 days..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="challenge_type">Challenge Type</Label>
                  <Select value={formData.challenge_type} onValueChange={(value) => setFormData({ ...formData, challenge_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workout_count">Workout Count</SelectItem>
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="weight_loss">Weight Loss</SelectItem>
                      <SelectItem value="streak">Streak</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={formData.difficulty_level} onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="extreme">Extreme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_value">Target Value</Label>
                  <Input
                    id="target_value"
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_unit">Unit</Label>
                  <Input
                    id="target_unit"
                    value={formData.target_unit}
                    onChange={(e) => setFormData({ ...formData, target_unit: e.target.value })}
                    placeholder="workouts, miles, lbs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points_reward">Points Reward</Label>
                <Input
                  id="points_reward"
                  type="number"
                  value={formData.points_reward}
                  onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) })}
                />
              </div>

              <Button onClick={createChallenge} className="w-full">
                Create Challenge
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-muted-foreground">Loading challenges...</p>
          ) : challenges.length === 0 ? (
            <p className="text-muted-foreground">No challenges available</p>
          ) : (
            challenges.map((challenge) => (
              <Card key={challenge.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/progress-challenge/${challenge.id}`)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{challenge.title}</CardTitle>
                    <Badge className={getDifficultyColor(challenge.difficulty_level)}>
                      {challenge.difficulty_level}
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
                    {challenge.participants_count} participants
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{challenge.points_reward} points</span>
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