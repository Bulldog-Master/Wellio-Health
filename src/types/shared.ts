/**
 * Shared TypeScript interfaces for common data structures
 */

export interface User {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_private?: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  post_type: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_public: boolean;
}

export interface Workout {
  id: string;
  user_id: string;
  workout_type: string;
  duration_minutes: number;
  calories_burned?: number;
  notes?: string;
  logged_at: string;
  created_at: string;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  food_name: string;
  meal_type: string;
  calories?: number;
  protein_grams?: number;
  carbs_grams?: number;
  fat_grams?: number;
  logged_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_frequency: string;
  target_count?: number;
  icon?: string;
  color?: string;
  is_active: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  category: string;
  start_date: string;
  end_date: string;
  target_value: number;
  target_unit: string;
  points_reward: number;
  is_active: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
