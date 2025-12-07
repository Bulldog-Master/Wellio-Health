import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { formatDistance } from "@/lib/unitConversion";
import { ActivityLog } from "@/hooks/useActivityData";

interface RecentActivityListProps {
  activityLogs: ActivityLog[];
  isLoading: boolean;
  preferredUnit: 'imperial' | 'metric';
}

export const RecentActivityList = ({ 
  activityLogs, 
  isLoading, 
  preferredUnit 
}: RecentActivityListProps) => {
  const { t, i18n } = useTranslation('fitness');
  const { t: tCommon } = useTranslation('common');
  const isSpanish = i18n.language?.startsWith('es');
  const dateLocale = isSpanish ? es : undefined;

  return (
    <Card className="p-6 bg-gradient-card shadow-md">
      <h3 className="text-lg font-semibold mb-4">{t('recent_activities')}</h3>
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">{tCommon('loading')}</p>
        ) : activityLogs.length > 0 ? (
          activityLogs.map((log) => (
            <div key={log.id} className="p-4 bg-secondary rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-lg text-secondary-foreground">{log.activity_type}</h4>
                  <p className="text-sm text-secondary-foreground/80">
                    {format(new Date(log.logged_at), "PPp", { locale: dateLocale })}
                  </p>
                </div>
                {log.calories_burned && (
                  <span className="font-bold text-secondary-foreground">{log.calories_burned} {t('cal_label')}</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-secondary-foreground/70">
                <span>{log.duration_minutes} {t('min_label')}</span>
                {log.distance_miles && (
                  <span>{formatDistance(log.distance_miles, preferredUnit)}</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            {t('no_activities')}
          </p>
        )}
      </div>
    </Card>
  );
};
