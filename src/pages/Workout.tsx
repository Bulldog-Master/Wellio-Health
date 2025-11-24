import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dumbbell, Plus, Clock, Flame, Zap, MapPin, Trash2, Pencil, ListOrdered, Upload, Image as ImageIcon, Video, Check, ChevronsUpDown, ChevronDown, Library, BookOpen } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
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
    media_url?: string;
  }>;
}

interface SampleRoutine {
  id: string;
  name: string;
  description: string | null;
  source_platform: string | null;
  source_url: string | null;
  exercises: Array<{
    name: string;
    sets?: number;
    reps?: number;
    duration?: number;
    media_url?: string;
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
  const [openExercisePopover, setOpenExercisePopover] = useState<number | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [uploadingExerciseMedia, setUploadingExerciseMedia] = useState<number | null>(null);
  const [customExercises, setCustomExercises] = useState<string[]>(() => {
    const saved = localStorage.getItem('customExercises');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSampleLibrary, setShowSampleLibrary] = useState(false);
  const [sampleRoutines, setSampleRoutines] = useState<SampleRoutine[]>([]);
  const [sortOrder, setSortOrder] = useState<'name' | 'date' | 'custom'>('date');
  const [sampleName, setSampleName] = useState("");
  const [sampleDescription, setSampleDescription] = useState("");
  const [samplePlatform, setSamplePlatform] = useState("");
  const [sampleUrl, setSampleUrl] = useState("");
  const [sampleExercises, setSampleExercises] = useState<Array<{ name: string; sets?: number; reps?: number; duration?: number; media_url?: string }>>([]);
  const [showAddSample, setShowAddSample] = useState(false);

  const baseExercises = [
    "Bench Press", "Incline Bench Press", "Decline Bench Press", "Dumbbell Press", "Chest Fly",
    "Squats", "Front Squats", "Bulgarian Split Squats", "Leg Press", "Hack Squat",
    "Deadlift", "Romanian Deadlift", "Sumo Deadlift", "Trap Bar Deadlift",
    "Pull-ups", "Chin-ups", "Lat Pulldown", "Cable Rows", "Bent Over Rows", "T-Bar Rows",
    "Push-ups", "Diamond Push-ups", "Wide Push-ups",
    "Shoulder Press", "Arnold Press", "Lateral Raises", "Front Raises", "Rear Delt Fly",
    "Bicep Curls", "Hammer Curls", "Preacher Curls", "Cable Curls", "Concentration Curls",
    "Tricep Dips", "Tricep Extensions", "Skull Crushers", "Cable Pushdowns",
    "Lunges", "Walking Lunges", "Reverse Lunges", "Curtsy Lunges",
    "Leg Curls", "Leg Extensions", "Calf Raises", "Seated Calf Raises",
    "Planks", "Side Planks", "Crunches", "Bicycle Crunches", "Russian Twists",
    "Mountain Climbers", "Burpees", "Jump Squats", "Box Jumps",
    "Barbell Rows", "Dumbbell Rows", "Face Pulls", "Shrugs",
    "Hip Thrusts", "Glute Bridges", "Good Mornings",
    "Farmer's Walk", "Kettlebell Swings", "Turkish Get-ups",
    "Battle Ropes", "Sled Push", "Sled Pull",
    "Running", "Cycling", "Swimming", "Rowing", "Jump Rope",
    "Yoga", "Pilates", "Stretching"
  ];
  
  const allExercises = [...new Set([...baseExercises, ...customExercises])].sort();
  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [routineExercises, setRoutineExercises] = useState<Array<{ name: string; sets?: number; reps?: number; duration?: number; media_url?: string }>>([]);

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
    fetchSampleRoutines();
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
          media_url?: string;
        }>
      })));
    } catch (error) {
      console.error('Error fetching workout routines:', error);
    }
  };

  const fetchSampleRoutines = async () => {
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
        exercises: routine.exercises as Array<{
          name: string;
          sets?: number;
          reps?: number;
          duration?: number;
          media_url?: string;
        }>
      })));
    } catch (error) {
      console.error('Error fetching sample routines:', error);
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
    setRoutineExercises([...routineExercises, { name: "", sets: 3, reps: 10, media_url: "" }]);
  };

  const handleExerciseMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>, exerciseIndex: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingExerciseMedia(exerciseIndex);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/routines/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('workout-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('workout-media')
        .getPublicUrl(fileName);

      handleUpdateRoutineExercise(exerciseIndex, 'media_url', publicUrl);

      toast({
        title: "Upload successful",
        description: "Exercise media has been uploaded.",
      });
      
      // Reset the input so the same file can be selected again
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading exercise media:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload media.",
        variant: "destructive",
      });
      // Reset the input even on error
      event.target.value = '';
    } finally {
      setUploadingExerciseMedia(null);
    }
  };

  const handleUpdateRoutineExercise = (index: number, field: string, value: string | number) => {
    const updated = [...routineExercises];
    updated[index] = { ...updated[index], [field]: value };
    setRoutineExercises(updated);
    
    // If updating the name field with a custom exercise, add it to the custom list
    if (field === 'name' && typeof value === 'string' && value.trim()) {
      const exerciseName = value.trim();
      if (!baseExercises.includes(exerciseName) && !customExercises.includes(exerciseName)) {
        const updatedCustom = [...customExercises, exerciseName].sort();
        setCustomExercises(updatedCustom);
        localStorage.setItem('customExercises', JSON.stringify(updatedCustom));
      }
    }
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

  const handleSaveSampleRoutine = async () => {
    if (!sampleName || sampleExercises.length === 0) {
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

      const { error } = await supabase
        .from('sample_routines')
        .insert({
          user_id: user.id,
          name: sampleName,
          description: sampleDescription || null,
          source_platform: samplePlatform || null,
          source_url: sampleUrl || null,
          exercises: sampleExercises,
        });

      if (error) throw error;

      toast({
        title: "Sample routine saved",
        description: "Your sample routine has been saved.",
      });

      setSampleName("");
      setSampleDescription("");
      setSamplePlatform("");
      setSampleUrl("");
      setSampleExercises([]);
      setShowAddSample(false);
      fetchSampleRoutines();
    } catch (error) {
      console.error('Error saving sample routine:', error);
      toast({
        title: "Error",
        description: "Failed to save sample routine.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSampleRoutine = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sample_routines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sample routine deleted",
        description: "The sample routine has been removed.",
      });

      fetchSampleRoutines();
    } catch (error) {
      console.error('Error deleting sample routine:', error);
      toast({
        title: "Error",
        description: "Failed to delete sample routine.",
        variant: "destructive",
      });
    }
  };

  const getSortedSampleRoutines = () => {
    const sorted = [...sampleRoutines];
    if (sortOrder === 'name') {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
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
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowLibrary(true)}>
            <Library className="w-4 h-4" />
            Personal Library
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setShowSampleLibrary(true)}>
            <BookOpen className="w-4 h-4" />
            Sample Library
          </Button>
          <Dialog open={showRoutineDialog} onOpenChange={setShowRoutineDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create Routine
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-blue-900 dark:text-blue-100">{editingRoutineId ? "Edit Routine" : "Create New Routine"}</DialogTitle>
            </DialogHeader>
            
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
                          <Popover open={openExercisePopover === idx} onOpenChange={(open) => setOpenExercisePopover(open ? idx : null)}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openExercisePopover === idx}
                                className="flex-1 justify-between"
                              >
                                {exercise.name || "Select or type exercise..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                              <Command>
                                  <CommandInput 
                                    placeholder="Search or type exercise..." 
                                    value={exercise.name}
                                    onValueChange={(value) => handleUpdateRoutineExercise(idx, 'name', value)}
                                  />
                                  <CommandList>
                                    <CommandEmpty>Press Enter to use "{exercise.name}"</CommandEmpty>
                                    <CommandGroup>
                                      {allExercises.map((ex) => (
                                      <CommandItem
                                        key={ex}
                                        value={ex}
                                        onSelect={(currentValue) => {
                                          handleUpdateRoutineExercise(idx, 'name', currentValue);
                                          setOpenExercisePopover(null);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            exercise.name === ex ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {ex}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveRoutineExercise(idx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
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

                        <div className="space-y-2">
                          <Label className="text-xs">Example Photo/Video (optional)</Label>
                          <div className="flex gap-2 items-start">
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="image/*,video/*"
                                onChange={(e) => handleExerciseMediaUpload(e, idx)}
                                className="hidden"
                                id={`exercise-media-${idx}`}
                                disabled={uploadingExerciseMedia === idx}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 w-full"
                                onClick={() => document.getElementById(`exercise-media-${idx}`)?.click()}
                                disabled={uploadingExerciseMedia === idx}
                              >
                                <Upload className="w-4 h-4" />
                                {uploadingExerciseMedia === idx ? "Uploading..." : "Upload Media"}
                              </Button>
                            </div>
                            {exercise.media_url && (
                              <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted border-2 border-primary">
                                {exercise.media_url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                                  <video
                                    src={exercise.media_url}
                                    className="w-full h-full object-cover"
                                    controls
                                  />
                                ) : (
                                  <img
                                    src={exercise.media_url}
                                    alt={exercise.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                            )}
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
                    setShowRoutineDialog(false);
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
          </DialogContent>
        </Dialog>

        <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-purple-900 dark:text-purple-100">Personal Library</DialogTitle>
            </DialogHeader>
            
            <div className="mt-2">
              {workoutRoutines.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-2">
                  {workoutRoutines.map((routine) => (
                    <AccordionItem key={routine.id} value={routine.id} className="border rounded-lg px-4 bg-card">
                      <div className="flex items-center justify-between">
                        <AccordionTrigger className="flex-1 hover:no-underline py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <Dumbbell className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-semibold text-base">{routine.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRoutine(routine);
                              setShowLibrary(false);
                              setShowRoutineDialog(true);
                            }}
                            className="hover:bg-blue-500/10"
                          >
                            <Pencil className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRoutine(routine.id);
                            }}
                            className="hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <AccordionContent className="pt-2 pb-4">
                        {routine.description && (
                          <p className="text-sm text-muted-foreground mb-3">{routine.description}</p>
                        )}
                        <div className="space-y-3">
                          {routine.exercises.map((exercise, idx) => (
                            <div key={idx} className="p-3 bg-secondary/50 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <p className="font-medium">{exercise.name}</p>
                                  <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                                    {exercise.sets && exercise.reps && (
                                      <span>{exercise.sets} sets × {exercise.reps} reps</span>
                                    )}
                                    {exercise.duration && (
                                      <span>{exercise.duration} min</span>
                                    )}
                                  </div>
                                </div>
                                {exercise.media_url && (
                                  <div className="w-20 h-20 rounded overflow-hidden bg-muted border-2 border-primary">
                                    {exercise.media_url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                                      <video
                                        src={exercise.media_url}
                                        className="w-full h-full object-cover"
                                        controls
                                      />
                                    ) : (
                                      <img
                                        src={exercise.media_url}
                                        alt={exercise.name}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No routines saved yet. Create your first routine!
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showSampleLibrary} onOpenChange={setShowSampleLibrary}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-2 border-orange-200 dark:border-orange-800 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-orange-900 dark:text-orange-100 flex items-center justify-between">
                <span>Sample Library</span>
                <Button variant="outline" size="sm" onClick={() => setShowAddSample(true)} className="bg-orange-100 dark:bg-orange-900/50 border-orange-300 dark:border-orange-700 hover:bg-orange-200 dark:hover:bg-orange-900">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sample
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Sort by:</Label>
                <Select value={sortOrder} onValueChange={(value: 'name' | 'date' | 'custom') => setSortOrder(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date Added</SelectItem>
                    <SelectItem value="name">Alphabetical</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {getSortedSampleRoutines().length > 0 ? (
                <Accordion type="single" collapsible className="space-y-2">
                  {getSortedSampleRoutines().map((routine) => (
                    <AccordionItem key={routine.id} value={routine.id} className="border rounded-lg px-4 bg-card">
                      <div className="flex items-center justify-between">
                        <AccordionTrigger className="flex-1 hover:no-underline py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-semibold text-base">{routine.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}</span>
                                {routine.source_platform && (
                                  <>
                                    <span>•</span>
                                    <span>{routine.source_platform}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSampleRoutine(routine.id);
                            }}
                            className="hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <AccordionContent className="pt-2 pb-4">
                        {routine.description && (
                          <p className="text-sm text-muted-foreground mb-3">{routine.description}</p>
                        )}
                        {routine.source_url && (
                          <a 
                            href={routine.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mb-3 block"
                          >
                            View Source
                          </a>
                        )}
                        <div className="space-y-3">
                          {routine.exercises.map((exercise, idx) => (
                            <div key={idx} className="p-3 bg-secondary/50 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <p className="font-medium">{exercise.name}</p>
                                  <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                                    {exercise.sets && exercise.reps && (
                                      <span>{exercise.sets} sets × {exercise.reps} reps</span>
                                    )}
                                    {exercise.duration && (
                                      <span>{exercise.duration} min</span>
                                    )}
                                  </div>
                                </div>
                                {exercise.media_url && (
                                  <div className="w-20 h-20 rounded overflow-hidden bg-muted border-2 border-primary">
                                    {exercise.media_url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                                      <video
                                        src={exercise.media_url}
                                        className="w-full h-full object-cover"
                                        controls
                                      />
                                    ) : (
                                      <img
                                        src={exercise.media_url}
                                        alt={exercise.name}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No sample routines saved yet. Add your first sample routine!
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddSample} onOpenChange={setShowAddSample}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-2 border-teal-200 dark:border-teal-800 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-teal-900 dark:text-teal-100">Upload from Social Media</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <Label className="text-base mb-3 block">Select Platform</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['Instagram', 'YouTube', 'TikTok'].map((platform) => (
                    <Button
                      key={platform}
                      variant={samplePlatform === platform ? "default" : "outline"}
                      onClick={() => {
                        setSamplePlatform(platform);
                        console.log(`Selected platform: ${platform}`);
                      }}
                      className={cn(
                        "h-20 flex-col gap-2 transition-all",
                        samplePlatform === platform && "ring-2 ring-teal-500 ring-offset-2 scale-105"
                      )}
                    >
                      <Video className="w-6 h-6" />
                      <span className="text-sm font-semibold">{platform}</span>
                      {samplePlatform === platform && (
                        <Check className="w-4 h-4 absolute top-2 right-2 text-teal-600" />
                      )}
                    </Button>
                  ))}
                </div>
                {samplePlatform && (
                  <p className="text-sm text-teal-700 dark:text-teal-300 mt-2 text-center animate-in fade-in">
                    ✓ {samplePlatform} selected - paste URL or upload video below
                  </p>
                )}
              </div>

              {/* Video/Link Upload */}
              <div className="space-y-4 p-4 bg-white/50 dark:bg-black/20 rounded-lg border-2 border-dashed border-teal-300 dark:border-teal-700">
                <div className="text-center space-y-2">
                  <Upload className="w-12 h-12 mx-auto text-teal-600 dark:text-teal-400" />
                  <div>
                    <Label htmlFor="sample-url" className="text-lg font-semibold">Paste Video URL</Label>
                    <p className="text-sm text-muted-foreground mt-1">Or upload a video file from your device</p>
                  </div>
                </div>
                
                <Input
                  id="sample-url"
                  placeholder="https://instagram.com/p/... or https://youtube.com/watch?v=..."
                  value={sampleUrl}
                  onChange={(e) => setSampleUrl(e.target.value)}
                  className="text-center"
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-teal-300 dark:border-teal-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2" onClick={() => document.getElementById('video-upload')?.click()}>
                  <Video className="w-4 h-4" />
                  Upload Video File
                </Button>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  className="hidden"
                />
              </div>

              {/* Routine Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sample-name">Routine Name</Label>
                  <Input
                    id="sample-name"
                    placeholder="e.g., Arnold's Upper Body Blast"
                    value={sampleName}
                    onChange={(e) => setSampleName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="sample-description">Description (optional)</Label>
                  <Textarea
                    id="sample-description"
                    placeholder="What makes this routine special..."
                    value={sampleDescription}
                    onChange={(e) => setSampleDescription(e.target.value)}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>

              {/* Quick Exercise Add */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-lg">Exercises from Video</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSampleExercises([...sampleExercises, { name: "", sets: 3, reps: 10 }])}
                    className="gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    Add Exercise
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sampleExercises.map((exercise, idx) => (
                    <Card key={idx} className="p-3 bg-white/50 dark:bg-black/20">
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Exercise name"
                          value={exercise.name}
                          onChange={(e) => {
                            const updated = [...sampleExercises];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setSampleExercises(updated);
                          }}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Sets"
                          value={exercise.sets || ''}
                          onChange={(e) => {
                            const updated = [...sampleExercises];
                            updated[idx] = { ...updated[idx], sets: parseInt(e.target.value) || 0 };
                            setSampleExercises(updated);
                          }}
                          className="w-20"
                        />
                        <span className="text-muted-foreground">×</span>
                        <Input
                          type="number"
                          placeholder="Reps"
                          value={exercise.reps || ''}
                          onChange={(e) => {
                            const updated = [...sampleExercises];
                            updated[idx] = { ...updated[idx], reps: parseInt(e.target.value) || 0 };
                            setSampleExercises(updated);
                          }}
                          className="w-20"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSampleExercises(sampleExercises.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  
                  {sampleExercises.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-6 bg-white/30 dark:bg-black/10 rounded-lg">
                      Add exercises you see in the video
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddSample(false);
                    setSampleName("");
                    setSampleDescription("");
                    setSamplePlatform("");
                    setSampleUrl("");
                    setSampleExercises([]);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveSampleRoutine} className="flex-1 bg-teal-600 hover:bg-teal-700">
                  Save to Library
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
