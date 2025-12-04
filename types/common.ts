/**
 * Common Types & Database Schema
 * Shared types and Supabase database definitions used across the application
 */

export type UserRole = 'athlete' | 'parent' | 'agency' | 'school' | 'business';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
          first_name?: string;
          last_name?: string;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string;
          date_of_birth?: string;
          phone?: string;
          parent_email?: string;
          school_name?: string;
          graduation_year?: number;
          major?: string;
          gpa?: number;
          primary_sport?: string;
          position?: string;
          achievements?: string[];
          nil_interests?: string[];
          nil_concerns?: string[];
          social_media_handles?: any;
          athlete_info?: any;
          institution_info?: any;
          connected_athletes?: string[];
          dashboard_access_level?: string;
          notification_preferences?: any;
          compliance_settings?: any;
          managed_athletes?: string[];
          relationship_type?: string;
          title?: string;
          division?: string;
          team_name?: string;
          // Agency-specific fields
          company_name?: string;
          industry?: string;
          company_size?: string;
          website_url?: string;
          target_demographics?: any;
          campaign_interests?: string[];
          budget_range?: string;
          geographic_focus?: string[];
          brand_values?: string[];
          verification_status?: string;
          verified_at?: string;
          // Athlete enhancement fields (Migration 016)
          hobbies?: string[];
          content_creation_interests?: string[];
          brand_affinity?: string[];
          lifestyle_interests?: string[];
          causes_care_about?: string[];
          social_media_stats?: any;
          nil_preferences?: any;
          bio?: string;
          profile_video_url?: string;
          content_samples?: any;
          total_followers?: number;
          avg_engagement_rate?: number;
          profile_completion_score?: number;
          // School system fields (Migration 027)
          school_created?: boolean;
          profile_completion_tier?: 'basic' | 'full';
          home_completion_required?: boolean;
          school_id?: string;
          home_completed_at?: string;
        };
        Insert: {
          id: string;
          email: string;
          role: UserRole;
          created_at?: string;
          updated_at?: string;
          first_name?: string;
          last_name?: string;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string;
          date_of_birth?: string;
          phone?: string;
          parent_email?: string;
          school_name?: string;
          graduation_year?: number;
          major?: string;
          gpa?: number;
          primary_sport?: string;
          position?: string;
          achievements?: string[];
          nil_interests?: string[];
          nil_concerns?: string[];
          social_media_handles?: any;
          athlete_info?: any;
          institution_info?: any;
          connected_athletes?: string[];
          dashboard_access_level?: string;
          notification_preferences?: any;
          compliance_settings?: any;
          managed_athletes?: string[];
          relationship_type?: string;
          title?: string;
          division?: string;
          team_name?: string;
          // Agency-specific fields
          company_name?: string;
          industry?: string;
          company_size?: string;
          website_url?: string;
          target_demographics?: any;
          campaign_interests?: string[];
          budget_range?: string;
          geographic_focus?: string[];
          brand_values?: string[];
          verification_status?: string;
          verified_at?: string;
          // Athlete enhancement fields (Migration 016)
          hobbies?: string[];
          content_creation_interests?: string[];
          brand_affinity?: string[];
          lifestyle_interests?: string[];
          causes_care_about?: string[];
          social_media_stats?: any;
          nil_preferences?: any;
          bio?: string;
          profile_video_url?: string;
          content_samples?: any;
          total_followers?: number;
          avg_engagement_rate?: number;
          profile_completion_score?: number;
          // School system fields (Migration 027)
          school_created?: boolean;
          profile_completion_tier?: 'basic' | 'full';
          home_completion_required?: boolean;
          school_id?: string;
          home_completed_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
          first_name?: string;
          last_name?: string;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string;
          date_of_birth?: string;
          phone?: string;
          parent_email?: string;
          school_name?: string;
          graduation_year?: number;
          major?: string;
          gpa?: number;
          primary_sport?: string;
          position?: string;
          achievements?: string[];
          nil_interests?: string[];
          nil_concerns?: string[];
          social_media_handles?: any;
          athlete_info?: any;
          institution_info?: any;
          connected_athletes?: string[];
          dashboard_access_level?: string;
          notification_preferences?: any;
          compliance_settings?: any;
          managed_athletes?: string[];
          relationship_type?: string;
          title?: string;
          division?: string;
          team_name?: string;
          // Agency-specific fields
          company_name?: string;
          industry?: string;
          company_size?: string;
          website_url?: string;
          target_demographics?: any;
          campaign_interests?: string[];
          budget_range?: string;
          geographic_focus?: string[];
          brand_values?: string[];
          verification_status?: string;
          verified_at?: string;
          // Athlete enhancement fields (Migration 016)
          hobbies?: string[];
          content_creation_interests?: string[];
          brand_affinity?: string[];
          lifestyle_interests?: string[];
          causes_care_about?: string[];
          social_media_stats?: any;
          nil_preferences?: any;
          bio?: string;
          profile_video_url?: string;
          content_samples?: any;
          total_followers?: number;
          avg_engagement_rate?: number;
          profile_completion_score?: number;
          // School system fields (Migration 027)
          school_created?: boolean;
          profile_completion_tier?: 'basic' | 'full';
          home_completion_required?: boolean;
          school_id?: string;
          home_completed_at?: string;
        };
      };
      athlete_profiles: {
        Row: {
          user_id: string;
          first_name: string;
          last_name: string;
          sport: string;
          school: string;
          graduation_year: number | null;
          position: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          first_name: string;
          last_name: string;
          sport: string;
          school: string;
          graduation_year?: number | null;
          position?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          first_name?: string;
          last_name?: string;
          sport?: string;
          school?: string;
          graduation_year?: number | null;
          position?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      parent_profiles: {
        Row: {
          user_id: string;
          first_name: string;
          last_name: string;
          relation_to_athlete: string;
          phone: string | null;
          athletes: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          first_name: string;
          last_name: string;
          relation_to_athlete: string;
          phone?: string | null;
          athletes?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          first_name?: string;
          last_name?: string;
          relation_to_athlete?: string;
          phone?: string | null;
          athletes?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      coach_profiles: {
        Row: {
          user_id: string;
          first_name: string;
          last_name: string;
          school: string;
          team: string | null;
          sport: string;
          years_experience: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          first_name: string;
          last_name: string;
          school: string;
          team?: string | null;
          sport: string;
          years_experience?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          first_name?: string;
          last_name?: string;
          school?: string;
          team?: string | null;
          sport?: string;
          years_experience?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          role_context: string;
          is_pinned: boolean;
          is_archived: boolean;
          draft: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          role_context?: string;
          is_pinned?: boolean;
          is_archived?: boolean;
          draft?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          role_context?: string;
          is_pinned?: boolean;
          is_archived?: boolean;
          draft?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          content: string;
          role: 'user' | 'assistant';
          attachments: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          content: string;
          role: 'user' | 'assistant';
          attachments?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          content?: string;
          role?: 'user' | 'assistant';
          attachments?: any | null;
          created_at?: string;
        };
      };
      chat_attachments: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          file_name: string;
          file_size: number;
          file_type: string;
          storage_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id: string;
          file_name: string;
          file_size: number;
          file_type: string;
          storage_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          user_id?: string;
          file_name?: string;
          file_size?: number;
          file_type?: string;
          storage_path?: string;
          created_at?: string;
        };
      };
      parent_athlete_relationships: {
        Row: {
          parent_id: string;
          athlete_id: string;
          relationship_type: string;
          permissions: any;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          parent_id: string;
          athlete_id: string;
          relationship_type: string;
          permissions?: any;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          parent_id?: string;
          athlete_id?: string;
          relationship_type?: string;
          permissions?: any;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coach_athlete_relationships: {
        Row: {
          coach_id: string;
          athlete_id: string;
          team_role?: string;
          sport?: string;
          season?: string;
          permissions: any;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          coach_id: string;
          athlete_id: string;
          team_role?: string;
          sport?: string;
          season?: string;
          permissions?: any;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          coach_id?: string;
          athlete_id?: string;
          team_role?: string;
          sport?: string;
          season?: string;
          permissions?: any;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string | null;
          category: 'learning' | 'engagement' | 'social' | 'achievement' | 'milestone';
          rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
          criteria: any;
          points: number;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon?: string | null;
          category: 'learning' | 'engagement' | 'social' | 'achievement' | 'milestone';
          rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
          criteria?: any;
          points?: number;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string | null;
          category?: 'learning' | 'engagement' | 'social' | 'achievement' | 'milestone';
          rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
          criteria?: any;
          points?: number;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
          progress: any;
          is_displayed: boolean;
          display_order: number;
          notes: string | null;
          awarded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
          progress?: any;
          is_displayed?: boolean;
          display_order?: number;
          notes?: string | null;
          awarded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
          progress?: any;
          is_displayed?: boolean;
          display_order?: number;
          notes?: string | null;
          awarded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          question: string;
          question_type: string;
          options: any;
          correct_answer: any;
          correct_answer_index: number | null;
          explanation: string | null;
          learning_resources: any;
          category: 'nil_basics' | 'contracts' | 'branding' | 'social_media' | 'compliance' | 'tax_finance' | 'negotiation' | 'legal' | 'marketing' | 'athlete_rights';
          topic: string | null;
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
          tags: string[];
          points: number;
          time_limit_seconds: number;
          is_active: boolean;
          display_order: number;
          times_answered: number;
          times_correct: number;
          target_roles: string[];
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          question: string;
          question_type?: string;
          options?: any;
          correct_answer: any;
          correct_answer_index?: number | null;
          explanation?: string | null;
          learning_resources?: any;
          category: 'nil_basics' | 'contracts' | 'branding' | 'social_media' | 'compliance' | 'tax_finance' | 'negotiation' | 'legal' | 'marketing' | 'athlete_rights';
          topic?: string | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
          tags?: string[];
          points?: number;
          time_limit_seconds?: number;
          is_active?: boolean;
          display_order?: number;
          times_answered?: number;
          times_correct?: number;
          target_roles?: string[];
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          question?: string;
          question_type?: string;
          options?: any;
          correct_answer?: any;
          correct_answer_index?: number | null;
          explanation?: string | null;
          learning_resources?: any;
          category?: 'nil_basics' | 'contracts' | 'branding' | 'social_media' | 'compliance' | 'tax_finance' | 'negotiation' | 'legal' | 'marketing' | 'athlete_rights';
          topic?: string | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
          tags?: string[];
          points?: number;
          time_limit_seconds?: number;
          is_active?: boolean;
          display_order?: number;
          times_answered?: number;
          times_correct?: number;
          target_roles?: string[];
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      user_quiz_progress: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          attempt_number: number;
          status: 'in_progress' | 'completed' | 'abandoned';
          user_answer: any | null;
          user_answer_index: number | null;
          is_correct: boolean | null;
          time_taken_seconds: number | null;
          points_earned: number;
          confidence_level: number | null;
          hints_used: number;
          resources_viewed: string[];
          quiz_session_id: string | null;
          session_score: number | null;
          session_total_questions: number | null;
          user_feedback: string | null;
          flagged_for_review: boolean;
          notes: string | null;
          started_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          attempt_number?: number;
          status?: 'in_progress' | 'completed' | 'abandoned';
          user_answer?: any | null;
          user_answer_index?: number | null;
          is_correct?: boolean | null;
          time_taken_seconds?: number | null;
          points_earned?: number;
          confidence_level?: number | null;
          hints_used?: number;
          resources_viewed?: string[];
          quiz_session_id?: string | null;
          session_score?: number | null;
          session_total_questions?: number | null;
          user_feedback?: string | null;
          flagged_for_review?: boolean;
          notes?: string | null;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          attempt_number?: number;
          status?: 'in_progress' | 'completed' | 'abandoned';
          user_answer?: any | null;
          user_answer_index?: number | null;
          is_correct?: boolean | null;
          time_taken_seconds?: number | null;
          points_earned?: number;
          confidence_level?: number | null;
          hints_used?: number;
          resources_viewed?: string[];
          quiz_session_id?: string | null;
          session_score?: number | null;
          session_total_questions?: number | null;
          user_feedback?: string | null;
          flagged_for_review?: boolean;
          notes?: string | null;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      user_role: 'athlete' | 'parent' | 'coach' | 'agency';
      message_role: 'user' | 'assistant';
      badge_rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
      badge_category: 'learning' | 'engagement' | 'social' | 'achievement' | 'milestone';
      quiz_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      quiz_category: 'nil_basics' | 'contracts' | 'branding' | 'social_media' | 'compliance' | 'tax_finance' | 'negotiation' | 'legal' | 'marketing' | 'athlete_rights';
      quiz_status: 'in_progress' | 'completed' | 'abandoned';
    };
  };
}
