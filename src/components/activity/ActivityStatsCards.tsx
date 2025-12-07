import { Card } from "@/components/ui/card";
import { Calendar, Flame, TrendingUp, Activity as ActivityIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WeeklyStats {
  workoutCount: number;
  totalCalories: number;
  totalDuration: number;
  totalDistance: number;
}

interface ActivityStatsCardsProps {
  weeklyStats: WeeklyStats;
  preferredUnit: 'imperial' | 'metric';
}

export const ActivityStatsCards = ({ weeklyStats, preferredUnit }: ActivityStatsCardsProps) => {
  const { t } = useTranslation('fitness');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6 bg-gradient-card shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{t('workouts')}</h3>
        </div>
        <p className="text-3xl font-bold text-primary">{weeklyStats.workoutCount}</p>
        <p className="text-sm text-muted-foreground">{t('this_week')}</p>
      </Card>

      <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5" />
          <h3 className="font-semibold">{t('calories')}</h3>
        </div>
        <p className="text-3xl font-bold">{weeklyStats.totalCalories}</p>
        <p className="text-sm opacity-90">{t('burned_this_week')}</p>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <ActivityIcon className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold">{t('duration')}</h3>
        </div>
        <p className="text-3xl font-bold text-secondary">{weeklyStats.totalDuration}</p>
        <p className="text-sm text-muted-foreground">{t('minutes')}</p>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">{t('distance')}</h3>
        </div>
        <p className="text-3xl font-bold text-accent">
          {preferredUnit === 'metric' 
            ? (weeklyStats.totalDistance * 1.60934).toFixed(1)
            : weeklyStats.totalDistance.toFixed(1)}
        </p>
        <p className="text-sm text-muted-foreground">{preferredUnit === 'metric' ? 'km' : 'mi'}</p>
      </Card>
    </div>
  );
};
