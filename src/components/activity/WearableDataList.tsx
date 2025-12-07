import { Card } from "@/components/ui/card";
import { Watch, Footprints, Flame, Heart, Moon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { WearableData } from "@/hooks/useWearableForm";

interface WearableDataListProps {
  wearableData: WearableData[];
}

export const WearableDataList = ({ wearableData }: WearableDataListProps) => {
  const { t, i18n } = useTranslation('fitness');
  const isSpanish = i18n.language?.startsWith('es');
  const dateLocale = isSpanish ? es : undefined;

  return (
    <Card className="p-6 bg-gradient-card shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Watch className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">{t('wearable_device_data')}</h3>
      </div>
      <div className="space-y-3">
        {wearableData.length > 0 ? (
          wearableData.map((data) => (
            <div key={data.id} className="p-4 bg-secondary rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{data.device_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(data.data_date), "PPP", { locale: dateLocale })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.steps && (
                  <div className="flex items-center gap-2 text-sm">
                    <Footprints className="w-4 h-4 text-primary" />
                    <span>{data.steps.toLocaleString()} {t('steps_label')}</span>
                  </div>
                )}
                {data.calories_burned && (
                  <div className="flex items-center gap-2 text-sm">
                    <Flame className="w-4 h-4 text-accent" />
                    <span>{data.calories_burned} {t('cal_label')}</span>
                  </div>
                )}
                {data.heart_rate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>{data.heart_rate} {t('bpm_label')}</span>
                  </div>
                )}
                {data.sleep_hours && (
                  <div className="flex items-center gap-2 text-sm">
                    <Moon className="w-4 h-4 text-blue-500" />
                    <span>{data.sleep_hours}{t('h_sleep')}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            {t('no_wearable_data')}
          </p>
        )}
      </div>
    </Card>
  );
};
