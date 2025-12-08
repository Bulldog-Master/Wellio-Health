import { Button } from "@/components/ui/button";
import { CalendarDays, Timer, Smartphone, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface WorkoutQuickActionsProps {
  onShowAppsLibrary: () => void;
  onShowRoutineDialog: () => void;
}

const WorkoutQuickActions = ({ onShowAppsLibrary, onShowRoutineDialog }: WorkoutQuickActionsProps) => {
  const { t } = useTranslation(['workout', 'common']);
  const navigate = useNavigate();

  return (
    <div className="flex gap-2 flex-wrap justify-end">
      <Button variant="outline" className="gap-2 group" onClick={() => navigate('/workout-schedule')}>
        <span style={{ color: 'hsl(270, 95%, 65%)' }} className="flex">
          <CalendarDays className="w-4 h-4 transition-all group-hover:drop-shadow-[0_0_8px_hsl(270_95%_65%)]" />
        </span>
        {t('schedule')}
      </Button>
      <Button variant="outline" className="gap-2 group" onClick={() => navigate('/interval-timer')}>
        <span style={{ color: 'hsl(30, 95%, 55%)' }} className="flex">
          <Timer className="w-4 h-4 transition-all group-hover:drop-shadow-[0_0_8px_hsl(30_95%_55%)]" />
        </span>
        {t('interval_timer')}
      </Button>
      <Button variant="outline" className="gap-2 group" onClick={onShowAppsLibrary}>
        <span style={{ color: 'hsl(180, 95%, 50%)' }} className="flex">
          <Smartphone className="w-4 h-4 transition-all group-hover:drop-shadow-[0_0_8px_hsl(180_95%_50%)]" />
        </span>
        {t('apps')}
      </Button>
      <Button variant="outline" className="gap-2 group" onClick={onShowRoutineDialog}>
        <span style={{ color: 'hsl(145, 80%, 50%)' }} className="flex">
          <Plus className="w-4 h-4 transition-all group-hover:drop-shadow-[0_0_8px_hsl(145_80%_50%)]" />
        </span>
        {t('create_routine')}
      </Button>
    </div>
  );
};

export default WorkoutQuickActions;
