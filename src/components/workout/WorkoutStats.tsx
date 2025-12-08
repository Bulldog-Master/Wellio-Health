import { Card } from "@/components/ui/card";
import { Clock, Flame } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WorkoutStatsProps {
  totalDuration: number;
  totalCalories: number;
}

const WorkoutStats = ({ totalDuration, totalCalories }: WorkoutStatsProps) => {
  const { t } = useTranslation(['workout', 'common']);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{t('total_duration')}</h3>
          </div>
        </div>
        <p className="text-4xl font-bold text-primary mb-2">{totalDuration} min</p>
        <p className="text-muted-foreground">{t('active_time_today')}</p>
      </Card>

      <Card className="p-6 bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">{t('calories_burned')}</h3>
          </div>
        </div>
        <p className="text-4xl font-bold mb-2">{totalCalories}</p>
        <p className="opacity-90">{t('through_exercise')}</p>
      </Card>
    </div>
  );
};

export default WorkoutStats;
