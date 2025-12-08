import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { WorkoutProgram, Completion, WorkoutFormData } from "@/components/workout-programs/types";

export const useWorkoutPrograms = () => {
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [completions, setCompletions] = useState<Record<string, Completion[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: programsData, error: programsError } = await supabase
        .from('workout_programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (programsError) throw programsError;
      setPrograms((programsData || []).map(p => ({
        ...p,
        workouts: (p.workouts as any[]) || []
      })));

      if (programsData && programsData.length > 0) {
        const completionsMap: Record<string, Completion[]> = {};
        
        for (const program of programsData) {
          const { data: completionsData } = await supabase
            .from('program_completions')
            .select('week_number, day_number')
            .eq('program_id', program.id);
          
          completionsMap[program.id] = completionsData || [];
        }
        
        setCompletions(completionsMap);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const saveProgram = async (formData: WorkoutFormData, editingProgramId: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Cast workouts to Json type for Supabase
      const workoutsJson = formData.workouts as unknown as any[];

      if (editingProgramId) {
        const { error } = await supabase
          .from('workout_programs')
          .update({
            name: formData.name,
            description: formData.description || null,
            duration_weeks: formData.duration_weeks,
            workouts: workoutsJson
          })
          .eq('id', editingProgramId);

        if (error) throw error;
        toast.success('Program updated!');
      } else {
        const { error } = await supabase
          .from('workout_programs')
          .insert([{
            user_id: user.id,
            name: formData.name,
            description: formData.description || null,
            duration_weeks: formData.duration_weeks,
            start_date: format(new Date(), 'yyyy-MM-dd'),
            workouts: workoutsJson
          }]);

        if (error) throw error;
        toast.success('Program created!');
      }

      fetchPrograms();
      return true;
    } catch (error) {
      console.error('Error saving program:', error);
      toast.error('Failed to save program');
      return false;
    }
  };

  const deleteProgram = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workout_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Program deleted');
      fetchPrograms();
    } catch (error) {
      console.error('Error deleting program:', error);
      toast.error('Failed to delete program');
    }
  };

  const toggleCompletion = async (programId: string, week: number, day: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isCompleted = completions[programId]?.some(
        c => c.week_number === week && c.day_number === day
      );

      if (isCompleted) {
        const { error } = await supabase
          .from('program_completions')
          .delete()
          .eq('program_id', programId)
          .eq('week_number', week)
          .eq('day_number', day);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('program_completions')
          .insert({
            user_id: user.id,
            program_id: programId,
            week_number: week,
            day_number: day
          });

        if (error) throw error;
      }

      fetchPrograms();
    } catch (error) {
      console.error('Error toggling completion:', error);
      toast.error('Failed to update completion');
    }
  };

  const reorderWorkouts = async (programId: string, reorderedWorkouts: any[]) => {
    try {
      const { error } = await supabase
        .from('workout_programs')
        .update({ workouts: reorderedWorkouts })
        .eq('id', programId);

      if (error) throw error;

      setPrograms(programs.map(p => 
        p.id === programId ? { ...p, workouts: reorderedWorkouts } : p
      ));

      toast.success('Workout order updated');
    } catch (error) {
      console.error('Error reordering workouts:', error);
      toast.error('Failed to reorder workouts');
    }
  };

  const calculateProgress = (program: WorkoutProgram) => {
    const totalDays = program.duration_weeks * 7;
    const completedDays = completions[program.id]?.length || 0;
    return (completedDays / totalDays) * 100;
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return {
    programs,
    completions,
    loading,
    saveProgram,
    deleteProgram,
    toggleCompletion,
    reorderWorkouts,
    calculateProgress
  };
};
