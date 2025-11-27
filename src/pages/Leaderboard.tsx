import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Flame, Target, Calendar } from "lucide-react";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("total_points");

  // Fetch leaderboard with user profiles
  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard", activeTab],
    queryFn: async () => {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data: entries, error } = await supabase
        .from("leaderboard_entries")
        .select("*")
        .eq("leaderboard_type", activeTab)
        .gte("period_start", periodStart.toISOString())
        .lte("period_end", periodEnd.toISOString())
        .order("score", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch user profiles
      if (!entries || entries.length === 0) return [];

      const userIds = entries.map(e => e.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      // Merge entries with profiles
      return entries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        profile: profiles?.find(p => p.id === entry.user_id),
      }));
    },
  });

  const getTabIcon = (type: string) => {
    const icons: Record<string, any> = {
      total_points: Trophy,
      daily_steps: Target,
      weekly_workouts: TrendingUp,
      monthly_challenges: Calendar,
      streak: Flame,
    };
    return icons[type] || Trophy;
  };

  const getTabLabel = (type: string) => {
    const labels: Record<string, string> = {
      total_points: "Total Points",
      daily_steps: "Daily Steps",
      weekly_workouts: "Weekly Workouts",
      monthly_challenges: "Monthly Challenges",
      streak: "Longest Streak",
    };
    return labels[type] || type;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-warning";
    if (rank === 2) return "text-muted-foreground";
    if (rank === 3) return "text-accent";
    return "text-foreground";
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">See how you rank against other users</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="total_points">Points</TabsTrigger>
          <TabsTrigger value="daily_steps">Steps</TabsTrigger>
          <TabsTrigger value="weekly_workouts">Workouts</TabsTrigger>
          <TabsTrigger value="monthly_challenges">Challenges</TabsTrigger>
          <TabsTrigger value="streak">Streaks</TabsTrigger>
        </TabsList>

        {["total_points", "daily_steps", "weekly_workouts", "monthly_challenges", "streak"].map((type) => {
          const TabIcon = getTabIcon(type);
          
          return (
            <TabsContent key={type} value={type}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TabIcon className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle>{getTabLabel(type)}</CardTitle>
                      <CardDescription>Top performers this month</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard?.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className={`text-2xl font-bold ${getRankColor(entry.rank)} min-w-[3rem]`}>
                            {getRankBadge(entry.rank)}
                          </span>
                          
                          <Avatar>
                            {entry.profile?.avatar_url ? (
                              <AvatarImage src={entry.profile.avatar_url} alt={entry.profile.full_name || "User"} />
                            ) : (
                              <AvatarFallback>
                                {entry.profile?.full_name?.charAt(0) || "?"}
                              </AvatarFallback>
                            )}
                          </Avatar>

                          <div>
                            <p className="font-medium">{entry.profile?.full_name || "Anonymous"}</p>
                            <p className="text-sm text-muted-foreground">
                              Score: {entry.score.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {entry.rank <= 3 && (
                          <Badge variant={entry.rank === 1 ? "default" : "secondary"}>
                            Top {entry.rank}
                          </Badge>
                        )}
                      </div>
                    ))}

                    {(!leaderboard || leaderboard.length === 0) && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No leaderboard data available yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Leaderboard;
