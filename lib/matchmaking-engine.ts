/**
 * Enhanced Matchmaking Engine for Agency-Athlete Partnerships
 * ===========================================================
 * 11-factor scoring system for calculating compatibility between
 * agencies and athletes based on comprehensive profile analysis.
 *
 * This is an enhanced version of lib/matchmaking.ts with additional factors.
 *
 * Scoring Factors (Total: 100 points):
 * 1. Sport Alignment (10 points)
 * 2. Geographic Match (10 points)
 * 3. School Division (5 points)
 * 4. Follower Count (10 points)
 * 5. Engagement Rate (15 points)
 * 6. Audience Demographics (5 points)
 * 7. Hobby Overlap (15 points)
 * 8. Brand Affinity (10 points)
 * 9. Past NIL Success (10 points)
 * 10. Content Quality (5 points)
 * 11. Response Rate (5 points)
 */

import type { User } from './types';

export interface MatchScore {
  sport_alignment: number;
  geographic_match: number;
  school_division: number;
  follower_count: number;
  engagement_rate: number;
  audience_demographics: number;
  hobby_overlap: number;
  brand_affinity: number;
  past_nil_success: number;
  content_quality: number;
  response_rate: number;
}

export interface MatchResult {
  score: number;
  breakdown: MatchScore;
  reasons: string[];
  tier: 'excellent' | 'good' | 'potential' | 'poor';
}

/**
 * Calculate comprehensive match score between agency and athlete
 */
export function calculateMatchScore(
  agency: any,
  athlete: any
): MatchResult {
  const breakdown: MatchScore = {
    sport_alignment: 0,
    geographic_match: 0,
    school_division: 0,
    follower_count: 0,
    engagement_rate: 0,
    audience_demographics: 0,
    hobby_overlap: 0,
    brand_affinity: 0,
    past_nil_success: 0,
    content_quality: 0,
    response_rate: 0
  };

  const reasons: string[] = [];

  // Check if agency has complete targeting preferences
  const hasAgencyPreferences = !!(
    agency.campaign_interests?.length ||
    agency.geographic_focus?.length ||
    agency.target_demographics
  );

  // 1. Sport Alignment (10 points)
  // If agency has no preferences, give full credit for any athlete with a sport
  if (!agency.campaign_interests?.length) {
    // Agency hasn't set preferences - give credit for having a sport
    if (athlete.primary_sport) {
      breakdown.sport_alignment = 8;
      reasons.push(`${athlete.primary_sport} athlete`);
    }
  } else if (agency.campaign_interests?.includes(athlete.primary_sport || '')) {
    breakdown.sport_alignment = 10;
    reasons.push(`${athlete.primary_sport} athlete matches campaign focus`);
  } else if (athlete.primary_sport) {
    // Partial credit for related sports
    breakdown.sport_alignment = 5;
    reasons.push(`${athlete.primary_sport} athlete available`);
  }

  // 2. Geographic Match (10 points)
  const athleteState = extractState(athlete.school_name || '');
  // If agency has no geographic preferences, give credit for having a school
  if (!agency.geographic_focus?.length) {
    if (athleteState) {
      breakdown.geographic_match = 7;
      reasons.push(`Based in ${athleteState}`);
    } else if (athlete.school_name) {
      breakdown.geographic_match = 5;
    }
  } else if (athleteState && agency.geographic_focus?.includes(athleteState)) {
    breakdown.geographic_match = 10;
    reasons.push(`Located in target region (${athleteState})`);
  } else if (athleteState) {
    // Partial credit if in same general region
    breakdown.geographic_match = 4;
  }

  // 3. School Division (5 points)
  const division = inferDivision(athlete.school_name || '');
  if (division === 'D1') {
    breakdown.school_division = 5;
    reasons.push('Division 1 athlete');
  } else if (division === 'D2') {
    breakdown.school_division = 3;
  } else if (division === 'D3') {
    breakdown.school_division = 2;
  }

  // 4. Follower Count (10 points)
  const totalFollowers = calculateTotalFollowers(athlete.social_media_stats);
  const hasFollowerTarget = agency.target_demographics?.follower_min;
  const targetMin = hasFollowerTarget || 1000;

  if (totalFollowers >= targetMin) {
    const ratio = totalFollowers / targetMin;
    breakdown.follower_count = Math.min(10, ratio >= 2 ? 10 : 5 + (ratio - 1) * 5);
    reasons.push(`${formatNumber(totalFollowers)} followers`);
  } else if (totalFollowers > 0) {
    // More generous partial credit when agency hasn't set preferences
    const partialMax = hasFollowerTarget ? 5 : 8;
    breakdown.follower_count = Math.min(partialMax, (totalFollowers / targetMin) * partialMax);
    if (totalFollowers >= 500 && !hasFollowerTarget) {
      reasons.push(`${formatNumber(totalFollowers)} followers`);
    }
  } else {
    // Small credit for having a profile even without follower data
    breakdown.follower_count = 2;
  }

  // 5. Engagement Rate (15 points)
  const engagementRate = calculateEngagementRate(athlete.social_media_stats);
  const hasEngagementTarget = agency.target_demographics?.engagement_min;
  const targetEngagement = hasEngagementTarget || 2.0;

  if (engagementRate >= targetEngagement) {
    const ratio = engagementRate / targetEngagement;
    breakdown.engagement_rate = Math.min(15, ratio >= 2 ? 15 : 8 + (ratio - 1) * 7);
    reasons.push(`${engagementRate.toFixed(1)}% engagement rate`);
  } else if (engagementRate > 0) {
    // More generous when agency hasn't set preferences
    const partialMax = hasEngagementTarget ? 7 : 10;
    breakdown.engagement_rate = Math.min(partialMax, (engagementRate / targetEngagement) * partialMax);
  } else {
    // Small credit for having a profile
    breakdown.engagement_rate = 3;
  }

  // 6. Audience Demographics (5 points) - placeholder for future demographic analysis
  // Would analyze athlete's audience age, gender, location from social stats
  // Give better score for completed profiles
  breakdown.audience_demographics = athlete.onboarding_completed ? 4 : 3;

  // 7. Hobby Overlap (15 points)
  const athleteHobbies = athlete.hobbies || [];
  const agencyInterests = [
    ...(agency.campaign_interests || []),
    ...(agency.brand_values || [])
  ];

  // If agency has no interests set, give credit for having hobbies
  if (agencyInterests.length === 0) {
    if (athleteHobbies.length > 0) {
      breakdown.hobby_overlap = Math.min(10, 5 + athleteHobbies.length * 2);
      reasons.push(`Active interests: ${athleteHobbies.slice(0, 3).join(', ')}`);
    } else {
      breakdown.hobby_overlap = 5; // Neutral when both are empty
    }
  } else {
    const hobbyOverlap = athleteHobbies.filter((h: string) =>
      agencyInterests.some((i: string) => i.toLowerCase().includes(h.toLowerCase()) ||
                                 h.toLowerCase().includes(i.toLowerCase()))
    );

    if (hobbyOverlap.length > 0) {
      breakdown.hobby_overlap = Math.min(15, hobbyOverlap.length * 5);
      reasons.push(`Shared interests: ${hobbyOverlap.slice(0, 3).join(', ')}`);
    } else if (athleteHobbies.length > 0) {
      // Partial credit for having documented interests
      breakdown.hobby_overlap = 4;
    }
  }

  // 8. Brand Affinity (10 points)
  const brandAffinity = athlete.brand_affinity || [];
  if (brandAffinity.includes(agency.company_name || '')) {
    breakdown.brand_affinity = 10;
    reasons.push(`Already follows ${agency.company_name}`);
  } else if (brandAffinity.length > 0) {
    // Check for related brands or categories
    const relatedBrands = brandAffinity.filter((brand: string) =>
      agencyInterests.some((interest: string) =>
        brand.toLowerCase().includes(interest.toLowerCase())
      )
    );
    if (relatedBrands.length > 0) {
      breakdown.brand_affinity = 6;
      reasons.push(`Interested in similar brands`);
    } else {
      // Credit for having brand interests documented
      breakdown.brand_affinity = 4;
    }
  } else {
    // Small credit for onboarded athletes
    breakdown.brand_affinity = athlete.onboarding_completed ? 3 : 0;
  }

  // 9. Past NIL Success (10 points)
  // Would query nil_deals table in actual implementation
  // For now, check if athlete has NIL preferences set
  if (athlete.nil_preferences) {
    const prefs = athlete.nil_preferences as any;
    if (prefs.previous_deals_count > 0) {
      breakdown.past_nil_success = 10;
      reasons.push(`${prefs.previous_deals_count} previous NIL deals`);
    } else if (prefs.interested_in_nil) {
      breakdown.past_nil_success = 6;
      reasons.push('Actively seeking NIL opportunities');
    } else {
      breakdown.past_nil_success = 4;
    }
  } else {
    // Give credit to onboarded athletes as they're actively using the platform
    breakdown.past_nil_success = athlete.onboarding_completed ? 5 : 3;
    if (athlete.onboarding_completed) {
      reasons.push('Verified athlete on platform');
    }
  }

  // 10. Content Quality (5 points)
  const contentSamples = athlete.content_samples || [];
  if (contentSamples.length >= 3) {
    breakdown.content_quality = 5;
    reasons.push(`${contentSamples.length} content samples available`);
  } else if (contentSamples.length > 0) {
    breakdown.content_quality = 3;
  } else {
    // Small credit for completed profile
    breakdown.content_quality = athlete.onboarding_completed ? 2 : 0;
  }

  // 11. Response Rate (5 points)
  // Would calculate from past match interactions in actual implementation
  // Give better score to active/verified athletes
  breakdown.response_rate = athlete.onboarding_completed ? 4 : 3;

  // Calculate total score
  const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  const tier = getTier(totalScore);

  return {
    score: Math.round(totalScore),
    breakdown,
    reasons,
    tier
  };
}

/**
 * Extract state code from school name
 */
function extractState(schoolName: string): string {
  const statePatterns: Record<string, string[]> = {
    'KY': ['Kentucky', 'Louisville', 'Lexington'],
    'TN': ['Tennessee', 'Vanderbilt', 'Memphis'],
    'OH': ['Ohio State', 'Cincinnati', 'Cleveland'],
    'IN': ['Indiana', 'Purdue', 'Notre Dame'],
    'IL': ['Illinois', 'Northwestern', 'Chicago'],
    'CA': ['California', 'USC', 'UCLA', 'Stanford', 'Berkeley'],
    'TX': ['Texas', 'Houston', 'Dallas', 'Austin'],
    'FL': ['Florida', 'Miami', 'Tampa'],
    'NY': ['New York', 'Syracuse', 'Cornell'],
    'PA': ['Pennsylvania', 'Penn State', 'Pittsburgh'],
    'MI': ['Michigan', 'Detroit'],
    'NC': ['North Carolina', 'Duke', 'Carolina'],
    'GA': ['Georgia', 'Atlanta']
  };

  for (const [state, patterns] of Object.entries(statePatterns)) {
    if (patterns.some(pattern => schoolName.includes(pattern))) {
      return state;
    }
  }

  // Try to extract state abbreviation
  const stateMatch = schoolName.match(/\b([A-Z]{2})\b/);
  return stateMatch ? stateMatch[1] : '';
}

/**
 * Infer school division from school name
 */
function inferDivision(schoolName: string): 'D1' | 'D2' | 'D3' | 'Unknown' {
  const d1Keywords = [
    'State University', 'University of', 'Tech', 'College',
    'Kentucky', 'Tennessee', 'Ohio State', 'Michigan', 'Texas',
    'Florida', 'California', 'Alabama', 'Georgia', 'Penn State'
  ];

  for (const keyword of d1Keywords) {
    if (schoolName.includes(keyword)) {
      return 'D1';
    }
  }

  return 'Unknown';
}

/**
 * Calculate total followers across all platforms
 */
function calculateTotalFollowers(socialStats: any): number {
  if (!socialStats || typeof socialStats !== 'object') return 0;

  let total = 0;
  const platforms = ['instagram', 'tiktok', 'twitter', 'youtube', 'facebook'];

  for (const platform of platforms) {
    if (socialStats[platform]?.followers) {
      total += Number(socialStats[platform].followers) || 0;
    }
  }

  return total;
}

/**
 * Calculate average engagement rate across platforms
 */
function calculateEngagementRate(socialStats: any): number {
  if (!socialStats || typeof socialStats !== 'object') return 0;

  const platforms = ['instagram', 'tiktok', 'twitter', 'youtube'];
  let totalRate = 0;
  let count = 0;

  for (const platform of platforms) {
    if (socialStats[platform]?.engagement_rate) {
      totalRate += Number(socialStats[platform].engagement_rate) || 0;
      count++;
    }
  }

  return count > 0 ? totalRate / count : 0;
}

/**
 * Format large numbers for display
 */
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Determine match tier based on score
 */
export function getTier(score: number): 'excellent' | 'good' | 'potential' | 'poor' {
  if (score >= 75) return 'excellent';
  if (score >= 55) return 'good';
  if (score >= 35) return 'potential';
  return 'poor';
}

/**
 * Generate match highlights from reasons
 */
export function generateMatchHighlights(reasons: string[], maxHighlights: number = 5): string[] {
  return reasons.slice(0, maxHighlights);
}
