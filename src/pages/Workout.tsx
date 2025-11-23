import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, Plus, Clock, Flame, Zap, MapPin, Trash2 } from "lucide-react";
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
  const [intensity, setIntensity] = useState("moderate");
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calorie calculation based on activity, duration, and intensity
  const calculateCalories = (activityType: string, durationMin: number, intensityLevel: string): number => {
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
      'light': 0.7,
      'moderate': 1.0,
      'intense': 1.4
    };
    
    const baseCalories = baseCaloriesPerMinute[activityType] || baseCaloriesPerMinute['Other'];
    return Math.round(baseCalories * durationMin * (intensityMultiplier[intensityLevel] || 1.0));
  };

  const estimatedCalories = exercise && duration 
    ? calculateCalories(exercise, parseInt(duration) || 0, intensity)
    : 0;

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
      const calculatedCalories = calculateCalories(exercise, parseInt(duration), intensity);

      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          activity_type: exercise,
          duration_minutes: parseInt(duration),
          calories_burned: calculatedCalories,
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
      setIntensity("moderate");
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

  const handleDeleteWorkout = async (id: string) => {
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
          <div>
            <Label htmlFor="exercise">Activity Type</Label>
            <Select value={exercise} onValueChange={setExercise}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Running">Running</SelectItem>
                <SelectItem value="Cycling">Cycling</SelectItem>
                <SelectItem value="Swimming">Swimming</SelectItem>
                <SelectItem value="Walking">Walking</SelectItem>
                <SelectItem value="Weightlifting">Weightlifting</SelectItem>
                <SelectItem value="Yoga">Yoga</SelectItem>
                <SelectItem value="HIIT">HIIT</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="intensity">Intensity Level</Label>
              <Select value={intensity} onValueChange={setIntensity}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-muted-foreground" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="moderate">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-primary" />
                      Moderate
                    </div>
                  </SelectItem>
                  <SelectItem value="intense">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-accent" />
                      Intense
                    </div>
                  </SelectItem>
                  <SelectItem value="HIT">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-accent" />
                      HIT
                    </div>
                  </SelectItem>
                  <SelectItem value="HIIT">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-accent" />
                      HIIT
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {estimatedCalories > 0 && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                Estimated: <span className="text-primary">{estimatedCalories} calories</span>
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="distance">Distance (optional)</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="distance"
                type="number"
                step="0.1"
                placeholder="5.0"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="flex-1"
              />
              <div className="flex items-center px-3 bg-secondary rounded-md text-sm text-muted-foreground min-w-[60px] justify-center">
                {preferredUnit === 'imperial' ? 'mi' : 'km'}
              </div>
            </div>
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
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{log.activity_type}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{log.duration_minutes} min</span>
                      </div>
                      {log.distance_miles && (
                        <span>{formatDistance(log.distance_miles, preferredUnit)}</span>
                      )}
                    </div>
                    {log.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {log.calories_burned && (
                      <span className="font-bold text-accent">{log.calories_burned} cal</span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteWorkout(log.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
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
