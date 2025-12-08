import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay } from 'date-fns';

export interface ActivityLog {
  id: string;
  activity_type: string;
  duration_minutes: number;
  calories_burned: number | null;
  distance_miles: number | null;
  logged_at: string;
}

export const useActivityData = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivityLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sevenDaysAgo = subDays(startOfDay(new Date()), 7);

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', sevenDaysAgo.toISOString())
        .order('logged_at', { ascending: false });

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const weeklyStats = {
    totalDuration: activityLogs.reduce((sum, log) => sum + log.duration_minutes, 0),
    totalCalories: activityLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0),
    totalDistance: activityLogs.reduce((sum, log) => sum + (log.distance_miles || 0), 0),
    workoutCount: activityLogs.length,
  };

  return {
    activityLogs,
    isLoading,
    weeklyStats,
    refetch: fetchActivityLogs,
  };
};
