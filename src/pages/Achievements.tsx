import { Card } from "@/components/ui/card";
import { Trophy, Flame, Activity, Footprints, Clock, Scale, TrendingDown, ArrowLeft, Calendar } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface Achievement {
  id: string;
  achievement_type: string;
  created_at: string;
  actual_value: number;
  goal_value: number;
  achieved_at: string;
  user_id: string;
}

const Achievements = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "move" | "exercise" | "stand" | "weight">("all");

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Error",
        description: "Failed to load achievements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "move":
        return <Flame className="w-6 h-6 text-destructive" />;
      case "exercise":
        return <Activity className="w-6 h-6 text-success" />;
      case "stand":
        return <Footprints className="w-6 h-6 text-primary" />;
      case "weight":
        return <Scale className="w-6 h-6 text-accent" />;
      default:
        return <Trophy className="w-6 h-6 text-warning" />;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case "move":
        return "bg-destructive/10 border-destructive/20";
      case "exercise":
        return "bg-success/10 border-success/20";
      case "stand":
        return "bg-primary/10 border-primary/20";
      case "weight":
        return "bg-accent/10 border-accent/20";
      default:
        return "bg-warning/10 border-warning/20";
    }
  };

  const getAchievementLabel = (type: string) => {
    switch (type) {
      case "move":
        return "Move Goal";
      case "exercise":
        return "Exercise Goal";
      case "stand":
        return "Stand Goal";
      case "weight":
        return "Weight Milestone";
      default:
        return "Achievement";
    }
  };

  const getAchievementUnit = (type: string) => {
    switch (type) {
      case "move":
        return "cal";
      case "exercise":
        return "min";
      case "stand":
        return "hrs";
      case "weight":
        return "lbs";
      default:
        return "";
    }
  };

  const filteredAchievements = useMemo(() => {
    if (filter === "all") return achievements;
    return achievements.filter(a => a.achievement_type === filter);
  }, [achievements, filter]);

  const statistics = useMemo(() => {
    const totalAchievements = achievements.length;
    const achievementsByType = achievements.reduce((acc, a) => {
      acc[a.achievement_type] = (acc[a.achievement_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const thisMonth = achievements.filter(a => {
      const achievedDate = new Date(a.achieved_at);
      const now = new Date();
      return achievedDate.getMonth() === now.getMonth() && 
             achievedDate.getFullYear() === now.getFullYear();
    }).length;

    const thisWeek = achievements.filter(a => {
      const achievedDate = new Date(a.achieved_at);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return achievedDate >= weekAgo;
    }).length;

    return {
      total: totalAchievements,
      byType: achievementsByType,
      thisMonth,
      thisWeek,
    };
  }, [achievements]);

  return (
    <div className="space-y-6 max-w-5xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-warning/10 rounded-xl">
          <Trophy className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">Your journey of milestones and accomplishments</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5" />
            <h3 className="font-semibold">Total</h3>
          </div>
          <p className="text-4xl font-bold">{statistics.total}</p>
          <p className="opacity-90 text-sm mt-1">All time</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">This Week</h3>
          </div>
          <p className="text-3xl font-bold text-primary">{statistics.thisWeek}</p>
          <p className="text-muted-foreground text-sm mt-1">Last 7 days</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-success" />
            <h3 className="font-semibold">This Month</h3>
          </div>
          <p className="text-3xl font-bold text-success">{statistics.thisMonth}</p>
          <p className="text-muted-foreground text-sm mt-1">Current month</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold">Most Common</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {Object.keys(statistics.byType).length > 0
              ? getAchievementLabel(
                  Object.entries(statistics.byType).sort((a, b) => b[1] - a[1])[0][0]
                )
              : "None yet"}
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            {Object.keys(statistics.byType).length > 0
              ? `${Object.entries(statistics.byType).sort((a, b) => b[1] - a[1])[0][1]} times`
              : "Start achieving!"}
          </p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card className="p-6 bg-gradient-card shadow-md">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="move">Move</TabsTrigger>
            <TabsTrigger value="exercise">Exercise</TabsTrigger>
            <TabsTrigger value="stand">Stand</TabsTrigger>
            <TabsTrigger value="weight">Weight</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-0">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading achievements...</p>
              </div>
            ) : filteredAchievements.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-xl font-semibold mb-2">No achievements yet</p>
                <p className="text-muted-foreground">
                  {filter === "all" 
                    ? "Start completing your goals to earn achievements!"
                    : `Complete ${getAchievementLabel(filter).toLowerCase()} to earn achievements!`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAchievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`p-6 border-2 ${getAchievementColor(achievement.achievement_type)} 
                      hover:shadow-lg transition-smooth`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-background rounded-lg shadow-sm">
                          {getAchievementIcon(achievement.achievement_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold">
                              {getAchievementLabel(achievement.achievement_type)} Completed!
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {achievement.achievement_type}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-muted-foreground">
                            <p className="text-lg">
                              <span className="font-semibold text-foreground">
                                {achievement.actual_value.toLocaleString()} {getAchievementUnit(achievement.achievement_type)}
                              </span>
                              {" "} out of {" "}
                              <span className="font-semibold text-foreground">
                                {achievement.goal_value.toLocaleString()} {getAchievementUnit(achievement.achievement_type)}
                              </span>
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4" />
                              <span>
                                {format(new Date(achievement.achieved_at), "MMMM d, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-6xl">🎉</div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Achievements;
