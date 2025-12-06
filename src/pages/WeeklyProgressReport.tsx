import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Trophy, 
  Flame, 
  Footprints, 
  Moon, 
  Utensils,
  TrendingUp,
  Calendar,
  Loader2,
  RefreshCw,
  Award,
  Target
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, subDays } from "date-fns";

interface WeeklyReport {
  period: {
    start: string;
    end: string;
  };
  workouts: {
    total: number;
    totalMinutes: number;
    caloriesBurned: number;
    types: string[];
    avgPerDay: number;
  };
  nutrition: {
    mealsLogged: number;
    avgDailyCalories: number;
    avgDailyProtein: number;
  };
  activity: {
    totalSteps: number;
    avgDailySteps: number;
  };
  sleep: {
    avgHours: number | null;
  };
  bodyProgress: {
    weightChange: number | null;
  };
  highlights: string[];
}

const WeeklyProgressReport = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['fitness', 'common']);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t('common:authentication_required'));
        navigate('/auth');
        return;
      }

      const response = await supabase.functions.invoke('weekly-progress-report', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) throw response.error;
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error(t('fitness:failed_to_load_report'));
    } finally {
      setIsLoading(false);
    }
  };

  const getHighlightMessage = (highlight: string) => {
    const messages: Record<string, { icon: React.ReactNode; message: string; color: string }> = {
      workout_streak: { 
        icon: <Trophy className="w-5 h-5" />, 
        message: t('fitness:highlight_workout_streak'),
        color: 'text-yellow-500'
      },
      workout_consistent: { 
        icon: <Award className="w-5 h-5" />, 
        message: t('fitness:highlight_workout_consistent'),
        color: 'text-blue-500'
      },
      steps_champion: { 
        icon: <Footprints className="w-5 h-5" />, 
        message: t('fitness:highlight_steps_champion'),
        color: 'text-green-500'
      },
      steps_active: { 
        icon: <Footprints className="w-5 h-5" />, 
        message: t('fitness:highlight_steps_active'),
        color: 'text-teal-500'
      },
      sleep_great: { 
        icon: <Moon className="w-5 h-5" />, 
        message: t('fitness:highlight_sleep_great'),
        color: 'text-purple-500'
      },
      nutrition_balanced: { 
        icon: <Utensils className="w-5 h-5" />, 
        message: t('fitness:highlight_nutrition_balanced'),
        color: 'text-orange-500'
      },
    };
    return messages[highlight] || { icon: <Target className="w-5 h-5" />, message: highlight, color: 'text-primary' };
  };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/activity')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('fitness:weekly_progress_report')}</h1>
            {report && (
              <p className="text-muted-foreground">
                {format(new Date(report.period.start), 'MMM d')} - {format(new Date(report.period.end), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={fetchReport} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {t('common:refresh')}
        </Button>
      </div>

      {report && (
        <>
          {/* Highlights */}
          {report.highlights.length > 0 && (
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  {t('fitness:weekly_highlights')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.highlights.map((highlight, index) => {
                    const { icon, message, color } = getHighlightMessage(highlight);
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                        <div className={color}>{icon}</div>
                        <span className="font-medium">{message}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{t('fitness:workouts')}</h3>
              </div>
              <p className="text-3xl font-bold text-primary">{report.workouts.total}</p>
              <p className="text-sm text-muted-foreground">
                {report.workouts.totalMinutes} {t('fitness:minutes')}
              </p>
              <Progress value={Math.min((report.workouts.total / 7) * 100, 100)} className="mt-2" />
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">{t('fitness:calories_burned')}</h3>
              </div>
              <p className="text-3xl font-bold text-orange-500">{report.workouts.caloriesBurned}</p>
              <p className="text-sm text-muted-foreground">{t('fitness:this_week')}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Footprints className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">{t('fitness:daily_steps')}</h3>
              </div>
              <p className="text-3xl font-bold text-green-500">{report.activity.avgDailySteps.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{t('fitness:avg_per_day')}</p>
              <Progress value={Math.min((report.activity.avgDailySteps / 10000) * 100, 100)} className="mt-2" />
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">{t('fitness:nutrition')}</h3>
              </div>
              <p className="text-3xl font-bold text-blue-500">{report.nutrition.avgDailyCalories}</p>
              <p className="text-sm text-muted-foreground">{t('fitness:avg_calories_day')}</p>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardTitle className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5" />
                {t('fitness:workout_breakdown')}
              </CardTitle>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('fitness:total_sessions')}</span>
                  <span className="font-semibold">{report.workouts.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('fitness:total_time')}</span>
                  <span className="font-semibold">{report.workouts.totalMinutes} {t('fitness:min')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('fitness:avg_per_day')}</span>
                  <span className="font-semibold">{report.workouts.avgPerDay}</span>
                </div>
                {report.workouts.types.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">{t('fitness:activity_types')}</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {report.workouts.types.map((type, i) => (
                        <span key={i} className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <CardTitle className="flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5" />
                {t('fitness:nutrition_summary')}
              </CardTitle>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('fitness:meals_logged')}</span>
                  <span className="font-semibold">{report.nutrition.mealsLogged}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('fitness:avg_daily_calories')}</span>
                  <span className="font-semibold">{report.nutrition.avgDailyCalories} kcal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('fitness:avg_daily_protein')}</span>
                  <span className="font-semibold">{report.nutrition.avgDailyProtein}g</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sleep & Body Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.sleep.avgHours && (
              <Card className="p-6">
                <CardTitle className="flex items-center gap-2 mb-4">
                  <Moon className="w-5 h-5 text-purple-500" />
                  {t('fitness:sleep')}
                </CardTitle>
                <p className="text-3xl font-bold text-purple-500">{report.sleep.avgHours}h</p>
                <p className="text-sm text-muted-foreground">{t('fitness:avg_per_night')}</p>
                <Progress value={Math.min((report.sleep.avgHours / 8) * 100, 100)} className="mt-2" />
              </Card>
            )}

            {report.bodyProgress.weightChange !== null && (
              <Card className="p-6">
                <CardTitle className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5" />
                  {t('fitness:body_progress')}
                </CardTitle>
                <p className={`text-3xl font-bold ${report.bodyProgress.weightChange < 0 ? 'text-green-500' : 'text-orange-500'}`}>
                  {report.bodyProgress.weightChange > 0 ? '+' : ''}{report.bodyProgress.weightChange.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">{t('fitness:weight_change')}</p>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WeeklyProgressReport;
