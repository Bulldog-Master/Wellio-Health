// Nutrition-related type definitions

export interface NutritionLog {
  id: string;
  user_id: string;
  food_name: string;
  meal_type: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sodium_mg?: number;
  sugar_g?: number;
  serving_size?: string;
  image_url?: string;
  logged_at: string;
  notes?: string;
  created_at: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  day_of_week: number;
  meal_type: string;
  food_name: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
  notes?: string;
  created_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  calories_per_serving?: number;
  image_url?: string;
  is_public?: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface GroceryItem {
  id: string;
  user_id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  is_checked?: boolean;
  notes?: string;
  created_at: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'fast';