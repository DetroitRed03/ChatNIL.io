/**
 * Matchmaking Algorithm for Agency-Athlete Partnerships
 * ======================================================
 * Calculates compatibility scores between agencies and athletes
 * based on multiple factors including interests, values, budget, and audience fit.
 *
 * Related Types: lib/types.ts (MatchScore, MatchmakingQuery, EnhancedAthleteProfile, AgencyProfile)
 */

import type { MatchScore, MatchmakingQuery, EnhancedAthleteProfile, AgencyProfile } from './types';

/**
 * Calculate the Jaccard similarity coefficient between two arrays
 * Returns a value between 0 (no overlap) and 1 (identical)
 */
function calculateJaccardSimilarity(arr1: string[], arr2: string[]): number {
  if (!arr1?.length || !arr2?.length) return 0;

  const set1 = new Set(arr1.map(s => s.toLowerCase()));
  const set2 = new Set(arr2.map(s => s.toLowerCase()));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Check if a value falls within a range
 */
function isInRange(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * Convert budget range string to numerical min/max values
 */
function parseBudgetRange(budgetRange?: string): { min: number; max: number } {
  const ranges: Record<string, { min: number; max: number }> = {
    'under_5k': { min: 0, max: 5000 },
    '5k_25k': { min: 5000, max: 25000 },
    '25k_100k': { min: 25000, max: 100000 },
    '100k_500k': { min: 100000, max: 500000 },
    '500k_plus': { min: 500000, max: 10000000 },
  };

  return budgetRange ? ranges[budgetRange] || { min: 0, max: 0 } : { min: 0, max: 0 };
}

/**
 * Calculate brand values alignment score (0-20 points)
 */
function calculateBrandValuesMatch(
  agencyValues: string[] = [],
  athleteValues: string[] = []
): number {
  if (!agencyValues.length || !athleteValues.length) return 0;

  const similarity = calculateJaccardSimilarity(agencyValues, athleteValues);
  return Math.round(similarity * 20); // Max 20 points
}

/**
 * Calculate interests alignment score (0-20 points)
 */
function calculateInterestsAlignment(
  campaignInterests: string[] = [],
  athleteInterests: {
    hobbies?: string[];
    lifestyle_interests?: string[];
    content_creation_interests?: string[];
  } = {}
): number {
  if (!campaignInterests.length) return 10; // Neutral score if no preferences

  // Combine all athlete interests
  const allAthleteInterests = [
    ...(athleteInterests.hobbies || []),
    ...(athleteInterests.lifestyle_interests || []),
    ...(athleteInterests.content_creation_interests || []),
  ];

  if (!allAthleteInterests.length) return 5; // Lower score if athlete has no interests

  const similarity = calculateJaccardSimilarity(campaignInterests, allAthleteInterests);
  return Math.round(similarity * 20); // Max 20 points
}

/**
 * Calculate campaign type fit score (0-15 points)
 */
function calculateCampaignTypeFit(
  agencyCampaigns: string[] = [],
  athleteDealTypes: string[] = []
): number {
  if (!agencyCampaigns.length && !athleteDealTypes.length) return 7.5; // Neutral

  const similarity = calculateJaccardSimilarity(agencyCampaigns, athleteDealTypes);
  return Math.round(similarity * 15); // Max 15 points
}

/**
 * Calculate budget compatibility score (0-15 points)
 */
function calculateBudgetCompatibility(
  agencyBudgetRange?: string,
  athletePreferences?: {
    min_compensation?: number;
    max_compensation?: number;
  }
): number {
  if (!agencyBudgetRange) return 7.5; // Neutral if no agency budget specified

  const agencyBudget = parseBudgetRange(agencyBudgetRange);

  // If athlete has no preferences, assume compatible
  if (!athletePreferences?.min_compensation && !athletePreferences?.max_compensation) {
    return 12; // Good score by default
  }

  // Check if ranges overlap
  const athleteMin = athletePreferences.min_compensation || 0;
  const athleteMax = athletePreferences.max_compensation || Infinity;

  const hasOverlap =
    (agencyBudget.min <= athleteMax && agencyBudget.max >= athleteMin);

  if (!hasOverlap) return 0; // No overlap = incompatible

  // Calculate overlap percentage
  const overlapMin = Math.max(agencyBudget.min, athleteMin);
  const overlapMax = Math.min(agencyBudget.max, athleteMax);
  const overlapSize = overlapMax - overlapMin;

  const athleteRangeSize = athleteMax - athleteMin;
  const agencyRangeSize = agencyBudget.max - agencyBudget.min;

  const overlapPercentage = Math.min(
    overlapSize / athleteRangeSize,
    overlapSize / agencyRangeSize
  );

  return Math.round(overlapPercentage * 15); // Max 15 points
}

/**
 * Calculate geographic match score (0-10 points)
 */
function calculateGeographicMatch(
  agencyFocus: string[] = [],
  athleteSchool?: string
): number {
  if (!agencyFocus.length) return 8; // Neutral score if no geographic focus

  // This is simplified - in production, you'd map schools to states/regions
  // For now, return a moderate score
  return 6;
}

/**
 * Calculate audience demographics match score (0-10 points)
 */
function calculateAudienceDemographicsMatch(
  agencyDemographics?: {
    age_range?: { min: number; max: number };
    gender?: string[];
    interests?: string[];
  },
  athleteAge?: number,
  athleteInterests: string[] = []
): number {
  if (!agencyDemographics) return 8; // Neutral if no target demographics

  let score = 0;

  // Age match (if athlete age is provided)
  if (athleteAge && agencyDemographics.age_range) {
    const isAgeMatch = isInRange(
      athleteAge,
      agencyDemographics.age_range.min,
      agencyDemographics.age_range.max
    );
    score += isAgeMatch ? 5 : 2;
  } else {
    score += 4; // Neutral
  }

  // Interest match
  if (agencyDemographics.interests?.length && athleteInterests.length) {
    const similarity = calculateJaccardSimilarity(
      agencyDemographics.interests,
      athleteInterests
    );
    score += Math.round(similarity * 5);
  } else {
    score += 3; // Neutral
  }

  return Math.min(score, 10); // Max 10 points
}

/**
 * Calculate engagement quality score (0-10 points)
 */
function calculateEngagementQuality(
  athleteEngagementRate?: number,
  athleteFollowers?: number
): number {
  let score = 0;

  // Engagement rate scoring (0-7 points)
  if (athleteEngagementRate !== undefined) {
    if (athleteEngagementRate >= 5.0) score += 7; // Excellent (5%+)
    else if (athleteEngagementRate >= 3.0) score += 5; // Good (3-5%)
    else if (athleteEngagementRate >= 1.5) score += 3; // Average (1.5-3%)
    else score += 1; // Below average
  } else {
    score += 3; // Neutral if no data
  }

  // Follower count bonus (0-3 points)
  if (athleteFollowers !== undefined) {
    if (athleteFollowers >= 100000) score += 3; // 100K+
    else if (athleteFollowers >= 10000) score += 2; // 10K-100K
    else if (athleteFollowers >= 1000) score += 1; // 1K-10K
  } else {
    score += 1; // Neutral if no data
  }

  return Math.min(score, 10); // Max 10 points
}

/**
 * Generate human-readable reasons for the match
 */
function generateMatchReasons(
  breakdown: MatchScore['breakdown'],
  athlete: EnhancedAthleteProfile,
  agency: Partial<AgencyProfile>
): string[] {
  const reasons: string[] = [];

  if (breakdown.brand_values_match >= 15) {
    reasons.push('Strong alignment on brand values');
  }

  if (breakdown.interests_alignment >= 15) {
    reasons.push('Shared interests and passions');
  }

  if (breakdown.campaign_type_fit >= 12) {
    reasons.push('Campaign types match athlete preferences');
  }

  if (breakdown.budget_compatibility >= 12) {
    reasons.push('Budget range aligns with athlete expectations');
  }

  if (breakdown.engagement_quality >= 7) {
    reasons.push('High-quality audience engagement');
  }

  if (athlete.total_followers && athlete.total_followers >= 50000) {
    reasons.push(`Strong social media presence (${athlete.total_followers.toLocaleString()} followers)`);
  }

  if (athlete.profile_completion_score && athlete.profile_completion_score >= 80) {
    reasons.push('Complete and professional profile');
  }

  return reasons;
}

/**
 * Generate potential concerns about the match
 */
function generateMatchConcerns(
  breakdown: MatchScore['breakdown'],
  athlete: EnhancedAthleteProfile,
  agency: Partial<AgencyProfile>
): string[] {
  const concerns: string[] = [];

  if (breakdown.budget_compatibility < 8) {
    concerns.push('Budget expectations may not align');
  }

  if (breakdown.brand_values_match < 10) {
    concerns.push('Limited overlap in brand values');
  }

  if (breakdown.engagement_quality < 5) {
    concerns.push('Engagement rate could be higher');
  }

  if (!athlete.social_media_stats?.length) {
    concerns.push('No social media stats provided');
  }

  if (!athlete.content_samples?.length) {
    concerns.push('No content samples to review');
  }

  if (athlete.profile_completion_score && athlete.profile_completion_score < 60) {
    concerns.push('Profile could be more complete');
  }

  return concerns;
}

/**
 * Main matchmaking function - calculates compatibility between agency and athlete
 */
export function calculateMatchScore(
  athlete: EnhancedAthleteProfile,
  agency: Partial<AgencyProfile> | MatchmakingQuery
): MatchScore {
  // Calculate each component of the match score
  const breakdown = {
    brand_values_match: calculateBrandValuesMatch(
      agency.brand_values || [],
      athlete.brand_values || []
    ),
    interests_alignment: calculateInterestsAlignment(
      agency.campaign_interests || [],
      {
        hobbies: athlete.hobbies,
        lifestyle_interests: athlete.lifestyle_interests,
        content_creation_interests: athlete.content_creation_interests,
      }
    ),
    campaign_type_fit: calculateCampaignTypeFit(
      agency.campaign_interests || [],
      athlete.nil_preferences?.preferred_deal_types || []
    ),
    budget_compatibility: calculateBudgetCompatibility(
      agency.budget_range,
      athlete.nil_preferences
    ),
    geographic_match: calculateGeographicMatch(
      agency.geographic_focus || [],
      athlete.school
    ),
    audience_demographics: calculateAudienceDemographicsMatch(
      agency.target_demographics,
      undefined, // Would need athlete birth date to calculate age
      [
        ...(athlete.hobbies || []),
        ...(athlete.lifestyle_interests || []),
      ]
    ),
    engagement_quality: calculateEngagementQuality(
      athlete.avg_engagement_rate,
      athlete.total_followers
    ),
  };

  // Calculate total score
  const total_score = Object.values(breakdown).reduce((sum, score) => sum + score, 0);

  // Generate reasons and concerns
  const reasons = generateMatchReasons(breakdown, athlete, agency);
  const concerns = generateMatchConcerns(breakdown, athlete, agency);

  return {
    athlete_id: athlete.user_id,
    total_score,
    breakdown,
    reasons,
    concerns: concerns.length > 0 ? concerns : undefined,
  };
}

/**
 * Filter athletes based on hard requirements
 */
export function filterAthletesByRequirements(
  athletes: EnhancedAthleteProfile[],
  query: MatchmakingQuery
): EnhancedAthleteProfile[] {
  return athletes.filter(athlete => {
    // Follower count filters
    if (query.min_followers && (athlete.total_followers || 0) < query.min_followers) {
      return false;
    }
    if (query.max_followers && (athlete.total_followers || 0) > query.max_followers) {
      return false;
    }

    // Engagement rate filter
    if (query.min_engagement_rate && (athlete.avg_engagement_rate || 0) < query.min_engagement_rate) {
      return false;
    }

    // Sport filter
    if (query.sports?.length && !query.sports.includes(athlete.sport)) {
      return false;
    }

    // School filter
    if (query.schools?.length && !query.schools.includes(athlete.school)) {
      return false;
    }

    // Graduation year filter
    if (query.graduation_years?.length && athlete.graduation_year &&
        !query.graduation_years.includes(athlete.graduation_year)) {
      return false;
    }

    return true;
  });
}

/**
 * Sort athletes by match score or other criteria
 */
export function sortAthletes(
  athletesWithScores: Array<{ athlete: EnhancedAthleteProfile; score: MatchScore }>,
  sortBy: 'match_score' | 'followers' | 'engagement' | 'profile_completion' = 'match_score',
  sortOrder: 'asc' | 'desc' = 'desc'
): Array<{ athlete: EnhancedAthleteProfile; score: MatchScore }> {
  const sorted = [...athletesWithScores].sort((a, b) => {
    let valueA: number;
    let valueB: number;

    switch (sortBy) {
      case 'match_score':
        valueA = a.score.total_score;
        valueB = b.score.total_score;
        break;
      case 'followers':
        valueA = a.athlete.total_followers || 0;
        valueB = b.athlete.total_followers || 0;
        break;
      case 'engagement':
        valueA = a.athlete.avg_engagement_rate || 0;
        valueB = b.athlete.avg_engagement_rate || 0;
        break;
      case 'profile_completion':
        valueA = a.athlete.profile_completion_score || 0;
        valueB = b.athlete.profile_completion_score || 0;
        break;
      default:
        valueA = a.score.total_score;
        valueB = b.score.total_score;
    }

    return sortOrder === 'desc' ? valueB - valueA : valueA - valueB;
  });

  return sorted;
}

/**
 * Main matchmaking pipeline - filters, scores, and sorts athletes
 */
export function matchAthletesToAgency(
  athletes: EnhancedAthleteProfile[],
  query: MatchmakingQuery
): Array<{ athlete: EnhancedAthleteProfile; score: MatchScore }> {
  // Step 1: Filter by hard requirements
  const filtered = filterAthletesByRequirements(athletes, query);

  // Step 2: Calculate match scores
  const withScores = filtered.map(athlete => ({
    athlete,
    score: calculateMatchScore(athlete, query),
  }));

  // Step 3: Sort by preference
  const sorted = sortAthletes(
    withScores,
    query.sort_by || 'match_score',
    query.sort_order || 'desc'
  );

  // Step 4: Apply pagination
  const offset = query.offset || 0;
  const limit = query.limit || 50;
  const paginated = sorted.slice(offset, offset + limit);

  return paginated;
}

/**
 * Get match score interpretation
 */
export function interpretMatchScore(score: number): {
  level: 'excellent' | 'good' | 'fair' | 'poor';
  label: string;
  description: string;
  color: string;
} {
  if (score >= 80) {
    return {
      level: 'excellent',
      label: 'Excellent Match',
      description: 'Highly compatible partnership opportunity',
      color: 'green',
    };
  } else if (score >= 60) {
    return {
      level: 'good',
      label: 'Good Match',
      description: 'Strong potential for successful partnership',
      color: 'blue',
    };
  } else if (score >= 40) {
    return {
      level: 'fair',
      label: 'Fair Match',
      description: 'Some alignment, may require discussion',
      color: 'yellow',
    };
  } else {
    return {
      level: 'poor',
      label: 'Limited Match',
      description: 'Significant gaps in alignment',
      color: 'red',
    };
  }
}
