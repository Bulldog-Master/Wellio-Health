import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Target, Plus, Check, Trash2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { habitSchema, validateAndSanitize } from "@/lib/validationSchemas";
import { useTranslation } from "react-i18next";

interface Habit {
  id: string;
  name: string;
  description: string | null;
  target_frequency: string;
  target_count: number | null;
  icon: string | null;
  color: string | null;
  is_active: boolean | null;
}

interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_at: string | null;
}

const Habits = () => {
  const { t } = useTranslation('fitness');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    target_frequency: "daily",
    target_count: "1",
  });

  useEffect(() => {
    fetchHabits();
    fetchTodayCompletions();
  }, []);

  const fetchHabits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTodayCompletions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', today.toISOString());

      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  };

  const handleAddHabit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Validate habit data
      const validation = validateAndSanitize(habitSchema, {
        name: formData.name,
        description: formData.description || undefined,
        target_frequency: formData.target_frequency,
        target_count: parseInt(formData.target_count),
      });

      if (validation.success === false) {
        toast({
          title: t('validation_error'),
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          ...validation.data,
        });

      if (error) throw error;

      toast({
        title: t('habit_created'),
        description: `${formData.name} ${t('habit_added_message')}`,
      });

      setFormData({ name: "", description: "", target_frequency: "daily", target_count: "1" });
      setShowAddForm(false);
      fetchHabits();
    } catch (error) {
      console.error('Error adding habit:', error);
      toast({
        title: tCommon('error'),
        description: tCommon('error'),
        variant: "destructive",
      });
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('habit_completions')
        .insert({
          user_id: user.id,
          habit_id: habitId,
        });

      if (error) throw error;

      toast({
        title: t('habit_completed'),
        description: t('great_job_consistent'),
      });

      fetchTodayCompletions();
    } catch (error) {
      console.error('Error completing habit:', error);
      toast({
        title: tCommon('error'),
        description: tCommon('error'),
        variant: "destructive",
      });
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habitId);

      if (error) throw error;

      toast({
        title: t('habit_removed'),
        description: t('habit_removed_message'),
      });

      fetchHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast({
        title: tCommon('error'),
        description: tCommon('error'),
        variant: "destructive",
      });
    }
  };

  const isHabitCompleted = (habitId: string) => {
    return completions.some(c => c.habit_id === habitId);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/activity")}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('back_to_activity')}
      </Button>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('habit_tracker')}</h1>
            <p className="text-muted-foreground mt-1">{t('build_consistent_habits')}</p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('add_habit')}
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{t('new_habit')}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="habit-name">{t('habit_name')}</Label>
              <Input
                id="habit-name"
                placeholder={t('habit_name_placeholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="habit-description">{t('description_optional')}</Label>
              <Textarea
                id="habit-description"
                placeholder={t('add_details')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1.5 min-h-20"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddHabit}>{t('create_habit')}</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>{tCommon('cancel')}</Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{t('todays_habits')}</h3>
        </div>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">{t('loading')}</p>
          ) : habits.length > 0 ? (
            habits.map((habit) => {
              const completed = isHabitCompleted(habit.id);
              return (
                <div key={habit.id} className="p-4 bg-secondary rounded-lg flex items-center justify-between hover:bg-secondary/80 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      size="icon"
                      variant={completed ? "default" : "outline"}
                      onClick={() => !completed && handleCompleteHabit(habit.id)}
                      disabled={completed}
                      className={completed ? "bg-primary" : ""}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <div>
                      <h4 className="font-semibold">{habit.name}</h4>
                      {habit.description && (
                        <p className="text-sm text-muted-foreground">{habit.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteHabit(habit.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t('no_habits_yet')}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Habits;
