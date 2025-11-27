import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Flame, Award, CheckCircle2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const Challenges = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("daily");

  // Fetch user profile with stats
  const { data: profile } = useQuery({
    queryKey: ["profile-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("total_points, current_streak, longest_streak")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch challenges
  const { data: challenges } = useQuery({
    queryKey: ["challenges", activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true)
        .eq("challenge_type", activeTab)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch user's completions
  const { data: completions } = useQuery({
    queryKey: ["challenge-completions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("challenge_completions")
        .select("challenge_id, progress_value, completed_at")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  const completeChallenge = useMutation({
    mutationFn: async ({ challengeId, progressValue }: { challengeId: string; progressValue: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("challenge_completions")
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          progress_value: progressValue,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge-completions"] });
      queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
      toast({ title: "Challenge completed!", description: "Points have been awarded!" });
    },
  });

  const isCompleted = (challengeId: string) => {
    return completions?.some(c => c.challenge_id === challengeId);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      steps: Target,
      workout: Trophy,
      nutrition: Award,
      hydration: Target,
      sleep: Target,
      meditation: Target,
    };
    return icons[category] || Target;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Challenges</h1>
          <p className="text-muted-foreground">Complete challenges to earn points and badges</p>
        </div>
        <Button onClick={() => navigate('/progress-challenges')}>
          <Plus className="mr-2 h-4 w-4" />
          Custom Challenges
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.total_points || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.current_streak || 0} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
            <Award className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.longest_streak || 0} days</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="milestone">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges?.map((challenge) => {
              const CategoryIcon = getCategoryIcon(challenge.category);
              const completed = isCompleted(challenge.id);

              return (
                <Card key={challenge.id} className={completed ? "opacity-60" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <CategoryIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          <CardDescription>{challenge.description}</CardDescription>
                        </div>
                      </div>
                      {completed && <CheckCircle2 className="w-5 h-5 text-success" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Target: {challenge.target_value} {challenge.target_unit}
                      </span>
                      <Badge variant="secondary" className="capitalize">
                        {challenge.category}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Ends: {format(new Date(challenge.end_date), "MMM dd, yyyy")}
                      </span>
                      <span className="font-medium text-warning">
                        +{challenge.points_reward} points
                      </span>
                    </div>

                    {!completed && (
                      <Button
                        className="w-full"
                        onClick={() =>
                          completeChallenge.mutate({
                            challengeId: challenge.id,
                            progressValue: challenge.target_value,
                          })
                        }
                        disabled={completeChallenge.isPending}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {challenges?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No {activeTab} challenges available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Challenges;
