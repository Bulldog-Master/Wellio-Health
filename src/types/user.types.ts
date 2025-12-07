// User-related type definitions

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  is_private?: boolean;
  is_creator?: boolean;
  height_inches?: number;
  height_unit?: string;
  current_weight?: number;
  current_weight_unit?: string;
  target_weight?: number;
  target_weight_unit?: string;
  birth_date?: string;
  gender?: string;
  fitness_level?: string;
  daily_calorie_goal?: number;
  daily_protein_goal?: number;
  daily_carbs_goal?: number;
  daily_fat_goal?: number;
  daily_water_goal_ml?: number;
  preferred_unit_system?: 'imperial' | 'metric';
  total_points?: number;
  referral_points?: number;
  current_streak?: number;
  longest_streak?: number;
  referral_code?: string;
  referred_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  weekly_report_enabled?: boolean;
  data_sharing_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'expired' | 'pending';
  start_date: string;
  end_date?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'user' | 'admin' | 'moderator' | 'trainer' | 'practitioner';
  created_at: string;
}

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type UnitSystem = 'imperial' | 'metric';