import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { formatWeight } from "@/lib/utils";
import { type WeightLog } from "@/hooks/fitness";

interface WeightLogListProps {
  weightLogs: WeightLog[];
  isLoading: boolean;
  preferredUnit: 'imperial' | 'metric';
  editingLog: WeightLog | null;
  editWeight: string;
  setEditingLog: (log: WeightLog | null) => void;
  setEditWeight: (weight: string) => void;
  onEditLog: (log: WeightLog) => void;
  onDeleteLog: (logId: string) => void;
}

export const WeightLogList = ({
  weightLogs,
  isLoading,
  preferredUnit,
  editingLog,
  editWeight,
  setEditingLog,
  setEditWeight,
  onEditLog,
  onDeleteLog,
}: WeightLogListProps) => {
  const { t, i18n } = useTranslation('weight');
  const dateLocale = i18n.language === 'es' ? es : undefined;

  return (
    <Card className="p-6 bg-gradient-card shadow-md">
      <h3 className="text-lg font-semibold mb-4">{t('recent_weights')}</h3>
      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">{t('loading')}</p>
      ) : weightLogs.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{t('no_logs_yet')}</p>
      ) : (
        <div className="h-[600px] overflow-y-auto pr-2 space-y-3">
          {[...weightLogs].reverse().map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">
                    {format(new Date(log.logged_at), "MMM dd, yyyy", { locale: dateLocale })}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({log.period === 'morning' ? t('morning') : t('evening')})
                  </span>
                </div>
                {editingLog?.id === log.id ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      className="w-32"
                    />
                    <Button size="sm" onClick={() => onEditLog(log)}>
                      {t('save')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingLog(null)}>
                      {t('cancel')}
                    </Button>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-primary">
                    {formatWeight(log.weight_lbs, preferredUnit)}
                  </p>
                )}
              </div>
              {!editingLog && (
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingLog(log);
                      setEditWeight(String(preferredUnit === 'imperial' ? log.weight_lbs : log.weight_lbs / 2.20462));
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDeleteLog(log.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
