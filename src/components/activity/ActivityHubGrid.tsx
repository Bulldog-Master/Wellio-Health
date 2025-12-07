import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Scale, Footprints, Dumbbell, CheckSquare, Pill, Timer, 
  Video, Crown, MessageSquare, Image, ArrowLeftRight, Mic, 
  Shield, Brain, Clock, CloudSun, Zap, TrendingUp, Flame, 
  Activity as ActivityIcon 
} from "lucide-react";

interface HubCard {
  route: string;
  icon: React.ElementType;
  iconColor: string;
  titleKey: string;
  descKey: string;
  isVip?: boolean;
}

const hubCards: HubCard[] = [
  { route: '/weight', icon: Scale, iconColor: 'text-primary', titleKey: 'weight', descKey: 'track_weight_progress' },
  { route: '/step-count', icon: Footprints, iconColor: 'text-success', titleKey: 'step_count', descKey: 'daily_steps_distance' },
  { route: '/workout', icon: Dumbbell, iconColor: 'text-secondary', titleKey: 'workout', descKey: 'log_plan_workouts' },
  { route: '/habits', icon: CheckSquare, iconColor: 'text-accent', titleKey: 'habits', descKey: 'build_track_habits' },
  { route: '/supplements', icon: Pill, iconColor: 'text-primary', titleKey: 'supplements', descKey: 'manage_supplements' },
  { route: '/interval-timer', icon: Timer, iconColor: 'text-accent', titleKey: 'interval_timer', descKey: 'custom_workout_timers' },
  { route: '/live-workout-sessions', icon: ActivityIcon, iconColor: 'text-accent', titleKey: 'live_workout_sessions', descKey: 'join_host_live_workouts', isVip: true },
  { route: '/exercise-library', icon: Video, iconColor: 'text-primary', titleKey: 'video_tutorials', descKey: 'exercise_video_tutorials', isVip: true },
  { route: '/fitness-chat', icon: MessageSquare, iconColor: 'text-secondary', titleKey: 'ai_fitness_chat', descKey: 'ai_fitness_chat_desc', isVip: true },
  { route: '/weekly-report', icon: TrendingUp, iconColor: 'text-blue-500', titleKey: 'weekly_progress_report', descKey: 'view_weekly_summary' },
  { route: '/goal-wizard', icon: Flame, iconColor: 'text-green-500', titleKey: 'goal_setting', descKey: 'set_your_goals' },
  { route: '/ai-workout-plan', icon: Dumbbell, iconColor: 'text-purple-500', titleKey: 'ai_workout_plan', descKey: 'generate_plan', isVip: true },
  { route: '/social-challenges', icon: ActivityIcon, iconColor: 'text-yellow-500', titleKey: 'social_challenges', descKey: 'compete_with_community' },
  { route: '/workout-media', icon: Image, iconColor: 'text-pink-500', titleKey: 'workout_media_gallery', descKey: 'view_workout_photos_videos' },
  { route: '/progress-comparison', icon: ArrowLeftRight, iconColor: 'text-teal-500', titleKey: 'progress_comparison', descKey: 'compare_progress_photos', isVip: true },
  { route: '/voice-workout', icon: Mic, iconColor: 'text-orange-500', titleKey: 'voice_workout', descKey: 'voice_workout_desc', isVip: true },
  { route: '/injury-prevention', icon: Shield, iconColor: 'text-green-500', titleKey: 'injury_prevention', descKey: 'injury_prevention_desc', isVip: true },
  { route: '/emotion-fitness', icon: Brain, iconColor: 'text-purple-500', titleKey: 'emotion_fitness_engine', descKey: 'emotion_fitness_desc', isVip: true },
  { route: '/circadian-rhythm', icon: Clock, iconColor: 'text-cyan-500', titleKey: 'circadian_optimizer', descKey: 'circadian_optimizer_desc', isVip: true },
  { route: '/environmental-fitness', icon: CloudSun, iconColor: 'text-sky-500', titleKey: 'environmental_intelligence', descKey: 'environmental_intelligence_desc', isVip: true },
  { route: '/micro-challenges', icon: Zap, iconColor: 'text-yellow-500', titleKey: 'micro_challenges', descKey: 'micro_challenges_desc', isVip: true },
];

export const ActivityHubGrid = () => {
  const { t } = useTranslation('fitness');
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {hubCards.map((card) => {
        const Icon = card.icon;
        const bgColor = card.iconColor.replace('text-', 'bg-').replace('-500', '-500/10');
        
        return (
          <Card 
            key={card.route}
            className="p-6 bg-gradient-card shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
            onClick={() => navigate(card.route)}
          >
            {card.isVip && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3 text-primary" />
                <span className="text-xs font-semibold text-primary">VIP</span>
              </div>
            )}
            <div className="flex items-start gap-4">
              <div className={`p-3 ${bgColor} rounded-xl`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t(card.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(card.descKey)}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
