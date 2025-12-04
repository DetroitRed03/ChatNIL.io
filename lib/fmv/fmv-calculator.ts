/**
 * FMV (Fair Market Value) Calculator
 * ===================================
 * Comprehensive NIL valuation system that calculates an athlete's market value
 * based on social media presence, athletic profile, market position, and brand deals.
 *
 * Scoring System (0-100 points total):
 * - Social Score: 0-30 points (followers, engagement, platform diversity, verification)
 * - Athletic Score: 0-30 points (sport tier, position value, rankings, school division)
 * - Market Score: 0-20 points (state NIL maturity, school market size, school tier)
 * - Brand Score: 0-20 points (active deals, earnings, success rate, content quality)
 *
 * Privacy & Security:
 * - Rate limiting enforced (3 calculations per day)
 * - Privacy controls (public/private score toggle)
 * - Notification tracking for significant score increases
 */

import type {
  User,
  SocialMediaStat,
  NILDeal,
  ScrapedAthleteData,
  AthleteFMVData,
  FMVTier,
  ImprovementSuggestion,
  FMVScoreHistory,
} from '@/types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface FMVInputs {
  athlete: any;
  socialStats?: SocialMediaStat[];
  nilDeals?: NILDeal[];
  externalRankings?: ScrapedAthleteData[];
}

export interface FMVResult extends Omit<AthleteFMVData, 'id' | 'created_at' | 'updated_at'> {
  // Extends AthleteFMVData with calculated fields
}

export interface DealValueEstimates {
  sponsored_post: { low: number; mid: number; high: number };
  brand_ambassador: { low: number; mid: number; high: number };
  event_appearance: { low: number; mid: number; high: number };
  product_endorsement: { low: number; mid: number; high: number };
  content_creation: { low: number; mid: number; high: number };
}

// ============================================================================
// Constants
// ============================================================================

const CALCULATION_VERSION = 'v1.0';

// Sport tier values (higher tier = more NIL opportunities)
const SPORT_TIERS: Record<string, number> = {
  football: 10,
  basketball: 10,
  baseball: 9,
  softball: 9,
  soccer: 8,
  volleyball: 7,
  hockey: 7,
  track: 6,
  wrestling: 6,
  swimming: 5,
  golf: 4,
  tennis: 4,
  lacrosse: 5,
  gymnastics: 6,
};

// Position value for premium positions
const POSITION_VALUES: Record<string, number> = {
  // Football
  qb: 5,
  quarterback: 5,
  rb: 4,
  'running back': 4,
  wr: 4,
  'wide receiver': 4,
  te: 3,
  'tight end': 3,
  // Basketball
  pg: 5,
  'point guard': 5,
  sg: 4,
  'shooting guard': 4,
  sf: 3,
  'small forward': 3,
  // Baseball
  pitcher: 5,
  catcher: 4,
  shortstop: 4,
  // Default
  default: 2,
};

// State NIL maturity levels
const STATE_NIL_MATURITY: Record<string, number> = {
  // Mature markets (8 points)
  CA: 8, FL: 8, TX: 8, NY: 8, GA: 8,
  // Developing markets (5 points)
  KY: 5, OH: 5, IN: 5, TN: 5, IL: 5, PA: 5, NC: 5, MI: 5, AZ: 5, VA: 5,
  // Emerging markets (2 points) - default for unlisted states
};

// Base deal values (national averages in USD)
const BASE_DEAL_VALUES = {
  sponsored_post: { low: 100, mid: 500, high: 2000 },
  brand_ambassador: { low: 5000, mid: 20000, high: 50000 },
  event_appearance: { low: 500, mid: 2000, high: 5000 },
  product_endorsement: { low: 1000, mid: 5000, high: 20000 },
  content_creation: { low: 250, mid: 1500, high: 5000 },
};

// ============================================================================
// Main Calculation Function
// ============================================================================

/**
 * Calculate comprehensive FMV score for an athlete
 * @param inputs - Athlete data including profile, social stats, deals, rankings
 * @returns Complete FMV result with scores, suggestions, and estimates
 */
export async function calculateFMV(inputs: FMVInputs): Promise<FMVResult> {
  const { athlete, socialStats = [], nilDeals = [], externalRankings = [] } = inputs;

  // Calculate individual category scores
  const social_score = calculateSocialScore(athlete, socialStats);
  const athletic_score = calculateAthleticScore(athlete, externalRankings);
  const market_score = calculateMarketScore(athlete);
  const brand_score = calculateBrandScore(athlete, nilDeals);

  // Total FMV score
  const fmv_score = social_score + athletic_score + market_score + brand_score;

  // Determine tier
  const fmv_tier = getTier(fmv_score);

  // Calculate percentile rank
  const percentile_rank = await calculatePercentileRank(fmv_score, athlete.primary_sport || '');

  // Find comparable athletes
  const comparable_athletes = await findComparableAthletes(athlete, fmv_score);

  // Generate deal value estimates
  const dealEstimates = calculateDealValueEstimates(fmv_score, athlete, socialStats);

  // Generate improvement suggestions
  const improvement_suggestions = generateImprovementSuggestions({
    social_score,
    athletic_score,
    market_score,
    brand_score,
    athlete,
    socialStats,
    nilDeals,
    externalRankings,
  });

  // Identify strengths and weaknesses
  const strengths = identifyStrengths({ social_score, athletic_score, market_score, brand_score, athlete, socialStats });
  const weaknesses = identifyWeaknesses({ social_score, athletic_score, market_score, brand_score, athlete, socialStats });

  return {
    athlete_id: athlete.id,
    fmv_score,
    fmv_tier,
    social_score,
    athletic_score,
    market_score,
    brand_score,
    estimated_deal_value_low: dealEstimates.sponsored_post.low,
    estimated_deal_value_mid: dealEstimates.brand_ambassador.mid,
    estimated_deal_value_high: dealEstimates.brand_ambassador.high,
    improvement_suggestions,
    strengths,
    weaknesses,
    score_history: [], // Will be populated from existing data
    comparable_athletes,
    percentile_rank,
    is_public_score: false, // Default private
    calculation_count_today: 0,
    last_calculation_reset_date: new Date().toISOString().split('T')[0],
    calculation_version: CALCULATION_VERSION,
  };
}

// ============================================================================
// Category Score Calculations
// ============================================================================

/**
 * Calculate social media score (0-30 points)
 * Breakdown:
 * - Total followers: 0-12 points
 * - Engagement rate: 0-10 points
 * - Platform diversity: 0-4 points (1 pt per platform)
 * - Verified accounts: 0-4 points (2 pts each, max 2)
 */
export function calculateSocialScore(athlete: any, socialStats: SocialMediaStat[]): number {
  let score = 0;

  // Total followers (0-12 points)
  const totalFollowers = socialStats.reduce((sum, stat) => sum + stat.followers, 0);
  if (totalFollowers >= 100000) score += 12;
  else if (totalFollowers >= 50000) score += 10;
  else if (totalFollowers >= 25000) score += 8;
  else if (totalFollowers >= 10000) score += 6;
  else if (totalFollowers >= 5000) score += 4;
  else if (totalFollowers >= 1000) score += 2;

  // Average engagement rate (0-10 points)
  if (socialStats.length > 0) {
    const avgEngagement = socialStats.reduce((sum, stat) => sum + stat.engagement_rate, 0) / socialStats.length;
    if (avgEngagement >= 8) score += 10;
    else if (avgEngagement >= 6) score += 8;
    else if (avgEngagement >= 4) score += 6;
    else if (avgEngagement >= 3) score += 4;
    else if (avgEngagement >= 2) score += 2;
  }

  // Platform diversity (0-4 points)
  score += Math.min(socialStats.length, 4);

  // Verified accounts (0-4 points)
  const verifiedCount = socialStats.filter(stat => stat.verified).length;
  score += Math.min(verifiedCount * 2, 4);

  return Math.min(score, 30); // Cap at 30
}

/**
 * Calculate athletic profile score (0-30 points)
 * Breakdown:
 * - Sport tier: 0-10 points
 * - Position value: 0-5 points
 * - External rankings: 0-10 points
 * - School division: 0-5 points
 */
export function calculateAthleticScore(athlete: any, externalRankings: ScrapedAthleteData[]): number {
  let score = 0;

  // Sport tier (0-10 points)
  const sport = athlete.primary_sport?.toLowerCase() || '';
  score += SPORT_TIERS[sport] || 3; // Default 3 points for other sports

  // Position value (0-5 points)
  const position = (athlete as any).position?.toLowerCase() || '';
  score += POSITION_VALUES[position] || POSITION_VALUES.default;

  // External rankings (0-10 points)
  if (externalRankings.length > 0) {
    const bestRanking = Math.min(...externalRankings.map(r => r.overall_ranking || 999999));
    if (bestRanking <= 50) score += 10;
    else if (bestRanking <= 100) score += 8;
    else if (bestRanking <= 300) score += 6;
    else if (bestRanking <= 500) score += 4;
    else if (bestRanking <= 1000) score += 2;
  }

  // School division (0-5 points)
  const schoolLevel = extractSchoolLevel(athlete.school_name || '');
  if (schoolLevel === 'D1' || schoolLevel === 'Division 1') score += 5;
  else if (schoolLevel === 'D2' || schoolLevel === 'Division 2') score += 3;
  else if (schoolLevel === 'D3' || schoolLevel === 'NAIA' || schoolLevel === 'JUCO') score += 2;
  else score += 1; // High school or other

  return Math.min(score, 30); // Cap at 30
}

/**
 * Calculate market position score (0-20 points)
 * Breakdown:
 * - State NIL maturity: 0-8 points
 * - School market size: 0-7 points
 * - School tier bonus: 0-5 points
 */
export function calculateMarketScore(athlete: any): number {
  let score = 0;

  // State NIL maturity (0-8 points)
  const state = extractState(athlete.school_name || '');
  score += STATE_NIL_MATURITY[state] || 2; // Default 2 points for emerging states

  // School market size (0-7 points)
  const marketSize = estimateSchoolMarketSize(athlete.school_name || '');
  if (marketSize === 'large') score += 7;
  else if (marketSize === 'medium') score += 4;
  else score += 2; // Small market

  // School tier bonus (0-5 points)
  const schoolLevel = extractSchoolLevel(athlete.school_name || '');
  if (schoolLevel === 'D1' || schoolLevel === 'Division 1') score += 5;
  else if (schoolLevel === 'D2' || schoolLevel === 'Division 2') score += 3;
  else score += 1;

  return Math.min(score, 20); // Cap at 20
}

/**
 * Calculate brand & deals score (0-20 points)
 * Breakdown:
 * - Active NIL deals: 0-8 points (2 pts each, max 4 deals)
 * - Total earnings: 0-6 points
 * - Deal success rate: 0-3 points
 * - Content samples: 0-3 points
 */
export function calculateBrandScore(athlete: any, nilDeals: NILDeal[]): number {
  let score = 0;

  // Active NIL deals (0-8 points)
  const activeDeals = nilDeals.filter(deal => deal.status === 'active').length;
  score += Math.min(activeDeals * 2, 8);

  // Total earnings (0-6 points)
  const totalEarnings = nilDeals.reduce((sum, deal) => sum + (deal.compensation_amount || 0), 0);
  if (totalEarnings >= 50000) score += 6;
  else if (totalEarnings >= 25000) score += 5;
  else if (totalEarnings >= 10000) score += 4;
  else if (totalEarnings >= 5000) score += 3;
  else if (totalEarnings >= 1000) score += 2;
  else if (totalEarnings > 0) score += 1;

  // Deal success rate (0-3 points)
  const completedDeals = nilDeals.filter(deal => deal.status === 'completed').length;
  const totalDeals = nilDeals.length;
  if (totalDeals > 0) {
    const successRate = completedDeals / totalDeals;
    if (successRate >= 0.9) score += 3;
    else if (successRate >= 0.7) score += 2;
    else if (successRate >= 0.5) score += 1;
  }

  // Content samples (0-3 points)
  const contentSamples = athlete.content_samples || [];
  if (Array.isArray(contentSamples)) {
    if (contentSamples.length >= 5) score += 3;
    else if (contentSamples.length >= 3) score += 2;
    else if (contentSamples.length >= 1) score += 1;
  }

  return Math.min(score, 20); // Cap at 20
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determine FMV tier based on score
 */
export function getTier(score: number): FMVTier {
  if (score >= 90) return 'elite';
  if (score >= 75) return 'high';
  if (score >= 55) return 'medium';
  if (score >= 35) return 'developing';
  return 'emerging';
}

/**
 * Extract state code from school name
 * Examples: "University of Kentucky" -> "KY", "Ohio State" -> "OH"
 */
export function extractState(schoolName: string): string {
  const stateMap: Record<string, string> = {
    kentucky: 'KY', ohio: 'OH', indiana: 'IN', tennessee: 'TN',
    california: 'CA', texas: 'TX', florida: 'FL', 'new york': 'NY',
    illinois: 'IL', pennsylvania: 'PA', michigan: 'MI', georgia: 'GA',
    'north carolina': 'NC', arizona: 'AZ', virginia: 'VA',
  };

  const lowerSchool = schoolName.toLowerCase();
  for (const [state, code] of Object.entries(stateMap)) {
    if (lowerSchool.includes(state)) return code;
  }

  return 'OTHER'; // Unknown state
}

/**
 * Extract school division level
 */
export function extractSchoolLevel(schoolName: string): string {
  const lower = schoolName.toLowerCase();
  if (lower.includes('d1') || lower.includes('division 1') || lower.includes('division i')) return 'D1';
  if (lower.includes('d2') || lower.includes('division 2') || lower.includes('division ii')) return 'D2';
  if (lower.includes('d3') || lower.includes('division 3') || lower.includes('division iii')) return 'D3';
  if (lower.includes('naia')) return 'NAIA';
  if (lower.includes('juco') || lower.includes('junior college')) return 'JUCO';
  if (lower.includes('high school') || lower.includes('hs')) return 'High School';

  // Guess based on school name (major universities are typically D1)
  const majorSchools = ['university', 'state', 'college'];
  if (majorSchools.some(term => lower.includes(term))) return 'D1';

  return 'Unknown';
}

/**
 * Estimate school market size based on name
 */
export function estimateSchoolMarketSize(schoolName: string): 'large' | 'medium' | 'small' {
  const lower = schoolName.toLowerCase();

  // Large markets (major cities)
  const largeCities = ['los angeles', 'new york', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san diego', 'dallas', 'san francisco', 'boston', 'atlanta', 'miami'];
  if (largeCities.some(city => lower.includes(city))) return 'large';

  // Medium markets (state capitals, mid-size cities)
  const mediumCities = ['columbus', 'indianapolis', 'nashville', 'austin', 'denver', 'seattle', 'detroit', 'minneapolis', 'charlotte', 'portland'];
  if (mediumCities.some(city => lower.includes(city))) return 'medium';

  // Major universities typically in medium+ markets
  if (lower.includes('university') && lower.includes('state')) return 'medium';

  return 'small'; // Default to small market
}

/**
 * Get position value for scoring
 */
export function getPositionValue(sport: string, position: string): number {
  const key = position.toLowerCase();
  return POSITION_VALUES[key] || POSITION_VALUES.default;
}

/**
 * Calculate percentile rank compared to other athletes in same sport
 * @param score - Athlete's FMV score
 * @param sport - Athlete's primary sport
 * @returns Percentile rank (0-100)
 */
export async function calculatePercentileRank(score: number, sport: string): Promise<number> {
  // This would query the database in production
  // For now, return estimated percentile based on score
  if (score >= 90) return 99;
  if (score >= 85) return 95;
  if (score >= 80) return 90;
  if (score >= 75) return 85;
  if (score >= 70) return 75;
  if (score >= 65) return 65;
  if (score >= 60) return 55;
  if (score >= 55) return 45;
  if (score >= 50) return 35;
  if (score >= 45) return 25;
  if (score >= 40) return 15;
  return 10;
}

/**
 * Find comparable athletes with similar profiles and public scores
 * @param athlete - Current athlete
 * @param score - Athlete's FMV score
 * @returns Array of comparable athlete IDs (only those with public scores)
 */
export async function findComparableAthletes(athlete: any, score: number): Promise<string[]> {
  // This would query the database in production
  // Criteria: same sport, ±50% followers, ±10 FMV score, is_public_score = true
  // For now, return empty array (will be implemented in API route)
  return [];
}

// ============================================================================
// Deal Value Estimation
// ============================================================================

/**
 * Calculate estimated deal values based on FMV score and social following
 * Formula: Base value × (fmv_score/100) × log10(max(followers, 100))/5
 */
export function calculateDealValueEstimates(
  fmv_score: number,
  athlete: any,
  socialStats: SocialMediaStat[]
): DealValueEstimates {
  // Calculate multipliers
  const baseMultiplier = fmv_score / 100;
  const totalFollowers = socialStats.reduce((sum, stat) => sum + stat.followers, 0);
  const followerMultiplier = Math.log10(Math.max(totalFollowers, 100)) / 5;
  const finalMultiplier = baseMultiplier * followerMultiplier;

  // Apply multiplier to each deal type
  const estimates: DealValueEstimates = {
    sponsored_post: {
      low: Math.round(BASE_DEAL_VALUES.sponsored_post.low * finalMultiplier),
      mid: Math.round(BASE_DEAL_VALUES.sponsored_post.mid * finalMultiplier),
      high: Math.round(BASE_DEAL_VALUES.sponsored_post.high * finalMultiplier),
    },
    brand_ambassador: {
      low: Math.round(BASE_DEAL_VALUES.brand_ambassador.low * finalMultiplier),
      mid: Math.round(BASE_DEAL_VALUES.brand_ambassador.mid * finalMultiplier),
      high: Math.round(BASE_DEAL_VALUES.brand_ambassador.high * finalMultiplier),
    },
    event_appearance: {
      low: Math.round(BASE_DEAL_VALUES.event_appearance.low * finalMultiplier),
      mid: Math.round(BASE_DEAL_VALUES.event_appearance.mid * finalMultiplier),
      high: Math.round(BASE_DEAL_VALUES.event_appearance.high * finalMultiplier),
    },
    product_endorsement: {
      low: Math.round(BASE_DEAL_VALUES.product_endorsement.low * finalMultiplier),
      mid: Math.round(BASE_DEAL_VALUES.product_endorsement.mid * finalMultiplier),
      high: Math.round(BASE_DEAL_VALUES.product_endorsement.high * finalMultiplier),
    },
    content_creation: {
      low: Math.round(BASE_DEAL_VALUES.content_creation.low * finalMultiplier),
      mid: Math.round(BASE_DEAL_VALUES.content_creation.mid * finalMultiplier),
      high: Math.round(BASE_DEAL_VALUES.content_creation.high * finalMultiplier),
    },
  };

  return estimates;
}

// ============================================================================
// Improvement Suggestions
// ============================================================================

interface SuggestionContext {
  social_score: number;
  athletic_score: number;
  market_score: number;
  brand_score: number;
  athlete: any;
  socialStats: SocialMediaStat[];
  nilDeals: NILDeal[];
  externalRankings: ScrapedAthleteData[];
}

/**
 * Generate prioritized improvement suggestions
 * Returns up to 5 actionable suggestions
 */
export function generateImprovementSuggestions(context: SuggestionContext): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];
  const { social_score, athletic_score, brand_score, athlete, socialStats, nilDeals } = context;

  // Social media suggestions (if social_score < 20)
  if (social_score < 20) {
    const totalFollowers = socialStats.reduce((sum, stat) => sum + stat.followers, 0);

    if (totalFollowers < 5000) {
      suggestions.push({
        area: 'social',
        current: `${totalFollowers.toLocaleString()} followers`,
        target: '5,000 followers',
        action: 'Post 3-4x per week, use trending hashtags, collaborate with other athletes, and engage with your audience consistently.',
        impact: '+4 points',
        priority: 'high',
      });
    } else if (totalFollowers < 10000) {
      suggestions.push({
        area: 'social',
        current: `${totalFollowers.toLocaleString()} followers`,
        target: '10,000 followers',
        action: 'Increase posting frequency, create more video content, and cross-promote on multiple platforms.',
        impact: '+2 points',
        priority: 'high',
      });
    }

    if (socialStats.length === 0) {
      suggestions.push({
        area: 'social',
        current: 'No social media platforms added',
        target: 'Add 3+ platforms',
        action: 'Add your Instagram, TikTok, and Twitter accounts to your profile with verified follower counts.',
        impact: '+3 points',
        priority: 'high',
      });
    } else if (socialStats.length < 3) {
      suggestions.push({
        area: 'social',
        current: `${socialStats.length} platform${socialStats.length === 1 ? '' : 's'}`,
        target: '3+ platforms',
        action: 'Expand to additional social media platforms like TikTok, YouTube, or Twitter to diversify your reach.',
        impact: `+${3 - socialStats.length} points`,
        priority: 'medium',
      });
    }

    // Engagement rate suggestion
    if (socialStats.length > 0) {
      const avgEngagement = socialStats.reduce((sum, stat) => sum + stat.engagement_rate, 0) / socialStats.length;
      if (avgEngagement < 4) {
        suggestions.push({
          area: 'social',
          current: `${avgEngagement.toFixed(1)}% engagement rate`,
          target: '4%+ engagement rate',
          action: 'Ask questions in captions, respond to comments, create interactive content (polls, Q&As), and post when your audience is most active.',
          impact: '+4 points',
          priority: 'medium',
        });
      }
    }
  }

  // Brand/deals suggestions (if brand_score < 12)
  if (brand_score < 12) {
    if (nilDeals.length === 0) {
      suggestions.push({
        area: 'brand',
        current: 'No NIL deals',
        target: 'Complete your first NIL deal',
        action: 'Reach out to local businesses, offer social media posts for $100-500, and use our matchmaking tool to find opportunities.',
        impact: '+2 points',
        priority: 'high',
      });
    }

    const contentSamples = athlete.content_samples || [];
    if (!Array.isArray(contentSamples) || contentSamples.length < 3) {
      suggestions.push({
        area: 'brand',
        current: `${Array.isArray(contentSamples) ? contentSamples.length : 0} content samples`,
        target: '5+ content samples',
        action: 'Add your best social media posts, videos, and sponsored content to your portfolio to showcase your content quality.',
        impact: '+3 points',
        priority: 'medium',
      });
    }
  }

  // Athletic suggestions (if athletic_score < 20)
  if (athletic_score < 20 && context.externalRankings.length === 0) {
    suggestions.push({
      area: 'athletic',
      current: 'No national rankings',
      target: 'Get ranked by recruiting services',
      action: 'Create profiles on 247Sports, Rivals, and On3. Submit highlight videos and reach out to recruiting analysts.',
      impact: '+8 points',
      priority: 'low',
    });
  }

  // Sort by priority and return top 5
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return suggestions
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 5);
}

/**
 * Identify athlete's top strengths
 */
export function identifyStrengths(context: Omit<SuggestionContext, 'nilDeals' | 'externalRankings'>): string[] {
  const strengths: string[] = [];
  const { social_score, athletic_score, market_score, brand_score, athlete, socialStats } = context;

  // Check each category
  if (social_score >= 20) {
    const totalFollowers = socialStats.reduce((sum, stat) => sum + stat.followers, 0);
    if (totalFollowers >= 10000) {
      strengths.push(`Strong social media presence (${(totalFollowers / 1000).toFixed(1)}K followers)`);
    }

    if (socialStats.length > 0) {
      const avgEngagement = socialStats.reduce((sum, stat) => sum + stat.engagement_rate, 0) / socialStats.length;
      if (avgEngagement >= 4) {
        strengths.push(`High engagement rate (${avgEngagement.toFixed(1)}%)`);
      }
    }
  }

  if (athletic_score >= 20) {
    const sport = athlete.primary_sport;
    if (sport && SPORT_TIERS[sport.toLowerCase()] >= 9) {
      strengths.push(`Premium sport (${sport})`);
    }

    const position = athlete.position?.toLowerCase() || '';
    if (POSITION_VALUES[position] >= 4) {
      strengths.push(`High-value position (${athlete.position})`);
    }
  }

  if (market_score >= 15) {
    strengths.push('Strong local NIL market');
  }

  if (brand_score >= 15) {
    strengths.push('Active NIL deal portfolio');
  }

  return strengths.slice(0, 5); // Top 5 strengths
}

/**
 * Identify areas for improvement (weaknesses)
 */
export function identifyWeaknesses(context: Omit<SuggestionContext, 'nilDeals' | 'externalRankings'>): string[] {
  const weaknesses: string[] = [];
  const { social_score, athletic_score, market_score, brand_score, socialStats } = context;

  if (social_score < 15) {
    weaknesses.push('Limited social media presence');
  }

  if (socialStats.length < 2) {
    weaknesses.push('Low platform diversity');
  }

  if (athletic_score < 15) {
    weaknesses.push('No national rankings');
  }

  if (market_score < 10) {
    weaknesses.push('Small market area');
  }

  if (brand_score < 10) {
    weaknesses.push('No NIL deal experience');
  }

  return weaknesses.slice(0, 5); // Top 5 weaknesses
}

/**
 * Check if athlete should be encouraged to share their score publicly
 * Trigger: FMV score >= 70 (High Tier or above)
 */
export function shouldEncouragePublicSharing(fmv_score: number): boolean {
  return fmv_score >= 70;
}

/**
 * Check if athlete should be notified of score increase
 * Trigger: Score increased by 5+ points since last notification
 */
export function shouldNotifyScoreIncrease(
  current_score: number,
  last_notified_score: number | null | undefined
): boolean {
  if (last_notified_score === null || last_notified_score === undefined) {
    return false; // Don't notify on first calculation
  }
  return current_score - last_notified_score >= 5;
}
