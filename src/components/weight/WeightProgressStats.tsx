import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { formatWeight } from "@/lib/utils";

interface WeightProgressStatsProps {
  statistics: {
    totalChange: number;
    avgRatePerWeek: number;
    progressPercentage: number;
    daysTracked: number;
  } | null;
  targetWeight: number | null;
  preferredUnit: 'imperial' | 'metric';
}

export const WeightProgressStats = ({ 
  statistics, 
  targetWeight, 
  preferredUnit 
}: WeightProgressStatsProps) => {
  const { t } = useTranslation('weight');

  if (!statistics) return null;

  return (
    <Card className="p-6 bg-gradient-card shadow-md">
      <h3 className="text-lg font-semibold mb-4">{t('progress_statistics')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{t('total_change')}</p>
          <p className="text-2xl font-bold" style={{ 
            color: statistics.totalChange < 0 ? 'hsl(142, 71%, 45%)' : 'hsl(var(--primary))' 
          }}>
            {statistics.totalChange > 0 ? '+' : ''}
            {formatWeight(Math.abs(statistics.totalChange), preferredUnit)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('over_days', { days: statistics.daysTracked })}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">{t('avg_change_week')}</p>
          <p className="text-2xl font-bold">
            {statistics.avgRatePerWeek > 0 ? '+' : ''}
            {formatWeight(Math.abs(statistics.avgRatePerWeek), preferredUnit)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('weekly_average')}
          </p>
        </div>
        
        {targetWeight && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('goal_progress')}</p>
            <p className="text-2xl font-bold text-primary">
              {Math.abs(Math.round(statistics.progressPercentage))}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('target', { weight: formatWeight(targetWeight, preferredUnit) })}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
