import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dumbbell, Plus, Clock, Flame, Zap, MapPin, Trash2, Pencil, ListOrdered, Upload, Image as ImageIcon, Video } from "lucide-react";
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

interface WorkoutRoutine {
  id: string;
  name: string;
  description: string | null;
  exercises: Array<{
    name: string;
    sets?: number;
    reps?: number;
    duration?: number;
  }>;
}

interface WorkoutMedia {
  id: string;
  file_url: string;
  file_type: string;
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
  const [editingWorkout, setEditingWorkout] = useState<string | null>(null);
  const [workoutRoutines, setWorkoutRoutines] = useState<WorkoutRoutine[]>([]);
  const [showRoutineDialog, setShowRoutineDialog] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [workoutMedia, setWorkoutMedia] = useState<Record<string, WorkoutMedia[]>>({});
  const [showCreateRoutine, setShowCreateRoutine] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [routineExercises, setRoutineExercises] = useState<Array<{ name: string; sets?: number; reps?: number; duration?: number }>>([]);

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
    fetchWorkoutRoutines();
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
      
      // Fetch media for each activity log
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
  };

  const fetchWorkoutRoutines = async () => {
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
        exercises: routine.exercises as Array<{
          name: string;
          sets?: number;
          reps?: number;
          duration?: number;
        }>
      })));
    } catch (error) {
      console.error('Error fetching workout routines:', error);
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

      if (editingWorkout) {
        const { error } = await supabase
          .from('activity_logs')
          .update({
            activity_type: exercise,
            duration_minutes: parseInt(duration),
            calories_burned: calculatedCalories,
            distance_miles: distanceMiles,
            notes: notes || null,
          })
          .eq('id', editingWorkout);

        if (error) throw error;

        toast({
          title: "Workout updated",
          description: `${exercise} has been updated.`,
        });
        setEditingWorkout(null);
      } else {
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
      }

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

  const handleEditWorkout = (log: ActivityLog) => {
    setExercise(log.activity_type);
    setDuration(log.duration_minutes.toString());
    setIntensity("moderate");
    setDistance(log.distance_miles ? formatDistance(log.distance_miles, preferredUnit).split(' ')[0] : "");
    setNotes(log.notes || "");
    setEditingWorkout(log.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, activityLogId: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('workout-media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('workout-media')
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from('workout_media')
          .insert({
            user_id: user.id,
            activity_log_id: activityLogId,
            file_url: publicUrl,
            file_type: file.type,
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Upload successful",
        description: "Your media has been uploaded.",
      });

      fetchActivityLogs();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload media.",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleAddExerciseToRoutine = () => {
    setRoutineExercises([...routineExercises, { name: "", sets: 3, reps: 10 }]);
  };

  const handleUpdateRoutineExercise = (index: number, field: string, value: string | number) => {
    const updated = [...routineExercises];
    updated[index] = { ...updated[index], [field]: value };
    setRoutineExercises(updated);
  };

  const handleRemoveRoutineExercise = (index: number) => {
    setRoutineExercises(routineExercises.filter((_, i) => i !== index));
  };

  const handleEditRoutine = (routine: WorkoutRoutine) => {
    setEditingRoutineId(routine.id);
    setRoutineName(routine.name);
    setRoutineDescription(routine.description || "");
    setRoutineExercises(routine.exercises);
    setShowCreateRoutine(true);
  };

  const handleDeleteRoutine = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workout_routines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Routine deleted",
        description: "The workout routine has been removed.",
      });

      fetchWorkoutRoutines();
    } catch (error) {
      console.error('Error deleting routine:', error);
      toast({
        title: "Error",
        description: "Failed to delete routine.",
        variant: "destructive",
      });
    }
  };

  const handleSaveRoutine = async () => {
    if (!routineName || routineExercises.length === 0) {
      toast({
        title: "Missing information",
        description: "Please provide a routine name and at least one exercise.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (editingRoutineId) {
        const { error } = await supabase
          .from('workout_routines')
          .update({
            name: routineName,
            description: routineDescription || null,
            exercises: routineExercises,
          })
          .eq('id', editingRoutineId);

        if (error) throw error;

        toast({
          title: "Routine updated",
          description: "Your workout routine has been updated.",
        });
      } else {
        const { error } = await supabase
          .from('workout_routines')
          .insert({
            user_id: user.id,
            name: routineName,
            description: routineDescription || null,
            exercises: routineExercises,
          });

        if (error) throw error;

        toast({
          title: "Routine saved",
          description: "Your workout routine has been saved.",
        });
      }

      setRoutineName("");
      setRoutineDescription("");
      setRoutineExercises([]);
      setEditingRoutineId(null);
      setShowCreateRoutine(false);
      fetchWorkoutRoutines();
    } catch (error) {
      console.error('Error saving routine:', error);
      toast({
        title: "Error",
        description: "Failed to save routine.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Dumbbell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Workout Log</h1>
            <p className="text-muted-foreground">Track your daily exercises</p>
          </div>
        </div>
        <Dialog open={showRoutineDialog} onOpenChange={setShowRoutineDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <ListOrdered className="w-4 h-4" />
              Routines
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Workout Routines</DialogTitle>
            </DialogHeader>
            
            {!showCreateRoutine ? (
              <div className="space-y-4">
                <Button onClick={() => setShowCreateRoutine(true)} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Routine
                </Button>
                
                <div className="space-y-3">
                  {workoutRoutines.length > 0 ? (
                    workoutRoutines.map((routine) => (
                      <Card key={routine.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{routine.name}</h4>
                            {routine.description && (
                              <p className="text-sm text-muted-foreground mt-1">{routine.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditRoutine(routine)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRoutine(routine.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {routine.exercises.map((exercise, idx) => (
                            <div key={idx} className="text-sm p-2 bg-secondary/50 rounded">
                              <span className="font-medium">{exercise.name}</span>
                              {exercise.sets && exercise.reps && (
                                <span className="text-muted-foreground ml-2">
                                  {exercise.sets} sets × {exercise.reps} reps
                                </span>
                              )}
                              {exercise.duration && (
                                <span className="text-muted-foreground ml-2">
                                  {exercise.duration} min
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No routines saved yet. Create your first routine!
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="routine-name">Routine Name</Label>
                  <Input
                    id="routine-name"
                    placeholder="e.g., Upper Body Day"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="routine-description">Description (optional)</Label>
                  <Textarea
                    id="routine-description"
                    placeholder="Brief description of this routine..."
                    value={routineDescription}
                    onChange={(e) => setRoutineDescription(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Exercises</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddExerciseToRoutine}
                      className="gap-2"
                    >
                      <Plus className="w-3 h-3" />
                      Add Exercise
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {routineExercises.map((exercise, idx) => (
                      <Card key={idx} className="p-3">
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Select
                              value={exercise.name}
                              onValueChange={(value) => handleUpdateRoutineExercise(idx, 'name', value)}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select exercise" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Bench Press">Bench Press</SelectItem>
                                <SelectItem value="Squats">Squats</SelectItem>
                                <SelectItem value="Deadlift">Deadlift</SelectItem>
                                <SelectItem value="Pull-ups">Pull-ups</SelectItem>
                                <SelectItem value="Push-ups">Push-ups</SelectItem>
                                <SelectItem value="Shoulder Press">Shoulder Press</SelectItem>
                                <SelectItem value="Bicep Curls">Bicep Curls</SelectItem>
                                <SelectItem value="Tricep Dips">Tricep Dips</SelectItem>
                                <SelectItem value="Lunges">Lunges</SelectItem>
                                <SelectItem value="Leg Press">Leg Press</SelectItem>
                                <SelectItem value="Lat Pulldown">Lat Pulldown</SelectItem>
                                <SelectItem value="Cable Rows">Cable Rows</SelectItem>
                                <SelectItem value="Leg Curls">Leg Curls</SelectItem>
                                <SelectItem value="Leg Extensions">Leg Extensions</SelectItem>
                                <SelectItem value="Calf Raises">Calf Raises</SelectItem>
                                <SelectItem value="Planks">Planks</SelectItem>
                                <SelectItem value="Crunches">Crunches</SelectItem>
                                <SelectItem value="Custom">Custom Exercise</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveRoutineExercise(idx)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {exercise.name === 'Custom' && (
                            <Input
                              placeholder="Enter custom exercise name"
                              value={exercise.name === 'Custom' ? '' : exercise.name}
                              onChange={(e) => handleUpdateRoutineExercise(idx, 'name', e.target.value)}
                            />
                          )}
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Sets</Label>
                              <Input
                                type="number"
                                placeholder="3"
                                value={exercise.sets || ''}
                                onChange={(e) => handleUpdateRoutineExercise(idx, 'sets', parseInt(e.target.value) || 0)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Reps</Label>
                              <Input
                                type="number"
                                placeholder="10"
                                value={exercise.reps || ''}
                                onChange={(e) => handleUpdateRoutineExercise(idx, 'reps', parseInt(e.target.value) || 0)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Duration (min)</Label>
                              <Input
                                type="number"
                                placeholder="5"
                                value={exercise.duration || ''}
                                onChange={(e) => handleUpdateRoutineExercise(idx, 'duration', parseInt(e.target.value) || 0)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {routineExercises.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm py-4">
                        Add exercises to your routine
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateRoutine(false);
                      setEditingRoutineId(null);
                      setRoutineName("");
                      setRoutineDescription("");
                      setRoutineExercises([]);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveRoutine} className="flex-1">
                    {editingRoutineId ? "Update Routine" : "Save Routine"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
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
        <h3 className="text-lg font-semibold mb-6">
          {editingWorkout ? "Edit Workout" : "Log Workout"}
        </h3>
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

          <div className="flex gap-2">
            {editingWorkout && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingWorkout(null);
                  setExercise("");
                  setDuration("");
                  setIntensity("moderate");
                  setDistance("");
                  setNotes("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button onClick={handleAddWorkout} className="flex-1 gap-2">
              {editingWorkout ? (
                <>
                  <Pencil className="w-4 h-4" />
                  Update Workout
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Workout
                </>
              )}
            </Button>
          </div>
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
                    {workoutMedia[log.id] && workoutMedia[log.id].length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {workoutMedia[log.id].map((media) => (
                          <a
                            key={media.id}
                            href={media.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity"
                          >
                            {media.file_type.startsWith('image/') ? (
                              <img src={media.file_url} alt="Workout" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-secondary flex items-center justify-center">
                                <Video className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {log.calories_burned && (
                      <span className="font-bold text-accent">{log.calories_burned} cal</span>
                    )}
                    <input
                      type="file"
                      id={`upload-${log.id}`}
                      className="hidden"
                      accept="image/*,video/*"
                      multiple
                      onChange={(e) => handleFileUpload(e, log.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => document.getElementById(`upload-${log.id}`)?.click()}
                      disabled={uploadingFiles}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditWorkout(log)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
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
