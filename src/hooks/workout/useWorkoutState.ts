import { useState } from "react";
import type { ActivityLog, WorkoutRoutine, SampleRoutine, SavedApp, WorkoutMedia } from "@/types/workout.types";

export const useWorkoutState = () => {
  const [exercise, setExercise] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("medium");
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingWorkout, setEditingWorkout] = useState<string | null>(null);
  const [workoutRoutines, setWorkoutRoutines] = useState<WorkoutRoutine[]>([]);
  const [sampleRoutines, setSampleRoutines] = useState<SampleRoutine[]>([]);
  const [savedApps, setSavedApps] = useState<SavedApp[]>([]);
  const [workoutMedia, setWorkoutMedia] = useState<Record<string, WorkoutMedia[]>>({});
  const [loadedRoutine, setLoadedRoutine] = useState<WorkoutRoutine | null>(null);
  const [pendingMediaFiles, setPendingMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  
  const [workoutDate, setWorkoutDate] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [timeOfDay, setTimeOfDay] = useState<string>('morning');
  const [viewFilter, setViewFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const resetForm = () => {
    setExercise("");
    setDuration("");
    setIntensity("medium");
    setDistance("");
    setNotes("");
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setWorkoutDate(`${year}-${month}-${day}`);
    setTimeOfDay('morning');
    setLoadedRoutine(null);
  };

  return {
    // Form state
    exercise, setExercise,
    duration, setDuration,
    intensity, setIntensity,
    distance, setDistance,
    notes, setNotes,
    workoutDate, setWorkoutDate,
    timeOfDay, setTimeOfDay,
    
    // Data state
    activityLogs, setActivityLogs,
    isLoading, setIsLoading,
    editingWorkout, setEditingWorkout,
    workoutRoutines, setWorkoutRoutines,
    sampleRoutines, setSampleRoutines,
    savedApps, setSavedApps,
    workoutMedia, setWorkoutMedia,
    loadedRoutine, setLoadedRoutine,
    
    // Media state
    pendingMediaFiles, setPendingMediaFiles,
    mediaPreviewUrls, setMediaPreviewUrls,
    
    // Filter
    viewFilter, setViewFilter,
    
    // Actions
    resetForm,
  };
};
