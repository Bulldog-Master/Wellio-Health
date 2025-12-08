import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Utensils, Moon } from "lucide-react";
import type { WeeklyReport } from "@/hooks/fitness/useWeeklyReport";

interface ReportDetailCardsProps {
  report: WeeklyReport;
}

export const ReportDetailCards: React.FC<ReportDetailCardsProps> = ({ report }) => {
  const { t } = useTranslation('fitness');

  return (
    <>
      {/* Workout & Nutrition Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardTitle className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            {t('workout_breakdown')}
          </CardTitle>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('total_sessions')}</span>
              <span className="font-semibold">{report.workouts.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('total_time')}</span>
              <span className="font-semibold">{report.workouts.totalMinutes} {t('min')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('avg_per_day')}</span>
              <span className="font-semibold">{report.workouts.avgPerDay}</span>
            </div>
            {report.workouts.types.length > 0 && (
              <div>
                <span className="text-muted-foreground">{t('activity_types')}</span>
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
            {t('nutrition_summary')}
          </CardTitle>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('meals_logged')}</span>
              <span className="font-semibold">{report.nutrition.mealsLogged}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('avg_daily_calories')}</span>
              <span className="font-semibold">{report.nutrition.avgDailyCalories} kcal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('avg_daily_protein')}</span>
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
              {t('sleep')}
            </CardTitle>
            <p className="text-3xl font-bold text-purple-500">{report.sleep.avgHours}h</p>
            <p className="text-sm text-muted-foreground">{t('avg_per_night')}</p>
            <Progress value={Math.min((report.sleep.avgHours / 8) * 100, 100)} className="mt-2" />
          </Card>
        )}

        {report.bodyProgress.weightChange !== null && (
          <Card className="p-6">
            <CardTitle className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" />
              {t('body_progress')}
            </CardTitle>
            <p className={`text-3xl font-bold ${report.bodyProgress.weightChange < 0 ? 'text-green-500' : 'text-orange-500'}`}>
              {report.bodyProgress.weightChange > 0 ? '+' : ''}{report.bodyProgress.weightChange.toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">{t('weight_change')}</p>
          </Card>
        )}
      </div>
    </>
  );
};
