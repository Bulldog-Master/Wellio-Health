import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Dumbbell, 
  Scale, 
  Footprints, 
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';

interface Goal {
  type: string;
  target: number;
  unit: string;
  timeframe: string;
}

const GOAL_TYPES = [
  { id: 'weight_loss', icon: Scale, color: 'text-blue-500' },
  { id: 'muscle_gain', icon: Dumbbell, color: 'text-orange-500' },
  { id: 'steps', icon: Footprints, color: 'text-green-500' },
  { id: 'workouts', icon: Heart, color: 'text-red-500' },
];

const TIMEFRAMES = ['weekly', 'monthly', 'quarterly'];

export const GoalSettingWizard = ({ onComplete }: { onComplete?: () => void }) => {
  const { t } = useTranslation(['fitness', 'common']);
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [targetValue, setTargetValue] = useState('');
  const [timeframe, setTimeframe] = useState('monthly');

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  const getUnitForGoal = (goalType: string): string => {
    switch (goalType) {
      case 'weight_loss':
      case 'muscle_gain':
        return 'lbs';
      case 'steps':
        return 'steps/day';
      case 'workouts':
        return 'sessions/week';
      default:
        return '';
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSaveGoal = async () => {
    if (!user || !selectedGoal || !targetValue) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('achievements').insert({
        user_id: user.id,
        achievement_type: selectedGoal,
        goal_value: parseFloat(targetValue),
        actual_value: 0,
        achieved_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success(t('fitness:goal_created'));
      onComplete?.();
    } catch (err) {
      console.error('Error saving goal:', err);
      toast.error(t('fitness:goal_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          {t('fitness:goal_wizard_title')}
        </CardTitle>
        <Progress value={progress} className="h-2 mt-4" />
        <p className="text-sm text-muted-foreground mt-2">
          {t('fitness:step')} {step} {t('common:of')} {totalSteps}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium">{t('fitness:choose_goal_type')}</h3>
            <div className="grid grid-cols-2 gap-4">
              {GOAL_TYPES.map(({ id, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => setSelectedGoal(id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedGoal === id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${color}`} />
                  <p className="text-sm font-medium">{t(`fitness:goal_${id}`)}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-medium">{t('fitness:set_target')}</h3>
            <div className="space-y-2">
              <Label htmlFor="target">{t('fitness:target_value')}</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="target"
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder={t('fitness:enter_target')}
                  className="flex-1"
                />
                <span className="text-muted-foreground text-sm">
                  {selectedGoal && getUnitForGoal(selectedGoal)}
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-medium">{t('fitness:choose_timeframe')}</h3>
            <div className="space-y-2">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    timeframe === tf
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium">{t(`fitness:timeframe_${tf}`)}</p>
                  <p className="text-sm text-muted-foreground">
                    {t(`fitness:timeframe_${tf}_desc`)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('common:back')}
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={step === 1 && !selectedGoal}
              className="gap-2"
            >
              {t('common:next')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSaveGoal}
              disabled={isLoading || !targetValue}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {t('fitness:save_goal')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
