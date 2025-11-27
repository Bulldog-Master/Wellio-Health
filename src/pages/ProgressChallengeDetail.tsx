import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Users, ArrowLeft, Plus, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  target_unit: string;
  points_reward: number;
  difficulty_level: string;
}

interface Milestone {
  id: string;
  milestone_name: string;
  target_value: number;
  points_reward: number;
  sort_order: number;
}

interface Participant {
  id: string;
  user_id: string;
  current_progress: number;
  status: string;
  profiles?: {
    username: string;
    full_name: string;
  };
}

interface LeaderboardEntry {
  user_id: string;
  progress: number;
  rank: number;
  points_earned: number;
  milestones_completed: number;
  profiles?: {
    username: string;
    full_name: string;
  };
}

const ProgressChallengeDetail = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userParticipation, setUserParticipation] = useState<Participant | null>(null);
  const [progressInput, setProgressInput] = useState("");

  useEffect(() => {
    fetchChallengeData();
    setupRealtimeSubscriptions();
  }, [challengeId]);

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel(`challenge-${challengeId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'challenge_leaderboard',
        filter: `challenge_id=eq.${challengeId}`
      }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchChallengeData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: challengeData, error: challengeError } = await supabase
        .from('custom_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;
      setChallenge(challengeData);

      const { data: milestonesData } = await supabase
        .from('challenge_milestones')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('sort_order');

      setMilestones(milestonesData || []);

      const { data: participationData } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .single();

      setUserParticipation(participationData);

      await fetchLeaderboard();
    } catch (error) {
      console.error('Error fetching challenge data:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('challenge_leaderboard')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('rank');

      if (error) throw error;

      if (data && data.length > 0) {
        const userIds = data.map(entry => entry.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .in('id', userIds);

        const leaderboardWithProfiles = data.map(entry => ({
          ...entry,
          profiles: profilesData?.find(p => p.id === entry.user_id)
        }));

        setLeaderboard(leaderboardWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const joinChallenge = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('challenge_participants')
        .insert([{
          challenge_id: challengeId,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('challenge_leaderboard')
        .insert([{
          challenge_id: challengeId,
          user_id: user.id,
          progress: 0,
          rank: 0,
          points_earned: 0,
          milestones_completed: 0,
        }]);

      setUserParticipation(data);

      toast({
        title: "Success",
        description: "You've joined the challenge!",
      });
    } catch (error: any) {
      if (error?.code === '23505') {
        toast({
          title: "Already Joined",
          description: "You're already participating in this challenge",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to join challenge",
          variant: "destructive",
        });
      }
    }
  };

  const updateProgress = async () => {
    if (!userParticipation || !progressInput) return;

    try {
      const newProgress = parseFloat(progressInput);

      const { error } = await supabase
        .from('challenge_participants')
        .update({ current_progress: newProgress })
        .eq('id', userParticipation.id);

      if (error) throw error;

      await supabase
        .from('challenge_leaderboard')
        .update({ 
          progress: newProgress,
          last_updated: new Date().toISOString()
        })
        .eq('challenge_id', challengeId)
        .eq('user_id', userParticipation.user_id);

      toast({
        title: "Success",
        description: "Progress updated!",
      });

      setProgressInput("");
      fetchChallengeData();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  if (!challenge) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <p>Loading challenge...</p>
        </div>
      </Layout>
    );
  }

  const progressPercentage = userParticipation
    ? (userParticipation.current_progress / challenge.target_value) * 100
    : 0;

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate('/progress-challenges')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Challenges
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl">{challenge.title}</CardTitle>
                    <p className="text-muted-foreground mt-2">{challenge.description}</p>
                  </div>
                  <Badge className="capitalize">{challenge.difficulty_level}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="text-2xl font-bold">{challenge.target_value} {challenge.target_unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reward</p>
                    <p className="text-2xl font-bold text-primary">{challenge.points_reward} pts</p>
                  </div>
                </div>

                {!userParticipation ? (
                  <Button onClick={joinChallenge} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Join Challenge
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Your Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {userParticipation.current_progress} / {challenge.target_value} {challenge.target_unit}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                    </div>

                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Update progress"
                        value={progressInput}
                        onChange={(e) => setProgressInput(e.target.value)}
                      />
                      <Button onClick={updateProgress}>Update</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {milestones.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {milestones.map((milestone) => {
                      const achieved = userParticipation && userParticipation.current_progress >= milestone.target_value;
                      return (
                        <div key={milestone.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${achieved ? 'bg-primary' : 'bg-muted'}`}>
                              {achieved ? <Check className="h-4 w-4 text-primary-foreground" /> : <Trophy className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-medium">{milestone.milestone_name}</p>
                              <p className="text-sm text-muted-foreground">{milestone.target_value} {challenge.target_unit}</p>
                            </div>
                          </div>
                          <Badge variant={achieved ? "default" : "outline"}>
                            {milestone.points_reward} pts
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No participants yet</p>
                  ) : (
                    leaderboard.map((entry) => (
                      <div key={entry.user_id} className="flex items-center gap-3 p-2 rounded hover:bg-accent">
                        <div className="font-bold text-lg w-8 text-center">#{entry.rank}</div>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {(entry.profiles?.username || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{entry.profiles?.username || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{entry.progress} {challenge.target_unit}</p>
                        </div>
                        <Badge variant="secondary">{entry.points_earned} pts</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProgressChallengeDetail;