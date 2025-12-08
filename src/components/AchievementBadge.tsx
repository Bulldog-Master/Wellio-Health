import { Trophy, Award, Star, Zap, Target, Crown, Flame, Heart } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface AchievementBadgeProps {
  type: string;
  value: number;
  unlockedAt?: string;
  isNew?: boolean;
}

const achievementConfig: Record<string, { icon: any; color: string; title: string; levels: { value: number; label: string }[] }> = {
  'workout_streak': {
    icon: Flame,
    color: 'text-orange-500',
    title: 'Workout Streak',
    levels: [
      { value: 7, label: 'Week Warrior' },
      { value: 30, label: 'Month Master' },
      { value: 100, label: 'Century Club' },
      { value: 365, label: 'Year Legend' }
    ]
  },
  'total_workouts': {
    icon: Trophy,
    color: 'text-yellow-500',
    title: 'Total Workouts',
    levels: [
      { value: 10, label: 'Getting Started' },
      { value: 50, label: 'Committed' },
      { value: 100, label: 'Dedicated' },
      { value: 500, label: 'Elite Athlete' }
    ]
  },
  'weight_lost': {
    icon: Target,
    color: 'text-green-500',
    title: 'Weight Loss',
    levels: [
      { value: 5, label: 'First Steps' },
      { value: 10, label: 'Milestone' },
      { value: 25, label: 'Major Victory' },
      { value: 50, label: 'Transformation' }
    ]
  },
  'calories_burned': {
    icon: Zap,
    color: 'text-blue-500',
    title: 'Calories Burned',
    levels: [
      { value: 1000, label: 'Torch Starter' },
      { value: 5000, label: 'Burner' },
      { value: 10000, label: 'Inferno' },
      { value: 50000, label: 'Volcano' }
    ]
  },
  'personal_records': {
    icon: Award,
    color: 'text-purple-500',
    title: 'Personal Records',
    levels: [
      { value: 1, label: 'Record Setter' },
      { value: 5, label: 'Record Breaker' },
      { value: 10, label: 'Record Crusher' },
      { value: 25, label: 'Record Legend' }
    ]
  },
  'community_likes': {
    icon: Heart,
    color: 'text-pink-500',
    title: 'Community Engagement',
    levels: [
      { value: 50, label: 'Liked' },
      { value: 250, label: 'Popular' },
      { value: 1000, label: 'Influential' },
      { value: 5000, label: 'Superstar' }
    ]
  },
};

export const AchievementBadge = ({ type, value, unlockedAt, isNew }: AchievementBadgeProps) => {
  const config = achievementConfig[type] || achievementConfig['total_workouts'];
  const Icon = config.icon;
  
  // Find the current level based on value
  const currentLevel = config.levels.reduce((acc, level) => {
    return value >= level.value ? level : acc;
  }, config.levels[0]);

  const nextLevel = config.levels.find(l => l.value > value);
  const progress = nextLevel ? (value / nextLevel.value) * 100 : 100;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className={`cursor-pointer hover:shadow-lg transition-all ${isNew ? 'animate-pulse ring-2 ring-primary' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full bg-muted ${config.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{currentLevel.label}</p>
                <p className="text-xs text-muted-foreground">{config.title}</p>
              </div>
              {isNew && (
                <Badge variant="default" className="animate-pulse">New!</Badge>
              )}
            </div>
            {nextLevel && (
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {value} / {nextLevel.value} to {nextLevel.label}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`w-6 h-6 ${config.color}`} />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {unlockedAt && `Unlocked ${new Date(unlockedAt).toLocaleDateString()}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-center p-6">
            <div className={`p-6 rounded-full bg-muted ${config.color}`}>
              <Icon className="w-16 h-16" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">{currentLevel.label}</h3>
            <p className="text-muted-foreground">
              You've achieved {value} in {config.title}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">All Levels</h4>
            {config.levels.map((level, index) => (
              <div 
                key={level.value}
                className={`flex items-center justify-between p-2 rounded ${
                  value >= level.value ? 'bg-primary/10' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {value >= level.value ? (
                    <Star className="w-4 h-4 text-primary fill-current" />
                  ) : (
                    <Star className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={value >= level.value ? 'font-semibold' : 'text-muted-foreground'}>
                    {level.label}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {level.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
