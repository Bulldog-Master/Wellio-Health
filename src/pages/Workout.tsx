import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserPreferences } from "@/hooks/utils";
import { formatDistance } from "@/lib/utils";
import { useWorkoutState, useWorkoutData, useWorkoutActions, calculateCalories } from "@/hooks/workout";
import type { ActivityLog, RoutineExercise } from "@/types/workout.types";
import type { Json } from "@/integrations/supabase/types";

// Components
import WorkoutHero from "@/components/workout/WorkoutHero";
import WorkoutQuickActions from "@/components/workout/WorkoutQuickActions";
import WorkoutStats from "@/components/workout/WorkoutStats";
import WorkoutForm from "@/components/workout/WorkoutForm";
import WorkoutHistory from "@/components/workout/WorkoutHistory";
import VoiceWorkoutLogger from "@/components/workout/VoiceWorkoutLogger";
import AIVoiceCompanion from "@/components/workout/AIVoiceCompanion";
import { CreateRoutineDialog, PersonalLibraryDialog, AppsLibraryDialog, AddAppDialog } from "@/components/workout/dialogs";

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
  "Running", "Cycling", "Swimming", "Rowing", "Jump Rope", "Yoga", "Pilates", "Stretching"
];

const Workout = () => {
  const { t } = useTranslation(['workout', 'common']);
  const { toast } = useToast();
  const { preferredUnit, updatePreferredUnit } = useUserPreferences();
  
  // State from hook
  const workoutState = useWorkoutState();
  const {
    exercise, setExercise, duration, setDuration, intensity, setIntensity,
    distance, setDistance, notes, setNotes, workoutDate, setWorkoutDate,
    timeOfDay, setTimeOfDay, activityLogs, setActivityLogs, isLoading, setIsLoading,
    editingWorkout, setEditingWorkout, workoutRoutines, setWorkoutRoutines,
    sampleRoutines, setSampleRoutines, savedApps, setSavedApps,
    workoutMedia, setWorkoutMedia, loadedRoutine, setLoadedRoutine,
    pendingMediaFiles, setPendingMediaFiles, mediaPreviewUrls, setMediaPreviewUrls,
    viewFilter, setViewFilter, resetForm,
  } = workoutState;

  // Dialog states
  const [showRoutineDialog, setShowRoutineDialog] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showAppsLibrary, setShowAppsLibrary] = useState(false);
  const [showAddApp, setShowAddApp] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  
  // Routine form state
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  
  // App form state
  const [appName, setAppName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [appCategory, setAppCategory] = useState("");
  const [appPlatform, setAppPlatform] = useState("");
  const [appIconUrl, setAppIconUrl] = useState("");

  // Custom exercises
  const [customExercises, setCustomExercises] = useState<string[]>(() => {
    const saved = localStorage.getItem('customExercises');
    return saved ? JSON.parse(saved) : [];
  });
  const allExercises = [...new Set([...baseExercises, ...customExercises])].sort();

  // Data fetching
  const { fetchActivityLogs, fetchWorkoutRoutines, fetchSampleRoutines, fetchSavedApps } = useWorkoutData({
    viewFilter, setActivityLogs, setWorkoutRoutines, setSampleRoutines, setSavedApps, setWorkoutMedia, setIsLoading,
  });

  // Actions
  const { handleAddWorkout, handleDeleteWorkout } = useWorkoutActions({
    exercise, duration, intensity, distance, notes, workoutDate, timeOfDay,
    loadedRoutine, editingWorkout, pendingMediaFiles, mediaPreviewUrls, preferredUnit,
    setEditingWorkout, setPendingMediaFiles, setMediaPreviewUrls, resetForm, fetchActivityLogs,
  });

  useEffect(() => {
    fetchActivityLogs();
    fetchWorkoutRoutines();
    fetchSampleRoutines();
    fetchSavedApps();
  }, [viewFilter]);

  const estimatedCalories = exercise && duration ? calculateCalories(exercise, parseInt(duration) || 0, intensity) : 0;
  const totalDuration = activityLogs.reduce((sum, log) => sum + log.duration_minutes, 0);
  const totalCalories = activityLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0);

  const handleEditWorkout = (log: ActivityLog) => {
    setExercise(log.activity_type);
    setDuration(log.duration_minutes.toString());
    setIntensity("medium");
    setDistance(log.distance_miles ? formatDistance(log.distance_miles, preferredUnit).split(' ')[0] : "");
    setNotes(log.notes || "");
    setWorkoutDate(log.logged_at.split('T')[0]);
    setTimeOfDay(log.time_of_day || 'morning');
    setEditingWorkout(log.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadRoutine = (routine: typeof workoutRoutines[0]) => {
    setLoadedRoutine(routine);
    const totalDur = routine.exercises.reduce((total, ex) => total + (ex.duration || 0), 0);
    setExercise(routine.name || "Routine Workout");
    if (totalDur > 0) setDuration(totalDur.toString());
    setNotes("");
    toast({ title: "Routine loaded", description: `${routine.name} is ready to log.` });
  };

  const handleSaveRoutine = async () => {
    if (!routineName || routineExercises.length === 0) {
      toast({ title: "Missing information", description: "Please provide a routine name and at least one exercise.", variant: "destructive" });
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      if (editingRoutineId) {
        await supabase.from('workout_routines').update({ name: routineName, description: routineDescription || null, exercises: routineExercises as unknown as Json }).eq('id', editingRoutineId);
        toast({ title: "Routine updated" });
      } else {
        await supabase.from('workout_routines').insert({ user_id: user.id, name: routineName, description: routineDescription || null, exercises: routineExercises as unknown as Json });
        toast({ title: "Routine saved" });
      }
      setRoutineName(""); setRoutineDescription(""); setRoutineExercises([]); setEditingRoutineId(null); setShowRoutineDialog(false);
      fetchWorkoutRoutines();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save routine.", variant: "destructive" });
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    await supabase.from('workout_routines').delete().eq('id', id);
    toast({ title: "Routine deleted" });
    fetchWorkoutRoutines();
  };

  const handleSaveApp = async () => {
    if (!appName) { toast({ title: "Missing information", variant: "destructive" }); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      await supabase.from('saved_apps').insert({ user_id: user.id, app_name: appName, app_description: appDescription || null, app_url: appUrl || null, app_category: appCategory || null, platform: appPlatform || null, app_icon_url: appIconUrl || null });
      toast({ title: "App saved" });
      setAppName(""); setAppDescription(""); setAppUrl(""); setAppCategory(""); setAppPlatform(""); setAppIconUrl(""); setShowAddApp(false);
      fetchSavedApps();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDeleteApp = async (id: string) => {
    await supabase.from('saved_apps').delete().eq('id', id);
    toast({ title: "App deleted" });
    fetchSavedApps();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, activityLogId: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploadingFiles(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      for (const file of Array.from(files)) {
        const fileName = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`;
        await supabase.storage.from('workout-media').upload(fileName, file);
        const { data: { publicUrl } } = supabase.storage.from('workout-media').getPublicUrl(fileName);
        await supabase.from('workout_media').insert({ user_id: user.id, activity_log_id: activityLogId, file_url: publicUrl, file_type: file.type });
      }
      toast({ title: "Upload successful" });
      fetchActivityLogs();
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingFiles(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <WorkoutHero onShowLibrary={() => setShowLibrary(true)} onShowSampleLibrary={() => {}} />
      <WorkoutQuickActions onShowAppsLibrary={() => setShowAppsLibrary(true)} onShowRoutineDialog={() => setShowRoutineDialog(true)} />
      <WorkoutStats totalDuration={totalDuration} totalCalories={totalCalories} />
      <WorkoutForm
        exercise={exercise} duration={duration} intensity={intensity} distance={distance} notes={notes}
        workoutDate={workoutDate} timeOfDay={timeOfDay} estimatedCalories={estimatedCalories}
        loadedRoutine={loadedRoutine} editingWorkout={editingWorkout} preferredUnit={preferredUnit}
        pendingMediaFiles={pendingMediaFiles} mediaPreviewUrls={mediaPreviewUrls}
        onExerciseChange={setExercise} onDurationChange={setDuration} onIntensityChange={setIntensity}
        onDistanceChange={setDistance} onNotesChange={setNotes} onWorkoutDateChange={setWorkoutDate}
        onTimeOfDayChange={setTimeOfDay} onPreferredUnitChange={updatePreferredUnit}
        onLoadedRoutineClear={() => setLoadedRoutine(null)}
        onCancelEdit={() => { setEditingWorkout(null); resetForm(); }}
        onSubmit={handleAddWorkout}
        onShowLibrary={() => setShowLibrary(true)} onShowSampleLibrary={() => {}}
        onMediaFilesChange={(files, urls) => { setPendingMediaFiles(files); setMediaPreviewUrls(urls); }}
      />
      <AIVoiceCompanion onWorkoutComplete={(summary) => console.log('Workout completed:', summary)} />
      <VoiceWorkoutLogger onWorkoutLogged={() => fetchActivityLogs()} />
      <WorkoutHistory
        activityLogs={activityLogs} workoutMedia={workoutMedia} isLoading={isLoading}
        viewFilter={viewFilter} preferredUnit={preferredUnit} uploadingFiles={uploadingFiles}
        onViewFilterChange={setViewFilter} onEditWorkout={handleEditWorkout}
        onDeleteWorkout={handleDeleteWorkout} onFileUpload={handleFileUpload}
      />

      {/* Dialogs */}
      <CreateRoutineDialog
        open={showRoutineDialog} onOpenChange={setShowRoutineDialog}
        editingRoutineId={editingRoutineId} routineName={routineName}
        routineDescription={routineDescription} routineExercises={routineExercises}
        onRoutineNameChange={setRoutineName} onRoutineDescriptionChange={setRoutineDescription}
        onRoutineExercisesChange={setRoutineExercises} onSave={handleSaveRoutine}
        onCancel={() => { setShowRoutineDialog(false); setEditingRoutineId(null); setRoutineName(""); setRoutineDescription(""); setRoutineExercises([]); }}
        allExercises={allExercises}
      />
      <PersonalLibraryDialog
        open={showLibrary} onOpenChange={setShowLibrary} workoutRoutines={workoutRoutines}
        onEditRoutine={(r) => { setEditingRoutineId(r.id); setRoutineName(r.name); setRoutineDescription(r.description || ""); setRoutineExercises(r.exercises); setShowLibrary(false); setShowRoutineDialog(true); }}
        onDeleteRoutine={handleDeleteRoutine} onLoadRoutine={handleLoadRoutine}
        onCreateNew={() => { setShowLibrary(false); setShowRoutineDialog(true); }}
      />
      <AppsLibraryDialog open={showAppsLibrary} onOpenChange={setShowAppsLibrary} savedApps={savedApps} onDeleteApp={handleDeleteApp} onShowAddApp={() => setShowAddApp(true)} />
      <AddAppDialog
        open={showAddApp} onOpenChange={setShowAddApp}
        appName={appName} appDescription={appDescription} appUrl={appUrl}
        appCategory={appCategory} appPlatform={appPlatform} appIconUrl={appIconUrl}
        onAppNameChange={setAppName} onAppDescriptionChange={setAppDescription}
        onAppUrlChange={setAppUrl} onAppCategoryChange={setAppCategory}
        onAppPlatformChange={setAppPlatform} onAppIconUrlChange={setAppIconUrl}
        onSave={handleSaveApp} onCancel={() => { setShowAddApp(false); setAppName(""); setAppDescription(""); setAppUrl(""); setAppCategory(""); setAppPlatform(""); setAppIconUrl(""); }}
      />
    </div>
  );
};

export default Workout;
