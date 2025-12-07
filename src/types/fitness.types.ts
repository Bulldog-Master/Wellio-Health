// Fitness-related type definitions

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_type: string;
  duration_minutes: number;
  calories_burned?: number;
  notes?: string;
  created_at: string;
  started_at: string;
  completed_at?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  duration_minutes: number;
  calories_burned?: number;
  distance_miles?: number;
  notes?: string;
  logged_at: string;
  time_of_day?: string;
  created_at: string;
}

export interface FitnessEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_type: string;
  start_time: string;
  end_time?: string;
  location?: string;
  completed?: boolean;
  color?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  reminder_minutes?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight_lbs: number;
  logged_at: string;
  notes?: string;
  created_at: string;
}

export interface BodyMeasurement {
  id: string;
  user_id: string;
  measured_at: string;
  chest_inches?: number;
  waist_inches?: number;
  hips_inches?: number;
  left_arm_inches?: number;
  right_arm_inches?: number;
  left_thigh_inches?: number;
  right_thigh_inches?: number;
  left_calf_inches?: number;
  right_calf_inches?: number;
  notes?: string;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_frequency: string;
  target_count?: number;
  color?: string;
  icon?: string;
  is_active?: boolean;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  notes?: string;
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_name: string;
  value: number;
  unit: string;
  achieved_at: string;
  notes?: string;
  created_at: string;
}