export type UserRole = 'athlete' | 'parent' | 'agency';

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

// Extended User interface for application use
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
  profile?: AthleteProfile | ParentProfile | CoachProfile | AgencyProfile;
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