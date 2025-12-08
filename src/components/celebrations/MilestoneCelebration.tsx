import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Flame, Target, Zap, Share2, Award } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

export type MilestoneType = 
  | 'workout_streak_3' | 'workout_streak_7' | 'workout_streak_14' | 'workout_streak_30' | 'workout_streak_100'
  | 'first_workout' | 'workouts_10' | 'workouts_50' | 'workouts_100'
  | 'weight_goal_reached' | 'calories_goal_met' | 'water_goal_met' | 'steps_goal_met'
  | 'first_meal_logged' | 'meals_logged_100'
  | 'new_record' | 'challenge_won' | 'level_up' | 'badge_unlocked';

interface MilestoneCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: MilestoneType;
  points?: number;
  badgeName?: string;
}

const milestoneConfig: Record<MilestoneType, { icon: typeof Trophy; color: string; gradient: string }> = {
  workout_streak_3: { icon: Flame, color: 'text-orange-500', gradient: 'from-orange-500 to-red-500' },
  workout_streak_7: { icon: Flame, color: 'text-orange-500', gradient: 'from-orange-500 to-red-500' },
  workout_streak_14: { icon: Flame, color: 'text-orange-600', gradient: 'from-orange-600 to-red-600' },
  workout_streak_30: { icon: Flame, color: 'text-red-500', gradient: 'from-red-500 to-pink-500' },
  workout_streak_100: { icon: Flame, color: 'text-red-600', gradient: 'from-red-600 to-purple-600' },
  first_workout: { icon: Zap, color: 'text-yellow-500', gradient: 'from-yellow-400 to-orange-500' },
  workouts_10: { icon: Target, color: 'text-blue-500', gradient: 'from-blue-400 to-cyan-500' },
  workouts_50: { icon: Target, color: 'text-blue-600', gradient: 'from-blue-500 to-indigo-600' },
  workouts_100: { icon: Trophy, color: 'text-yellow-500', gradient: 'from-yellow-400 to-amber-600' },
  weight_goal_reached: { icon: Target, color: 'text-green-500', gradient: 'from-green-400 to-emerald-600' },
  calories_goal_met: { icon: Flame, color: 'text-orange-500', gradient: 'from-orange-400 to-red-500' },
  water_goal_met: { icon: Target, color: 'text-blue-400', gradient: 'from-blue-300 to-cyan-500' },
  steps_goal_met: { icon: Target, color: 'text-green-500', gradient: 'from-green-400 to-teal-500' },
  first_meal_logged: { icon: Star, color: 'text-yellow-500', gradient: 'from-yellow-300 to-orange-500' },
  meals_logged_100: { icon: Trophy, color: 'text-amber-500', gradient: 'from-amber-400 to-orange-600' },
  new_record: { icon: Trophy, color: 'text-yellow-500', gradient: 'from-yellow-400 to-amber-600' },
  challenge_won: { icon: Award, color: 'text-purple-500', gradient: 'from-purple-400 to-pink-600' },
  level_up: { icon: Zap, color: 'text-indigo-500', gradient: 'from-indigo-400 to-purple-600' },
  badge_unlocked: { icon: Award, color: 'text-emerald-500', gradient: 'from-emerald-400 to-teal-600' },
};

export const MilestoneCelebration = ({ 
  isOpen, 
  onClose, 
  milestone, 
  points = 0,
  badgeName 
}: MilestoneCelebrationProps) => {
  const { t } = useTranslation(['celebrations', 'common']);
  const navigate = useNavigate();
  const [animationComplete, setAnimationComplete] = useState(false);

  const config = milestoneConfig[milestone];
  const Icon = config.icon;

  useEffect(() => {
    if (isOpen) {
      setAnimationComplete(false);
      
      // Initial burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Side cannons
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 200);

      // Star burst
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 360,
          ticks: 60,
          gravity: 0,
          decay: 0.94,
          startVelocity: 20,
          shapes: ['star'],
          colors: ['#FFD700', '#FFA500', '#FF6347']
        });
        setAnimationComplete(true);
      }, 500);
    }
  }, [isOpen]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t('milestone_reached'),
        text: `${t('congratulations')} ${t(milestone)}`,
      });
    }
  };

  const handleViewAchievements = () => {
    onClose();
    navigate('/achievements');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-gradient-to-br from-background via-background to-muted overflow-hidden">
        <div className="relative flex flex-col items-center py-8 px-4">
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-r ${config.gradient} opacity-20 animate-ping`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-r ${config.gradient} opacity-30 animate-pulse`} />
          </div>

          {/* Icon with glow */}
          <div className={`relative z-10 p-6 rounded-full bg-gradient-to-br ${config.gradient} shadow-2xl mb-6 animate-bounce`}>
            <Icon className="w-16 h-16 text-white drop-shadow-lg" />
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} blur-xl opacity-50`} />
          </div>

          {/* Title */}
          <h2 className="relative z-10 text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            {t('congratulations')}
          </h2>

          {/* Milestone name */}
          <p className={`relative z-10 text-xl font-semibold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r ${config.gradient}`}>
            {t(milestone)}
          </p>

          {/* Points earned */}
          {points > 0 && (
            <div className="relative z-10 flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Star className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">+{points} {t('points_earned')}</span>
            </div>
          )}

          {/* Badge name if unlocked */}
          {badgeName && (
            <div className="relative z-10 flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full mb-4">
              <Award className="w-5 h-5 text-secondary-foreground" />
              <span className="font-medium">{badgeName}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full mt-4">
            <Button
              onClick={onClose}
              className={`flex-1 bg-gradient-to-r ${config.gradient} text-white hover:opacity-90`}
            >
              {t('continue')}
            </Button>
            <Button
              variant="outline"
              onClick={handleViewAchievements}
              className="flex-1"
            >
              <Trophy className="w-4 h-4 mr-2" />
              {t('view_achievements')}
            </Button>
          </div>

          {/* Share button */}
          {navigator.share && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="relative z-10 mt-4"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {t('share_achievement')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MilestoneCelebration;