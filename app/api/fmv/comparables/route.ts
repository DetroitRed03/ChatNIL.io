import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/fmv/comparables
 *
 * Get comparable athletes based on:
 * - Similar FMV score (±10 points)
 * - Same sport (optional)
 * - Same school level (optional)
 * - ONLY shows athletes who have made their scores public (privacy-first)
 *
 * Query params:
 * - athlete_id: ID of athlete to find comparables for (optional, defaults to current user)
 * - sport_filter: Only show athletes in same sport (boolean, default: false)
 * - level_filter: Only show athletes at same school level (boolean, default: false)
 * - limit: Max number of results (default: 10, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get('athlete_id') || authUser.id;
    const sportFilter = searchParams.get('sport_filter') === 'true';
    const levelFilter = searchParams.get('level_filter') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    // 3. Get athlete's FMV data
    const { data: athleteFMV, error: fmvError } = await supabase
      .from('athlete_fmv_data')
      .select('fmv_score, athlete_id')
      .eq('athlete_id', athleteId)
      .single();

    if (fmvError || !athleteFMV) {
      return NextResponse.json(
        {
          error: 'FMV data not found',
          message: 'No FMV score exists for this athlete. Calculate FMV first.'
        },
        { status: 404 }
      );
    }

    // 4. Get athlete's profile (for sport and school level filtering)
    const { data: athlete, error: athleteError } = await supabase
      .from('users')
      .select('primary_sport, school_name')
      .eq('id', athleteId)
      .single();

    if (athleteError) {
      console.error('Athlete fetch error:', athleteError);
    }

    // 5. Calculate score range (±10 points)
    const minScore = Math.max(0, athleteFMV.fmv_score - 10);
    const maxScore = Math.min(100, athleteFMV.fmv_score + 10);

    // 6. Build query for comparable athletes
    let query = supabase
      .from('athlete_fmv_data')
      .select(`
        athlete_id,
        fmv_score,
        fmv_tier,
        social_score,
        athletic_score,
        market_score,
        brand_score,
        percentile_rank,
        users!inner (
          id,
          first_name,
          last_name,
          primary_sport,
          school_name,
          state,
          graduation_year,
          total_followers,
          profile_image_url
        )
      `)
      .eq('is_public_score', true) // PRIVACY: Only public scores
      .neq('athlete_id', athleteId) // Exclude self
      .gte('fmv_score', minScore)
      .lte('fmv_score', maxScore);

    // 7. Apply optional filters
    if (sportFilter && athlete?.primary_sport) {
      query = query.eq('users.primary_sport', athlete.primary_sport);
    }

    if (levelFilter && athlete?.school_name) {
      // Extract school level (D1, D2, etc.) for filtering
      const schoolLevel = extractSchoolLevel(athlete.school_name);
      if (schoolLevel) {
        query = query.ilike('users.school_name', `%${schoolLevel}%`);
      }
    }

    // 8. Execute query with limit and ordering
    const { data: comparables, error: comparablesError } = await query
      .order('fmv_score', { ascending: false })
      .limit(limit);

    if (comparablesError) {
      console.error('Comparables fetch error:', comparablesError);
      return NextResponse.json(
        { error: 'Failed to fetch comparable athletes' },
        { status: 500 }
      );
    }

    // 9. Format response data
    const formattedComparables = (comparables || []).map((comp: any) => ({
      athlete_id: comp.athlete_id,
      athlete_name: `${comp.users.first_name} ${comp.users.last_name}`,
      fmv_score: comp.fmv_score,
      fmv_tier: comp.fmv_tier,
      score_breakdown: {
        social_score: comp.social_score,
        athletic_score: comp.athletic_score,
        market_score: comp.market_score,
        brand_score: comp.brand_score,
      },
      percentile_rank: comp.percentile_rank,
      sport: comp.users.primary_sport,
      school: comp.users.school_name,
      state: comp.users.state,
      graduation_year: comp.users.graduation_year,
      total_followers: comp.users.total_followers,
      profile_image_url: comp.users.profile_image_url,
      score_difference: comp.fmv_score - athleteFMV.fmv_score, // Positive means they scored higher
    }));

    // 10. Calculate insights
    const avgScore = formattedComparables.length > 0
      ? Math.round(formattedComparables.reduce((sum, c) => sum + c.fmv_score, 0) / formattedComparables.length)
      : 0;

    const higherScoringCount = formattedComparables.filter(c => c.fmv_score > athleteFMV.fmv_score).length;
    const lowerScoringCount = formattedComparables.filter(c => c.fmv_score < athleteFMV.fmv_score).length;

    return NextResponse.json({
      success: true,
      comparables: formattedComparables,
      meta: {
        athlete_score: athleteFMV.fmv_score,
        score_range: { min: minScore, max: maxScore },
        total_found: formattedComparables.length,
        filters_applied: {
          sport: sportFilter ? athlete?.primary_sport : null,
          level: levelFilter ? extractSchoolLevel(athlete?.school_name || '') : null,
        },
        insights: {
          avg_score: avgScore,
          higher_scoring: higherScoringCount,
          lower_scoring: lowerScoringCount,
          athlete_rank_in_group: lowerScoringCount + 1, // 1-indexed rank
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Comparables fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Extract school level from school name
 * Examples: "University of Kentucky" -> "D1", "Kentucky Community College" -> "JUCO"
 */
function extractSchoolLevel(schoolName: string): string | null {
  const name = schoolName.toLowerCase();

  // Division 1 patterns
  if (
    name.includes('university') ||
    name.includes('college') && (
      name.includes('state') ||
      name.includes('tech') ||
      name.includes('western') ||
      name.includes('eastern') ||
      name.includes('northern') ||
      name.includes('southern')
    )
  ) {
    return 'D1'; // Assume D1 for major universities
  }

  // Community/Junior College
  if (name.includes('community college') || name.includes('junior college') || name.includes('juco')) {
    return 'JUCO';
  }

  // Division 2/3 (harder to detect, would need a lookup table)
  if (name.includes('division 2') || name.includes('d2')) return 'D2';
  if (name.includes('division 3') || name.includes('d3')) return 'D3';

  // High School
  if (
    name.includes('high school') ||
    name.includes('hs') ||
    name.includes('academy') ||
    name.includes('prep')
  ) {
    return 'High School';
  }

  return null; // Can't determine
}
