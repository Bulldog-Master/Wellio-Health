import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Plus, 
  X, 
  Dumbbell, 
  Utensils, 
  Scale, 
  Footprints, 
  Timer, 
  CheckSquare,
  Droplets
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  icon: React.ElementType;
  label: string;
  route: string;
  color: string;
  bgColor: string;
}

export const QuickActionsButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'fitness', 'nutrition']);

  const quickActions: QuickAction[] = [
    {
      id: 'workout',
      icon: Dumbbell,
      label: t('fitness:log_workout'),
      route: '/workout',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20'
    },
    {
      id: 'food',
      icon: Utensils,
      label: t('nutrition:log_food'),
      route: '/food-log',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20'
    },
    {
      id: 'weight',
      icon: Scale,
      label: t('fitness:weight'),
      route: '/weight',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20'
    },
    {
      id: 'steps',
      icon: Footprints,
      label: t('fitness:step_count'),
      route: '/step-count',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10 hover:bg-orange-500/20'
    },
    {
      id: 'water',
      icon: Droplets,
      label: t('nutrition:water_intake'),
      route: '/water-intake',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10 hover:bg-cyan-500/20'
    },
    {
      id: 'timer',
      icon: Timer,
      label: t('fitness:interval_timer'),
      route: '/interval-timer',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10 hover:bg-red-500/20'
    },
    {
      id: 'habit',
      icon: CheckSquare,
      label: t('fitness:add_habit'),
      route: '/habits',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 hover:bg-amber-500/20'
    },
  ];

  const handleAction = (route: string) => {
    setIsOpen(false);
    navigate(route);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Quick Actions Menu */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col items-end gap-2">
        {isOpen && (
          <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
            {quickActions.map((action, index) => (
              <button
                key={action.id}
                onClick={() => handleAction(action.route)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-full bg-card border shadow-lg",
                  "hover:shadow-xl transition-all duration-200",
                  "animate-in fade-in slide-in-from-right duration-200"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn("p-2 rounded-full", action.bgColor)}>
                  <action.icon className={cn("w-4 h-4", action.color)} />
                </div>
                <span className="font-medium text-sm whitespace-nowrap pr-2">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg",
            "flex items-center justify-center",
            "hover:bg-primary/90 hover:shadow-xl hover:scale-105",
            "active:scale-95 transition-all duration-200",
            isOpen && "rotate-45"
          )}
          aria-label={isOpen ? t('common:close') : t('common:quick_actions')}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </button>
      </div>
    </>
  );
};

export default QuickActionsButton;