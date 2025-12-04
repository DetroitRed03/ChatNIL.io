/**
 * FMV (Fair Market Value) Calculator
 * Calculates athlete's market value based on multiple factors
 *
 * Scoring Formula (0-100 points):
 * - Social Score: 30 points (followers, engagement, verification)
 * - Athletic Score: 30 points (rankings, school prestige, performance)
 * - Market Score: 20 points (location, state NIL rules, content quality)
 * - Brand Score: 20 points (brand affinity, values alignment, professionalism)
 */

import { createClient } from '@supabase/supabase-js';

// FMV Tiers based on total score
export type FMVTier = 'elite' | 'high' | 'medium' | 'developing' | 'emerging';

export interface FMVScore {
  total: number; // 0-100
  tier: FMVTier;
  social: number; // 0-30
  athletic: number; // 0-30
  market: number; // 0-20
  brand: number; // 0-20
}

export interface FMVCalculation extends FMVScore {
  estimatedDealValueLow: number;
  estimatedDealValueMid: number;
  estimatedDealValueHigh: number;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: ImprovementSuggestion[];
  percentileRank: number;
}

export interface ImprovementSuggestion {
  area: string;
  current: number;
  target: number;
  action: string;
  impact: 'high' | 'medium' | 'low';
  priority: number; // 1-5, higher is more important
}

// Helper: Determine tier from score
export function getTierFromScore(score: number): FMVTier {
  if (score >= 90) return 'elite';
  if (score >= 75) return 'high';
  if (score >= 55) return 'medium';
  if (score >= 35) return 'developing';
  return 'emerging';
}

// Helper: Calculate deal value estimates based on score
export function calculateDealValues(score: number): {
  low: number;
  mid: number;
  high: number;
} {
  // Base values by tier
  const tierMultipliers = {
    elite: { base: 50000, multiplier: 3 },       // $50K-$150K
    high: { base: 15000, multiplier: 2.5 },      // $15K-$37.5K
    medium: { base: 5000, multiplier: 2 },       // $5K-$10K
    developing: { base: 1500, multiplier: 1.5 }, // $1.5K-$2.25K
    emerging: { base: 500, multiplier: 1.2 }     // $500-$600
  };

  const tier = getTierFromScore(score);
  const config = tierMultipliers[tier];

  // Scale within tier based on exact score
  const tierScore = score % 15; // Position within tier (0-15)
  const scaleFactor = 1 + (tierScore / 15) * 0.5; // 1.0 to 1.5x

  return {
    low: config.base * scaleFactor,
    mid: config.base * config.multiplier * scaleFactor,
    high: config.base * config.multiplier * 1.5 * scaleFactor
  };
}

/**
 * Calculate Social Score (0-30 points)
 * Based on: followers, engagement rate, platform verification
 */
export function calculateSocialScore(athlete: any, socialStats: any[]): {
  score: number;
  breakdown: any;
} {
  let score = 0;
  const breakdown: any = {};

  // Total followers across all platforms
  const totalFollowers = socialStats.reduce((sum, stat) => sum + (stat.followers || 0), 0);
  breakdown.totalFollowers = totalFollowers;

  // Followers score (0-15 points) - Logarithmic scale
  if (totalFollowers >= 500000) score += 15;
  else if (totalFollowers >= 100000) score += 12 + ((totalFollowers - 100000) / 400000) * 3;
  else if (totalFollowers >= 50000) score += 10 + ((totalFollowers - 50000) / 50000) * 2;
  else if (totalFollowers >= 10000) score += 7 + ((totalFollowers - 10000) / 40000) * 3;
  else if (totalFollowers >= 5000) score += 5 + ((totalFollowers - 5000) / 5000) * 2;
  else if (totalFollowers >= 1000) score += 3 + ((totalFollowers - 1000) / 4000) * 2;
  else score += (totalFollowers / 1000) * 3;

  breakdown.followersScore = Math.round(score * 10) / 10;

  // Engagement rate (0-10 points) - Average across platforms
  const avgEngagement = socialStats.length > 0
    ? socialStats.reduce((sum, stat) => sum + (stat.engagement_rate || 0), 0) / socialStats.length
    : 0;
  breakdown.avgEngagement = avgEngagement;

  const engagementScore = Math.min(10, avgEngagement * 100); // 10% = max 10 points
  score += engagementScore;
  breakdown.engagementScore = Math.round(engagementScore * 10) / 10;

  // Verification bonus (0-5 points)
  const verifiedCount = socialStats.filter(stat => stat.verified).length;
  const verificationScore = Math.min(5, verifiedCount * 2.5); // 2 verified = max 5 points
  score += verificationScore;
  breakdown.verificationScore = verificationScore;

  // Platform diversity bonus (0-3 points)
  const platformCount = socialStats.length;
  const diversityScore = Math.min(3, platformCount * 0.75);
  score += diversityScore;
  breakdown.diversityScore = Math.round(diversityScore * 10) / 10;

  return {
    score: Math.min(30, Math.round(score)),
    breakdown
  };
}

/**
 * Calculate Athletic Score (0-30 points)
 * Based on: school prestige, performance, external rankings
 */
export function calculateAthleticScore(athlete: any, scrapedData: any): {
  score: number;
  breakdown: any;
} {
  let score = 0;
  const breakdown: any = {};

  // School prestige (0-10 points)
  const schoolLevel = athlete.school_level;
  const schoolName = athlete.school_name?.toLowerCase() || '';

  let prestigeScore = 0;
  if (schoolLevel === 'college') {
    // Check for Power 5 schools or well-known programs
    const prestigiousSchools = [
      'university of kentucky', 'university of california', 'ucla', 'usc',
      'university of texas', 'university of florida', 'duke', 'kansas',
      'north carolina', 'ohio state', 'michigan', 'alabama', 'clemson'
    ];

    if (prestigiousSchools.some(school => schoolName.includes(school))) {
      prestigeScore = 10;
    } else if (schoolName.includes('university') || schoolName.includes('college')) {
      prestigeScore = 7;
    } else {
      prestigeScore = 5;
    }
  } else {
    // High school - check for prominent programs
    if (schoolName.includes('img academy') || schoolName.includes('montverde')) {
      prestigeScore = 8;
    } else {
      prestigeScore = 4; // Base high school score
    }
  }

  score += prestigeScore;
  breakdown.prestigeScore = prestigeScore;

  // External rankings (0-12 points)
  if (scrapedData && scrapedData.overall_ranking) {
    const ranking = scrapedData.overall_ranking;
    if (ranking <= 10) score += 12;
    else if (ranking <= 50) score += 10;
    else if (ranking <= 100) score += 8;
    else if (ranking <= 300) score += 6;
    else if (ranking <= 500) score += 4;
    else score += 2;
    breakdown.rankingScore = score - prestigeScore;
  } else {
    breakdown.rankingScore = 0;
  }

  // Star rating (0-5 points)
  if (scrapedData && scrapedData.star_rating) {
    const starScore = scrapedData.star_rating; // 1-5 stars
    score += starScore;
    breakdown.starScore = starScore;
  } else {
    breakdown.starScore = 0;
  }

  // Position value (0-3 points) - Some positions are more marketable
  const highValuePositions = [
    'quarterback', 'point guard', 'center', 'forward',
    'pitcher', 'striker', 'setter'
  ];

  const position = athlete.position?.toLowerCase() || '';
  const positionScore = highValuePositions.some(p => position.includes(p)) ? 3 : 1.5;
  score += positionScore;
  breakdown.positionScore = positionScore;

  return {
    score: Math.min(30, Math.round(score)),
    breakdown
  };
}

/**
 * Calculate Market Score (0-20 points)
 * Based on: state NIL friendliness, location, content quality
 */
export function calculateMarketScore(athlete: any, nilRules: any, publicProfile: any): {
  score: number;
  breakdown: any;
} {
  let score = 0;
  const breakdown: any = {};

  // State NIL friendliness (0-8 points)
  if (nilRules) {
    let stateScore = 0;

    // Full NIL allowed
    if (nilRules.allows_nil) stateScore += 4;

    // High school allowed (huge bonus)
    if (nilRules.high_school_allowed && athlete.school_level === 'high_school') {
      stateScore += 3;
    }

    // Low restrictions
    if (nilRules.prohibited_categories && nilRules.prohibited_categories.length < 3) {
      stateScore += 1;
    }

    score += stateScore;
    breakdown.stateScore = stateScore;
  } else {
    breakdown.stateScore = 0;
  }

  // Content quality (0-7 points) - Based on content categories
  const contentCategories = athlete.content_creation_interests || [];
  const qualityScore = Math.round(Math.min(7, contentCategories.length * 1.5));
  score += qualityScore;
  breakdown.contentQualityScore = qualityScore;

  // Geographic desirability (0-5 points)
  const majorMarkets = ['CA', 'TX', 'FL', 'NY', 'IL'];
  const state = publicProfile?.state || athlete.state || '';
  const geoScore = majorMarkets.includes(state) ? 5 : 3;
  score += geoScore;
  breakdown.geoScore = geoScore;

  return {
    score: Math.min(20, Math.round(score)),
    breakdown
  };
}

/**
 * Calculate Brand Score (0-20 points)
 * Based on: brand affinity, values alignment, professionalism
 */
export function calculateBrandScore(athlete: any): {
  score: number;
  breakdown: any;
} {
  let score = 0;
  const breakdown: any = {};

  // Brand affinity (0-8 points)
  const brandAffinity = athlete.brand_affinity || [];
  const affinityScore = Math.min(8, brandAffinity.length * 2);
  score += affinityScore;
  breakdown.affinityScore = affinityScore;

  // Values/causes (0-7 points)
  const causes = athlete.causes_care_about || [];
  const valuesScore = Math.round(Math.min(7, causes.length * 2.5));
  score += valuesScore;
  breakdown.valuesScore = valuesScore;

  // Profile completeness (0-5 points)
  const profileScore = Math.round((athlete.profile_completion_score || 0) / 20); // Convert 0-100 to 0-5
  score += profileScore;
  breakdown.profileScore = profileScore;

  return {
    score: Math.min(20, Math.round(score)),
    breakdown
  };
}

/**
 * Generate improvement suggestions based on scores
 */
export function generateImprovementSuggestions(
  scores: FMVScore,
  socialBreakdown: any,
  athleticBreakdown: any
): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  // Social improvements
  if (scores.social < 20) {
    if (socialBreakdown.totalFollowers < 10000) {
      suggestions.push({
        area: 'Social Media Growth',
        current: socialBreakdown.totalFollowers,
        target: 10000,
        action: 'Focus on consistent posting and engagement. Aim for 3-5 posts per week on your strongest platform.',
        impact: 'high',
        priority: 5
      });
    }

    if (socialBreakdown.avgEngagement < 0.05) {
      suggestions.push({
        area: 'Engagement Rate',
        current: Math.round(socialBreakdown.avgEngagement * 1000) / 10,
        target: 5,
        action: 'Increase audience interaction through stories, polls, and responding to comments.',
        impact: 'high',
        priority: 4
      });
    }

    if (socialBreakdown.diversityScore < 2) {
      suggestions.push({
        area: 'Platform Diversity',
        current: Math.floor(socialBreakdown.diversityScore / 0.75),
        target: 3,
        action: 'Expand to at least 3 major platforms (Instagram, TikTok, Twitter).',
        impact: 'medium',
        priority: 3
      });
    }
  }

  // Athletic improvements
  if (scores.athletic < 20) {
    if (athleticBreakdown.rankingScore === 0) {
      suggestions.push({
        area: 'Rankings & Recognition',
        current: 0,
        target: 1,
        action: 'Get ranked by major scouting services (On3, Rivals, 247Sports, ESPN).',
        impact: 'high',
        priority: 5
      });
    }
  }

  // Brand improvements
  if (scores.brand < 15) {
    suggestions.push({
      area: 'Brand Development',
      current: scores.brand,
      target: 18,
      action: 'Complete your profile with brand values and causes you care about. This helps match with aligned partners.',
      impact: 'medium',
      priority: 3
    });
  }

  return suggestions.sort((a, b) => b.priority - a.priority);
}

/**
 * Main FMV calculation function
 */
export async function calculateFMV(athleteId: string): Promise<FMVCalculation> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Fetch athlete data
  const { data: athlete, error: athleteError } = await supabase
    .from('users')
    .select('*')
    .eq('id', athleteId)
    .single();

  if (athleteError || !athlete) {
    throw new Error('Athlete not found');
  }

  // Fetch social media stats
  const { data: socialStats } = await supabase
    .from('social_media_stats')
    .select('*')
    .eq('user_id', athleteId);

  // Fetch public profile for state info
  const { data: publicProfile } = await supabase
    .from('athlete_public_profiles')
    .select('state')
    .eq('user_id', athleteId)
    .single();

  // Fetch state NIL rules
  let nilRules = null;
  if (publicProfile?.state) {
    const { data } = await supabase
      .from('state_nil_rules')
      .select('*')
      .eq('state_code', publicProfile.state)
      .single();
    nilRules = data;
  }

  // Fetch scraped data if available
  const { data: scrapedData } = await supabase
    .from('scraped_athlete_data')
    .select('*')
    .eq('matched_user_id', athleteId)
    .single();

  // Calculate component scores
  const socialResult = calculateSocialScore(athlete, socialStats || []);
  const athleticResult = calculateAthleticScore(athlete, scrapedData);
  const marketResult = calculateMarketScore(athlete, nilRules, publicProfile);
  const brandResult = calculateBrandScore(athlete);

  // Calculate total score
  const totalScore = Math.min(100, Math.round(
    socialResult.score + athleticResult.score + marketResult.score + brandResult.score
  ));

  const tier = getTierFromScore(totalScore);
  const dealValues = calculateDealValues(totalScore);

  const scores: FMVScore = {
    total: totalScore,
    tier,
    social: socialResult.score,
    athletic: athleticResult.score,
    market: marketResult.score,
    brand: brandResult.score
  };

  // Generate strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (socialResult.score >= 24) strengths.push('Strong social media presence');
  else if (socialResult.score < 15) weaknesses.push('Limited social media reach');

  if (athleticResult.score >= 24) strengths.push('High athletic achievement');
  else if (athleticResult.score < 15) weaknesses.push('Need more athletic recognition');

  if (marketResult.score >= 16) strengths.push('Favorable market conditions');
  else if (marketResult.score < 10) weaknesses.push('Limited market opportunity');

  if (brandResult.score >= 16) strengths.push('Well-defined brand identity');
  else if (brandResult.score < 10) weaknesses.push('Underdeveloped brand profile');

  // Generate improvement suggestions
  const improvements = generateImprovementSuggestions(
    scores,
    socialResult.breakdown,
    athleticResult.breakdown
  );

  // Calculate percentile rank (placeholder - would need all athlete scores)
  const percentileRank = Math.min(99, Math.round((totalScore / 100) * 95));

  return {
    ...scores,
    estimatedDealValueLow: dealValues.low,
    estimatedDealValueMid: dealValues.mid,
    estimatedDealValueHigh: dealValues.high,
    strengths,
    weaknesses,
    improvementSuggestions: improvements,
    percentileRank
  };
}
