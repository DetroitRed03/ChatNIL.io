import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { searchAthletesForAgency, getTopMatches } from '@/lib/agency/matchmaking-service';
import { getAgencyProfile, hasAgencyProfile } from '@/lib/agency/profile-service';
import type { AthleteSearchFilters } from '@/types/agency';

export const dynamic = 'force-dynamic';

/**
 * Agency Discovery API
 *
 * GET /api/agency/discover
 *
 * Enhanced athlete discovery with trait-based matching:
 * - Uses agency brand values for trait alignment scoring (60%)
 * - Uses target criteria for criteria matching (40%)
 * - Supports filtering by sport, followers, engagement, FMV, etc.
 * - Falls back to basic scoring if no agency profile
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const serviceClient = createServiceRoleClient();
    const { searchParams } = new URL(request.url);

    // Get user
    const { data: { user } } = await supabase.auth.getUser();

    // Check if agency has new profile for enhanced matching
    if (user) {
      const hasProfile = await hasAgencyProfile(user.id, serviceClient);

      if (hasProfile) {
        const profileResult = await getAgencyProfile(user.id, serviceClient);

        if (profileResult.success && profileResult.data) {
          // Use enhanced matchmaking service

          // Check if requesting top matches only
          if (searchParams.get('top') === 'true') {
            const limit = parseInt(searchParams.get('limit') || '10');
            const result = await getTopMatches(profileResult.data.id, limit, serviceClient);
            return NextResponse.json(result);
          }

          // Build filters from query params
          const filters: AthleteSearchFilters = {};

          const query = searchParams.get('q') || searchParams.get('query');
          if (query) filters.query = query;

          const sports = searchParams.get('sports') || searchParams.get('sport');
          if (sports) filters.sports = sports.split(',');

          const states = searchParams.get('states');
          if (states) filters.states = states.split(',');

          const schoolLevels = searchParams.get('school_levels');
          if (schoolLevels) filters.school_levels = schoolLevels.split(',');

          const minFollowers = searchParams.get('min_followers') || searchParams.get('minFollowers');
          if (minFollowers) filters.min_followers = parseInt(minFollowers);

          const maxFollowers = searchParams.get('max_followers');
          if (maxFollowers) filters.max_followers = parseInt(maxFollowers);

          const minFmv = searchParams.get('min_fmv');
          if (minFmv) filters.min_fmv = parseInt(minFmv);

          const maxFmv = searchParams.get('max_fmv') || searchParams.get('maxBudget');
          if (maxFmv) filters.max_fmv = parseInt(maxFmv);

          const minEngagement = searchParams.get('min_engagement');
          if (minEngagement) filters.min_engagement_rate = parseFloat(minEngagement);

          const gradYears = searchParams.get('graduation_years');
          if (gradYears) filters.graduation_years = gradYears.split(',').map(Number);

          const sortBy = searchParams.get('sort_by') as AthleteSearchFilters['sort_by'];
          if (sortBy) filters.sort_by = sortBy;

          const sortOrder = searchParams.get('sort_order') as AthleteSearchFilters['sort_order'];
          if (sortOrder) filters.sort_order = sortOrder;

          const page = searchParams.get('page');
          if (page) filters.page = parseInt(page);

          const limit = searchParams.get('limit');
          if (limit) filters.limit = parseInt(limit);

          // Search athletes with enhanced matching
          const result = await searchAthletesForAgency(profileResult.data.id, filters, serviceClient);

          return NextResponse.json(result);
        }
      }
    }

    // Fallback to basic discovery (legacy behavior)
    const sport = searchParams.get('sport');
    const school = searchParams.get('school');
    const minFollowers = searchParams.get('minFollowers')
      ? parseInt(searchParams.get('minFollowers')!)
      : 0;
    const maxBudget = searchParams.get('maxBudget')
      ? parseInt(searchParams.get('maxBudget')!)
      : null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Fetch athlete profiles
    let profileQuery = serviceClient
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
        profile_completion_score
      `, { count: 'exact' })
      .eq('role', 'athlete')
      .eq('onboarding_completed', true);

    // Apply filters
    if (sport) {
      profileQuery = profileQuery.ilike('primary_sport', `%${sport}%`);
    }
    if (school) {
      profileQuery = profileQuery.ilike('school_name', `%${school}%`);
    }
    if (minFollowers > 0) {
      profileQuery = profileQuery.gte('total_followers', minFollowers);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    profileQuery = profileQuery.range(from, to);

    // Execute query
    const { data: profiles, error: profileError, count } = await profileQuery;

    if (profileError) {
      console.error('Error fetching athlete profiles:', profileError);
      throw profileError;
    }

    // Calculate basic match scores
    const athletes = (profiles || [])
      .map(profile => {
        const totalFollowers = profile.total_followers || 0;
        const engagementRate = profile.avg_engagement_rate || 0;

        // Calculate basic match score (0-100)
        let matchScore = 50; // Base score

        // +20 if total followers > 100k
        if (totalFollowers > 100000) {
          matchScore += 20;
        } else if (totalFollowers > 10000) {
          matchScore += 10;
        }

        // +15 if engagement rate > 5%
        if (engagementRate > 5) {
          matchScore += 15;
        } else if (engagementRate > 2) {
          matchScore += 8;
        }

        // +15 if sport matches filter
        if (sport && profile.primary_sport?.toLowerCase().includes(sport.toLowerCase())) {
          matchScore += 15;
        }

        // Cap at 100
        matchScore = Math.min(matchScore, 100);

        return {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          primary_sport: profile.primary_sport,
          school_name: profile.school_name,
          graduation_year: profile.graduation_year,
          total_followers: totalFollowers,
          avg_engagement_rate: engagementRate,
          profile_completion_score: profile.profile_completion_score,
          match_score: matchScore,
        };
      })
      // Sort by match score descending
      .sort((a, b) => b.match_score - a.match_score);

    return NextResponse.json({
      success: true,
      data: {
        athletes,
        total: count || 0,
        page,
        limit,
        has_more: count ? (page * limit) < count : false,
      }
    });

  } catch (error) {
    console.error('Discovery API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch athletes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
