import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ActivityLog, WorkoutRoutine, SampleRoutine, SavedApp, WorkoutMedia, RoutineExercise } from "@/types/workout.types";

interface UseWorkoutDataProps {
  viewFilter: 'today' | 'week' | 'month' | 'all';
  setActivityLogs: (logs: ActivityLog[]) => void;
  setWorkoutRoutines: (routines: WorkoutRoutine[]) => void;
  setSampleRoutines: (routines: SampleRoutine[]) => void;
  setSavedApps: (apps: SavedApp[]) => void;
  setWorkoutMedia: (media: Record<string, WorkoutMedia[]>) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useWorkoutData = ({
  viewFilter,
  setActivityLogs,
  setWorkoutRoutines,
  setSampleRoutines,
  setSavedApps,
  setWorkoutMedia,
  setIsLoading,
}: UseWorkoutDataProps) => {
  
  const fetchActivityLogs = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id);

      if (viewFilter === 'today') {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        query = query.gte('logged_at', todayStr);
      } else if (viewFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const year = weekAgo.getFullYear();
        const month = String(weekAgo.getMonth() + 1).padStart(2, '0');
        const day = String(weekAgo.getDate()).padStart(2, '0');
        const weekAgoStr = `${year}-${month}-${day}`;
        query = query.gte('logged_at', weekAgoStr);
      } else if (viewFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const year = monthAgo.getFullYear();
        const month = String(monthAgo.getMonth() + 1).padStart(2, '0');
        const day = String(monthAgo.getDate()).padStart(2, '0');
        const monthAgoStr = `${year}-${month}-${day}`;
        query = query.gte('logged_at', monthAgoStr);
      }

      const { data, error } = await query.order('logged_at', { ascending: false });

      if (error) throw error;
      setActivityLogs(data || []);
      
      if (data && data.length > 0) {
        const mediaPromises = data.map(async (log) => {
          const { data: mediaData } = await supabase
            .from('workout_media')
            .select('*')
            .eq('activity_log_id', log.id);
          return { logId: log.id, media: mediaData || [] };
        });
        
        const mediaResults = await Promise.all(mediaPromises);
        const mediaMap: Record<string, WorkoutMedia[]> = {};
        mediaResults.forEach(({ logId, media }) => {
          mediaMap[logId] = media;
        });
        setWorkoutMedia(mediaMap);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [viewFilter, setActivityLogs, setWorkoutMedia, setIsLoading]);

  const fetchWorkoutRoutines = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('workout_routines')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkoutRoutines((data || []).map(routine => ({
        ...routine,
        exercises: routine.exercises as unknown as RoutineExercise[]
      })));
    } catch (error) {
      console.error('Error fetching workout routines:', error);
    }
  }, [setWorkoutRoutines]);

  const fetchSampleRoutines = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('sample_routines')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSampleRoutines((data || []).map(routine => ({
        ...routine,
        exercises: routine.exercises as unknown as RoutineExercise[]
      })));
    } catch (error) {
      console.error('Error fetching sample routines:', error);
    }
  }, [setSampleRoutines]);

  const fetchSavedApps = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_apps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedApps(data || []);
    } catch (error) {
      console.error('Error fetching saved apps:', error);
    }
  }, [setSavedApps]);

  return {
    fetchActivityLogs,
    fetchWorkoutRoutines,
    fetchSampleRoutines,
    fetchSavedApps,
  };
};
