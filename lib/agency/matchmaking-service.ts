/**
 * Agency Matchmaking Service
 * Calculates match scores between agencies and athletes based on:
 * - 60% Trait Alignment (agency brand values vs athlete traits)
 * - 40% Criteria Match (targeting criteria)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  AgencyProfile,
  AgencyBrandValue,
  AgencyTargetCriteria,
  AgencyAthleteInteraction,
  MatchBreakdown,
  AthletePreview,
  AthleteSearchFilters,
  AthleteSearchResult,
  AgencyApiResponse,
} from '@/types/agency';

/**
 * Get a Supabase client with the service role key
 */
function getServiceClient(): SupabaseClient {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Weight constants
const TRAIT_ALIGNMENT_WEIGHT = 0.6;
const CRITERIA_MATCH_WEIGHT = 0.4;

interface AthleteWithTraits {
  id: string;
  first_name: string;
  last_name: string;
  primary_sport?: string;
  school_name?: string;
  graduation_year?: number;
  total_followers?: number;
  avg_engagement_rate?: number;
  profile_completion_score?: number;
  traits: {
    trait_id: string;
    score: number;
    trait: {
      id: string;
      name: string;
      display_name: string;
    };
  }[];
  archetype?: {
    id: string;
    name: string;
  };
}

/**
 * Calculate trait alignment score between agency brand values and athlete traits
 */
function calculateTraitAlignment(
  brandValues: AgencyBrandValue[],
  athleteTraits: { trait_id: string; score: number }[]
): { score: number; breakdown: MatchBreakdown['trait_scores'] } {
  if (brandValues.length === 0) {
    return { score: 0.5, breakdown: [] }; // Neutral if no values set
  }

  const breakdown: MatchBreakdown['trait_scores'] = [];
  let totalWeightedMatch = 0;
  let totalWeight = 0;

  for (const brandValue of brandValues) {
    const athleteTrait = athleteTraits.find(t => t.trait_id === brandValue.trait_id);
    const athleteScore = athleteTrait?.score || 0;

    // Score similarity: 1 = perfect match, 0 = opposite
    // Athlete scores are 0-100, normalize to 0-1
    const normalizedAthleteScore = athleteScore / 100;

    // Weight by importance and priority (priority 1 = highest)
    const priorityWeight = (6 - brandValue.priority) / 5; // 1->1.0, 5->0.2
    const importanceWeight = brandValue.importance_weight || 1;
    const combinedWeight = priorityWeight * importanceWeight;

    const weightedMatch = normalizedAthleteScore * combinedWeight;
    totalWeightedMatch += weightedMatch;
    totalWeight += combinedWeight;

    breakdown.push({
      trait_id: brandValue.trait_id,
      trait_name: brandValue.trait?.display_name || 'Unknown',
      athlete_score: athleteScore,
      agency_importance: combinedWeight,
      weighted_match: weightedMatch,
    });
  }

  const score = totalWeight > 0 ? totalWeightedMatch / totalWeight : 0.5;

  return { score, breakdown };
}

/**
 * Calculate criteria match score
 */
function calculateCriteriaMatch(
  criteria: AgencyTargetCriteria | null,
  athlete: AthleteWithTraits
): { score: number; breakdown: MatchBreakdown['criteria_matches'] } {
  if (!criteria) {
    return { score: 0.5, breakdown: [] }; // Neutral if no criteria set
  }

  const breakdown: MatchBreakdown['criteria_matches'] = [];
  let matches = 0;
  let total = 0;

  // Check sport match
  if (criteria.target_sports && criteria.target_sports.length > 0) {
    total++;
    const sportMatch = athlete.primary_sport &&
      criteria.target_sports.some(s =>
        s.toLowerCase() === athlete.primary_sport?.toLowerCase()
      );
    if (sportMatch) matches++;
    breakdown.push({
      criterion: 'Sport',
      matched: !!sportMatch,
      details: `Looking for: ${criteria.target_sports.join(', ')}`,
    });
  }

  // Check follower minimum
  if (criteria.min_followers && criteria.min_followers > 0) {
    total++;
    const followerMatch = (athlete.total_followers || 0) >= criteria.min_followers;
    if (followerMatch) matches++;
    breakdown.push({
      criterion: 'Minimum Followers',
      matched: followerMatch,
      details: `Requires ${criteria.min_followers.toLocaleString()}+, has ${(athlete.total_followers || 0).toLocaleString()}`,
    });
  }

  // Check follower maximum
  if (criteria.max_followers) {
    total++;
    const followerMatch = (athlete.total_followers || 0) <= criteria.max_followers;
    if (followerMatch) matches++;
    breakdown.push({
      criterion: 'Maximum Followers',
      matched: followerMatch,
      details: `Max ${criteria.max_followers.toLocaleString()}, has ${(athlete.total_followers || 0).toLocaleString()}`,
    });
  }

  // Check engagement rate
  if (criteria.min_engagement_rate && criteria.min_engagement_rate > 0) {
    total++;
    const engagementMatch = (athlete.avg_engagement_rate || 0) >= criteria.min_engagement_rate;
    if (engagementMatch) matches++;
    breakdown.push({
      criterion: 'Engagement Rate',
      matched: engagementMatch,
      details: `Requires ${criteria.min_engagement_rate}%+, has ${(athlete.avg_engagement_rate || 0).toFixed(1)}%`,
    });
  }

  // Check school level (would need school level field on athlete)
  // This is a placeholder - implement when school level is available

  // Check archetype preference
  if (criteria.preferred_archetypes && criteria.preferred_archetypes.length > 0 && athlete.archetype) {
    total++;
    const archetypeMatch = criteria.preferred_archetypes.includes(athlete.archetype.id);
    if (archetypeMatch) matches++;
    breakdown.push({
      criterion: 'Archetype',
      matched: archetypeMatch,
      details: `Athlete archetype: ${athlete.archetype.name}`,
    });
  }

  const score = total > 0 ? matches / total : 0.5;

  return { score, breakdown };
}

/**
 * Calculate overall match score for an athlete
 */
export function calculateMatchScore(
  brandValues: AgencyBrandValue[],
  criteria: AgencyTargetCriteria | null,
  athlete: AthleteWithTraits
): {
  overallScore: number;
  traitScore: number;
  criteriaScore: number;
  breakdown: MatchBreakdown
} {
  const traitResult = calculateTraitAlignment(
    brandValues,
    athlete.traits.map(t => ({ trait_id: t.trait_id, score: t.score }))
  );

  const criteriaResult = calculateCriteriaMatch(criteria, athlete);

  const overallScore =
    (traitResult.score * TRAIT_ALIGNMENT_WEIGHT) +
    (criteriaResult.score * CRITERIA_MATCH_WEIGHT);

  return {
    overallScore: Math.round(overallScore * 100),
    traitScore: Math.round(traitResult.score * 100),
    criteriaScore: Math.round(criteriaResult.score * 100),
    breakdown: {
      trait_scores: traitResult.breakdown,
      criteria_matches: criteriaResult.breakdown,
      overall_explanation: generateExplanation(overallScore, traitResult.score, criteriaResult.score),
    },
  };
}

/**
 * Generate human-readable explanation
 */
function generateExplanation(overall: number, trait: number, criteria: number): string {
  const overallPct = Math.round(overall * 100);

  if (overallPct >= 80) {
    return 'Excellent match! This athlete strongly aligns with your brand values and targeting criteria.';
  } else if (overallPct >= 60) {
    return 'Good match. This athlete shows solid alignment with your brand.';
  } else if (overallPct >= 40) {
    return 'Moderate match. Some alignment with your brand values and criteria.';
  } else {
    return 'Limited match. This athlete may not be the best fit for your current targeting.';
  }
}

/**
 * Search and score athletes for an agency
 */
export async function searchAthletesForAgency(
  agencyProfileId: string,
  filters: AthleteSearchFilters = {},
  client?: SupabaseClient
): Promise<AgencyApiResponse<AthleteSearchResult>> {
  const supabase = client || getServiceClient();

  // Get agency brand values and criteria
  const [brandValuesResult, criteriaResult] = await Promise.all([
    supabase
      .from('agency_brand_values')
      .select(`
        *,
        trait:core_traits(id, name, display_name, category)
      `)
      .eq('agency_profile_id', agencyProfileId),
    supabase
      .from('agency_target_criteria')
      .select('*')
      .eq('agency_profile_id', agencyProfileId)
      .single(),
  ]);

  const brandValues = brandValuesResult.data || [];
  const criteria = criteriaResult.data;

  // Build athlete query
  let query = supabase
    .from('users')
    .select(`
      id,
      first_name,
      last_name,
      primary_sport,
      school_name,
      graduation_year,
      total_followers,
      avg_engagement_rate,
      profile_completion_score,
      athlete_traits:athlete_traits(
        trait_id,
        score,
        trait:core_traits(id, name, display_name)
      )
    `, { count: 'exact' })
    .eq('role', 'athlete')
    .eq('onboarding_completed', true);

  // Apply filters
  if (filters.sports && filters.sports.length > 0) {
    query = query.in('primary_sport', filters.sports);
  }

  if (filters.min_followers) {
    query = query.gte('total_followers', filters.min_followers);
  }

  if (filters.max_followers) {
    query = query.lte('total_followers', filters.max_followers);
  }

  if (filters.min_engagement_rate) {
    query = query.gte('avg_engagement_rate', filters.min_engagement_rate);
  }

  if (filters.graduation_years && filters.graduation_years.length > 0) {
    query = query.in('graduation_year', filters.graduation_years);
  }

  if (filters.query) {
    query = query.or(`first_name.ilike.%${filters.query}%,last_name.ilike.%${filters.query}%,school_name.ilike.%${filters.query}%`);
  }

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  query = query.range(offset, offset + limit - 1);

  const { data: athletes, error, count } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  // Calculate match scores for each athlete
  const scoredAthletes = (athletes || []).map((athlete: any) => {
    const athleteWithTraits: AthleteWithTraits = {
      ...athlete,
      traits: (athlete.athlete_traits || []).map((t: any) => ({
        trait_id: t.trait_id,
        score: t.score,
        trait: Array.isArray(t.trait) ? t.trait[0] : t.trait,
      })),
    };

    const scores = calculateMatchScore(brandValues, criteria, athleteWithTraits);

    return {
      id: athlete.id,
      first_name: athlete.first_name,
      last_name: athlete.last_name,
      primary_sport: athlete.primary_sport,
      school_name: athlete.school_name,
      graduation_year: athlete.graduation_year,
      total_followers: athlete.total_followers,
      avg_engagement_rate: athlete.avg_engagement_rate,
      profile_completion_score: athlete.profile_completion_score,
      match_score: scores.overallScore,
      trait_alignment_score: scores.traitScore,
      criteria_match_score: scores.criteriaScore,
    };
  });

  // Sort by match score or other criteria
  if (filters.sort_by === 'match_score' || !filters.sort_by) {
    scoredAthletes.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  } else if (filters.sort_by === 'followers') {
    scoredAthletes.sort((a, b) => {
      const diff = (b.total_followers || 0) - (a.total_followers || 0);
      return filters.sort_order === 'asc' ? -diff : diff;
    });
  } else if (filters.sort_by === 'engagement') {
    scoredAthletes.sort((a, b) => {
      const diff = (b.avg_engagement_rate || 0) - (a.avg_engagement_rate || 0);
      return filters.sort_order === 'asc' ? -diff : diff;
    });
  }

  return {
    success: true,
    data: {
      athletes: scoredAthletes,
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit,
    },
  };
}

/**
 * Get top matches for an agency (for dashboard)
 */
export async function getTopMatches(
  agencyProfileId: string,
  limit = 10,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AthletePreview[]>> {
  const result = await searchAthletesForAgency(
    agencyProfileId,
    { limit, sort_by: 'match_score' },
    client
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data?.athletes || [] };
}

/**
 * Update match scores for interactions
 */
export async function refreshInteractionScores(
  agencyProfileId: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<number>> {
  const supabase = client || getServiceClient();

  // Get agency data
  const [brandValuesResult, criteriaResult, interactionsResult] = await Promise.all([
    supabase
      .from('agency_brand_values')
      .select(`*, trait:core_traits(id, name, display_name)`)
      .eq('agency_profile_id', agencyProfileId),
    supabase
      .from('agency_target_criteria')
      .select('*')
      .eq('agency_profile_id', agencyProfileId)
      .single(),
    supabase
      .from('agency_athlete_interactions')
      .select('id, athlete_user_id')
      .eq('agency_profile_id', agencyProfileId),
  ]);

  const brandValues = brandValuesResult.data || [];
  const criteria = criteriaResult.data;
  const interactions = interactionsResult.data || [];

  if (interactions.length === 0) {
    return { success: true, data: 0 };
  }

  // Get athlete data for all interactions
  const athleteIds = interactions.map(i => i.athlete_user_id);
  const { data: athletes } = await supabase
    .from('users')
    .select(`
      id,
      first_name,
      last_name,
      primary_sport,
      school_name,
      graduation_year,
      total_followers,
      avg_engagement_rate,
      profile_completion_score,
      athlete_traits:athlete_traits(trait_id, score, trait:core_traits(id, name, display_name))
    `)
    .in('id', athleteIds);

  // Update each interaction
  let updated = 0;
  for (const interaction of interactions) {
    const athlete = athletes?.find((a: any) => a.id === interaction.athlete_user_id);
    if (!athlete) continue;

    const athleteWithTraits: AthleteWithTraits = {
      ...athlete,
      traits: ((athlete as any).athlete_traits || []).map((t: any) => ({
        trait_id: t.trait_id,
        score: t.score,
        trait: Array.isArray(t.trait) ? t.trait[0] : t.trait,
      })),
    };

    const scores = calculateMatchScore(brandValues, criteria, athleteWithTraits);

    await supabase
      .from('agency_athlete_interactions')
      .update({
        match_score: scores.overallScore,
        trait_alignment_score: scores.traitScore,
        criteria_match_score: scores.criteriaScore,
        match_breakdown: scores.breakdown,
      })
      .eq('id', interaction.id);

    updated++;
  }

  return { success: true, data: updated, message: `Updated ${updated} interaction scores` };
}
