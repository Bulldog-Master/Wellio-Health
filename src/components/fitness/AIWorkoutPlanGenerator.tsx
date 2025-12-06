import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Brain, 
  Dumbbell,
  Loader2,
  Calendar,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced'];
const GOALS = ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'];
const EQUIPMENT = ['bodyweight', 'dumbbells', 'barbell', 'resistance_bands', 'full_gym'];

interface WorkoutPlan {
  name: string;
  weeklySchedule: Array<{
    day: string;
    focus: string;
    estimatedDuration: number;
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
      restSeconds: number;
    }>;
  }>;
  tips: string[];
}

export const AIWorkoutPlanGenerator = () => {
  const { t } = useTranslation(['fitness', 'common']);
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['general_fitness']);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['bodyweight']);
  const [duration, setDuration] = useState(45);

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment(prev => 
      prev.includes(eq) 
        ? prev.filter(e => e !== eq)
        : [...prev, eq]
    );
  };

  const generatePlan = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-workout-plan', {
        body: {
          fitnessLevel,
          goals: selectedGoals,
          daysPerWeek,
          equipment: selectedEquipment,
          duration
        }
      });

      if (error) throw error;
      setPlan(data.plan);
      toast.success(t('fitness:plan_generated'));
    } catch (err) {
      console.error('Error generating plan:', err);
      toast.error(t('fitness:plan_error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (plan) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {plan.name}
              </CardTitle>
              <Button variant="outline" onClick={() => setPlan(null)}>
                {t('fitness:new_plan')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {plan.weeklySchedule.map((day, index) => (
              <Card key={index} className="bg-secondary/30">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{day.day}</span>
                      <span className="text-sm text-muted-foreground">- {day.focus}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {day.estimatedDuration} {t('fitness:min')}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {day.exercises.map((exercise, exIndex) => (
                      <div 
                        key={exIndex}
                        className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                      >
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {exercise.sets} x {exercise.reps} | {exercise.restSeconds}s {t('fitness:rest')}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {plan.tips.length > 0 && (
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {t('fitness:pro_tips')}
                  </h4>
                  <ul className="space-y-1">
                    {plan.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {tip}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {t('fitness:ai_workout_generator')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fitness Level */}
        <div className="space-y-2">
          <Label>{t('fitness:fitness_level')}</Label>
          <div className="flex gap-2">
            {FITNESS_LEVELS.map(level => (
              <Button
                key={level}
                variant={fitnessLevel === level ? 'default' : 'outline'}
                onClick={() => setFitnessLevel(level)}
                className="flex-1"
              >
                {t(`fitness:level_${level}`)}
              </Button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="space-y-2">
          <Label>{t('fitness:your_goals')}</Label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map(goal => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox
                  id={goal}
                  checked={selectedGoals.includes(goal)}
                  onCheckedChange={() => toggleGoal(goal)}
                />
                <label htmlFor={goal} className="text-sm cursor-pointer">
                  {t(`fitness:goal_${goal}`)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Days per week */}
        <div className="space-y-2">
          <Label>{t('fitness:days_per_week')}: {daysPerWeek}</Label>
          <Slider
            value={[daysPerWeek]}
            onValueChange={([val]) => setDaysPerWeek(val)}
            min={2}
            max={6}
            step={1}
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label>{t('fitness:session_duration')}: {duration} {t('fitness:min')}</Label>
          <Slider
            value={[duration]}
            onValueChange={([val]) => setDuration(val)}
            min={20}
            max={90}
            step={5}
          />
        </div>

        {/* Equipment */}
        <div className="space-y-2">
          <Label>{t('fitness:available_equipment')}</Label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map(eq => (
              <Button
                key={eq}
                variant={selectedEquipment.includes(eq) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleEquipment(eq)}
              >
                {t(`fitness:equipment_${eq}`)}
              </Button>
            ))}
          </div>
        </div>

        <Button 
          onClick={generatePlan} 
          disabled={isLoading || selectedGoals.length === 0}
          className="w-full gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Dumbbell className="h-4 w-4" />
          )}
          {t('fitness:generate_plan')}
        </Button>
      </CardContent>
    </Card>
  );
};
