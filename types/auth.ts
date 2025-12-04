/**
 * Authentication & User Types
 * User profiles, relationships, and authentication-related interfaces
 */

import type { UserRole } from './common';

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
