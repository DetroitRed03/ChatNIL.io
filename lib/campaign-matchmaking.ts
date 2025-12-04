/**
 * Campaign Matchmaking Engine
 * Matches athletes with agency campaigns based on multiple compatibility factors
 *
 * Scoring Formula (0-100 points):
 * - Brand Values Alignment: 20 points (shared values and causes)
 * - Interest Matching: 15 points (lifestyle, hobbies, content creation)
 * - Campaign Fit: 20 points (sport, demographics, deliverables)
 * - Budget Compatibility: 15 points (FMV vs offered amount)
 * - Geographic Alignment: 10 points (state/location matching)
 * - Demographics: 10 points (school level, age, gender)
 * - Engagement Potential: 10 points (social reach vs campaign requirements)
 */

import { createClient } from '@supabase/supabase-js';

export interface MatchScore {
  total: number; // 0-100
  brandValues: number; // 0-20
  interests: number; // 0-15
  campaignFit: number; // 0-20
  budget: number; // 0-15
  geography: number; // 0-10
  demographics: number; // 0-10
  engagement: number; // 0-10
}

export interface AthleteMatch {
  athleteId: string;
  athleteName: string;
  athleteProfile: any;
  campaignId: string;
  campaignName: string;
  matchScore: MatchScore;
  matchPercentage: number; // total as percentage
  strengths: string[];
  concerns: string[];
  recommendedOffer: number; // in cents
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Calculate brand values alignment score (0-20 points)
 */
export function calculateBrandValuesScore(
  athleteBrandAffinity: string[],
  athleteCauses: string[],
  campaignBrandValues?: string[],
  campaignCauses?: string[]
): {
  score: number;
  breakdown: any;
} {
  let score = 0;
  const breakdown: any = {};

  // Brand affinity matching (0-12 points)
  if (campaignBrandValues && campaignBrandValues.length > 0) {
    const matchedValues = athleteBrandAffinity.filter(v =>
      campaignBrandValues.some(cv => cv.toLowerCase() === v.toLowerCase())
    );
    const matchRatio = matchedValues.length / Math.max(campaignBrandValues.length, 1);
    const brandScore = Math.round(matchRatio * 12);
    score += brandScore;
    breakdown.brandAffinityScore = brandScore;
    breakdown.matchedValues = matchedValues;
  } else {
    // No specific brand values required - give partial credit
    breakdown.brandAffinityScore = 6;
    score += 6;
  }

  // Causes alignment (0-8 points)
  if (campaignCauses && campaignCauses.length > 0) {
    const matchedCauses = athleteCauses.filter(c =>
      campaignCauses.some(cc => cc.toLowerCase() === c.toLowerCase())
    );
    const matchRatio = matchedCauses.length / Math.max(campaignCauses.length, 1);
    const causesScore = Math.round(matchRatio * 8);
    score += causesScore;
    breakdown.causesScore = causesScore;
    breakdown.matchedCauses = matchedCauses;
  } else {
    // No specific causes required
    breakdown.causesScore = 4;
    score += 4;
  }

  return {
    score: Math.min(20, score),
    breakdown
  };
}

/**
 * Calculate interest matching score (0-15 points)
 */
export function calculateInterestScore(
  athleteHobbies: string[],
  athleteLifestyle: string[],
  athleteContentInterests: string[],
  campaignTargetInterests?: string[],
  campaignContentCategories?: string[]
): {
  score: number;
  breakdown: any;
} {
  let score = 0;
  const breakdown: any = {};

  // Lifestyle/hobbies matching (0-7 points)
  if (campaignTargetInterests && campaignTargetInterests.length > 0) {
    const allAthleteInterests = [...athleteHobbies, ...athleteLifestyle];
    const matchedInterests = allAthleteInterests.filter(i =>
      campaignTargetInterests.some(ti => ti.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(ti.toLowerCase()))
    );
    const matchRatio = matchedInterests.length / Math.max(campaignTargetInterests.length, 1);
    const interestScore = Math.round(matchRatio * 7);
    score += interestScore;
    breakdown.lifestyleScore = interestScore;
    breakdown.matchedInterests = matchedInterests;
  } else {
    breakdown.lifestyleScore = 4;
    score += 4;
  }

  // Content creation matching (0-8 points)
  if (campaignContentCategories && campaignContentCategories.length > 0) {
    const matchedContent = athleteContentInterests.filter(c =>
      campaignContentCategories.some(cc => cc.toLowerCase() === c.toLowerCase())
    );
    const matchRatio = matchedContent.length / Math.max(campaignContentCategories.length, 1);
    const contentScore = Math.round(matchRatio * 8);
    score += contentScore;
    breakdown.contentScore = contentScore;
    breakdown.matchedContent = matchedContent;
  } else {
    breakdown.contentScore = 4;
    score += 4;
  }

  return {
    score: Math.min(15, score),
    breakdown
  };
}

/**
 * Calculate campaign fit score (0-20 points)
 */
export function calculateCampaignFitScore(
  athleteSport: string,
  athleteSecondarySports: string[],
  athleteSchoolLevel: string,
  campaignTargetSports: string[],
  campaignTargetSchoolLevels: string[]
): {
  score: number;
  breakdown: any;
} {
  let score = 0;
  const breakdown: any = {};

  // Sport matching (0-12 points)
  const allAthleteSports = [athleteSport, ...(athleteSecondarySports || [])];
  const sportMatches = allAthleteSports.filter(s =>
    campaignTargetSports.some(ts => ts.toLowerCase() === s.toLowerCase())
  );

  if (sportMatches.length > 0) {
    // Perfect match if primary sport matches
    if (campaignTargetSports.some(ts => ts.toLowerCase() === athleteSport.toLowerCase())) {
      score += 12;
      breakdown.sportScore = 12;
      breakdown.sportMatch = 'primary';
    } else {
      // Partial match for secondary sport
      score += 8;
      breakdown.sportScore = 8;
      breakdown.sportMatch = 'secondary';
    }
  } else {
    breakdown.sportScore = 0;
    breakdown.sportMatch = 'none';
  }

  // School level matching (0-8 points)
  if (campaignTargetSchoolLevels.includes(athleteSchoolLevel)) {
    score += 8;
    breakdown.schoolLevelScore = 8;
    breakdown.schoolLevelMatch = true;
  } else {
    breakdown.schoolLevelScore = 0;
    breakdown.schoolLevelMatch = false;
  }

  return {
    score: Math.min(20, score),
    breakdown
  };
}

/**
 * Calculate budget compatibility score (0-15 points)
 */
export function calculateBudgetScore(
  athleteFMVLow: number,
  athleteFMVHigh: number,
  campaignBudgetPerAthlete: number
): {
  score: number;
  breakdown: any;
} {
  const breakdown: any = {};
  breakdown.athleteFMVRange = `$${(athleteFMVLow / 100).toFixed(0)} - $${(athleteFMVHigh / 100).toFixed(0)}`;
  breakdown.campaignBudget = `$${(campaignBudgetPerAthlete / 100).toFixed(0)}`;

  const athleteFMVMid = (athleteFMVLow + athleteFMVHigh) / 2;

  // Perfect match: budget within FMV range
  if (campaignBudgetPerAthlete >= athleteFMVLow && campaignBudgetPerAthlete <= athleteFMVHigh) {
    breakdown.budgetFit = 'perfect';
    return { score: 15, breakdown };
  }

  // Good match: budget within 20% of FMV
  const ratio = campaignBudgetPerAthlete / athleteFMVMid;
  if (ratio >= 0.8 && ratio <= 1.2) {
    breakdown.budgetFit = 'good';
    return { score: 12, breakdown };
  }

  // Acceptable: budget within 40% of FMV
  if (ratio >= 0.6 && ratio <= 1.4) {
    breakdown.budgetFit = 'acceptable';
    return { score: 8, breakdown };
  }

  // Poor match: budget too far from FMV
  if (ratio < 0.6) {
    breakdown.budgetFit = 'too_low';
    return { score: 3, breakdown };
  } else {
    breakdown.budgetFit = 'over_budget';
    return { score: 10, breakdown };
  }
}

/**
 * Calculate geographic alignment score (0-10 points)
 */
export function calculateGeographyScore(
  athleteState: string,
  athleteCity: string,
  campaignTargetStates: string[],
  campaignTargetCities?: string[]
): {
  score: number;
  breakdown: any;
} {
  let score = 0;
  const breakdown: any = {};

  // State matching (0-7 points)
  if (campaignTargetStates.length === 0) {
    // No geographic restrictions
    score += 7;
    breakdown.stateScore = 7;
    breakdown.stateMatch = 'no_restriction';
  } else if (campaignTargetStates.includes(athleteState)) {
    score += 7;
    breakdown.stateScore = 7;
    breakdown.stateMatch = true;
  } else {
    breakdown.stateScore = 0;
    breakdown.stateMatch = false;
  }

  // City matching (0-3 points) - bonus if specified
  if (campaignTargetCities && campaignTargetCities.length > 0) {
    if (campaignTargetCities.some(c => c.toLowerCase() === athleteCity.toLowerCase())) {
      score += 3;
      breakdown.cityScore = 3;
      breakdown.cityMatch = true;
    } else {
      breakdown.cityScore = 0;
      breakdown.cityMatch = false;
    }
  } else {
    // No city restriction - give full points
    score += 3;
    breakdown.cityScore = 3;
    breakdown.cityMatch = 'no_restriction';
  }

  return {
    score: Math.min(10, score),
    breakdown
  };
}

/**
 * Calculate demographics score (0-10 points)
 */
export function calculateDemographicsScore(
  athleteGender: string,
  athleteGraduationYear: number,
  campaignTargetGender?: string,
  campaignTargetAgeRange?: { min: number; max: number }
): {
  score: number;
  breakdown: any;
} {
  let score = 0;
  const breakdown: any = {};

  // Gender matching (0-5 points)
  if (!campaignTargetGender || campaignTargetGender === 'any') {
    score += 5;
    breakdown.genderScore = 5;
    breakdown.genderMatch = 'no_restriction';
  } else if (campaignTargetGender.toLowerCase() === athleteGender.toLowerCase()) {
    score += 5;
    breakdown.genderScore = 5;
    breakdown.genderMatch = true;
  } else {
    breakdown.genderScore = 0;
    breakdown.genderMatch = false;
  }

  // Age/graduation year matching (0-5 points)
  const currentYear = new Date().getFullYear();
  const athleteAge = currentYear - (athleteGraduationYear - 18); // Approximate age

  if (!campaignTargetAgeRange) {
    score += 5;
    breakdown.ageScore = 5;
    breakdown.ageMatch = 'no_restriction';
  } else if (athleteAge >= campaignTargetAgeRange.min && athleteAge <= campaignTargetAgeRange.max) {
    score += 5;
    breakdown.ageScore = 5;
    breakdown.ageMatch = true;
  } else {
    breakdown.ageScore = 0;
    breakdown.ageMatch = false;
  }

  return {
    score: Math.min(10, score),
    breakdown
  };
}

/**
 * Calculate engagement potential score (0-10 points)
 */
export function calculateEngagementScore(
  athleteTotalFollowers: number,
  athleteAvgEngagement: number,
  campaignMinFollowers: number,
  campaignMinEngagement: number
): {
  score: number;
  breakdown: any;
} {
  let score = 0;
  const breakdown: any = {};

  // Follower count (0-6 points)
  if (campaignMinFollowers === 0) {
    score += 6;
    breakdown.followersScore = 6;
  } else {
    const followerRatio = athleteTotalFollowers / campaignMinFollowers;
    if (followerRatio >= 2.0) {
      score += 6; // Exceeds requirements
    } else if (followerRatio >= 1.5) {
      score += 5;
    } else if (followerRatio >= 1.2) {
      score += 4;
    } else if (followerRatio >= 1.0) {
      score += 3;
    } else if (followerRatio >= 0.8) {
      score += 2; // Close to requirement
    } else {
      score += 0; // Below requirement
    }
    breakdown.followersScore = score;
    breakdown.followerRatio = followerRatio;
  }

  // Engagement rate (0-4 points)
  const engagementFollowerScore = score;
  if (campaignMinEngagement === 0) {
    score += 4;
    breakdown.engagementScore = 4;
  } else {
    const engagementRatio = athleteAvgEngagement / campaignMinEngagement;
    if (engagementRatio >= 1.5) {
      score += 4; // Exceeds requirements
    } else if (engagementRatio >= 1.2) {
      score += 3;
    } else if (engagementRatio >= 1.0) {
      score += 2;
    } else if (engagementRatio >= 0.8) {
      score += 1; // Close to requirement
    } else {
      score += 0; // Below requirement
    }
    breakdown.engagementScore = score - engagementFollowerScore;
    breakdown.engagementRatio = engagementRatio;
  }

  return {
    score: Math.min(10, score),
    breakdown
  };
}

/**
 * Calculate recommended offer based on FMV and match quality
 */
export function calculateRecommendedOffer(
  athleteFMVLow: number,
  athleteFMVHigh: number,
  matchPercentage: number,
  campaignBudgetPerAthlete: number
): number {
  const athleteFMVMid = (athleteFMVLow + athleteFMVHigh) / 2;

  // Start with mid-point FMV
  let offer = athleteFMVMid;

  // Adjust based on match quality
  if (matchPercentage >= 85) {
    // Excellent match - offer toward high end
    offer = athleteFMVMid + (athleteFMVHigh - athleteFMVMid) * 0.5;
  } else if (matchPercentage >= 70) {
    // Good match - offer mid-range
    offer = athleteFMVMid;
  } else {
    // Lower match - offer toward low end
    offer = athleteFMVMid - (athleteFMVMid - athleteFMVLow) * 0.3;
  }

  // Don't exceed campaign budget
  offer = Math.min(offer, campaignBudgetPerAthlete);

  // Don't go below athlete's minimum
  offer = Math.max(offer, athleteFMVLow * 0.9);

  return Math.round(offer);
}

/**
 * Determine match confidence level
 */
export function getMatchConfidence(matchPercentage: number): 'high' | 'medium' | 'low' {
  if (matchPercentage >= 80) return 'high';
  if (matchPercentage >= 60) return 'medium';
  return 'low';
}

/**
 * Generate match strengths and concerns
 */
export function generateMatchInsights(
  matchScore: MatchScore,
  breakdown: any
): {
  strengths: string[];
  concerns: string[];
} {
  const strengths: string[] = [];
  const concerns: string[] = [];

  // Brand values
  if (matchScore.brandValues >= 16) {
    strengths.push('Strong brand alignment');
  } else if (matchScore.brandValues < 10) {
    concerns.push('Limited brand values alignment');
  }

  // Interests
  if (matchScore.interests >= 12) {
    strengths.push('Excellent interest match');
  } else if (matchScore.interests < 8) {
    concerns.push('Interest mismatch with campaign');
  }

  // Campaign fit
  if (matchScore.campaignFit >= 16) {
    strengths.push('Perfect campaign fit');
  } else if (matchScore.campaignFit < 10) {
    concerns.push('Poor sport/demographic fit');
  }

  // Budget
  if (matchScore.budget >= 12) {
    strengths.push('Budget aligns with FMV');
  } else if (matchScore.budget < 6) {
    concerns.push('Budget concerns');
  }

  // Geography
  if (matchScore.geography >= 8) {
    strengths.push('Geographic match');
  } else if (matchScore.geography < 5) {
    concerns.push('Geographic mismatch');
  }

  // Engagement
  if (matchScore.engagement >= 8) {
    strengths.push('Exceeds engagement requirements');
  } else if (matchScore.engagement < 5) {
    concerns.push('Below engagement requirements');
  }

  return { strengths, concerns };
}

/**
 * Main matchmaking function - finds best athlete matches for a campaign
 */
export async function findCampaignMatches(
  campaignId: string,
  options: {
    minMatchScore?: number; // Default: 50
    maxResults?: number; // Default: 50
    includeBreakdown?: boolean; // Default: false
  } = {}
): Promise<AthleteMatch[]> {
  const {
    minMatchScore = 50,
    maxResults = 50,
    includeBreakdown = false
  } = options;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Fetch campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from('agency_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    console.error('Campaign fetch error:', campaignError);
    throw new Error('Campaign not found');
  }

  // Normalize campaign data - handle schema differences
  // The actual DB has 'name' but code expects 'campaign_name'
  const normalizedCampaign = {
    ...campaign,
    campaign_name: campaign.name || campaign.campaign_name,
    // Optional fields with defaults
    budget_per_athlete: campaign.budget_per_athlete || Math.floor((campaign.budget || 0) / 5), // Estimate per-athlete budget
    target_school_levels: campaign.target_school_levels || [],
    brand_values: campaign.brand_values || [],
    target_causes: campaign.target_causes || [],
    target_interests: campaign.target_interests || [],
    content_categories: campaign.content_categories || [],
    target_states: campaign.target_states || [],
    target_cities: campaign.target_cities || [],
    target_gender: campaign.target_gender || null,
    target_age_range: campaign.target_age_range || null,
    min_followers: campaign.min_followers || 0,
    min_engagement_rate: campaign.min_engagement_rate || 0,
    target_sports: campaign.target_sports || [],
  };

  // Fetch athletes with separate queries to avoid FK relationship issues
  // Step 1: Get all athlete users
  const { data: athleteUsers, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'athlete');

  if (usersError) {
    console.error('Users fetch error:', usersError);
    throw new Error('Failed to fetch athletes');
  }

  if (!athleteUsers || athleteUsers.length === 0) {
    console.log('No athletes found in database');
    return [];
  }

  // Step 2: Get all public profiles
  const { data: publicProfiles, error: profilesError } = await supabase
    .from('athlete_public_profiles')
    .select('*');

  if (profilesError) {
    console.error('Profiles fetch error:', profilesError);
  }

  // Step 3: Get all FMV data
  const { data: fmvDataList, error: fmvError } = await supabase
    .from('athlete_fmv_data')
    .select('*');

  if (fmvError) {
    console.error('FMV data fetch error:', fmvError);
  }

  // Step 4: Get all social media stats
  const { data: socialStatsList, error: socialError } = await supabase
    .from('social_media_stats')
    .select('*');

  if (socialError) {
    console.error('Social stats fetch error:', socialError);
  }

  // Create lookup maps for O(1) access
  const profileMap = new Map((publicProfiles || []).map(p => [p.user_id, p]));
  const fmvMap = new Map((fmvDataList || []).map(f => [f.athlete_id, f]));
  const socialMap = new Map<string, any[]>();
  for (const stat of (socialStatsList || [])) {
    const userId = stat.user_id;
    if (!socialMap.has(userId)) {
      socialMap.set(userId, []);
    }
    socialMap.get(userId)!.push(stat);
  }

  // Combine data for each athlete
  const athletes = athleteUsers.map(user => ({
    ...user,
    athlete_public_profiles: profileMap.get(user.id),
    athlete_fmv_data: fmvMap.get(user.id),
    social_media_stats: socialMap.get(user.id) || [],
  }));

  const matches: AthleteMatch[] = [];

  // Calculate match score for each athlete
  for (const athlete of athletes) {
    // With left joins, these can be arrays or objects
    const profileData = athlete.athlete_public_profiles;
    const profile = Array.isArray(profileData)
      ? profileData[0]
      : profileData;

    const fmvDataArray = athlete.athlete_fmv_data;
    const fmvData = Array.isArray(fmvDataArray)
      ? fmvDataArray[0]
      : fmvDataArray;

    const socialStats = athlete.social_media_stats || [];

    // Skip athletes without profile or FMV data - they can't be properly matched
    if (!profile) {
      console.log(`Skipping athlete ${athlete.id} - no public profile`);
      continue;
    }

    // If no FMV data, create a default structure
    const effectiveFmvData = fmvData || {
      fmv_score: 0,
      fmv_tier: 'unranked',
      deal_value_min: 0,
      deal_value_max: 0,
    };

    // Calculate total followers and avg engagement
    const totalFollowers = socialStats.reduce((sum: number, s: any) => sum + (s.followers || 0), 0);
    const avgEngagement = socialStats.length > 0
      ? socialStats.reduce((sum: number, s: any) => sum + (s.engagement_rate || 0), 0) / socialStats.length
      : 0;

    // Calculate component scores using normalized campaign
    const brandValuesResult = calculateBrandValuesScore(
      athlete.brand_affinity || [],
      athlete.causes_care_about || [],
      normalizedCampaign.brand_values,
      normalizedCampaign.target_causes
    );

    const interestResult = calculateInterestScore(
      athlete.hobbies || [],
      athlete.lifestyle_interests || [],
      athlete.content_creation_interests || [],
      normalizedCampaign.target_interests,
      normalizedCampaign.content_categories
    );

    const campaignFitResult = calculateCampaignFitScore(
      profile.sport,
      (Array.isArray(profile.secondary_sports)
        ? profile.secondary_sports
        : (profile.secondary_sports ? [profile.secondary_sports] : [])),
      profile.school_level || '',
      normalizedCampaign.target_sports,
      normalizedCampaign.target_school_levels
    );

    // Handle FMV data column name differences (DB has deal_value_min/max, code expects estimated_deal_value_low/high)
    const fmvLow = effectiveFmvData.estimated_deal_value_low || effectiveFmvData.deal_value_min || 0;
    const fmvHigh = effectiveFmvData.estimated_deal_value_high || effectiveFmvData.deal_value_max || 0;

    const budgetResult = calculateBudgetScore(
      fmvLow,
      fmvHigh,
      normalizedCampaign.budget_per_athlete
    );

    const geographyResult = calculateGeographyScore(
      profile.state || '',
      profile.city || '',
      normalizedCampaign.target_states,
      normalizedCampaign.target_cities
    );

    const demographicsResult = calculateDemographicsScore(
      profile.gender || 'any',
      profile.graduation_year || new Date().getFullYear() + 4,
      normalizedCampaign.target_gender,
      normalizedCampaign.target_age_range
    );

    const engagementResult = calculateEngagementScore(
      totalFollowers,
      avgEngagement,
      normalizedCampaign.min_followers,
      normalizedCampaign.min_engagement_rate
    );

    // Build match score
    const matchScore: MatchScore = {
      total: Math.round(
        brandValuesResult.score +
        interestResult.score +
        campaignFitResult.score +
        budgetResult.score +
        geographyResult.score +
        demographicsResult.score +
        engagementResult.score
      ),
      brandValues: brandValuesResult.score,
      interests: interestResult.score,
      campaignFit: campaignFitResult.score,
      budget: budgetResult.score,
      geography: geographyResult.score,
      demographics: demographicsResult.score,
      engagement: engagementResult.score
    };

    // Filter by minimum score
    if (matchScore.total < minMatchScore) continue;

    const matchPercentage = matchScore.total;
    const { strengths, concerns } = generateMatchInsights(matchScore, {
      brandValues: brandValuesResult.breakdown,
      interests: interestResult.breakdown,
      campaignFit: campaignFitResult.breakdown,
      budget: budgetResult.breakdown,
      geography: geographyResult.breakdown,
      demographics: demographicsResult.breakdown,
      engagement: engagementResult.breakdown
    });

    const recommendedOffer = calculateRecommendedOffer(
      fmvLow,
      fmvHigh,
      matchPercentage,
      normalizedCampaign.budget_per_athlete
    );

    matches.push({
      athleteId: athlete.id,
      athleteName: `${athlete.first_name} ${athlete.last_name}`,
      athleteProfile: {
        ...profile,
        fmv_score: effectiveFmvData.fmv_score,
        fmv_tier: effectiveFmvData.fmv_tier,
        avatar_url: profile.avatar_url || profile.profile_image_url,
        total_followers: totalFollowers,
        avg_engagement_rate: avgEngagement,
      },
      campaignId: normalizedCampaign.id,
      campaignName: normalizedCampaign.campaign_name,
      matchScore,
      matchPercentage,
      strengths,
      concerns,
      recommendedOffer,
      confidence: getMatchConfidence(matchPercentage)
    });
  }

  // Sort by match score (descending) and limit results
  matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return matches.slice(0, maxResults);
}
