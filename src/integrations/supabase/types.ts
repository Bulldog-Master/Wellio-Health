export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achieved_at: string
          achievement_type: string
          actual_value: number
          created_at: string
          goal_value: number
          id: string
          user_id: string
        }
        Insert: {
          achieved_at?: string
          achievement_type: string
          actual_value: number
          created_at?: string
          goal_value: number
          id?: string
          user_id: string
        }
        Update: {
          achieved_at?: string
          achievement_type?: string
          actual_value?: number
          created_at?: string
          goal_value?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          activity_type: string
          calories_burned: number | null
          created_at: string | null
          distance_miles: number | null
          duration_minutes: number
          id: string
          logged_at: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          calories_burned?: number | null
          created_at?: string | null
          distance_miles?: number | null
          duration_minutes: number
          id?: string
          logged_at?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          calories_burned?: number | null
          created_at?: string | null
          distance_miles?: number | null
          duration_minutes?: number
          id?: string
          logged_at?: string | null
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          data_summary: Json | null
          generated_at: string | null
          id: string
          insight_text: string
          insight_type: string
          user_id: string
        }
        Insert: {
          data_summary?: Json | null
          generated_at?: string | null
          id?: string
          insight_text: string
          insight_type: string
          user_id: string
        }
        Update: {
          data_summary?: Json | null
          generated_at?: string | null
          id?: string
          insight_text?: string
          insight_type?: string
          user_id?: string
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed_at: string | null
          habit_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          habit_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          habit_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          target_count: number | null
          target_frequency: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          target_count?: number | null
          target_frequency: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          target_count?: number | null
          target_frequency?: string
          user_id?: string
        }
        Relationships: []
      }
      interval_timers: {
        Row: {
          countdown_beeps: boolean | null
          created_at: string | null
          end_with_interim: boolean | null
          folder_id: string | null
          id: string
          include_reps: boolean | null
          include_sets: boolean | null
          interim_interval_seconds: number | null
          intervals: Json | null
          name: string
          repeat_count: number | null
          show_elapsed_time: boolean | null
          show_line_numbers: boolean | null
          text_to_speech: boolean | null
          updated_at: string | null
          use_for_notifications: boolean | null
          use_interim_interval: boolean | null
          user_id: string
        }
        Insert: {
          countdown_beeps?: boolean | null
          created_at?: string | null
          end_with_interim?: boolean | null
          folder_id?: string | null
          id?: string
          include_reps?: boolean | null
          include_sets?: boolean | null
          interim_interval_seconds?: number | null
          intervals?: Json | null
          name: string
          repeat_count?: number | null
          show_elapsed_time?: boolean | null
          show_line_numbers?: boolean | null
          text_to_speech?: boolean | null
          updated_at?: string | null
          use_for_notifications?: boolean | null
          use_interim_interval?: boolean | null
          user_id: string
        }
        Update: {
          countdown_beeps?: boolean | null
          created_at?: string | null
          end_with_interim?: boolean | null
          folder_id?: string | null
          id?: string
          include_reps?: boolean | null
          include_sets?: boolean | null
          interim_interval_seconds?: number | null
          intervals?: Json | null
          name?: string
          repeat_count?: number | null
          show_elapsed_time?: boolean | null
          show_line_numbers?: boolean | null
          text_to_speech?: boolean | null
          updated_at?: string | null
          use_for_notifications?: boolean | null
          use_interim_interval?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interval_timers_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "timer_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          category: string
          created_at: string
          file_url: string | null
          id: string
          notes: string | null
          record_date: string
          record_name: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          record_date: string
          record_name: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          record_date?: string
          record_name?: string
          user_id?: string
        }
        Relationships: []
      }
      medical_test_results: {
        Row: {
          created_at: string | null
          file_url: string | null
          id: string
          notes: string | null
          result_unit: string | null
          result_value: string | null
          test_date: string
          test_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          result_unit?: string | null
          result_value?: string | null
          test_date: string
          test_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          result_unit?: string | null
          result_value?: string | null
          test_date?: string
          test_name?: string
          user_id?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string | null
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          medication_name: string
          notes: string | null
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          medication_name: string
          notes?: string | null
          start_date: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          medication_name?: string
          notes?: string | null
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_logs: {
        Row: {
          calories: number | null
          carbs_grams: number | null
          created_at: string | null
          fat_grams: number | null
          food_name: string
          id: string
          image_url: string | null
          logged_at: string | null
          meal_type: string
          notes: string | null
          protein_grams: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs_grams?: number | null
          created_at?: string | null
          fat_grams?: number | null
          food_name: string
          id?: string
          image_url?: string | null
          logged_at?: string | null
          meal_type: string
          notes?: string | null
          protein_grams?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs_grams?: number | null
          created_at?: string | null
          fat_grams?: number | null
          food_name?: string
          id?: string
          image_url?: string | null
          logged_at?: string | null
          meal_type?: string
          notes?: string | null
          protein_grams?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string | null
          exercise_goal: number | null
          fitness_level: string | null
          full_name: string | null
          gender: string | null
          goal: string | null
          height: number | null
          height_unit: string | null
          id: string
          move_goal: number | null
          onboarding_completed: boolean | null
          preferred_unit: string | null
          reminder_habits: boolean | null
          reminder_meal_logging: boolean | null
          reminder_time_meal: string | null
          reminder_time_weigh_in: string | null
          reminder_time_workout: string | null
          reminder_weigh_in: boolean | null
          reminder_workout: boolean | null
          stand_goal: number | null
          target_weight: number | null
          target_weight_unit: string | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          username: string | null
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          exercise_goal?: number | null
          fitness_level?: string | null
          full_name?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          height_unit?: string | null
          id: string
          move_goal?: number | null
          onboarding_completed?: boolean | null
          preferred_unit?: string | null
          reminder_habits?: boolean | null
          reminder_meal_logging?: boolean | null
          reminder_time_meal?: string | null
          reminder_time_weigh_in?: string | null
          reminder_time_workout?: string | null
          reminder_weigh_in?: boolean | null
          reminder_workout?: boolean | null
          stand_goal?: number | null
          target_weight?: number | null
          target_weight_unit?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          username?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          exercise_goal?: number | null
          fitness_level?: string | null
          full_name?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          height_unit?: string | null
          id?: string
          move_goal?: number | null
          onboarding_completed?: boolean | null
          preferred_unit?: string | null
          reminder_habits?: boolean | null
          reminder_meal_logging?: boolean | null
          reminder_time_meal?: string | null
          reminder_time_weigh_in?: string | null
          reminder_time_workout?: string | null
          reminder_weigh_in?: boolean | null
          reminder_workout?: boolean | null
          stand_goal?: number | null
          target_weight?: number | null
          target_weight_unit?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          username?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          ingredients: string | null
          instructions: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          instructions?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          instructions?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sample_routines: {
        Row: {
          created_at: string
          description: string | null
          exercises: Json
          id: string
          name: string
          source_platform: string | null
          source_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          exercises?: Json
          id?: string
          name: string
          source_platform?: string | null
          source_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          exercises?: Json
          id?: string
          name?: string
          source_platform?: string | null
          source_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_apps: {
        Row: {
          app_category: string | null
          app_description: string | null
          app_icon_url: string | null
          app_name: string
          app_url: string | null
          created_at: string
          id: string
          platform: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          app_category?: string | null
          app_description?: string | null
          app_icon_url?: string | null
          app_name: string
          app_url?: string | null
          created_at?: string
          id?: string
          platform?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          app_category?: string | null
          app_description?: string | null
          app_icon_url?: string | null
          app_name?: string
          app_url?: string | null
          created_at?: string
          id?: string
          platform?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          connection_type: string
          created_at: string | null
          id: string
          platform: string
          profile_url: string | null
          user_id: string
          username: string
        }
        Insert: {
          connection_type: string
          created_at?: string | null
          id?: string
          platform: string
          profile_url?: string | null
          user_id: string
          username: string
        }
        Update: {
          connection_type?: string
          created_at?: string | null
          id?: string
          platform?: string
          profile_url?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      supplements: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          dosage: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          product_link: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          dosage?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          product_link?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          dosage?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          product_link?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      symptoms: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          logged_at: string | null
          severity: number | null
          symptom_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          logged_at?: string | null
          severity?: number | null
          symptom_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          logged_at?: string | null
          severity?: number | null
          symptom_name?: string
          user_id?: string
        }
        Relationships: []
      }
      timer_folders: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wearable_data: {
        Row: {
          calories_burned: number | null
          created_at: string | null
          data_date: string
          device_name: string
          heart_rate: number | null
          id: string
          sleep_hours: number | null
          steps: number | null
          user_id: string
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string | null
          data_date: string
          device_name: string
          heart_rate?: number | null
          id?: string
          sleep_hours?: number | null
          steps?: number | null
          user_id: string
        }
        Update: {
          calories_burned?: number | null
          created_at?: string | null
          data_date?: string
          device_name?: string
          heart_rate?: number | null
          id?: string
          sleep_hours?: number | null
          steps?: number | null
          user_id?: string
        }
        Relationships: []
      }
      webauthn_credentials: {
        Row: {
          counter: number
          created_at: string | null
          credential_id: string
          device_type: string | null
          id: string
          last_used_at: string | null
          public_key: string
          user_id: string
        }
        Insert: {
          counter?: number
          created_at?: string | null
          credential_id: string
          device_type?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          user_id: string
        }
        Update: {
          counter?: number
          created_at?: string | null
          credential_id?: string
          device_type?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string | null
          id: string
          logged_at: string | null
          period: string
          user_id: string
          weight_lbs: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          logged_at?: string | null
          period: string
          user_id: string
          weight_lbs: number
        }
        Update: {
          created_at?: string | null
          id?: string
          logged_at?: string | null
          period?: string
          user_id?: string
          weight_lbs?: number
        }
        Relationships: []
      }
      workout_media: {
        Row: {
          activity_log_id: string | null
          created_at: string
          file_type: string
          file_url: string
          id: string
          user_id: string
        }
        Insert: {
          activity_log_id?: string | null
          created_at?: string
          file_type: string
          file_url: string
          id?: string
          user_id: string
        }
        Update: {
          activity_log_id?: string | null
          created_at?: string
          file_type?: string
          file_url?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_media_activity_log_id_fkey"
            columns: ["activity_log_id"]
            isOneToOne: false
            referencedRelation: "activity_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_routines: {
        Row: {
          created_at: string
          description: string | null
          exercises: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          exercises?: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          exercises?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
