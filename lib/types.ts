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
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          content: string;
          role: 'user' | 'assistant';
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          content?: string;
          role?: 'user' | 'assistant';
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

// Extended User interface for application use
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
  profile?: AthleteProfile | ParentProfile | CoachProfile | AgencyProfile;
  // Phase 6B: School system fields
  school_created?: boolean;
  profile_completion_tier?: 'basic' | 'full';
  home_completion_required?: boolean;
  school_id?: string;
  school_name?: string;
  home_completed_at?: string;
  // Other commonly accessed fields
  first_name?: string;
  last_name?: string;
  onboarding_completed?: boolean;
  graduation_year?: number;
  primary_sport?: string;
}

export interface AthleteProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  sport: string;
  school: string;
  graduation_year?: number;
  position?: string;
  bio?: string;
  onboarding_completed?: boolean;
}

export interface ParentProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  relation_to_athlete: string;
  phone?: string;
  athletes?: string[];
  onboarding_completed?: boolean;
}

export interface CoachProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  school: string;
  team?: string;
  sport: string;
  years_experience?: number;
  onboarding_completed?: boolean;
}

export interface AgencyProfile {
  user_id: string;
  company_name: string;
  industry: string;
  company_size?: string;
  website_url?: string;
  target_demographics?: {
    age_range?: { min: number; max: number };
    gender?: string[];
    interests?: string[];
  };
  campaign_interests?: string[];
  budget_range?: string;
  geographic_focus?: string[];
  brand_values?: string[];
  verification_status?: 'pending' | 'verified' | 'rejected';
  verified_at?: string;
  onboarding_completed?: boolean;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  attachments?: any;
  created_at: string;
}

export interface ChatAttachment {
  id: string;
  message_id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  created_at: string;
}

// Relationship interfaces
export interface ParentAthleteRelationship {
  parent_id: string;
  athlete_id: string;
  relationship_type: 'mother' | 'father' | 'guardian' | 'step_parent' | 'other';
  permissions: {
    view_nil_activities?: boolean;
    approve_contracts?: boolean;
    receive_notifications?: boolean;
    access_financial_info?: boolean;
  };
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachAthleteRelationship {
  coach_id: string;
  athlete_id: string;
  team_role?: 'starter' | 'bench' | 'redshirt' | 'walk_on' | 'injured_reserve';
  sport?: string;
  season?: string;
  permissions: {
    view_nil_activities?: boolean;
    provide_guidance?: boolean;
    receive_reports?: boolean;
    manage_compliance?: boolean;
  };
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Badge and Gamification interfaces
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'learning' | 'engagement' | 'social' | 'achievement' | 'milestone';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  category: BadgeCategory;
  rarity: BadgeRarity;
  criteria: any;
  points: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
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
  badge?: Badge; // Include full badge details when joined
}

// Quiz and Learning interfaces
export type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type QuizCategory = 'nil_basics' | 'contracts' | 'branding' | 'social_media' | 'compliance' | 'tax_finance' | 'negotiation' | 'legal' | 'marketing' | 'athlete_rights';
export type QuizStatus = 'in_progress' | 'completed' | 'abandoned';

export interface QuizQuestion {
  id: string;
  question: string;
  question_type: string;
  options: any;
  correct_answer: any;
  correct_answer_index: number | null;
  explanation: string | null;
  learning_resources: any;
  category: QuizCategory;
  topic: string | null;
  difficulty: QuizDifficulty;
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
}

export interface UserQuizProgress {
  id: string;
  user_id: string;
  question_id: string;
  attempt_number: number;
  status: QuizStatus;
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
  question?: QuizQuestion; // Include full question details when joined
}

export interface QuizSessionResults {
  total_questions: number;
  correct_answers: number;
  total_points: number;
  total_time_seconds: number;
  score_percentage: number;
  completed_at: string;
}

export interface UserQuizStats {
  total_questions_attempted: number;
  total_questions_correct: number;
  total_points_earned: number;
  average_score_percentage: number;
  total_time_spent_seconds: number;
  quizzes_completed: number;
}

// ============================================================================
// Athlete Enhancement Interfaces (Migration 016)
// ============================================================================

/**
 * Social media platform statistics
 * Stored in users.social_media_stats as JSONB array
 */
export interface SocialMediaStat {
  platform: 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'facebook' | 'linkedin' | 'twitch' | 'snapchat';
  handle: string;
  followers: number;
  engagement_rate: number; // Percentage (0-100)
  verified: boolean;
  last_updated: string; // ISO 8601 timestamp
  notes?: string;
}

/**
 * NIL partnership preferences
 * Stored in users.nil_preferences as JSONB object
 */
export interface NILPreferences {
  // Deal types athlete is interested in
  preferred_deal_types?: Array<
    'sponsored_posts' |
    'brand_ambassador' |
    'appearances' |
    'content_creation' |
    'product_endorsement' |
    'affiliate_marketing' |
    'event_hosting' |
    'consulting'
  >;

  // Compensation range
  min_compensation?: number; // USD
  max_compensation?: number; // USD

  // Partnership duration preference
  preferred_partnership_length?: 'one_time' | '1-3 months' | '3-6 months' | '6-12 months' | '12+ months';

  // Content types willing to create
  content_types_willing?: Array<
    'instagram_posts' |
    'instagram_stories' |
    'instagram_reels' |
    'tiktok_videos' |
    'youtube_videos' |
    'youtube_shorts' |
    'twitter_posts' |
    'blog_posts' |
    'podcast_appearances' |
    'live_streams'
  >;

  // Categories to avoid
  blacklist_categories?: Array<
    'alcohol' |
    'tobacco' |
    'gambling' |
    'cryptocurrency' |
    'adult_content' |
    'political' |
    'pharmaceuticals'
  >;

  // Preferred brand sizes
  preferred_brand_sizes?: Array<'startup' | 'small_business' | 'mid_market' | 'enterprise' | 'fortune_500'>;

  // How flexible on terms
  negotiation_flexibility?: 'firm' | 'somewhat_flexible' | 'very_flexible';

  // Requires agent/parent approval
  requires_agent_approval?: boolean;
  requires_parent_approval?: boolean;

  // Additional preferences
  exclusivity_willing?: boolean; // Willing to do exclusive deals
  usage_rights_consideration?: 'limited' | 'standard' | 'extended' | 'perpetual';
  travel_willing?: boolean;
  max_travel_distance_miles?: number;

  // Response time expectations
  typical_response_time_hours?: number;

  // Notes
  additional_notes?: string;
}

/**
 * Content sample for portfolio
 * Stored in users.content_samples as JSONB array
 */
export interface ContentSample {
  id?: string; // Optional UUID for client-side tracking
  type: 'instagram_post' | 'instagram_story' | 'tiktok_video' | 'youtube_video' | 'twitter_post' | 'blog_post' | 'other';
  url: string;
  description?: string;
  platform?: string;

  // Engagement metrics
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  engagement_rate?: number;

  // Metadata
  date: string; // ISO 8601 date
  sponsored: boolean; // Was this sponsored content?
  brand?: string; // Brand name if sponsored
  campaign_type?: string;

  // Media
  thumbnail_url?: string;

  // Display
  featured?: boolean; // Show prominently in profile
  display_order?: number;
}

/**
 * Enhanced Athlete Profile with new fields
 * Extends the existing AthleteProfile interface
 */
export interface EnhancedAthleteProfile extends AthleteProfile {
  // Interest fields
  hobbies?: string[];
  content_creation_interests?: string[];
  brand_affinity?: string[];
  lifestyle_interests?: string[];
  causes_care_about?: string[];

  // Social media
  social_media_stats?: SocialMediaStat[];

  // NIL preferences
  nil_preferences?: NILPreferences;

  // Profile enrichment
  bio?: string;
  profile_video_url?: string;
  content_samples?: ContentSample[];

  // Calculated fields (read-only, auto-updated by DB triggers)
  total_followers?: number;
  avg_engagement_rate?: number;
  profile_completion_score?: number;
}

/**
 * Matchmaking score breakdown
 * Used by matchmaking algorithm to explain why athlete was matched
 */
export interface MatchScore {
  athlete_id: string;
  total_score: number; // 0-100
  breakdown: {
    brand_values_match: number; // 0-20
    interests_alignment: number; // 0-20
    campaign_type_fit: number; // 0-15
    budget_compatibility: number; // 0-15
    geographic_match: number; // 0-10
    audience_demographics: number; // 0-10
    engagement_quality: number; // 0-10
  };
  reasons: string[]; // Human-readable reasons for the match
  concerns?: string[]; // Potential concerns or mismatches
}

/**
 * Matchmaking query parameters
 * Used when agencies search for athletes
 */
export interface MatchmakingQuery {
  // Agency details (from agency profile)
  agency_id: string;
  budget_range?: string;
  campaign_interests?: string[];
  geographic_focus?: string[];
  brand_values?: string[];
  target_demographics?: {
    age_range?: { min: number; max: number };
    gender?: string[];
    interests?: string[];
  };

  // Additional filters
  min_followers?: number;
  max_followers?: number;
  min_engagement_rate?: number;
  sports?: string[];
  schools?: string[];
  graduation_years?: number[];

  // Sorting
  sort_by?: 'match_score' | 'followers' | 'engagement' | 'profile_completion';
  sort_order?: 'asc' | 'desc';

  // Pagination
  limit?: number;
  offset?: number;
}

// ============================================================================
// NIL Deals & Matchmaking Interfaces (Migrations 018-021)
// ============================================================================

/**
 * NIL Deal - Represents a deal between an athlete and an agency/brand
 * Created in Migration 018
 */
export interface NILDeal {
  id: string;
  athlete_id: string;
  agency_id: string;

  // Deal basics
  deal_title: string;
  description?: string;
  deal_type: 'sponsorship' | 'endorsement' | 'appearance' | 'content_creation' | 'social_media' | 'merchandise' | 'licensing' | 'event' | 'other';
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'expired' | 'on_hold';

  // Financial
  compensation_amount?: number;
  currency?: string;
  payment_terms?: string;
  payment_status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'disputed';

  // Timeline
  start_date?: string;
  end_date?: string;
  auto_renew?: boolean;

  // Deliverables
  deliverables?: Array<{
    type: string;
    description: string;
    deadline?: string;
    status?: string;
  }>;

  // Contract
  contract_file_url?: string;
  contract_signed_at?: string;
  contract_signed_by_athlete?: boolean;
  contract_signed_by_agency?: boolean;

  // Payment schedule
  payment_schedule?: Array<{
    amount: number;
    due_date: string;
    status: string;
    paid_at?: string;
  }>;

  // Compliance
  requires_school_approval?: boolean;
  school_approved?: boolean;
  school_approved_at?: string;
  school_approved_by?: string;

  requires_parent_approval?: boolean;
  parent_approved?: boolean;
  parent_approved_at?: string;
  parent_approved_by?: string;

  compliance_checked?: boolean;
  compliance_notes?: string;

  // Performance
  performance_metrics?: {
    impressions?: number;
    engagement_rate?: number;
    clicks?: number;
    [key: string]: any;
  };

  // Metadata
  tags?: string[];
  notes?: string;
  internal_notes?: string;

  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * Agency-Athlete Match - Represents a matchmaking result
 * Created in Migration 019
 */
export interface AgencyAthleteMatch {
  id: string;
  agency_id: string;
  athlete_id: string;

  // Scoring
  match_score: number;  // 0-100
  score_breakdown: {
    brand_values?: number;
    interests?: number;
    campaign_fit?: number;
    budget?: number;
    geography?: number;
    demographics?: number;
    engagement?: number;
  };

  // Match insights
  match_reason?: string;
  match_highlights?: string[];

  // Status and workflow
  status: 'suggested' | 'saved' | 'contacted' | 'interested' | 'in_discussion' | 'partnered' | 'rejected' | 'expired';

  // Communication
  contacted_at?: string;
  contacted_by?: string;
  contact_method?: string;

  // Response
  athlete_response_at?: string;
  athlete_response_status?: string;

  // Notes
  agency_notes?: string;
  athlete_notes?: string;

  // Deal conversion
  deal_id?: string;
  deal_created_at?: string;

  // Feedback
  agency_feedback_rating?: number;
  athlete_feedback_rating?: number;
  feedback_comments?: string;

  // Algorithm metadata
  algorithm_version?: string;
  match_factors_used?: any;
  athlete_profile_snapshot?: any;
  agency_criteria_snapshot?: any;

  // Timestamps
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

/**
 * School Administrator - Manages athletes and compliance for a school
 * Created in Migration 020
 */
export interface SchoolAdministrator {
  id: string;
  user_id: string;

  // School info
  school_id?: string;
  school_name: string;
  school_division?: string;

  // Admin details
  admin_role: 'compliance_officer' | 'athletic_director' | 'assistant_ad' | 'coach_coordinator' | 'nil_coordinator' | 'super_admin';
  title?: string;
  department?: string;

  // Permissions
  permissions: {
    can_view_athletes?: boolean;
    can_approve_deals?: boolean;
    can_manage_admins?: boolean;
    can_bulk_create?: boolean;
    can_view_analytics?: boolean;
    [key: string]: any;
  };

  // Contact
  office_phone?: string;
  office_email?: string;

  // Status
  is_active: boolean;
  verified: boolean;
  verified_at?: string;

  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * School Account Batch - Bulk account creation for schools
 * Created in Migration 020
 */
export interface SchoolAccountBatch {
  id: string;

  // School and admin
  school_id?: string;
  school_name: string;
  admin_id: string;

  // Batch details
  batch_name: string;
  description?: string;

  // File upload
  csv_file_url?: string;
  csv_file_name?: string;

  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

  // Counts
  total_athletes: number;
  processed_count: number;
  success_count: number;
  failed_count: number;

  // Results
  created_user_ids?: string[];
  error_log?: Array<{
    row: number;
    email: string;
    error: string;
    timestamp: string;
  }>;

  // Configuration
  column_mapping?: {
    [key: string]: string;
  };
  send_welcome_emails?: boolean;
  auto_assign_coach?: boolean;
  default_permissions?: any;

  // Timestamps
  created_at: string;
  processing_started_at?: string;
  completed_at?: string;
  cancelled_at?: string;

  // Audit
  created_by?: string;
}

/**
 * Compliance Consent - Tracks consent for NIL deals
 * Created in Migration 020
 */
export interface ComplianceConsent {
  id: string;

  // Relationships
  athlete_id: string;
  deal_id?: string;

  // Consent details
  consent_type: 'athlete_consent' | 'parent_consent' | 'school_approval' | 'state_compliance' | 'ncaa_compliance';

  // Consenting party
  consented_by_user_id?: string;
  consented_by_name?: string;
  consented_by_title?: string;

  // Documentation
  consent_document_url?: string;
  consent_method?: string;

  // Legal metadata
  ip_address?: string;
  user_agent?: string;
  consent_language?: string;

  // Verification
  verified: boolean;
  verified_by?: string;
  verified_at?: string;

  // Validity
  consented_at: string;
  expires_at?: string;
  revoked_at?: string;
  revoked_by?: string;
  revocation_reason?: string;

  // Context
  notes?: string;
  school_name?: string;
  state?: string;

  // Requirements
  requirements_met?: {
    ncaa_cleared?: boolean;
    state_cleared?: boolean;
    school_cleared?: boolean;
    age_verified?: boolean;
    [key: string]: any;
  };

  // Audit
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Phase 5: FMV (Fair Market Value) System Interfaces (Migration 022-027)
// ============================================================================

/**
 * FMV Tier - Ranking tier based on FMV score
 */
export type FMVTier = 'elite' | 'high' | 'medium' | 'developing' | 'emerging';

/**
 * FMV Score Breakdown - Category scores that make up total FMV
 */
export interface FMVScoreBreakdown {
  social_score: number;      // 0-30 points
  athletic_score: number;    // 0-30 points
  market_score: number;      // 0-20 points
  brand_score: number;       // 0-20 points
}

/**
 * Improvement Suggestion - Actionable recommendation to improve FMV score
 */
export interface ImprovementSuggestion {
  area: 'social' | 'athletic' | 'market' | 'brand';
  current: string;           // Current state (e.g., "5K followers")
  target: string;            // Target state (e.g., "10K followers")
  action: string;            // Specific steps to take
  impact: string;            // Expected impact (e.g., "+6 points")
  priority: 'high' | 'medium' | 'low';
}

/**
 * FMV Score History Entry - Historical tracking of score changes
 */
export interface FMVScoreHistory {
  date: string;              // ISO 8601 timestamp
  score: number;             // FMV score at that time
  tier: FMVTier;            // Tier at that time
}

/**
 * Athlete FMV Data - Complete FMV profile for an athlete
 * Created in Migration 022
 */
export interface AthleteFMVData {
  id: string;
  athlete_id: string;

  // Overall FMV
  fmv_score: number;         // 0-100
  fmv_tier: FMVTier;

  // Category breakdowns
  social_score: number;      // 0-30
  athletic_score: number;    // 0-30
  market_score: number;      // 0-20
  brand_score: number;       // 0-20

  // Deal value estimates
  estimated_deal_value_low: number;
  estimated_deal_value_mid: number;
  estimated_deal_value_high: number;

  // Analysis (JSONB)
  improvement_suggestions: ImprovementSuggestion[];
  strengths: string[];
  weaknesses: string[];
  score_history: FMVScoreHistory[];

  // Comparables
  comparable_athletes: string[];  // UUID array of similar athletes

  // Rankings
  percentile_rank?: number;       // 0-100
  rank_in_sport?: number;
  total_athletes_in_sport?: number;

  // Privacy controls
  is_public_score: boolean;       // Default false (private)

  // Rate limiting
  last_calculation_date?: string;
  next_calculation_date?: string;
  calculation_count_today: number;
  last_calculation_reset_date: string;

  // Notifications
  last_notified_score?: number;
  last_notification_date?: string;

  // Metadata
  calculation_version: string;
  created_at: string;
  updated_at: string;
}

/**
 * State NIL Rules - State-by-state NIL compliance regulations
 * Created in Migration 023, enhanced in Migration 030
 */
export interface StateNILRules {
  state_code: string;              // 'KY', 'CA', etc.
  state_name: string;

  // General permissions
  allows_nil: boolean;
  high_school_allowed: boolean;
  college_allowed: boolean;
  school_approval_required: boolean;

  // Prohibited categories
  prohibited_categories: string[]; // ['alcohol', 'gambling', etc.]

  // Additional requirements
  disclosure_required: boolean;
  agent_registration_required: boolean;
  financial_literacy_required: boolean;

  // Freeform restrictions (migration 028)
  restrictions?: string[];

  // Documentation
  rules_summary?: string;
  rules_url?: string;
  effective_date?: string;

  // Athletic association (migration 030)
  athletic_association_name?: string;
  athletic_association_url?: string;

  // HS effective date
  hs_nil_effective_date?: string;

  // Permission flags
  can_earn_money?: boolean;
  can_use_agent?: boolean;
  can_sign_contracts?: boolean;
  can_use_school_marks?: boolean;
  can_mention_school?: boolean;
  can_wear_uniform_in_content?: boolean;

  // Parental requirements
  requires_parental_consent?: boolean;
  min_age_without_consent?: number;
  parent_must_sign_contracts?: boolean;

  // School involvement
  school_can_facilitate_deals?: boolean;
  must_notify_school?: boolean;
  must_notify_athletic_association?: boolean;
  disclosure_deadline_days?: number;
  requires_pre_approval?: boolean;

  // Restriction booleans
  cannot_conflict_with_school_sponsors?: boolean;
  cannot_use_during_school_hours?: boolean;
  cannot_interfere_with_academics?: boolean;
  cannot_promote_during_games?: boolean;

  // Compensation limits
  has_compensation_cap?: boolean;
  compensation_cap_amount?: number;
  compensation_cap_period?: string;

  // Dashboard summaries (JSONB)
  summary_can_do?: string[];
  summary_cannot_do?: string[];
  summary_must_do?: string[];
  summary_warnings?: string[];

  // Source/verification
  primary_source_url?: string;
  secondary_sources?: string[];
  last_verified_date?: string;
  verified_by?: string;

  // Legal
  relevant_legislation?: string;
  legislation_url?: string;

  // Summaries
  short_summary?: string;
  detailed_summary?: string;

  // Disclaimer
  disclaimer?: string;

  // Metadata
  last_updated: string;
  created_at: string;
}

/**
 * Scraped Athlete Data - External rankings from recruiting services
 * Created in Migration 024
 */
export interface ScrapedAthleteData {
  id: string;

  // Source
  source: 'on3' | 'rivals' | '247sports' | 'espn' | 'maxpreps' | 'other';
  source_athlete_id?: string;
  source_url?: string;

  // Athlete identification
  athlete_name: string;
  sport?: string;
  position?: string;
  school_name?: string;
  state?: string;
  graduation_year?: number;

  // Rankings
  overall_ranking?: number;
  position_ranking?: number;
  state_ranking?: number;
  composite_rating?: number;     // 0.00-1.00

  // NIL value
  estimated_nil_value?: number;
  star_rating?: number;          // 1-5 stars

  // Matching
  verified: boolean;
  matched_user_id?: string;
  match_confidence?: number;     // 0.00-1.00

  // Raw data
  raw_data?: any;

  // Metadata
  scraped_at: string;
  last_updated?: string;
  created_at: string;
}

/**
 * Institution Profile - Schools and universities
 * Created in Migration 025
 */
export interface InstitutionProfile {
  id: string;                    // References users.id

  // Basic info
  institution_name: string;
  institution_type: 'high_school' | 'community_college' | 'junior_college' | 'college' | 'university' | 'prep_school' | 'academy';

  // Official identifiers
  nces_id?: string;              // National Center for Education Statistics ID
  state_code?: string;
  county?: string;
  district?: string;

  // Location
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;

  // Contact
  phone?: string;
  website_url?: string;
  athletic_department_email?: string;
  athletic_director_name?: string;
  compliance_officer_email?: string;

  // Branding
  custom_url_slug?: string;      // e.g., 'kentucky-central-hs'
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  custom_splash_page?: {
    logo_url?: string;
    primary_color?: string;
    welcome_message?: string;
    background_image?: string;
    [key: string]: any;
  };

  // QR code
  qr_code_url?: string;
  athlete_signup_url?: string;

  // Compliance
  ferpa_compliant: boolean;
  requires_approval_for_nil_deals: boolean;
  automatic_athlete_association: boolean;
  email_domains?: string[];

  // Statistics
  total_athletes: number;
  total_active_nil_deals: number;
  total_nil_value: number;

  // Permissions
  can_create_bulk_accounts: boolean;
  can_view_athlete_analytics: boolean;
  can_approve_nil_deals: boolean;

  // Verification
  verified: boolean;
  verified_at?: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

/**
 * Business Profile - Local businesses and brands (simpler than agencies)
 * Created in Migration 026
 */
export interface BusinessProfile {
  id: string;                    // References users.id

  // Basic info
  business_name: string;
  business_type: 'local_business' | 'restaurant' | 'retail_store' | 'automotive' | 'fitness_gym' |
                 'healthcare' | 'real_estate' | 'law_firm' | 'financial_services' | 'technology' |
                 'entertainment' | 'hospitality' | 'nonprofit' | 'national_brand' | 'startup' | 'other';
  industry?: string;
  description?: string;

  // Contact
  contact_person_name?: string;
  contact_person_title?: string;
  email?: string;
  phone?: string;
  website_url?: string;

  // Location
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;

  // Social media
  instagram_handle?: string;
  facebook_page?: string;
  twitter_handle?: string;
  linkedin_url?: string;

  // NIL preferences
  looking_for?: string[];        // ['social_media_posts', 'event_appearances', etc.]
  preferred_sports?: string[];
  budget_range?: 'under_1k' | '1k_5k' | '5k_10k' | '10k_25k' | '25k_50k' | '50k_100k' | '100k_plus';
  estimated_monthly_budget?: number;

  // Geographic focus
  geographic_focus?: string[];   // State codes
  local_market_only: boolean;

  // Target criteria
  min_follower_count?: number;
  preferred_athlete_level?: string;
  preferred_content_types?: string[];

  // Deal templates
  default_deal_terms?: {
    duration_days?: number;
    payment_terms?: string;
    deliverables?: string[];
    [key: string]: any;
  };

  // Verification
  verified: boolean;
  verified_at?: string;
  verification_method?: string;

  // Statistics
  total_deals_created: number;
  total_deals_completed: number;
  total_spent: number;
  average_deal_value?: number;

  // Ratings
  rating_score?: number;         // 0.00-5.00
  total_ratings: number;

  // Settings
  auto_approve_deals: boolean;
  requires_contract: boolean;
  payment_method_on_file: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Phase 6B: School System Interfaces (Migration 027)
// ============================================================================

/**
 * School - Distribution channel for student athlete signups
 * NOT a user account - schools facilitate athlete registration
 */
export interface School {
  id: string;

  // Basic Info
  school_name: string;
  school_district?: string;
  state: string;
  school_type?: 'high_school' | 'college' | 'university' | 'community_college';

  // URL Configuration
  custom_slug: string;
  signup_url?: string;  // Generated: https://chatnil.io/school/{slug}/signup

  // QR Code & Branding
  qr_code_url?: string;
  logo_url?: string;
  primary_color?: string;

  // Statistics
  students_registered: number;
  students_completed: number;

  // Contact Information
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;

  // Status
  active: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// ============================================================================
// Dashboard Interfaces
// ============================================================================

/**
 * Dashboard Metrics - Aggregated stats for athlete dashboard
 */
export interface DashboardMetrics {
  totalEarnings: number;
  earningsChange: number;
  activeDeals: number;
  completedDeals: number;
  profileViews: number;
  viewsChange: number;
  fmvScore: number;
  fmvChange: number;
}

/**
 * Opportunity - Matched brand opportunity
 */
export interface Opportunity {
  id: string;
  title: string;
  brand_name: string;
  description: string;
  compensation_min: number;
  compensation_max: number;
  deadline: string;
  match_score: number;
  status: 'open' | 'applied' | 'closed';
}

/**
 * Notification - User notification
 */
export interface Notification {
  id: string;
  user_id: string;
  type: 'deal' | 'message' | 'fmv' | 'profile' | 'payment';
  message: string;
  url: string;
  read: boolean;
  created_at: string;
}

/**
 * Event - Calendar event from deal deliverables
 */
export interface Event {
  id: string;
  title: string;
  type: 'deliverable' | 'payment' | 'meeting' | 'event';
  date: string;
  deal_id?: string;
  deal_title?: string;
}

/**
 * Quick Stats - Performance metrics
 */
export interface QuickStats {
  responseRate: number;
  avgResponseTime: string;
  dealSuccessRate: number;
  profileGrowth: number;
}

// Education & Learning Dashboard Types
export interface QuizAttempt {
  id: string;
  category: string;
  score: number;
  completedAt: string;
  questionsCorrect: number;
  questionsTotal: number;
}

export interface QuizProgress {
  recentAttempts: QuizAttempt[];
  totalQuizzes: number;
  averageScore: number;
  categoriesCompleted: number;
  nextRecommended: string;
}

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  rarity: string;
  points: number;
  earnedAt: string;
}

export interface BadgeProgress {
  recentBadges: BadgeInfo[];
  totalBadges: number;
  earnedCount: number;
  totalPoints: number;
  completionPercentage: number;
}

export interface RecentChat {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  messageCount: number;
}

export interface LearningStats {
  knowledgeLevel: string;
  averageScore: number;
  badgesEarned: number;
  quizStreak: number;
  scoreChange: number;
}

// ============================================================================
// Documents & File Management Interfaces (Migration 050)
// ============================================================================

/**
 * User Document - Represents a file uploaded by user in chat
 * Stored in Supabase Storage and tracked in chat_attachments table
 */
export interface UserDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storagePath: string;
  publicUrl?: string;
  createdAt: string;
  sessionId: string;
  sessionTitle: string;
  messageId?: string;
  userId: string;
}

/**
 * Documents grouped by chat session
 */
export interface DocumentsBySession {
  sessionId: string;
  sessionTitle: string;
  sessionUpdatedAt: string;
  documents: UserDocument[];
  totalSize: number;
}

/**
 * Document storage statistics for user
 */
export interface DocumentsStats {
  totalDocuments: number;
  totalSize: number;
  storageLimit: number;
  storageUsedPercentage: number;
  documentsByType: Record<string, number>;
  recentDocumentsCount: number;
}

/**
 * File upload request/response
 */
export interface FileUploadRequest {
  file: File;
  sessionId: string;
  messageId?: string;
}

export interface FileUploadResponse {
  success: boolean;
  document?: UserDocument;
  error?: string;
}

// ============================================================================
// Agency Platform Interfaces (Migration 040)
// ============================================================================

/**
 * Athlete Public Profile - Public-facing athlete data for agency discovery
 * Created in Migration 040
 */
export interface AthletePublicProfile {
  id: string;
  user_id: string;
  username?: string;

  // Basic Info
  display_name: string;
  bio?: string;
  sport: string;
  position?: string;
  school_name: string;
  school_level: 'high_school' | 'college';
  graduation_year?: number;
  state?: string;
  city?: string;

  // Social Media Handles
  instagram_handle?: string;
  tiktok_handle?: string;
  twitter_handle?: string;
  youtube_channel?: string;

  // Social Media Stats (numeric)
  instagram_followers: number;
  instagram_engagement_rate?: number;
  tiktok_followers: number;
  tiktok_engagement_rate?: number;
  twitter_followers: number;
  youtube_subscribers: number;

  // Computed total followers (generated column)
  total_followers: number;

  // FMV (Fair Market Value)
  estimated_fmv_min?: number;
  estimated_fmv_max?: number;
  avg_engagement_rate?: number;

  // Brand Fit
  content_categories?: string[];
  brand_values?: string[];
  audience_demographics?: {
    age_range?: string;
    gender?: string;
    location?: string;
    [key: string]: any;
  };

  // Availability
  is_available_for_partnerships: boolean;
  preferred_partnership_types?: string[];
  response_rate?: number;
  avg_response_time_hours?: number;

  // Verification
  is_verified: boolean;
  verification_badges?: string[];

  // Statistics
  total_partnerships_completed?: number;
  total_campaign_impressions?: number;
  avg_campaign_performance?: number;

  // Activity
  last_active_at?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Athlete Portfolio Item - Showcase content samples and past work
 * Created in Migration 040
 */
export interface AthletePortfolioItem {
  id: string;
  athlete_user_id: string;

  // Item Details
  title: string;
  description?: string;
  item_type: 'social_post' | 'video' | 'photo_shoot' | 'event' | 'campaign' | 'collaboration' | 'other';
  content_url?: string;
  thumbnail_url?: string;

  // Platform
  platform?: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'other';

  // Metrics
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  engagement_rate?: number;

  // Campaign Info
  sponsored: boolean;
  brand_name?: string;
  campaign_type?: string;
  compensation_received?: number;

  // Media
  media_files?: string[];

  // Display
  is_featured: boolean;
  display_order: number;
  is_public: boolean;

  // Metadata
  published_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Agency Saved Search - Saved filter combinations for quick access
 * Created in Migration 040
 */
export interface AgencySavedSearch {
  id: string;
  agency_user_id: string;

  // Search Details
  search_name: string;
  description?: string;

  // Filter Criteria
  filters: {
    sports?: string[];
    states?: string[];
    school_levels?: string[];
    min_followers?: number;
    max_followers?: number;
    min_fmv?: number;
    max_fmv?: number;
    min_engagement?: number;
    content_categories?: string[];
    brand_values?: string[];
    available_only?: boolean;
    [key: string]: any;
  };

  // Settings
  notify_new_matches: boolean;
  last_checked?: string;
  match_count?: number;

  // Metadata
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Agency Athlete List - Organize athletes into collections
 * Created in Migration 040
 */
export interface AgencyAthleteList {
  id: string;
  agency_user_id: string;

  // List Details
  list_name: string;
  description?: string;
  color?: string;
  icon?: string;

  // Privacy
  is_shared: boolean;
  shared_with_user_ids?: string[];

  // Metadata
  athlete_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Agency Athlete List Item - Many-to-many relationship for lists
 * Created in Migration 040
 */
export interface AgencyAthleteListItem {
  id: string;
  list_id: string;
  athlete_user_id: string;

  // Metadata
  notes?: string;
  added_at: string;
  added_by_user_id?: string;
}

/**
 * Agency Campaign - Marketing campaigns created by agencies
 * Created in Migration 040
 */
export interface AgencyCampaign {
  id: string;
  agency_user_id: string;

  // Campaign Details
  campaign_name: string;
  description?: string;
  brand_name: string;
  campaign_type?: string;

  // Budget
  total_budget?: number;
  budget_per_athlete?: number;
  currency: string;

  // Timeline
  start_date?: string;
  end_date?: string;
  application_deadline?: string;

  // Status
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

  // Targeting Criteria
  target_sports?: string[];
  target_states?: string[];
  target_school_levels?: string[];
  min_followers?: number;
  max_followers?: number;
  min_engagement_rate?: number;
  target_content_categories?: string[];

  // Requirements
  required_deliverables?: Array<{
    type: string;
    quantity: number;
    description?: string;
    deadline?: string;
  }>;
  campaign_guidelines?: string;
  terms_and_conditions?: string;

  // Limits
  max_athletes?: number;
  athletes_invited_count: number;
  athletes_accepted_count: number;

  // Performance
  total_impressions?: number;
  total_engagement?: number;
  avg_engagement_rate?: number;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by_user_id?: string;
}

/**
 * Campaign Athlete Invite - Track athlete invitations to campaigns
 * Created in Migration 040
 */
export interface CampaignAthleteInvite {
  id: string;
  campaign_id: string;
  athlete_user_id: string;
  agency_user_id: string;

  // Invite Details
  invite_message?: string;
  compensation_offered?: number;

  // Status
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'expired';

  // Response
  athlete_response_message?: string;
  athlete_response_at?: string;

  // Timeline
  invited_at: string;
  expires_at?: string;
  accepted_at?: string;
  declined_at?: string;

  // Deal Conversion
  deal_id?: string;
  deal_created_at?: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

/**
 * Agency Athlete Message - Direct messaging between agencies and athletes
 * Created in Migration 040
 */
export interface AgencyAthleteMessage {
  id: string;
  agency_user_id: string;
  athlete_user_id: string;

  // Thread
  thread_id: string;
  parent_message_id?: string;

  // Message Content
  message_content: string;
  subject?: string;

  // Sender
  sender_type: 'agency' | 'athlete';
  sender_user_id: string;

  // Status
  is_read: boolean;
  read_at?: string;
  is_archived: boolean;

  // Related Items
  related_campaign_id?: string;
  related_deal_id?: string;

  // Attachments
  attachments?: Array<{
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
  }>;

  // Metadata
  sent_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Athlete Discovery Filters - Query parameters for athlete search
 */
export interface AthleteDiscoveryFilters {
  // Sport & School
  sports?: string[];
  states?: string[];
  school_levels?: ('high_school' | 'college')[];

  // Followers & Engagement
  min_followers?: number;
  max_followers?: number;
  min_engagement?: number;

  // FMV & Budget
  min_fmv?: number;
  max_fmv?: number;

  // Content & Brand Fit
  content_categories?: string[];
  brand_values?: string[];

  // Availability
  available_only?: boolean;

  // Search
  search?: string;

  // Sorting
  sort?: 'best_match' | 'followers_desc' | 'followers_asc' | 'engagement_desc' | 'fmv_desc' | 'fmv_asc';

  // Pagination
  page?: number;
  limit?: number;
}

/**
 * Athlete Discovery Response - API response from discovery endpoint
 */
export interface AthleteDiscoveryResponse {
  success: boolean;
  data: {
    athletes: AthletePublicProfile[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: Partial<AthleteDiscoveryFilters>;
    sort: string;
  };
}