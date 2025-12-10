import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { parseDistance } from "@/lib/utils";
import type { ActivityLog, WorkoutRoutine } from "@/types/workout.types";

interface UseWorkoutActionsProps {
  exercise: string;
  duration: string;
  intensity: string;
  distance: string;
  notes: string;
  workoutDate: string;
  timeOfDay: string;
  loadedRoutine: WorkoutRoutine | null;
  editingWorkout: string | null;
  pendingMediaFiles: File[];
  mediaPreviewUrls: string[];
  preferredUnit: 'metric' | 'imperial';
  setEditingWorkout: (id: string | null) => void;
  setPendingMediaFiles: (files: File[]) => void;
  setMediaPreviewUrls: (urls: string[]) => void;
  resetForm: () => void;
  fetchActivityLogs: () => void;
}

export const calculateCalories = (activityType: string, durationMin: number, intensityLevel: string): number => {
  const baseCaloriesPerMinute: { [key: string]: number } = {
    'Running': 10,
    'Cycling': 8,
    'Swimming': 9,
    'Walking': 4,
    'Weightlifting': 6,
    'Yoga': 3,
    'HIIT': 12,
    'Other': 6
  };
  
  const intensityMultiplier: { [key: string]: number } = {
    'low': 0.7,
    'medium': 1.0,
    'high': 1.2,
    'intense': 1.4
  };
  
  const baseCalories = baseCaloriesPerMinute[activityType] || baseCaloriesPerMinute['Other'];
  return Math.round(baseCalories * durationMin * (intensityMultiplier[intensityLevel] || 1.0));
};

export const useWorkoutActions = ({
  exercise,
  duration,
  intensity,
  distance,
  notes,
  workoutDate,
  timeOfDay,
  loadedRoutine,
  editingWorkout,
  pendingMediaFiles,
  mediaPreviewUrls,
  preferredUnit,
  setEditingWorkout,
  setPendingMediaFiles,
  setMediaPreviewUrls,
  resetForm,
  fetchActivityLogs,
}: UseWorkoutActionsProps) => {
  const { toast } = useToast();

  const handleAddWorkout = useCallback(async () => {
    if (!exercise || !duration) {
      toast({
        title: "Missing information",
        description: "Please enter activity type and duration.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to track your workouts.",
          variant: "destructive",
        });
        return;
      }

      const distanceMiles = distance ? parseDistance(distance, preferredUnit) : null;
      const calculatedCalories = calculateCalories(exercise, parseInt(duration), intensity);
      
      const [dateYear, dateMonth, dateDay] = workoutDate.split('-');
      const localDate = new Date(parseInt(dateYear), parseInt(dateMonth) - 1, parseInt(dateDay), 12, 0, 0);
      const loggedAtTimestamp = localDate.toISOString();

      let finalNotes = notes;
      if (loadedRoutine && !notes.includes(loadedRoutine.name)) {
        const exerciseList = loadedRoutine.exercises.map((ex, idx) => {
          let line = `${idx + 1}. ${ex.name}`;
          if (ex.sets && ex.reps) line += ` - ${ex.sets}x${ex.reps}`;
          else if (ex.duration) line += ` - ${ex.duration}min`;
          return line;
        }).join('\n');
        finalNotes = `Routine: ${loadedRoutine.name}\n\n${exerciseList}${notes ? '\n\n' + notes : ''}`;
      }

      if (editingWorkout) {
        const { error } = await supabase
          .from('activity_logs')
          .update({
            activity_type: exercise,
            duration_minutes: parseInt(duration),
            calories_burned: calculatedCalories,
            distance_miles: distanceMiles,
            notes: finalNotes || null,
            logged_at: loggedAtTimestamp,
            time_of_day: timeOfDay,
          })
          .eq('id', editingWorkout);

        if (error) throw error;

        toast({
          title: "Workout updated",
          description: `${exercise} has been updated.`,
        });
        setEditingWorkout(null);
      } else {
        const { data: insertData, error } = await supabase
          .from('activity_logs')
          .insert({
            user_id: user.id,
            activity_type: exercise,
            duration_minutes: parseInt(duration),
            calories_burned: calculatedCalories,
            distance_miles: distanceMiles,
            notes: finalNotes || null,
            logged_at: loggedAtTimestamp,
            time_of_day: timeOfDay,
          })
          .select('id')
          .single();

        if (error) throw error;

        if (pendingMediaFiles.length > 0 && insertData?.id) {
          for (const file of pendingMediaFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('workout-media')
              .upload(fileName, file);

            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from('workout-media')
                .getPublicUrl(fileName);

              await supabase.from('workout_media').insert({
                user_id: user.id,
                activity_log_id: insertData.id,
                file_url: publicUrl,
                file_type: file.type,
              });
            }
          }
        }

        toast({
          title: "Workout logged",
          description: `${exercise} for ${duration} minutes has been recorded.`,
        });
      }

      mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setPendingMediaFiles([]);
      setMediaPreviewUrls([]);
      resetForm();
      fetchActivityLogs();
    } catch (error) {
      console.error('Error logging workout:', error);
      toast({
        title: "Error",
        description: "Failed to log workout. Please try again.",
        variant: "destructive",
      });
    }
  }, [exercise, duration, intensity, distance, notes, workoutDate, timeOfDay, loadedRoutine, editingWorkout, pendingMediaFiles, mediaPreviewUrls, preferredUnit, toast, setEditingWorkout, setPendingMediaFiles, setMediaPreviewUrls, resetForm, fetchActivityLogs]);

  const handleDeleteWorkout = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Workout deleted",
        description: "The workout entry has been removed.",
      });

      fetchActivityLogs();
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast({
        title: "Error",
        description: "Failed to delete workout.",
        variant: "destructive",
      });
    }
  }, [toast, fetchActivityLogs]);

  return {
    handleAddWorkout,
    handleDeleteWorkout,
    calculateCalories,
  };
};
