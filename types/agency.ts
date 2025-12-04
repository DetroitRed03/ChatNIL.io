/**
 * Agency Platform Types
 * Agency discovery, campaigns, portfolios, and athlete-agency communications
 */

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
