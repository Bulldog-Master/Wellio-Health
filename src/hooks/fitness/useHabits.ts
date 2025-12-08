import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { habitSchema, validateAndSanitize } from "@/lib/validationSchemas";

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  target_frequency: string;
  target_count: number | null;
  icon: string | null;
  color: string | null;
  is_active: boolean | null;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_at: string | null;
}

export interface HabitFormData {
  name: string;
  description: string;
  target_frequency: string;
  target_count: string;
}

export const useHabits = () => {
  const { t } = useTranslation('fitness');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const addHabit = async (formData: HabitFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

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
        return false;
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

      fetchHabits();
      return true;
    } catch (error) {
      console.error('Error adding habit:', error);
      toast({
        title: tCommon('error'),
        description: tCommon('error'),
        variant: "destructive",
      });
      return false;
    }
  };

  const completeHabit = async (habitId: string) => {
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

  const deleteHabit = async (habitId: string) => {
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

  useEffect(() => {
    fetchHabits();
    fetchTodayCompletions();
  }, []);

  return {
    habits,
    completions,
    isLoading,
    addHabit,
    completeHabit,
    deleteHabit,
    isHabitCompleted,
  };
};
