import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ArrowRight,
  Target,
  Scale,
  Dumbbell,
  Heart,
  Flame,
  Check,
  Loader2
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface GoalData {
  primaryGoal: string;
  targetWeight: string;
  targetWeightUnit: 'lbs' | 'kg';
  weeklyWorkouts: number;
  dailySteps: number;
  dailyCalories: number;
}

const GoalSettingWizard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['fitness', 'common']);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [goalData, setGoalData] = useState<GoalData>({
    primaryGoal: '',
    targetWeight: '',
    targetWeightUnit: 'lbs',
    weeklyWorkouts: 3,
    dailySteps: 10000,
    dailyCalories: 2000,
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const goals = [
    { id: 'lose_weight', label: t('fitness:lose_weight'), icon: Scale, color: 'text-blue-500' },
    { id: 'build_muscle', label: t('fitness:build_muscle'), icon: Dumbbell, color: 'text-red-500' },
    { id: 'improve_fitness', label: t('fitness:improve_fitness'), icon: Heart, color: 'text-green-500' },
    { id: 'maintain_weight', label: t('fitness:maintain_weight'), icon: Target, color: 'text-purple-500' },
  ];

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

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Convert weight to lbs for storage
      let targetWeightLbs = goalData.targetWeight ? parseFloat(goalData.targetWeight) : null;
      if (targetWeightLbs && goalData.targetWeightUnit === 'kg') {
        targetWeightLbs = targetWeightLbs * 2.20462;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          goal: goalData.primaryGoal,
          target_weight: targetWeightLbs,
          target_weight_unit: goalData.targetWeightUnit,
          weekly_workouts_goal: goalData.weeklyWorkouts,
          daily_steps_goal: goalData.dailySteps,
          daily_calories_goal: goalData.dailyCalories,
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
      
      toast.success(t('fitness:goals_saved_successfully'));
      navigate('/activity');
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error(t('fitness:failed_to_save_goals'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/activity')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{t('fitness:goal_setting_wizard')}</h1>
          <p className="text-muted-foreground">{t('fitness:set_your_fitness_goals')}</p>
        </div>
      </div>

      <Progress value={progress} className="h-2" />
      <p className="text-sm text-muted-foreground text-center">
        {t('fitness:step')} {step} {t('common:of')} {totalSteps}
      </p>

      {/* Step 1: Primary Goal */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {t('fitness:whats_your_primary_goal')}
            </CardTitle>
            <CardDescription>{t('fitness:select_main_fitness_objective')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setGoalData({ ...goalData, primaryGoal: goal.id })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    goalData.primaryGoal === goal.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <goal.icon className={`w-6 h-6 ${goal.color}`} />
                    <span className="font-medium">{goal.label}</span>
                    {goalData.primaryGoal === goal.id && (
                      <Check className="w-5 h-5 text-primary ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Target Weight */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-500" />
              {t('fitness:whats_your_target_weight')}
            </CardTitle>
            <CardDescription>{t('fitness:set_weight_goal')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="targetWeight">{t('fitness:target_weight')}</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  step="0.1"
                  value={goalData.targetWeight}
                  onChange={(e) => setGoalData({ ...goalData, targetWeight: e.target.value })}
                  placeholder="150"
                  className="mt-1"
                />
              </div>
              <div className="w-24">
                <Label>{t('fitness:unit')}</Label>
                <div className="flex mt-1">
                  <button
                    onClick={() => setGoalData({ ...goalData, targetWeightUnit: 'lbs' })}
                    className={`flex-1 py-2 px-3 rounded-l-md border ${
                      goalData.targetWeightUnit === 'lbs'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background'
                    }`}
                  >
                    lbs
                  </button>
                  <button
                    onClick={() => setGoalData({ ...goalData, targetWeightUnit: 'kg' })}
                    className={`flex-1 py-2 px-3 rounded-r-md border-t border-r border-b ${
                      goalData.targetWeightUnit === 'kg'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background'
                    }`}
                  >
                    kg
                  </button>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('fitness:target_weight_hint')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Workout Frequency */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-red-500" />
              {t('fitness:weekly_workout_goal')}
            </CardTitle>
            <CardDescription>{t('fitness:how_many_workouts_per_week')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  onClick={() => setGoalData({ ...goalData, weeklyWorkouts: num })}
                  className={`w-12 h-12 rounded-full font-semibold transition-all ${
                    goalData.weeklyWorkouts === num
                      ? 'bg-primary text-primary-foreground scale-110'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-center text-muted-foreground">
              {goalData.weeklyWorkouts} {t('fitness:workouts_per_week')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Daily Targets */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              {t('fitness:daily_targets')}
            </CardTitle>
            <CardDescription>{t('fitness:set_daily_activity_goals')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dailySteps">{t('fitness:daily_steps_goal')}</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="dailySteps"
                  type="number"
                  value={goalData.dailySteps}
                  onChange={(e) => setGoalData({ ...goalData, dailySteps: parseInt(e.target.value) || 0 })}
                  className="flex-1"
                />
                <span className="text-muted-foreground">{t('fitness:steps')}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="20000"
                step="1000"
                value={goalData.dailySteps}
                onChange={(e) => setGoalData({ ...goalData, dailySteps: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyCalories">{t('fitness:daily_calorie_goal')}</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="dailyCalories"
                  type="number"
                  value={goalData.dailyCalories}
                  onChange={(e) => setGoalData({ ...goalData, dailyCalories: parseInt(e.target.value) || 0 })}
                  className="flex-1"
                />
                <span className="text-muted-foreground">kcal</span>
              </div>
              <input
                type="range"
                min="1200"
                max="4000"
                step="100"
                value={goalData.dailyCalories}
                onChange={(e) => setGoalData({ ...goalData, dailyCalories: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common:back')}
        </Button>

        {step < totalSteps ? (
          <Button
            onClick={handleNext}
            disabled={step === 1 && !goalData.primaryGoal}
            className="gap-2"
          >
            {t('common:next')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {t('fitness:save_goals')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default GoalSettingWizard;
