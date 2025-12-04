/**
 * Athlete Types
 * Athlete profiles, enhancements, social media, and NIL preferences
 */

import type { AthleteProfile } from './auth';

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
