import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, Plus, Clock, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { formatDistance, parseDistance } from "@/lib/unitConversion";

interface ActivityLog {
  id: string;
  activity_type: string;
  duration_minutes: number;
  calories_burned: number | null;
  distance_miles: number | null;
  notes: string | null;
  logged_at: string;
}

const Workout = () => {
  const { toast } = useToast();
  const { preferredUnit } = useUserPreferences();
  const [exercise, setExercise] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', today.toISOString())
        .order('logged_at', { ascending: false });

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalDuration = activityLogs.reduce((sum, log) => sum + log.duration_minutes, 0);
  const totalCalories = activityLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0);

  const handleAddWorkout = async () => {
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

      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          activity_type: exercise,
          duration_minutes: parseInt(duration),
          calories_burned: calories ? parseInt(calories) : null,
          distance_miles: distanceMiles,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Workout logged",
        description: `${exercise} for ${duration} minutes has been recorded.`,
      });

      setExercise("");
      setDuration("");
      setCalories("");
      setDistance("");
      setNotes("");
      
      fetchActivityLogs();
    } catch (error) {
      console.error('Error logging workout:', error);
      toast({
        title: "Error",
        description: "Failed to log workout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Dumbbell className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Workout Log</h1>
          <p className="text-muted-foreground">Track your daily exercises</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Total Duration</h3>
          </div>
          <p className="text-4xl font-bold text-primary mb-2">{totalDuration} min</p>
          <p className="text-muted-foreground">Active time today</p>
        </Card>

        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Calories Burned</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{totalCalories}</p>
          <p className="opacity-90">Through exercise</p>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-6">Log Workout</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exercise">Exercise Name</Label>
              <Input
                id="exercise"
                placeholder="e.g., Running, Weight Training"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="calories">Estimated Calories Burned (optional)</Label>
            <Input
              id="calories"
              type="number"
              placeholder="e.g., 250"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add details about your workout..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 min-h-24"
            />
          </div>

          <Button onClick={handleAddWorkout} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Workout
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Today's Workouts</h3>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : activityLogs.length > 0 ? (
            activityLogs.map((log) => (
              <div key={log.id} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-lg">{log.activity_type}</h4>
                  {log.calories_burned && (
                    <span className="font-bold text-accent">{log.calories_burned} cal</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{log.duration_minutes} min</span>
                  </div>
                  {log.distance_miles && (
                    <span>{formatDistance(log.distance_miles, preferredUnit)}</span>
                  )}
                </div>
                {log.notes && (
                  <p className="text-sm text-muted-foreground">{log.notes}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No workouts logged today. Start by adding one above!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Workout;
