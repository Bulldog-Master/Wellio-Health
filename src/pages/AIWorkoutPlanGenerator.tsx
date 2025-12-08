import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Sparkles,
  Dumbbell,
  Clock,
  Calendar,
  Target,
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SubscriptionGate } from "@/components/common";

interface WorkoutDay {
  day: string;
  focus: string;
  estimatedDuration: number;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    restSeconds: number;
  }>;
}

interface WorkoutPlan {
  name: string;
  fitnessLevel: string;
  goals: string[];
  daysPerWeek: number;
  weeklySchedule: WorkoutDay[];
  tips: string[];
}

const AIWorkoutPlanGenerator = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['fitness', 'common']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    fitnessLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    goals: [] as string[],
    daysPerWeek: 3,
    equipment: [] as string[],
    duration: 45,
  });

  const fitnessLevels = [
    { id: 'beginner', label: t('fitness:beginner') },
    { id: 'intermediate', label: t('fitness:intermediate') },
    { id: 'advanced', label: t('fitness:advanced') },
  ];

  const goalOptions = [
    { id: 'muscle_gain', label: t('fitness:build_muscle') },
    { id: 'weight_loss', label: t('fitness:lose_weight') },
    { id: 'endurance', label: t('fitness:improve_endurance') },
    { id: 'strength', label: t('fitness:increase_strength') },
    { id: 'flexibility', label: t('fitness:improve_flexibility') },
  ];

  const equipmentOptions = [
    { id: 'bodyweight', label: t('fitness:bodyweight_only') },
    { id: 'dumbbells', label: t('fitness:dumbbells') },
    { id: 'barbell', label: t('fitness:barbell') },
    { id: 'resistance_bands', label: t('fitness:resistance_bands') },
    { id: 'full_gym', label: t('fitness:full_gym') },
  ];

  const toggleGoal = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const toggleEquipment = (equipId: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipId)
        ? prev.equipment.filter(e => e !== equipId)
        : [...prev.equipment, equipId]
    }));
  };

  const handleGenerate = async () => {
    if (formData.goals.length === 0) {
      toast.error(t('fitness:select_at_least_one_goal'));
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t('common:authentication_required'));
        navigate('/auth');
        return;
      }

      const response = await supabase.functions.invoke('ai-workout-plan', {
        body: {
          fitnessLevel: formData.fitnessLevel,
          goals: formData.goals,
          daysPerWeek: formData.daysPerWeek,
          equipment: formData.equipment.length > 0 ? formData.equipment : ['bodyweight'],
          duration: formData.duration,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) throw response.error;
      
      setPlan(response.data.plan);
      toast.success(t('fitness:plan_generated'));
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error(t('fitness:failed_to_generate_plan'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/activity')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            {t('fitness:ai_workout_plan')}
          </h1>
          <p className="text-muted-foreground">{t('fitness:generate_personalized_plan')}</p>
        </div>
      </div>

      <SubscriptionGate feature="ai_workouts">
        {!plan ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('fitness:customize_your_plan')}</CardTitle>
              <CardDescription>{t('fitness:tell_us_about_fitness_goals')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fitness Level */}
              <div className="space-y-3">
                <Label>{t('fitness:fitness_level')}</Label>
                <div className="flex gap-2">
                  {fitnessLevels.map((level) => (
                    <Button
                      key={level.id}
                      variant={formData.fitnessLevel === level.id ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, fitnessLevel: level.id as any })}
                      className="flex-1"
                    >
                      {level.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-3">
                <Label>{t('fitness:fitness_goals')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {goalOptions.map((goal) => (
                    <div
                      key={goal.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.goals.includes(goal.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleGoal(goal.id)}
                    >
                      <Checkbox checked={formData.goals.includes(goal.id)} />
                      <span className="text-sm">{goal.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Days per Week */}
              <div className="space-y-3">
                <Label>{t('fitness:days_per_week')}: {formData.daysPerWeek}</Label>
                <Slider
                  value={[formData.daysPerWeek]}
                  onValueChange={(value) => setFormData({ ...formData, daysPerWeek: value[0] })}
                  min={2}
                  max={6}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2 {t('fitness:days')}</span>
                  <span>6 {t('fitness:days')}</span>
                </div>
              </div>

              {/* Session Duration */}
              <div className="space-y-3">
                <Label>{t('fitness:session_duration')}: {formData.duration} {t('fitness:min')}</Label>
                <Slider
                  value={[formData.duration]}
                  onValueChange={(value) => setFormData({ ...formData, duration: value[0] })}
                  min={20}
                  max={90}
                  step={5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>20 {t('fitness:min')}</span>
                  <span>90 {t('fitness:min')}</span>
                </div>
              </div>

              {/* Equipment */}
              <div className="space-y-3">
                <Label>{t('fitness:available_equipment')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {equipmentOptions.map((equip) => (
                    <div
                      key={equip.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.equipment.includes(equip.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleEquipment(equip.id)}
                    >
                      <Checkbox checked={formData.equipment.includes(equip.id)} />
                      <span className="text-sm">{equip.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || formData.goals.length === 0}
                className="w-full gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {t('fitness:generate_plan')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{plan.name}</h2>
                    <div className="flex gap-4 mt-2 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {plan.fitnessLevel}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {plan.daysPerWeek} {t('fitness:days_week')}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setPlan(null)}>
                    {t('fitness:create_new_plan')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Schedule */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{t('fitness:weekly_schedule')}</h3>
              {plan.weeklySchedule.map((day, index) => (
                <Card key={index} className="overflow-hidden">
                  <button
                    onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Dumbbell className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold">{day.day}</h4>
                        <p className="text-sm text-muted-foreground">{day.focus}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {day.estimatedDuration} {t('fitness:min')}
                      </span>
                      {expandedDay === index ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </button>
                  
                  {expandedDay === index && (
                    <div className="px-4 pb-4 space-y-3 border-t">
                      {day.exercises.map((exercise, exIndex) => (
                        <div key={exIndex} className="flex items-center justify-between py-2">
                          <span className="font-medium">{exercise.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {exercise.sets} × {exercise.reps} | {exercise.restSeconds}s {t('fitness:rest')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Tips */}
            {plan.tips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('fitness:pro_tips')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </SubscriptionGate>
    </div>
  );
};

export default AIWorkoutPlanGenerator;
