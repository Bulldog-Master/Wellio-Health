export interface ActivityLog {
  id: string;
  activity_type: string;
  duration_minutes: number;
  calories_burned: number | null;
  distance_miles: number | null;
  notes: string | null;
  logged_at: string;
  time_of_day: string | null;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercises: RoutineExercise[];
}

export interface RoutineExercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  media_url?: string;
  rest_seconds?: number;
}

export interface SampleRoutine {
  id: string;
  name: string;
  description: string | null;
  source_platform: string | null;
  source_url: string | null;
  exercises: RoutineExercise[];
}

export interface SavedApp {
  id: string;
  app_name: string;
  app_description: string | null;
  app_url: string | null;
  app_category: string | null;
  platform: string | null;
  app_icon_url: string | null;
}

export interface WorkoutMedia {
  id: string;
  file_url: string;
  file_type: string;
}
