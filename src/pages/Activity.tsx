import { Card } from "@/components/ui/card";
import { Activity as ActivityIcon, TrendingUp, Calendar, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { formatDistance } from "@/lib/unitConversion";
import { format, subDays, startOfDay } from "date-fns";

interface ActivityLog {
  id: string;
  activity_type: string;
  duration_minutes: number;
  calories_burned: number | null;
  distance_miles: number | null;
  logged_at: string;
}

const Activity = () => {
  const { preferredUnit } = useUserPreferences();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

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

  const weeklyStats = {
    totalDuration: activityLogs.reduce((sum, log) => sum + log.duration_minutes, 0),
    totalCalories: activityLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0),
    totalDistance: activityLogs.reduce((sum, log) => sum + (log.distance_miles || 0), 0),
    workoutCount: activityLogs.length,
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <ActivityIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Activity Overview</h1>
          <p className="text-muted-foreground">Your fitness activity summary</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Workouts</h3>
          </div>
          <p className="text-3xl font-bold text-primary">{weeklyStats.workoutCount}</p>
          <p className="text-sm text-muted-foreground">This week</p>
        </Card>

        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5" />
            <h3 className="font-semibold">Calories</h3>
          </div>
          <p className="text-3xl font-bold">{weeklyStats.totalCalories}</p>
          <p className="text-sm opacity-90">Burned this week</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <ActivityIcon className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold">Duration</h3>
          </div>
          <p className="text-3xl font-bold text-secondary">{weeklyStats.totalDuration}</p>
          <p className="text-sm text-muted-foreground">Minutes</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Distance</h3>
          </div>
          <p className="text-3xl font-bold text-accent">
            {preferredUnit === 'metric' 
              ? (weeklyStats.totalDistance * 1.60934).toFixed(1)
              : weeklyStats.totalDistance.toFixed(1)}
          </p>
          <p className="text-sm text-muted-foreground">{preferredUnit === 'metric' ? 'km' : 'mi'}</p>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Activities (Last 7 Days)</h3>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : activityLogs.length > 0 ? (
            activityLogs.map((log) => (
              <div key={log.id} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-lg">{log.activity_type}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(log.logged_at), "PPp")}
                    </p>
                  </div>
                  {log.calories_burned && (
                    <span className="font-bold text-accent">{log.calories_burned} cal</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{log.duration_minutes} min</span>
                  {log.distance_miles && (
                    <span>{formatDistance(log.distance_miles, preferredUnit)}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No activities in the last 7 days. Start logging your workouts!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Activity;
