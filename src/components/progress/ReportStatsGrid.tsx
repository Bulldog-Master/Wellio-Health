import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Flame, Footprints, Utensils } from "lucide-react";
import type { WeeklyReport } from "@/hooks/fitness/useWeeklyReport";

interface ReportStatsGridProps {
  report: WeeklyReport;
}

export const ReportStatsGrid: React.FC<ReportStatsGridProps> = ({ report }) => {
  const { t } = useTranslation('fitness');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{t('workouts')}</h3>
        </div>
        <p className="text-3xl font-bold text-primary">{report.workouts.total}</p>
        <p className="text-sm text-muted-foreground">
          {report.workouts.totalMinutes} {t('minutes')}
        </p>
        <Progress value={Math.min((report.workouts.total / 7) * 100, 100)} className="mt-2" />
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold">{t('calories_burned')}</h3>
        </div>
        <p className="text-3xl font-bold text-orange-500">{report.workouts.caloriesBurned}</p>
        <p className="text-sm text-muted-foreground">{t('this_week')}</p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Footprints className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold">{t('daily_steps')}</h3>
        </div>
        <p className="text-3xl font-bold text-green-500">{report.activity.avgDailySteps.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">{t('avg_per_day')}</p>
        <Progress value={Math.min((report.activity.avgDailySteps / 10000) * 100, 100)} className="mt-2" />
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Utensils className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold">{t('nutrition')}</h3>
        </div>
        <p className="text-3xl font-bold text-blue-500">{report.nutrition.avgDailyCalories}</p>
        <p className="text-sm text-muted-foreground">{t('avg_calories_day')}</p>
      </Card>
    </div>
  );
};
