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
          time_of_day: string | null
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
          time_of_day?: string | null
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
          time_of_day?: string | null
          user_id?: string
        }
        Relationships: []
      }
      advertisements: {
        Row: {
          click_count: number | null
          created_at: string
          description: string | null
          description_es: string | null
          end_date: string | null
          id: string
          image_url: string | null
          impression_count: number | null
          is_active: boolean
          link_url: string | null
          placement: string
          start_date: string | null
          title: string
          title_es: string | null
          updated_at: string
        }
        Insert: {
          click_count?: number | null
          created_at?: string
          description?: string | null
          description_es?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          impression_count?: number | null
          is_active?: boolean
          link_url?: string | null
          placement?: string
          start_date?: string | null
          title: string
          title_es?: string | null
          updated_at?: string
        }
        Update: {
          click_count?: number | null
          created_at?: string
          description?: string | null
          description_es?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          impression_count?: number | null
          is_active?: boolean
          link_url?: string | null
          placement?: string
          start_date?: string | null
          title?: string
          title_es?: string | null
          updated_at?: string
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
      auth_secrets: {
        Row: {
          backup_codes: Json | null
          created_at: string | null
          id: string
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: Json | null
          created_at?: string | null
          id?: string
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: Json | null
          created_at?: string | null
          id?: string
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_user_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          blocked_user_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          blocked_user_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      body_measurements: {
        Row: {
          chest_inches: number | null
          created_at: string
          hips_inches: number | null
          id: string
          left_arm_inches: number | null
          left_calf_inches: number | null
          left_thigh_inches: number | null
          measured_at: string
          notes: string | null
          right_arm_inches: number | null
          right_calf_inches: number | null
          right_thigh_inches: number | null
          user_id: string
          waist_inches: number | null
        }
        Insert: {
          chest_inches?: number | null
          created_at?: string
          hips_inches?: number | null
          id?: string
          left_arm_inches?: number | null
          left_calf_inches?: number | null
          left_thigh_inches?: number | null
          measured_at?: string
          notes?: string | null
          right_arm_inches?: number | null
          right_calf_inches?: number | null
          right_thigh_inches?: number | null
          user_id: string
          waist_inches?: number | null
        }
        Update: {
          chest_inches?: number | null
          created_at?: string
          hips_inches?: number | null
          id?: string
          left_arm_inches?: number | null
          left_calf_inches?: number | null
          left_thigh_inches?: number | null
          measured_at?: string
          notes?: string | null
          right_arm_inches?: number | null
          right_calf_inches?: number | null
          right_thigh_inches?: number | null
          user_id?: string
          waist_inches?: number | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_type: string
          client_id: string
          created_at: string | null
          end_time: string | null
          id: string
          notes: string | null
          price: number | null
          program_id: string | null
          start_time: string
          status: string | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          booking_type: string
          client_id: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          program_id?: string | null
          start_time: string
          status?: string | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          booking_type?: string
          client_id?: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          program_id?: string | null
          start_time?: string
          status?: string | null
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "trainer_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_completions: {
        Row: {
          challenge_id: string
          completed_at: string
          created_at: string
          id: string
          notes: string | null
          progress_value: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string
          created_at?: string
          id?: string
          notes?: string | null
          progress_value: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string
          created_at?: string
          id?: string
          notes?: string | null
          progress_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_leaderboard: {
        Row: {
          challenge_id: string
          id: string
          last_updated: string
          milestones_completed: number | null
          points_earned: number | null
          progress: number | null
          rank: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          id?: string
          last_updated?: string
          milestones_completed?: number | null
          points_earned?: number | null
          progress?: number | null
          rank?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          id?: string
          last_updated?: string
          milestones_completed?: number | null
          points_earned?: number | null
          progress?: number | null
          rank?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_leaderboard_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "custom_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_milestones: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          milestone_name: string
          points_reward: number | null
          sort_order: number | null
          target_value: number
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          milestone_name: string
          points_reward?: number | null
          sort_order?: number | null
          target_value: number
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          milestone_name?: string
          points_reward?: number | null
          sort_order?: number | null
          target_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_milestones_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "custom_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          completed_at: string | null
          current_progress: number | null
          id: string
          is_public: boolean | null
          joined_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          current_progress?: number | null
          id?: string
          is_public?: boolean | null
          joined_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          current_progress?: number | null
          id?: string
          is_public?: boolean | null
          joined_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "custom_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          badge_reward: string | null
          category: string
          challenge_type: string
          created_at: string
          description: string
          end_date: string
          id: string
          is_active: boolean
          points_reward: number
          start_date: string
          target_unit: string
          target_value: number
          title: string
          updated_at: string
        }
        Insert: {
          badge_reward?: string | null
          category: string
          challenge_type: string
          created_at?: string
          description: string
          end_date: string
          id?: string
          is_active?: boolean
          points_reward?: number
          start_date: string
          target_unit: string
          target_value: number
          title: string
          updated_at?: string
        }
        Update: {
          badge_reward?: string | null
          category?: string
          challenge_type?: string
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean
          points_reward?: number
          start_date?: string
          target_unit?: string
          target_value?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      close_friends: {
        Row: {
          created_at: string
          friend_user_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_user_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_user_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_likes: {
        Row: {
          content_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_likes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "creator_content"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant1_id: string
          participant2_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant1_id: string
          participant2_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant1_id?: string
          participant2_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      creator_content: {
        Row: {
          content_data: Json
          content_type: string
          created_at: string
          creator_id: string
          description: string | null
          id: string
          is_premium: boolean
          is_published: boolean
          likes_count: number
          price: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          content_data?: Json
          content_type: string
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          is_premium?: boolean
          is_published?: boolean
          likes_count?: number
          price?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          content_data?: Json
          content_type?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          is_premium?: boolean
          is_published?: boolean
          likes_count?: number
          price?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      creator_subscriptions: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          subscriber_id: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          subscriber_id: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          subscriber_id?: string
        }
        Relationships: []
      }
      custom_challenges: {
        Row: {
          badge_image_url: string | null
          challenge_type: string
          created_at: string
          creator_id: string
          description: string | null
          difficulty_level: string | null
          end_date: string
          id: string
          is_public: boolean | null
          max_participants: number | null
          points_reward: number | null
          start_date: string
          target_unit: string
          target_value: number
          title: string
          updated_at: string
        }
        Insert: {
          badge_image_url?: string | null
          challenge_type: string
          created_at?: string
          creator_id: string
          description?: string | null
          difficulty_level?: string | null
          end_date: string
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          points_reward?: number | null
          start_date: string
          target_unit: string
          target_value: number
          title: string
          updated_at?: string
        }
        Update: {
          badge_image_url?: string | null
          challenge_type?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          difficulty_level?: string | null
          end_date?: string
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          points_reward?: number | null
          start_date?: string
          target_unit?: string
          target_value?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          component_stack: string | null
          context: Json | null
          created_at: string
          error_message: string
          error_stack: string | null
          id: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component_stack?: string | null
          context?: Json | null
          created_at?: string
          error_message: string
          error_stack?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component_stack?: string | null
          context?: Json | null
          created_at?: string
          error_message?: string
          error_stack?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      event_reminders: {
        Row: {
          created_at: string
          event_id: string
          id: string
          remind_at: string
          sent: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          remind_at: string
          sent?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          remind_at?: string
          sent?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "fitness_events"
            referencedColumns: ["id"]
          },
        ]
      }
      fitness_events: {
        Row: {
          color: string | null
          completed: boolean | null
          created_at: string
          description: string | null
          end_time: string | null
          event_type: string
          id: string
          is_recurring: boolean | null
          location: string | null
          metadata: Json | null
          recurrence_pattern: string | null
          reminder_minutes: number | null
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          completed?: boolean | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_type: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          metadata?: Json | null
          recurrence_pattern?: string | null
          reminder_minutes?: number | null
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          completed?: boolean | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          metadata?: Json | null
          recurrence_pattern?: string | null
          reminder_minutes?: number | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fitness_locations: {
        Row: {
          address: string | null
          amenities: string[] | null
          average_rating: number | null
          category: string
          city: string
          country: string
          created_at: string
          description: string | null
          hours_of_operation: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          postal_code: string | null
          price_range: string | null
          state: string | null
          submitted_by: string | null
          total_reviews: number | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          average_rating?: number | null
          category: string
          city: string
          country: string
          created_at?: string
          description?: string | null
          hours_of_operation?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          postal_code?: string | null
          price_range?: string | null
          state?: string | null
          submitted_by?: string | null
          total_reviews?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          average_rating?: number | null
          category?: string
          city?: string
          country?: string
          created_at?: string
          description?: string | null
          hours_of_operation?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          price_range?: string | null
          state?: string | null
          submitted_by?: string | null
          total_reviews?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      follow_requests: {
        Row: {
          created_at: string
          id: string
          requested_id: string
          requester_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          requested_id: string
          requester_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          requested_id?: string
          requester_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      fundraiser_donations: {
        Row: {
          amount: number
          created_at: string | null
          donor_id: string | null
          fundraiser_id: string
          id: string
          is_anonymous: boolean | null
          message: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          donor_id?: string | null
          fundraiser_id: string
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          donor_id?: string | null
          fundraiser_id?: string
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fundraiser_donations_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: false
            referencedRelation: "fundraisers"
            referencedColumns: ["id"]
          },
        ]
      }
      fundraisers: {
        Row: {
          category: string
          created_at: string | null
          current_amount: number | null
          description: string
          end_date: string
          goal_amount: number
          id: string
          image_url: string | null
          location: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          category: string
          created_at?: string | null
          current_amount?: number | null
          description: string
          end_date: string
          goal_amount: number
          id?: string
          image_url?: string | null
          location?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          category?: string
          created_at?: string | null
          current_amount?: number | null
          description?: string
          end_date?: string
          goal_amount?: number
          id?: string
          image_url?: string | null
          location?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_posts: {
        Row: {
          created_at: string
          group_id: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          cover_image_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          is_private: boolean
          members_count: number
          name: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          is_private?: boolean
          members_count?: number
          name: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          is_private?: boolean
          members_count?: number
          name?: string
          updated_at?: string
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
      leaderboard_entries: {
        Row: {
          created_at: string
          id: string
          is_public: boolean | null
          leaderboard_type: string
          period_end: string
          period_start: string
          rank: number | null
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          leaderboard_type: string
          period_end: string
          period_start: string
          rank?: number | null
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          leaderboard_type?: string
          period_end?: string
          period_start?: string
          rank?: number | null
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      live_workout_sessions: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: string | null
          host_id: string
          id: string
          is_private: boolean | null
          max_participants: number | null
          scheduled_end: string
          scheduled_start: string
          status: string
          title: string
          updated_at: string
          workout_type: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          host_id: string
          id?: string
          is_private?: boolean | null
          max_participants?: number | null
          scheduled_end: string
          scheduled_start: string
          status?: string
          title: string
          updated_at?: string
          workout_type?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          host_id?: string
          id?: string
          is_private?: boolean | null
          max_participants?: number | null
          scheduled_end?: string
          scheduled_start?: string
          status?: string
          title?: string
          updated_at?: string
          workout_type?: string | null
        }
        Relationships: []
      }
      location_reviews: {
        Row: {
          content: string | null
          created_at: string
          id: string
          location_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
          visit_date: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          location_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
          visit_date?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          location_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_reviews_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "fitness_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          day_of_week: number
          food_name: string
          id: string
          meal_type: string
          notes: string | null
          updated_at: string
          user_id: string
          week_start_date: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          food_name: string
          id?: string
          meal_type: string
          notes?: string | null
          updated_at?: string
          user_id: string
          week_start_date: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          food_name?: string
          id?: string
          meal_type?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
      }
      medical_audit_log: {
        Row: {
          accessed_at: string
          action: string
          id: string
          ip_address: string | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accessed_at?: string
          action: string
          id?: string
          ip_address?: string | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accessed_at?: string
          action?: string
          id?: string
          ip_address?: string | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          category: string
          created_at: string
          file_url: string | null
          id: string
          last_accessed_at: string | null
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
          last_accessed_at?: string | null
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
          last_accessed_at?: string | null
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
          last_accessed_at: string | null
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
          last_accessed_at?: string | null
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
          last_accessed_at?: string | null
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
      mentions: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          mentioned_by_user_id: string
          mentioned_user_id: string
          post_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          mentioned_by_user_id: string
          mentioned_user_id: string
          post_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          mentioned_by_user_id?: string
          mentioned_user_id?: string
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_achievements: {
        Row: {
          achieved_at: string
          id: string
          milestone_id: string
          participant_id: string
        }
        Insert: {
          achieved_at?: string
          id?: string
          milestone_id: string
          participant_id: string
        }
        Update: {
          achieved_at?: string
          id?: string
          milestone_id?: string
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_achievements_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "challenge_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_achievements_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "challenge_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      news_items: {
        Row: {
          badge_type: string | null
          category: string
          created_at: string
          created_by: string | null
          event_date: string | null
          event_date_es: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          title: string
          title_es: string | null
          updated_at: string
          url: string
        }
        Insert: {
          badge_type?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          event_date?: string | null
          event_date_es?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title: string
          title_es?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          badge_type?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          event_date?: string | null
          event_date_es?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string
          title_es?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string
          comment_id: string | null
          created_at: string
          id: string
          is_read: boolean
          post_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          comment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          post_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          comment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          post_id?: string | null
          type?: string
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
      personal_records: {
        Row: {
          achieved_at: string
          created_at: string
          exercise_category: string
          exercise_name: string
          id: string
          notes: string | null
          record_type: string
          record_unit: string
          record_value: number
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          achieved_at?: string
          created_at?: string
          exercise_category: string
          exercise_name: string
          id?: string
          notes?: string | null
          record_type: string
          record_unit: string
          record_value: number
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          achieved_at?: string
          created_at?: string
          exercise_category?: string
          exercise_name?: string
          id?: string
          notes?: string | null
          record_type?: string
          record_unit?: string
          record_value?: number
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      points_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          related_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          related_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          related_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      post_hashtags: {
        Row: {
          created_at: string
          hashtag: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          hashtag: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          hashtag?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_hashtags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          post_id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          post_id: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          edit_count: number | null
          edited_at: string | null
          id: string
          is_public: boolean
          likes_count: number
          media_url: string | null
          metadata: Json | null
          post_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          edit_count?: number | null
          edited_at?: string | null
          id?: string
          is_public?: boolean
          likes_count?: number
          media_url?: string | null
          metadata?: Json | null
          post_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          edit_count?: number | null
          edited_at?: string | null
          id?: string
          is_public?: boolean
          likes_count?: number
          media_url?: string | null
          metadata?: Json | null
          post_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pr_history: {
        Row: {
          achieved_at: string
          created_at: string
          id: string
          improvement_percentage: number | null
          new_value: number
          pr_id: string
          previous_value: number
          user_id: string
        }
        Insert: {
          achieved_at?: string
          created_at?: string
          id?: string
          improvement_percentage?: number | null
          new_value: number
          pr_id: string
          previous_value: number
          user_id: string
        }
        Update: {
          achieved_at?: string
          created_at?: string
          id?: string
          improvement_percentage?: number | null
          new_value?: number
          pr_id?: string
          previous_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pr_history_pr_id_fkey"
            columns: ["pr_id"]
            isOneToOne: false
            referencedRelation: "personal_records"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          allow_mentions: boolean | null
          avatar_url: string | null
          created_at: string | null
          current_streak: number
          exercise_goal: number | null
          fitness_level: string | null
          followers_count: number
          following_count: number
          full_name: string | null
          gender: string | null
          goal: string | null
          height: number | null
          height_unit: string | null
          id: string
          is_private: boolean | null
          last_activity_date: string | null
          longest_streak: number
          move_goal: number | null
          onboarding_completed: boolean | null
          preferred_unit: string | null
          referral_code: string | null
          referral_points: number | null
          referred_by: string | null
          reminder_habits: boolean | null
          reminder_meal_logging: boolean | null
          reminder_time_meal: string | null
          reminder_time_weigh_in: string | null
          reminder_time_workout: string | null
          reminder_weigh_in: boolean | null
          reminder_workout: boolean | null
          show_activity: boolean | null
          stand_goal: number | null
          target_weight: number | null
          target_weight_unit: string | null
          total_points: number
          updated_at: string | null
          username: string | null
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          age?: number | null
          allow_mentions?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          current_streak?: number
          exercise_goal?: number | null
          fitness_level?: string | null
          followers_count?: number
          following_count?: number
          full_name?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          height_unit?: string | null
          id: string
          is_private?: boolean | null
          last_activity_date?: string | null
          longest_streak?: number
          move_goal?: number | null
          onboarding_completed?: boolean | null
          preferred_unit?: string | null
          referral_code?: string | null
          referral_points?: number | null
          referred_by?: string | null
          reminder_habits?: boolean | null
          reminder_meal_logging?: boolean | null
          reminder_time_meal?: string | null
          reminder_time_weigh_in?: string | null
          reminder_time_workout?: string | null
          reminder_weigh_in?: boolean | null
          reminder_workout?: boolean | null
          show_activity?: boolean | null
          stand_goal?: number | null
          target_weight?: number | null
          target_weight_unit?: string | null
          total_points?: number
          updated_at?: string | null
          username?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          age?: number | null
          allow_mentions?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          current_streak?: number
          exercise_goal?: number | null
          fitness_level?: string | null
          followers_count?: number
          following_count?: number
          full_name?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          height_unit?: string | null
          id?: string
          is_private?: boolean | null
          last_activity_date?: string | null
          longest_streak?: number
          move_goal?: number | null
          onboarding_completed?: boolean | null
          preferred_unit?: string | null
          referral_code?: string | null
          referral_points?: number | null
          referred_by?: string | null
          reminder_habits?: boolean | null
          reminder_meal_logging?: boolean | null
          reminder_time_meal?: string | null
          reminder_time_weigh_in?: string | null
          reminder_time_workout?: string | null
          reminder_weigh_in?: boolean | null
          reminder_workout?: boolean | null
          show_activity?: boolean | null
          stand_goal?: number | null
          target_weight?: number | null
          target_weight_unit?: string | null
          total_points?: number
          updated_at?: string | null
          username?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: []
      }
      program_completions: {
        Row: {
          completed_at: string
          created_at: string
          day_number: number
          id: string
          notes: string | null
          program_id: string
          user_id: string
          week_number: number
        }
        Insert: {
          completed_at?: string
          created_at?: string
          day_number: number
          id?: string
          notes?: string | null
          program_id: string
          user_id: string
          week_number: number
        }
        Update: {
          completed_at?: string
          created_at?: string
          day_number?: number
          id?: string
          notes?: string | null
          program_id?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "program_completions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_enrollments: {
        Row: {
          completed_at: string | null
          created_at: string
          current_day: number | null
          current_week: number | null
          id: string
          program_id: string
          started_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_day?: number | null
          current_week?: number | null
          id?: string
          program_id: string
          started_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_day?: number | null
          current_week?: number | null
          id?: string
          program_id?: string
          started_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_exercises: {
        Row: {
          created_at: string
          day_number: number
          duration_minutes: number | null
          exercise_name: string
          id: string
          notes: string | null
          program_id: string
          reps: string | null
          sets: number | null
          sort_order: number | null
          week_number: number
        }
        Insert: {
          created_at?: string
          day_number: number
          duration_minutes?: number | null
          exercise_name: string
          id?: string
          notes?: string | null
          program_id: string
          reps?: string | null
          sets?: number | null
          sort_order?: number | null
          week_number: number
        }
        Update: {
          created_at?: string
          day_number?: number
          duration_minutes?: number | null
          exercise_name?: string
          id?: string
          notes?: string | null
          program_id?: string
          reps?: string | null
          sets?: number | null
          sort_order?: number | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "program_exercises_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_photos: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          photo_url: string
          taken_at: string
          user_id: string
          weight_lbs: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          photo_url: string
          taken_at?: string
          user_id: string
          weight_lbs?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          photo_url?: string
          taken_at?: string
          user_id?: string
          weight_lbs?: number | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          subscription: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          subscription: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          subscription?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_collaborations: {
        Row: {
          accepted: boolean | null
          accepted_at: string | null
          collaborator_id: string
          id: string
          invited_at: string
          invited_by: string
          recipe_id: string
          role: string
        }
        Insert: {
          accepted?: boolean | null
          accepted_at?: string | null
          collaborator_id: string
          id?: string
          invited_at?: string
          invited_by: string
          recipe_id: string
          role?: string
        }
        Update: {
          accepted?: boolean | null
          accepted_at?: string | null
          collaborator_id?: string
          id?: string
          invited_at?: string
          invited_by?: string
          recipe_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_collaborations_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          parent_comment_id: string | null
          recipe_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          recipe_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          recipe_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "recipe_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_comments_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_remixes: {
        Row: {
          created_at: string
          id: string
          original_recipe_id: string
          remix_notes: string | null
          remixed_recipe_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          original_recipe_id: string
          remix_notes?: string | null
          remixed_recipe_id: string
        }
        Update: {
          created_at?: string
          id?: string
          original_recipe_id?: string
          remix_notes?: string | null
          remixed_recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_remixes_original_recipe_id_fkey"
            columns: ["original_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_remixes_remixed_recipe_id_fkey"
            columns: ["remixed_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_shares: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          share_type: string
          shared_by: string
          shared_with: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          share_type?: string
          shared_by: string
          shared_with?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          share_type?: string
          shared_by?: string
          shared_with?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_shares_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_versions: {
        Row: {
          change_notes: string | null
          cook_time: number | null
          created_at: string
          created_by: string
          id: string
          ingredients: Json
          instructions: string
          prep_time: number | null
          recipe_id: string
          servings: number | null
          title: string
          version_number: number
        }
        Insert: {
          change_notes?: string | null
          cook_time?: number | null
          created_at?: string
          created_by: string
          id?: string
          ingredients?: Json
          instructions: string
          prep_time?: number | null
          recipe_id: string
          servings?: number | null
          title: string
          version_number: number
        }
        Update: {
          change_notes?: string | null
          cook_time?: number | null
          created_at?: string
          created_by?: string
          id?: string
          ingredients?: Json
          instructions?: string
          prep_time?: number | null
          recipe_id?: string
          servings?: number | null
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_versions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          allow_remixing: boolean | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          ingredients: string | null
          instructions: string | null
          is_collaborative: boolean | null
          is_public: boolean | null
          name: string
          updated_at: string
          user_id: string
          version_number: number | null
        }
        Insert: {
          allow_remixing?: boolean | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          instructions?: string | null
          is_collaborative?: boolean | null
          is_public?: boolean | null
          name: string
          updated_at?: string
          user_id: string
          version_number?: number | null
        }
        Update: {
          allow_remixing?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          instructions?: string | null
          is_collaborative?: boolean | null
          is_public?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
          version_number?: number | null
        }
        Relationships: []
      }
      recommended_products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          description_es: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean
          is_bulldogz_approved: boolean
          name: string
          name_es: string | null
          personal_endorsement: string | null
          personal_endorsement_es: string | null
          price_range: string | null
          purchase_url: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          description_es?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_bulldogz_approved?: boolean
          name: string
          name_es?: string | null
          personal_endorsement?: string | null
          personal_endorsement_es?: string | null
          price_range?: string | null
          purchase_url?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          description_es?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_bulldogz_approved?: boolean
          name?: string
          name_es?: string | null
          personal_endorsement?: string | null
          personal_endorsement_es?: string | null
          price_range?: string | null
          purchase_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recovery_sessions: {
        Row: {
          cost: number | null
          created_at: string
          duration_minutes: number
          id: string
          intensity: string | null
          location: string | null
          notes: string | null
          session_date: string
          temperature: string | null
          therapy_type: string
          user_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          duration_minutes: number
          id?: string
          intensity?: string | null
          location?: string | null
          notes?: string | null
          session_date?: string
          temperature?: string | null
          therapy_type: string
          user_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          duration_minutes?: number
          id?: string
          intensity?: string | null
          location?: string | null
          notes?: string | null
          session_date?: string
          temperature?: string | null
          therapy_type?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_email: string | null
          referred_id: string | null
          referrer_id: string
          reward_points: number | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_email?: string | null
          referred_id?: string | null
          referrer_id: string
          reward_points?: number | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_email?: string | null
          referred_id?: string | null
          referrer_id?: string
          reward_points?: number | null
          status?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          expires_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          points_spent: number
          redeemed_at: string | null
          reward_id: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          points_spent: number
          redeemed_at?: string | null
          reward_id: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          points_spent?: number
          redeemed_at?: string | null
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          category: string
          created_at: string | null
          description: string
          duration_days: number | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          points_cost: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          points_cost: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          points_cost?: number
          updated_at?: string | null
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
      saved_meals: {
        Row: {
          calories: number
          carbs_grams: number | null
          created_at: string | null
          fat_grams: number | null
          id: string
          meal_name: string
          meal_type: string
          notes: string | null
          protein_grams: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calories: number
          carbs_grams?: number | null
          created_at?: string | null
          fat_grams?: number | null
          id?: string
          meal_name: string
          meal_type: string
          notes?: string | null
          protein_grams?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calories?: number
          carbs_grams?: number | null
          created_at?: string | null
          fat_grams?: number | null
          id?: string
          meal_name?: string
          meal_type?: string
          notes?: string | null
          protein_grams?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      session_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string
          left_at: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string
          left_at?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string
          left_at?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_workout_sessions"
            referencedColumns: ["id"]
          },
        ]
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
      sponsors: {
        Row: {
          created_at: string
          description: string | null
          description_es: string | null
          display_order: number | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          tier: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_es?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          tier?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          description_es?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          tier?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          close_friends_only: boolean | null
          content: string | null
          created_at: string
          expires_at: string
          id: string
          media_type: string | null
          media_url: string | null
          user_id: string
          views_count: number
        }
        Insert: {
          close_friends_only?: boolean | null
          content?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          user_id: string
          views_count?: number
        }
        Update: {
          close_friends_only?: boolean | null
          content?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          user_id?: string
          views_count?: number
        }
        Relationships: []
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_features: {
        Row: {
          created_at: string | null
          feature_key: string
          feature_value: string
          id: string
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          created_at?: string | null
          feature_key: string
          feature_value: string
          id?: string
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          created_at?: string | null
          feature_key?: string
          feature_value?: string
          id?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
          user_id?: string
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
      trainer_profiles: {
        Row: {
          availability_calendar: Json | null
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          is_verified: boolean | null
          location: string | null
          profile_image_url: string | null
          rating: number | null
          specialties: string[] | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability_calendar?: Json | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          profile_image_url?: string | null
          rating?: number | null
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability_calendar?: Json | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          profile_image_url?: string | null
          rating?: number | null
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trainer_programs: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          duration_weeks: number
          id: string
          is_active: boolean | null
          max_participants: number | null
          price: number | null
          program_content: Json | null
          program_type: string | null
          thumbnail_url: string | null
          title: string
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_weeks: number
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          price?: number | null
          program_content?: Json | null
          program_type?: string | null
          thumbnail_url?: string | null
          title: string
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_weeks?: number
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          price?: number | null
          program_content?: Json | null
          program_type?: string | null
          thumbnail_url?: string | null
          title?: string
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trainer_reviews: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          rating: number
          review_text: string | null
          reviewer_id: string
          trainer_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          rating: number
          review_text?: string | null
          reviewer_id: string
          trainer_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          review_text?: string | null
          reviewer_id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_devices: {
        Row: {
          created_at: string | null
          device_fingerprint: string
          device_name: string | null
          id: string
          last_used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint: string
          device_name?: string | null
          id?: string
          last_used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string
          device_name?: string | null
          id?: string
          last_used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_code: string
          badge_description: string | null
          badge_icon: string | null
          badge_name: string
          created_at: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_code: string
          badge_description?: string | null
          badge_icon?: string | null
          badge_name: string
          created_at?: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_code?: string
          badge_description?: string | null
          badge_icon?: string | null
          badge_name?: string
          created_at?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vip_passes: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          reason: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      voice_notes: {
        Row: {
          audio_url: string
          category: string
          created_at: string
          duration_seconds: number | null
          id: string
          is_favorite: boolean | null
          recorded_at: string
          tags: string[] | null
          title: string
          transcription: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url: string
          category: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_favorite?: boolean | null
          recorded_at?: string
          tags?: string[] | null
          title: string
          transcription?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string
          category?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_favorite?: boolean | null
          recorded_at?: string
          tags?: string[] | null
          title?: string
          transcription?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          logged_at: string
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string
          id?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wearable_connections: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          provider: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: string
          provider: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string
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
      workout_programs: {
        Row: {
          created_at: string
          description: string | null
          duration_weeks: number
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string
          start_date: string | null
          updated_at: string
          user_id: string
          workouts: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_weeks: number
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name: string
          start_date?: string | null
          updated_at?: string
          user_id: string
          workouts?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_weeks?: number
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string
          start_date?: string | null
          updated_at?: string
          user_id?: string
          workouts?: Json
        }
        Relationships: []
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
      award_points_and_streak: {
        Args: { _points: number; _user_id: string }
        Returns: undefined
      }
      award_referral_points: {
        Args: {
          _amount: number
          _description: string
          _related_id?: string
          _user_id: string
        }
        Returns: undefined
      }
      can_view_full_profile: {
        Args: { _profile_id: string; _viewer_id: string }
        Returns: boolean
      }
      cleanup_old_error_logs: { Args: never; Returns: undefined }
      cleanup_old_security_logs: { Args: never; Returns: undefined }
      create_booking: {
        Args: {
          _booking_type: string
          _end_time: string
          _notes?: string
          _program_id?: string
          _start_time: string
          _trainer_id: string
        }
        Returns: string
      }
      create_donation: {
        Args: {
          _amount: number
          _fundraiser_id: string
          _is_anonymous?: boolean
          _message?: string
        }
        Returns: string
      }
      generate_referral_code: { Args: never; Returns: string }
      get_fundraiser_donations: {
        Args: { _fundraiser_id: string }
        Returns: {
          amount: number
          created_at: string
          donor_id: string
          id: string
          is_anonymous: boolean
          message: string
        }[]
      }
      get_story_view_count: { Args: { _story_id: string }; Returns: number }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      grant_vip_pass: {
        Args: { _expires_at?: string; _reason?: string; _user_id: string }
        Returns: string
      }
      has_active_reward: {
        Args: { _feature_type: string; _user_id: string }
        Returns: boolean
      }
      has_active_vip: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_session_participant: {
        Args: { _session_id: string; _user_id: string }
        Returns: boolean
      }
      log_medical_read: { Args: never; Returns: undefined }
      redeem_reward: { Args: { _reward_id: string }; Returns: string }
      revoke_vip_pass: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "user" | "trainer" | "creator" | "admin"
      subscription_tier: "free" | "pro" | "enterprise"
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
    Enums: {
      app_role: ["user", "trainer", "creator", "admin"],
      subscription_tier: ["free", "pro", "enterprise"],
    },
  },
} as const
