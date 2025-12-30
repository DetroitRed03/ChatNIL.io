/**
 * Agency Platform Types
 * Agency discovery, campaigns, portfolios, and athlete-agency communications
 */

// ============================================================================
// ENUMS & CONSTANTS (Migration 020)
// ============================================================================

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

export type InteractionStatus =
  | 'suggested'
  | 'viewed'
  | 'saved'
  | 'contacted'
  | 'interested'
  | 'in_discussion'
  | 'deal_proposed'
  | 'declined'
  | 'archived';

export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  startup: '1-10 employees',
  small: '11-50 employees',
  medium: '51-200 employees',
  large: '201-1000 employees',
  enterprise: '1000+ employees',
};

export const INTERACTION_STATUS_LABELS: Record<InteractionStatus, string> = {
  suggested: 'Suggested',
  viewed: 'Viewed',
  saved: 'Saved',
  contacted: 'Contacted',
  interested: 'Interested',
  in_discussion: 'In Discussion',
  deal_proposed: 'Deal Proposed',
  declined: 'Declined',
  archived: 'Archived',
};

// ============================================================================
// INDUSTRY OPTIONS (Migration 020)
// ============================================================================

export interface IndustryOption {
  id: string;
  name: string;
  display_name: string;
  icon: string;
  sort_order: number;
}

export const INDUSTRIES: IndustryOption[] = [
  { id: '1', name: 'apparel', display_name: 'Apparel & Fashion', icon: 'shirt', sort_order: 1 },
  { id: '2', name: 'sports_equipment', display_name: 'Sports Equipment', icon: 'dumbbell', sort_order: 2 },
  { id: '3', name: 'food_beverage', display_name: 'Food & Beverage', icon: 'utensils', sort_order: 3 },
  { id: '4', name: 'technology', display_name: 'Technology', icon: 'laptop', sort_order: 4 },
  { id: '5', name: 'automotive', display_name: 'Automotive', icon: 'car', sort_order: 5 },
  { id: '6', name: 'finance', display_name: 'Finance & Banking', icon: 'landmark', sort_order: 6 },
  { id: '7', name: 'health_fitness', display_name: 'Health & Fitness', icon: 'heart-pulse', sort_order: 7 },
  { id: '8', name: 'entertainment', display_name: 'Entertainment & Media', icon: 'tv', sort_order: 8 },
  { id: '9', name: 'gaming', display_name: 'Gaming & Esports', icon: 'gamepad-2', sort_order: 9 },
  { id: '10', name: 'travel', display_name: 'Travel & Hospitality', icon: 'plane', sort_order: 10 },
  { id: '11', name: 'education', display_name: 'Education', icon: 'graduation-cap', sort_order: 11 },
  { id: '12', name: 'real_estate', display_name: 'Real Estate', icon: 'building', sort_order: 12 },
  { id: '13', name: 'retail', display_name: 'Retail', icon: 'shopping-bag', sort_order: 13 },
  { id: '14', name: 'crypto_web3', display_name: 'Crypto & Web3', icon: 'bitcoin', sort_order: 14 },
  { id: '15', name: 'other', display_name: 'Other', icon: 'briefcase', sort_order: 99 },
];

// ============================================================================
// AGENCY PROFILE (Migration 020)
// ============================================================================

export interface AgencyProfile {
  id: string;
  user_id: string;

  // Company Information
  company_name: string;
  slug: string;
  logo_url?: string;
  website?: string;
  industry: string;
  description?: string;
  tagline?: string;

  // Company Details
  company_size?: CompanySize;
  founded_year?: number;
  headquarters_city?: string;
  headquarters_state?: string;

  // Contact Information
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;

  // Social Links
  linkedin_url?: string;
  instagram_url?: string;
  twitter_url?: string;

  // Onboarding Status
  onboarding_completed: boolean;
  onboarding_completed_at?: string;
  onboarding_step: number;

  // Profile Status
  is_verified: boolean;
  is_active: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface AgencyProfileInsert {
  user_id: string;
  company_name: string;
  slug?: string;
  logo_url?: string;
  website?: string;
  industry: string;
  description?: string;
  tagline?: string;
  company_size?: CompanySize;
  founded_year?: number;
  headquarters_city?: string;
  headquarters_state?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  linkedin_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  onboarding_completed?: boolean;
  onboarding_step?: number;
}

export interface AgencyProfileUpdate {
  company_name?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  description?: string;
  tagline?: string;
  company_size?: CompanySize;
  founded_year?: number;
  headquarters_city?: string;
  headquarters_state?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  linkedin_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string;
  onboarding_step?: number;
  is_verified?: boolean;
  is_active?: boolean;
}

// ============================================================================
// BRAND VALUES (Migration 020)
// ============================================================================

export interface AgencyBrandValue {
  id: string;
  agency_profile_id: string;
  trait_id: string;

  // Priority: 1 = highest, 5 = lowest
  priority: number;

  // Importance weight for matching (0.0-1.0)
  importance_weight: number;

  // Notes on why this value matters
  notes?: string;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Joined data
  trait?: {
    id: string;
    name: string;
    display_name: string;
    category: string;
    description?: string;
  };
}

export interface AgencyBrandValueInsert {
  agency_profile_id: string;
  trait_id: string;
  priority: number;
  importance_weight?: number;
  notes?: string;
}

export interface AgencyBrandValueUpdate {
  priority?: number;
  importance_weight?: number;
  notes?: string;
}

// ============================================================================
// TARGET CRITERIA (Migration 020)
// ============================================================================

export interface AgencyTargetCriteria {
  id: string;
  agency_profile_id: string;

  // Sports Interest
  target_sports: string[];

  // Follower Requirements
  min_followers: number;
  max_followers?: number;

  // Geographic Targeting
  target_states: string[];
  target_regions: string[];

  // School Level Targeting
  target_school_levels: string[];

  // FMV Targeting
  min_fmv?: number;
  max_fmv?: number;

  // Engagement Requirements
  min_engagement_rate?: number;

  // Archetype Preferences
  preferred_archetypes: string[];

  // Additional Preferences (flexible)
  additional_criteria: Record<string, unknown>;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface AgencyTargetCriteriaInsert {
  agency_profile_id: string;
  target_sports?: string[];
  min_followers?: number;
  max_followers?: number;
  target_states?: string[];
  target_regions?: string[];
  target_school_levels?: string[];
  min_fmv?: number;
  max_fmv?: number;
  min_engagement_rate?: number;
  preferred_archetypes?: string[];
  additional_criteria?: Record<string, unknown>;
}

export interface AgencyTargetCriteriaUpdate {
  target_sports?: string[];
  min_followers?: number;
  max_followers?: number;
  target_states?: string[];
  target_regions?: string[];
  target_school_levels?: string[];
  min_fmv?: number;
  max_fmv?: number;
  min_engagement_rate?: number;
  preferred_archetypes?: string[];
  additional_criteria?: Record<string, unknown>;
}

// ============================================================================
// AGENCY-ATHLETE INTERACTIONS (Migration 020)
// ============================================================================

export interface AgencyAthleteInteraction {
  id: string;
  agency_profile_id: string;
  athlete_user_id: string;

  // Current Status
  status: InteractionStatus;

  // Match Information (cached)
  match_score?: number;
  trait_alignment_score?: number;
  criteria_match_score?: number;

  // Interaction History
  first_viewed_at?: string;
  first_contacted_at?: string;
  last_interaction_at?: string;

  // Agency Notes
  agency_notes?: string;

  // Match Breakdown (for UI)
  match_breakdown: MatchBreakdown;

  // Tracking
  view_count: number;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Joined data
  athlete?: AthletePreview;
  agency?: AgencyProfile;
}

export interface MatchBreakdown {
  trait_scores?: {
    trait_id: string;
    trait_name: string;
    athlete_score: number;
    agency_importance: number;
    weighted_match: number;
  }[];
  criteria_matches?: {
    criterion: string;
    matched: boolean;
    details?: string;
  }[];
  overall_explanation?: string;
}

export interface AthletePreview {
  id: string;
  first_name: string;
  last_name: string;
  primary_sport?: string;
  school_name?: string;
  graduation_year?: number;
  total_followers?: number;
  avg_engagement_rate?: number;
  profile_completion_score?: number;
  archetype_name?: string;
}

export interface AgencyAthleteInteractionInsert {
  agency_profile_id: string;
  athlete_user_id: string;
  status?: InteractionStatus;
  match_score?: number;
  trait_alignment_score?: number;
  criteria_match_score?: number;
  agency_notes?: string;
  match_breakdown?: MatchBreakdown;
}

export interface AgencyAthleteInteractionUpdate {
  status?: InteractionStatus;
  match_score?: number;
  trait_alignment_score?: number;
  criteria_match_score?: number;
  first_viewed_at?: string;
  first_contacted_at?: string;
  last_interaction_at?: string;
  agency_notes?: string;
  match_breakdown?: MatchBreakdown;
  view_count?: number;
}

// ============================================================================
// ONBOARDING TYPES (Migration 020)
// ============================================================================

export interface AgencyOnboardingStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
}

export interface AgencyOnboardingState {
  currentStep: number;
  steps: AgencyOnboardingStep[];
  profile: Partial<AgencyProfileInsert>;
  brandValues: AgencyBrandValueInsert[];
  targetCriteria: Partial<AgencyTargetCriteriaInsert>;
}

export const AGENCY_ONBOARDING_STEPS: Omit<AgencyOnboardingStep, 'isComplete'>[] = [
  {
    id: 0,
    title: 'Company Information',
    description: 'Tell us about your company',
  },
  {
    id: 1,
    title: 'Brand Values',
    description: 'Select the values that define your brand',
  },
  {
    id: 2,
    title: 'Target Athletes',
    description: 'Define your ideal athlete profile',
  },
  {
    id: 3,
    title: 'Contact & Social',
    description: 'Add contact information and social links',
  },
];

// ============================================================================
// SEARCH & FILTER TYPES (Migration 020)
// ============================================================================

export interface AthleteSearchFilters {
  query?: string;
  sports?: string[];
  states?: string[];
  school_levels?: string[];
  min_followers?: number;
  max_followers?: number;
  min_fmv?: number;
  max_fmv?: number;
  min_engagement_rate?: number;
  archetypes?: string[];
  graduation_years?: number[];
  sort_by?: 'match_score' | 'followers' | 'engagement' | 'fmv' | 'name';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AthleteSearchResult {
  athletes: AthletePreview[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// ============================================================================
// API RESPONSE TYPES (Migration 020)
// ============================================================================

export interface AgencyApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AgencyProfileWithRelations extends AgencyProfile {
  brand_values: AgencyBrandValue[];
  target_criteria?: AgencyTargetCriteria;
  interaction_count: number;
  saved_athlete_count: number;
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
