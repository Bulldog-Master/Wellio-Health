import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  X, 
  Dumbbell, 
  Utensils, 
  Scale, 
  Footprints,
  Droplets,
  Timer,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";

const QuickActionsButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'fitness', 'nutrition']);

  const actions = [
    { 
      icon: Dumbbell, 
      label: t('fitness:log_workout'), 
      path: '/workout',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    { 
      icon: Utensils, 
      label: t('nutrition:log_food'), 
      path: '/food-log',
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      icon: Scale, 
      label: t('fitness:log_weight'), 
      path: '/weight',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      icon: Footprints, 
      label: t('fitness:log_steps'), 
      path: '/step-count',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    { 
      icon: Droplets, 
      label: t('fitness:water_intake'), 
      path: '/water-intake',
      color: 'bg-cyan-500 hover:bg-cyan-600'
    },
    { 
      icon: Timer, 
      label: t('fitness:quick_timer'), 
      path: '/interval-timer',
      color: 'bg-red-500 hover:bg-red-600'
    },
    { 
      icon: Target, 
      label: t('fitness:add_habit'), 
      path: '/habits',
      color: 'bg-amber-500 hover:bg-amber-600'
    },
  ];

  const handleAction = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 flex flex-col gap-2 items-end"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  onClick={() => handleAction(action.path)}
                  className={`${action.color} text-white shadow-lg flex items-center gap-2 rounded-full px-4 py-2`}
                >
                  <action.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={`rounded-full h-14 w-14 shadow-xl transition-all duration-300 ${
          isOpen 
            ? 'bg-destructive hover:bg-destructive/90 rotate-45' 
            : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};

export { QuickActionsButton };
export default QuickActionsButton;
