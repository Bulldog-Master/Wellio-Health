import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Dumbbell, 
  Utensils, 
  Footprints, 
  Moon,
  Loader2,
  Calendar,
  Trophy,
  Target,
  Flame
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const WeeklyProgressReport = () => {
  const { t } = useTranslation(['fitness', 'common']);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('weekly-progress-report');
      
      if (error) throw error;
      setReport(data);
    } catch (err) {
      console.error('Error fetching report:', err);
      toast.error(t('fitness:report_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const getHighlightIcon = (highlight: string) => {
    switch (highlight) {
      case 'workout_streak':
      case 'workout_consistent':
        return <Dumbbell className="h-5 w-5 text-primary" />;
      case 'steps_champion':
      case 'steps_active':
        return <Footprints className="h-5 w-5 text-green-500" />;
      case 'sleep_great':
        return <Moon className="h-5 w-5 text-purple-500" />;
      case 'nutrition_balanced':
        return <Utensils className="h-5 w-5 text-orange-500" />;
      default:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!report) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">{t('fitness:weekly_progress_report')}</h3>
          <p className="text-muted-foreground">{t('fitness:report_description')}</p>
          <Button onClick={fetchReport} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            {t('fitness:generate_report')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t('fitness:weekly_progress_report')}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {formatDate(report.period.start)} - {formatDate(report.period.end)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {report.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {report.highlights.map((highlight) => (
                <div 
                  key={highlight}
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full text-sm"
                >
                  {getHighlightIcon(highlight)}
                  <span>{t(`fitness:highlight_${highlight}`)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Workouts */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{t('fitness:workouts')}</span>
                </div>
                <p className="text-3xl font-bold">{report.workouts.total}</p>
                <p className="text-sm text-muted-foreground">
                  {report.workouts.totalMinutes} {t('fitness:minutes')}
                </p>
                <div className="mt-2">
                  <Progress value={(report.workouts.total / 7) * 100} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {report.workouts.avgPerDay} {t('fitness:per_day')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Calories Burned */}
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">{t('fitness:calories_burned')}</span>
                </div>
                <p className="text-3xl font-bold">{report.workouts.caloriesBurned}</p>
                <p className="text-sm text-muted-foreground">{t('fitness:total_week')}</p>
              </CardContent>
            </Card>

            {/* Daily Steps */}
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Footprints className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{t('fitness:avg_steps')}</span>
                </div>
                <p className="text-3xl font-bold">{report.activity.avgDailySteps.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  {report.activity.totalSteps.toLocaleString()} {t('fitness:total_week')}
                </p>
                <div className="mt-2">
                  <Progress value={Math.min((report.activity.avgDailySteps / 10000) * 100, 100)} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('fitness:goal')}: 10,000
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Nutrition */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{t('fitness:avg_calories')}</span>
                </div>
                <p className="text-3xl font-bold">{report.nutrition.avgDailyCalories}</p>
                <p className="text-sm text-muted-foreground">
                  {report.nutrition.avgDailyProtein}g {t('fitness:protein')}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {report.nutrition.mealsLogged} {t('fitness:meals_logged')}
                </p>
              </CardContent>
            </Card>
          </div>

          {report.workouts.types.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">{t('fitness:workout_types')}</h4>
              <div className="flex flex-wrap gap-2">
                {report.workouts.types.map((type) => (
                  <span 
                    key={type}
                    className="px-3 py-1 bg-secondary rounded-full text-sm capitalize"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={fetchReport} disabled={isLoading} className="gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Target className="h-4 w-4" />
              )}
              {t('fitness:refresh_report')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
