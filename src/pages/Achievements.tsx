import { Card } from "@/components/ui/card";
import { Trophy, Flame, Activity, Footprints, Clock, Scale, TrendingDown, ArrowLeft, Calendar, Share2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(['achievements', 'common']);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "move" | "exercise" | "stand" | "weight">("all");
  const [celebrationShown, setCelebrationShown] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, []);

  useEffect(() => {
    // Celebration confetti on page load (only once)
    if (achievements.length > 0 && !celebrationShown) {
      setCelebrationShown(true);
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 30 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [achievements, celebrationShown]);

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
        title: t('achievements:error'),
        description: t('achievements:failed_to_load'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (achievement: Achievement) => {
    const shareText = `🎉 I just achieved ${getAchievementLabel(achievement.achievement_type)}! ${achievement.actual_value} ${getAchievementUnit(achievement.achievement_type)} completed! #Wellio #FitnessGoals`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Achievement Unlocked!',
          text: shareText,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard!",
          description: "Share your achievement on social media.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
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
      case "weight_25":
      case "weight_50":
      case "weight_75":
      case "weight_100":
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
      case "weight_25":
      case "weight_50":
      case "weight_75":
      case "weight_100":
        return "bg-accent/10 border-accent/20";
      default:
        return "bg-warning/10 border-warning/20";
    }
  };

  const getAchievementLabel = (type: string) => {
    switch (type) {
      case "move":
        return t('achievements:move_goal');
      case "exercise":
        return t('achievements:exercise_goal');
      case "stand":
        return t('achievements:stand_goal');
      case "weight_25":
        return t('achievements:weight_milestone_25');
      case "weight_50":
        return t('achievements:weight_milestone_50');
      case "weight_75":
        return t('achievements:weight_milestone_75');
      case "weight_100":
        return t('achievements:weight_goal_complete');
      default:
        return t('achievements:achievement');
    }
  };

  const getAchievementUnit = (type: string) => {
    switch (type) {
      case "move":
        return t('achievements:cal');
      case "exercise":
        return t('achievements:min');
      case "stand":
        return t('achievements:hrs');
      case "weight_25":
      case "weight_50":
      case "weight_75":
      case "weight_100":
        return t('achievements:lbs');
      default:
        return "";
    }
  };

  const filteredAchievements = useMemo(() => {
    if (filter === "all") return achievements;
    if (filter === "weight") {
      return achievements.filter(a => 
        a.achievement_type === "weight_25" || 
        a.achievement_type === "weight_50" || 
        a.achievement_type === "weight_75" || 
        a.achievement_type === "weight_100"
      );
    }
    return achievements.filter(a => a.achievement_type === filter);
  }, [achievements, filter]);

  const statistics = useMemo(() => {
    const totalAchievements = achievements.length;
    const achievementsByType = achievements.reduce((acc, a) => {
      // Normalize weight milestone types to "weight" for statistics
      const type = a.achievement_type.startsWith('weight_') ? 'weight' : a.achievement_type;
      acc[type] = (acc[type] || 0) + 1;
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
        {t('achievements:back_to_dashboard')}
      </Button>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-warning/10 rounded-xl">
          <Trophy className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t('achievements:achievements')}</h1>
          <p className="text-muted-foreground">{t('achievements:journey_milestones')}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5" />
            <h3 className="font-semibold">{t('achievements:total')}</h3>
          </div>
          <p className="text-4xl font-bold">{statistics.total}</p>
          <p className="opacity-90 text-sm mt-1">{t('achievements:all_time')}</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{t('achievements:this_week')}</h3>
          </div>
          <p className="text-3xl font-bold text-primary">{statistics.thisWeek}</p>
          <p className="text-muted-foreground text-sm mt-1">{t('achievements:last_7_days')}</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-success" />
            <h3 className="font-semibold">{t('achievements:this_month')}</h3>
          </div>
          <p className="text-3xl font-bold text-success">{statistics.thisMonth}</p>
          <p className="text-muted-foreground text-sm mt-1">{t('achievements:current_month')}</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold">{t('achievements:most_common')}</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {Object.keys(statistics.byType).length > 0
              ? (() => {
                  const mostCommonType = Object.entries(statistics.byType).sort((a, b) => b[1] - a[1])[0][0];
                  // Handle normalized weight type
                  if (mostCommonType === "weight") return t('achievements:weight_milestone');
                  return getAchievementLabel(mostCommonType);
                })()
              : t('achievements:none_yet')}
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
            <TabsTrigger value="all">{t('achievements:all')}</TabsTrigger>
            <TabsTrigger value="move">{t('achievements:move')}</TabsTrigger>
            <TabsTrigger value="exercise">{t('achievements:exercise')}</TabsTrigger>
            <TabsTrigger value="stand">{t('achievements:stand')}</TabsTrigger>
            <TabsTrigger value="weight">{t('achievements:weight')}</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-0">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('achievements:loading_achievements')}</p>
              </div>
            ) : filteredAchievements.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-xl font-semibold mb-2">{t('achievements:no_achievements_yet')}</p>
                <p className="text-muted-foreground">
                  {filter === "all" 
                    ? t('achievements:start_completing_goals')
                    : t('achievements:complete_goal_to_earn', { goal: getAchievementLabel(filter).toLowerCase() })}
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
                              {getAchievementLabel(achievement.achievement_type)} {t('achievements:completed')}
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
                              {" "} {t('achievements:out_of')} {" "}
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
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-6xl">🎉</div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleShare(achievement)}
                        >
                          <Share2 className="w-4 h-4" />
                          {t('achievements:share')}
                        </Button>
                      </div>
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
