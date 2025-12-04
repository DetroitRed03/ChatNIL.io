/**
 * Profile Data Utilities
 *
 * Functions for fetching, calculating, and managing athlete profile data
 */

export interface SocialMediaStats {
  instagram?: {
    followers: number;
    engagement_rate: number;
    handle: string;
  };
  tiktok?: {
    followers: number;
    engagement_rate: number;
    handle: string;
  };
  twitter?: {
    followers: number;
    engagement_rate: number;
    handle: string;
  };
  youtube?: {
    subscribers: number;
    handle: string;
  };
}

export interface SecondarySport {
  sport: string;
  position?: string;
}

export interface NILPreferences {
  preferred_deal_types?: string[];
  min_compensation?: number;
  max_compensation?: number;
  preferred_partnership_length?: string;
  content_types_willing?: string[];
  travel_willing?: boolean;
  blacklist_categories?: string[];
  requires_agent_approval?: boolean;
  requires_parent_approval?: boolean;
  additional_notes?: string;
}

export interface ProfileData {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  bio?: string;
  school_name?: string;
  graduation_year?: number;
  primary_sport?: string;
  position?: string;
  achievements?: string[];
  social_media_stats?: SocialMediaStats;
  total_followers?: number;
  avg_engagement_rate?: number;
  brand_values?: string[];
  profile_completion_score?: number;
  // FMV data
  fmv_score?: number | null;
  fmv_tier?: string | null;
  percentile_rank?: number | null;
  // NIL data
  active_deals_count?: number;
  // Additional fields
  team_name?: string;
  division?: string;
  major?: string;
  gpa?: number;
  // Secondary sports
  secondary_sports?: SecondarySport[];
  // Coach information
  coach_name?: string;
  coach_email?: string;
  // Interests
  content_creation_interests?: string[];
  lifestyle_interests?: string[];
  hobbies?: string[];
  causes_care_about?: string[];
  brand_affinity?: string[];
  nil_interests?: string[];
  nil_goals?: string[];
  nil_concerns?: string[];
  // NIL preferences
  nil_preferences?: NILPreferences;
  // Portfolio
  content_samples?: any;
  profile_video_url?: string;
  // Photos
  profile_photo_url?: string | null;
  cover_photo_url?: string | null;
  profile_photo_uploaded_at?: string | null;
  cover_photo_uploaded_at?: string | null;
  // Athlete Stats
  height_inches?: number | null;
  weight_lbs?: number | null;
  jersey_number?: number | null;
}

/**
 * Calculate total followers across all social platforms
 */
export function calculateTotalFollowers(socialStats?: SocialMediaStats): number {
  if (!socialStats) return 0;

  const instagram = socialStats.instagram?.followers || 0;
  const tiktok = socialStats.tiktok?.followers || 0;
  const twitter = socialStats.twitter?.followers || 0;
  const youtube = socialStats.youtube?.subscribers || 0;

  return instagram + tiktok + twitter + youtube;
}

/**
 * Calculate average engagement rate across platforms
 */
export function calculateAvgEngagementRate(socialStats?: SocialMediaStats): number {
  if (!socialStats) return 0;

  const rates: number[] = [];

  if (socialStats.instagram?.engagement_rate) {
    rates.push(socialStats.instagram.engagement_rate);
  }
  if (socialStats.tiktok?.engagement_rate) {
    rates.push(socialStats.tiktok.engagement_rate);
  }
  if (socialStats.twitter?.engagement_rate) {
    rates.push(socialStats.twitter.engagement_rate);
  }

  if (rates.length === 0) return 0;

  return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
}

/**
 * Calculate estimated Fair Market Value (FMV) based on social metrics
 *
 * Formula factors:
 * - Total followers
 * - Average engagement rate
 * - Number of platforms
 * - Sport popularity
 */
export function calculateEstimatedFMV(profile: Partial<ProfileData>): {
  min: number;
  max: number;
  average: number;
} {
  const totalFollowers = profile.total_followers || 0;
  const engagementRate = profile.avg_engagement_rate || 0;

  // Base rate per follower (in cents)
  const baseRatePerFollower = 5; // $0.05 per follower

  // Engagement multiplier (1.0 - 3.0x)
  const engagementMultiplier = 1 + (engagementRate / 10);

  // Calculate base value
  const baseValue = totalFollowers * baseRatePerFollower;

  // Apply engagement multiplier
  const estimatedValue = baseValue * engagementMultiplier;

  // Return range (±30% variance)
  const variance = estimatedValue * 0.3;

  return {
    min: Math.max(0, Math.round(estimatedValue - variance)),
    max: Math.round(estimatedValue + variance),
    average: Math.round(estimatedValue),
  };
}

/**
 * Format follower count with K/M suffixes
 */
export function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Format engagement rate as percentage
 */
export function formatEngagementRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

/**
 * Format FMV value as currency
 */
export function formatFMV(value: number): string {
  // Value is in cents, convert to dollars
  const dollars = value / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  }
  return `$${dollars.toFixed(0)}`;
}

/**
 * Get profile strength indicator based on completion score
 */
export function getProfileStrength(score: number): {
  label: string;
  color: 'red' | 'yellow' | 'green' | 'emerald';
  icon: string;
} {
  if (score >= 80) {
    return { label: 'Excellent', color: 'emerald', icon: '⭐' };
  }
  if (score >= 60) {
    return { label: 'Good', color: 'green', icon: '✓' };
  }
  if (score >= 40) {
    return { label: 'Fair', color: 'yellow', icon: '•' };
  }
  return { label: 'Needs Work', color: 'red', icon: '!' };
}

/**
 * Fetch profile data by username
 */
export async function fetchProfileByUsername(username: string): Promise<ProfileData | null> {
  try {
    const response = await fetch(`/api/athletes/${username}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    return data.profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: Partial<ProfileData>): Promise<ProfileData> {
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, updates }),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const data = await response.json();
    return data.profile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Fetch own profile data
 */
export async function fetchOwnProfile(userId: string): Promise<ProfileData> {
  try {
    const response = await fetch(`/api/profile?userId=${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    return data.profile;
  } catch (error) {
    console.error('Error fetching own profile:', error);
    throw error;
  }
}
