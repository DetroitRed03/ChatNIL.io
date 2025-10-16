/**
 * Athlete Data Helper Library
 * ============================
 * Provides structured options for athlete profile enhancement fields
 * Used in athlete onboarding and profile editing forms
 *
 * Related Migration: 016_athlete_enhancements.sql
 * Related Types: lib/types.ts (SocialMediaStat, NILPreferences, ContentSample)
 */

// ============================================================================
// HOBBIES & INTERESTS
// ============================================================================

export interface HobbyOption {
  value: string;
  label: string;
  emoji: string;
  category: 'creative' | 'active' | 'tech' | 'social' | 'lifestyle';
}

export const HOBBIES: HobbyOption[] = [
  // Creative
  { value: 'photography', label: 'Photography', emoji: '📸', category: 'creative' },
  { value: 'videography', label: 'Videography', emoji: '🎥', category: 'creative' },
  { value: 'music', label: 'Music', emoji: '🎵', category: 'creative' },
  { value: 'art', label: 'Art & Design', emoji: '🎨', category: 'creative' },
  { value: 'writing', label: 'Writing', emoji: '✍️', category: 'creative' },
  { value: 'cooking', label: 'Cooking', emoji: '🍳', category: 'creative' },

  // Active
  { value: 'gaming', label: 'Gaming', emoji: '🎮', category: 'active' },
  { value: 'fitness', label: 'Fitness', emoji: '💪', category: 'active' },
  { value: 'outdoor_activities', label: 'Outdoor Activities', emoji: '🏕️', category: 'active' },
  { value: 'yoga', label: 'Yoga', emoji: '🧘', category: 'active' },
  { value: 'travel', label: 'Travel', emoji: '✈️', category: 'active' },

  // Tech
  { value: 'tech_gadgets', label: 'Tech & Gadgets', emoji: '💻', category: 'tech' },
  { value: 'coding', label: 'Coding', emoji: '⌨️', category: 'tech' },
  { value: 'streaming', label: 'Streaming', emoji: '📡', category: 'tech' },

  // Social
  { value: 'fashion', label: 'Fashion', emoji: '👗', category: 'social' },
  { value: 'volunteering', label: 'Volunteering', emoji: '🤝', category: 'social' },
  { value: 'mentoring', label: 'Mentoring', emoji: '👥', category: 'social' },

  // Lifestyle
  { value: 'reading', label: 'Reading', emoji: '📚', category: 'lifestyle' },
  { value: 'podcasts', label: 'Podcasts', emoji: '🎧', category: 'lifestyle' },
  { value: 'cars', label: 'Cars', emoji: '🚗', category: 'lifestyle' },
  { value: 'sneakers', label: 'Sneakers', emoji: '👟', category: 'lifestyle' },
];

// ============================================================================
// CONTENT CREATION INTERESTS
// ============================================================================

export interface ContentInterestOption {
  value: string;
  label: string;
  emoji: string;
  description: string;
}

export const CONTENT_CREATION_INTERESTS: ContentInterestOption[] = [
  {
    value: 'vlogs',
    label: 'Vlogs',
    emoji: '📹',
    description: 'Day-in-the-life, behind-the-scenes content',
  },
  {
    value: 'tutorials',
    label: 'Tutorials & How-To',
    emoji: '🎓',
    description: 'Educational content, teaching skills',
  },
  {
    value: 'product_reviews',
    label: 'Product Reviews',
    emoji: '⭐',
    description: 'Unboxings, reviews, product demos',
  },
  {
    value: 'comedy_skits',
    label: 'Comedy & Skits',
    emoji: '😂',
    description: 'Funny videos, parodies, entertainment',
  },
  {
    value: 'motivational',
    label: 'Motivational Content',
    emoji: '💪',
    description: 'Inspirational messages, quotes, stories',
  },
  {
    value: 'training_workouts',
    label: 'Training & Workouts',
    emoji: '🏋️',
    description: 'Fitness routines, training tips',
  },
  {
    value: 'game_highlights',
    label: 'Game Highlights',
    emoji: '🏆',
    description: 'Sports highlights, game recaps',
  },
  {
    value: 'lifestyle',
    label: 'Lifestyle Content',
    emoji: '✨',
    description: 'Fashion, travel, daily routines',
  },
  {
    value: 'q_and_a',
    label: 'Q&A Sessions',
    emoji: '❓',
    description: 'Answering fan questions, AMAs',
  },
  {
    value: 'challenges',
    label: 'Challenges',
    emoji: '🎯',
    description: 'Trending challenges, competitions',
  },
  {
    value: 'collaborations',
    label: 'Collaborations',
    emoji: '🤝',
    description: 'Content with other creators/athletes',
  },
  {
    value: 'live_streams',
    label: 'Live Streams',
    emoji: '🔴',
    description: 'Real-time interactions, live events',
  },
];

// ============================================================================
// LIFESTYLE INTERESTS
// ============================================================================

export interface LifestyleInterestOption {
  value: string;
  label: string;
  emoji: string;
  description: string;
}

export const LIFESTYLE_INTERESTS: LifestyleInterestOption[] = [
  { value: 'fitness', label: 'Fitness & Wellness', emoji: '💪', description: 'Health, exercise, nutrition' },
  { value: 'fashion', label: 'Fashion & Style', emoji: '👗', description: 'Clothing, accessories, trends' },
  { value: 'beauty', label: 'Beauty & Skincare', emoji: '💄', description: 'Cosmetics, skincare routines' },
  { value: 'tech', label: 'Technology', emoji: '📱', description: 'Gadgets, apps, innovation' },
  { value: 'gaming', label: 'Gaming & Esports', emoji: '🎮', description: 'Video games, streaming' },
  { value: 'music', label: 'Music', emoji: '🎵', description: 'Concerts, playlists, artists' },
  { value: 'food', label: 'Food & Dining', emoji: '🍕', description: 'Restaurants, recipes, cuisine' },
  { value: 'travel', label: 'Travel', emoji: '✈️', description: 'Destinations, adventures, tourism' },
  { value: 'automotive', label: 'Automotive', emoji: '🚗', description: 'Cars, motorcycles, racing' },
  { value: 'outdoor', label: 'Outdoor & Adventure', emoji: '🏕️', description: 'Hiking, camping, nature' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬', description: 'Movies, TV shows, pop culture' },
  { value: 'education', label: 'Education & Learning', emoji: '📚', description: 'Courses, books, personal growth' },
  { value: 'finance', label: 'Finance & Investing', emoji: '💰', description: 'Money management, investing' },
  { value: 'sustainability', label: 'Sustainability', emoji: '🌱', description: 'Eco-friendly, green living' },
  { value: 'home_decor', label: 'Home & Decor', emoji: '🏡', description: 'Interior design, organization' },
];

// ============================================================================
// CAUSES & SOCIAL IMPACT
// ============================================================================

export interface CauseOption {
  value: string;
  label: string;
  emoji: string;
  description: string;
}

export const CAUSES: CauseOption[] = [
  { value: 'mental_health', label: 'Mental Health', emoji: '🧠', description: 'Mental wellness advocacy' },
  { value: 'education', label: 'Education', emoji: '📚', description: 'Educational access and equity' },
  { value: 'youth_sports', label: 'Youth Sports', emoji: '⚽', description: 'Supporting youth athletics' },
  { value: 'environment', label: 'Environment', emoji: '🌍', description: 'Climate and conservation' },
  { value: 'social_justice', label: 'Social Justice', emoji: '✊', description: 'Equality and justice initiatives' },
  { value: 'hunger', label: 'Hunger Relief', emoji: '🍞', description: 'Food security programs' },
  { value: 'healthcare', label: 'Healthcare', emoji: '❤️', description: 'Medical access and research' },
  { value: 'animal_welfare', label: 'Animal Welfare', emoji: '🐾', description: 'Animal rights and rescue' },
  { value: 'homelessness', label: 'Homelessness', emoji: '🏠', description: 'Housing and shelter support' },
  { value: 'veterans', label: 'Veterans Support', emoji: '🎖️', description: 'Military and veteran services' },
  { value: 'disability', label: 'Disability Rights', emoji: '♿', description: 'Accessibility and inclusion' },
  { value: 'lgbtq', label: 'LGBTQ+ Rights', emoji: '🏳️‍🌈', description: 'LGBTQ+ equality and support' },
];

// ============================================================================
// BRAND AFFINITY (Popular Brands)
// ============================================================================

export interface BrandAffinityOption {
  value: string;
  label: string;
  category: 'sports' | 'tech' | 'fashion' | 'lifestyle' | 'food' | 'other';
}

export const BRAND_AFFINITY_OPTIONS: BrandAffinityOption[] = [
  // Sports brands
  { value: 'nike', label: 'Nike', category: 'sports' },
  { value: 'adidas', label: 'Adidas', category: 'sports' },
  { value: 'under_armour', label: 'Under Armour', category: 'sports' },
  { value: 'puma', label: 'Puma', category: 'sports' },
  { value: 'new_balance', label: 'New Balance', category: 'sports' },
  { value: 'reebok', label: 'Reebok', category: 'sports' },
  { value: 'lululemon', label: 'Lululemon', category: 'sports' },
  { value: 'gatorade', label: 'Gatorade', category: 'sports' },
  { value: 'bodyarmor', label: 'BodyArmor', category: 'sports' },

  // Tech brands
  { value: 'apple', label: 'Apple', category: 'tech' },
  { value: 'samsung', label: 'Samsung', category: 'tech' },
  { value: 'sony', label: 'Sony', category: 'tech' },
  { value: 'bose', label: 'Bose', category: 'tech' },
  { value: 'beats', label: 'Beats', category: 'tech' },

  // Fashion brands
  { value: 'supreme', label: 'Supreme', category: 'fashion' },
  { value: 'off_white', label: 'Off-White', category: 'fashion' },
  { value: 'gucci', label: 'Gucci', category: 'fashion' },
  { value: 'north_face', label: 'The North Face', category: 'fashion' },
  { value: 'patagonia', label: 'Patagonia', category: 'fashion' },

  // Lifestyle brands
  { value: 'redbull', label: 'Red Bull', category: 'lifestyle' },
  { value: 'monster', label: 'Monster Energy', category: 'lifestyle' },
  { value: 'gopro', label: 'GoPro', category: 'lifestyle' },

  // Food brands
  { value: 'chipotle', label: 'Chipotle', category: 'food' },
  { value: 'starbucks', label: 'Starbucks', category: 'food' },
  { value: 'dunkin', label: 'Dunkin\'', category: 'food' },
];

// ============================================================================
// SOCIAL MEDIA PLATFORMS
// ============================================================================

export interface SocialPlatformOption {
  value: 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'facebook' | 'linkedin' | 'twitch' | 'snapchat';
  label: string;
  emoji: string;
  color: string;
  metrics: string[]; // What metrics are relevant for this platform
}

export const SOCIAL_PLATFORMS: SocialPlatformOption[] = [
  {
    value: 'instagram',
    label: 'Instagram',
    emoji: '📷',
    color: '#E1306C',
    metrics: ['followers', 'engagement_rate', 'avg_likes', 'avg_comments'],
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    emoji: '🎵',
    color: '#000000',
    metrics: ['followers', 'engagement_rate', 'avg_views', 'avg_likes'],
  },
  {
    value: 'twitter',
    label: 'Twitter/X',
    emoji: '🐦',
    color: '#1DA1F2',
    metrics: ['followers', 'engagement_rate', 'avg_retweets', 'avg_likes'],
  },
  {
    value: 'youtube',
    label: 'YouTube',
    emoji: '📺',
    color: '#FF0000',
    metrics: ['subscribers', 'avg_views', 'engagement_rate'],
  },
  {
    value: 'facebook',
    label: 'Facebook',
    emoji: '👍',
    color: '#1877F2',
    metrics: ['followers', 'engagement_rate', 'avg_reactions'],
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    emoji: '💼',
    color: '#0A66C2',
    metrics: ['connections', 'engagement_rate', 'post_views'],
  },
  {
    value: 'twitch',
    label: 'Twitch',
    emoji: '🎮',
    color: '#9146FF',
    metrics: ['followers', 'avg_viewers', 'peak_viewers'],
  },
  {
    value: 'snapchat',
    label: 'Snapchat',
    emoji: '👻',
    color: '#FFFC00',
    metrics: ['followers', 'story_views', 'snap_score'],
  },
];

// ============================================================================
// NIL DEAL TYPES
// ============================================================================

export interface DealTypeOption {
  value: string;
  label: string;
  emoji: string;
  description: string;
}

export const DEAL_TYPES: DealTypeOption[] = [
  {
    value: 'sponsored_posts',
    label: 'Sponsored Posts',
    emoji: '📱',
    description: 'Social media posts featuring brands/products',
  },
  {
    value: 'brand_ambassador',
    label: 'Brand Ambassador',
    emoji: '🤝',
    description: 'Long-term representation of a brand',
  },
  {
    value: 'appearances',
    label: 'Appearances',
    emoji: '🎤',
    description: 'In-person events, signings, meet & greets',
  },
  {
    value: 'content_creation',
    label: 'Content Creation',
    emoji: '🎥',
    description: 'Custom videos, photos, or creative content',
  },
  {
    value: 'product_endorsement',
    label: 'Product Endorsement',
    emoji: '⭐',
    description: 'Endorsing specific products or services',
  },
  {
    value: 'affiliate_marketing',
    label: 'Affiliate Marketing',
    emoji: '💰',
    description: 'Commission-based promotion with unique codes',
  },
  {
    value: 'event_hosting',
    label: 'Event Hosting',
    emoji: '🎉',
    description: 'Hosting or emceeing brand events',
  },
  {
    value: 'consulting',
    label: 'Consulting',
    emoji: '💡',
    description: 'Advisory role or strategic input',
  },
];

// ============================================================================
// CONTENT TYPES
// ============================================================================

export interface ContentTypeOption {
  value: string;
  label: string;
  emoji: string;
  platform: string;
}

export const CONTENT_TYPES: ContentTypeOption[] = [
  { value: 'instagram_posts', label: 'Instagram Posts', emoji: '📷', platform: 'Instagram' },
  { value: 'instagram_stories', label: 'Instagram Stories', emoji: '📸', platform: 'Instagram' },
  { value: 'instagram_reels', label: 'Instagram Reels', emoji: '🎬', platform: 'Instagram' },
  { value: 'tiktok_videos', label: 'TikTok Videos', emoji: '🎵', platform: 'TikTok' },
  { value: 'youtube_videos', label: 'YouTube Videos', emoji: '📺', platform: 'YouTube' },
  { value: 'youtube_shorts', label: 'YouTube Shorts', emoji: '▶️', platform: 'YouTube' },
  { value: 'twitter_posts', label: 'Twitter/X Posts', emoji: '🐦', platform: 'Twitter' },
  { value: 'blog_posts', label: 'Blog Posts', emoji: '✍️', platform: 'Blog' },
  { value: 'podcast_appearances', label: 'Podcast Appearances', emoji: '🎙️', platform: 'Podcast' },
  { value: 'live_streams', label: 'Live Streams', emoji: '🔴', platform: 'Various' },
];

// ============================================================================
// BLACKLIST CATEGORIES
// ============================================================================

export interface BlacklistCategoryOption {
  value: string;
  label: string;
  emoji: string;
  description: string;
}

export const BLACKLIST_CATEGORIES: BlacklistCategoryOption[] = [
  { value: 'alcohol', label: 'Alcohol', emoji: '🍺', description: 'Alcoholic beverages and brands' },
  { value: 'tobacco', label: 'Tobacco & Vaping', emoji: '🚬', description: 'Tobacco products and e-cigarettes' },
  { value: 'gambling', label: 'Gambling', emoji: '🎰', description: 'Casinos, betting, gambling platforms' },
  { value: 'cryptocurrency', label: 'Cryptocurrency', emoji: '₿', description: 'Crypto exchanges and NFTs' },
  { value: 'adult_content', label: 'Adult Content', emoji: '🔞', description: 'Adult entertainment or products' },
  { value: 'political', label: 'Political', emoji: '🗳️', description: 'Political campaigns or advocacy' },
  { value: 'pharmaceuticals', label: 'Pharmaceuticals', emoji: '💊', description: 'Prescription drugs and medical products' },
];

// ============================================================================
// BRAND SIZE PREFERENCES
// ============================================================================

export interface BrandSizeOption {
  value: string;
  label: string;
  description: string;
  emoji: string;
}

export const BRAND_SIZES: BrandSizeOption[] = [
  { value: 'startup', label: 'Startup', description: 'Early-stage companies, 1-50 employees', emoji: '🚀' },
  { value: 'small_business', label: 'Small Business', description: 'Local or regional businesses, 51-200 employees', emoji: '🏪' },
  { value: 'mid_market', label: 'Mid-Market', description: 'Established companies, 201-1000 employees', emoji: '🏢' },
  { value: 'enterprise', label: 'Enterprise', description: 'Large corporations, 1000+ employees', emoji: '🏛️' },
  { value: 'fortune_500', label: 'Fortune 500', description: 'Major global brands', emoji: '🌟' },
];

// ============================================================================
// PARTNERSHIP LENGTH OPTIONS
// ============================================================================

export interface PartnershipLengthOption {
  value: string;
  label: string;
  description: string;
}

export const PARTNERSHIP_LENGTHS: PartnershipLengthOption[] = [
  { value: 'one_time', label: 'One-Time Deal', description: 'Single campaign or post' },
  { value: '1-3 months', label: '1-3 Months', description: 'Short-term partnership' },
  { value: '3-6 months', label: '3-6 Months', description: 'Medium-term partnership' },
  { value: '6-12 months', label: '6-12 Months', description: 'Long-term partnership' },
  { value: '12+ months', label: '12+ Months', description: 'Extended brand ambassador role' },
];

// ============================================================================
// NEGOTIATION FLEXIBILITY
// ============================================================================

export interface NegotiationFlexibilityOption {
  value: 'firm' | 'somewhat_flexible' | 'very_flexible';
  label: string;
  description: string;
  emoji: string;
}

export const NEGOTIATION_FLEXIBILITY: NegotiationFlexibilityOption[] = [
  { value: 'firm', label: 'Firm', description: 'Specific terms required', emoji: '🔒' },
  { value: 'somewhat_flexible', label: 'Somewhat Flexible', description: 'Open to some negotiation', emoji: '🤝' },
  { value: 'very_flexible', label: 'Very Flexible', description: 'Highly adaptable to opportunities', emoji: '✅' },
];

// ============================================================================
// USAGE RIGHTS OPTIONS
// ============================================================================

export interface UsageRightsOption {
  value: string;
  label: string;
  description: string;
}

export const USAGE_RIGHTS: UsageRightsOption[] = [
  { value: 'limited', label: 'Limited Rights', description: 'Content used only for specific campaign duration' },
  { value: 'standard', label: 'Standard Rights', description: '6-12 months usage rights' },
  { value: 'extended', label: 'Extended Rights', description: '1-2 years usage rights' },
  { value: 'perpetual', label: 'Perpetual Rights', description: 'Unlimited usage rights' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get label for a hobby value
 */
export function getHobbyLabel(value: string): string {
  const hobby = HOBBIES.find(h => h.value === value);
  return hobby ? hobby.label : value;
}

/**
 * Get emoji for a hobby value
 */
export function getHobbyEmoji(value: string): string {
  const hobby = HOBBIES.find(h => h.value === value);
  return hobby ? hobby.emoji : '';
}

/**
 * Get label for a lifestyle interest
 */
export function getLifestyleInterestLabel(value: string): string {
  const interest = LIFESTYLE_INTERESTS.find(i => i.value === value);
  return interest ? interest.label : value;
}

/**
 * Get label for a cause
 */
export function getCauseLabel(value: string): string {
  const cause = CAUSES.find(c => c.value === value);
  return cause ? cause.label : value;
}

/**
 * Get social platform metadata
 */
export function getSocialPlatform(value: string) {
  return SOCIAL_PLATFORMS.find(p => p.value === value);
}

/**
 * Format follower count for display
 */
export function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Format engagement rate for display
 */
export function formatEngagementRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

/**
 * Calculate total followers across all platforms
 */
export function calculateTotalFollowers(socialStats: Array<{ followers: number }>): number {
  return socialStats.reduce((sum, stat) => sum + (stat.followers || 0), 0);
}

/**
 * Calculate average engagement rate across all platforms
 */
export function calculateAvgEngagement(socialStats: Array<{ engagement_rate: number }>): number {
  if (socialStats.length === 0) return 0;
  const sum = socialStats.reduce((sum, stat) => sum + (stat.engagement_rate || 0), 0);
  return sum / socialStats.length;
}

/**
 * Validate social media handle format
 */
export function validateSocialHandle(platform: string, handle: string): boolean {
  // Remove @ if present
  const cleanHandle = handle.replace('@', '');

  // Platform-specific validation
  switch (platform) {
    case 'instagram':
    case 'twitter':
    case 'tiktok':
      // Alphanumeric, underscores, periods (3-30 chars)
      return /^[a-zA-Z0-9_.]{3,30}$/.test(cleanHandle);
    case 'youtube':
      // Channel names or handles
      return cleanHandle.length >= 3 && cleanHandle.length <= 100;
    default:
      return cleanHandle.length >= 3;
  }
}

/**
 * Get deal type label
 */
export function getDealTypeLabel(value: string): string {
  const dealType = DEAL_TYPES.find(d => d.value === value);
  return dealType ? dealType.label : value;
}

/**
 * Get content type label
 */
export function getContentTypeLabel(value: string): string {
  const contentType = CONTENT_TYPES.find(c => c.value === value);
  return contentType ? contentType.label : value;
}
