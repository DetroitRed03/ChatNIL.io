import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateFMV } from '@/lib/fmv/fmv-calculator';
import type { User, SocialMediaStat, NILDeal, ScrapedAthleteData } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/fmv
 *
 * Get FMV data for the authenticated athlete
 * If no FMV data exists, automatically calculates it (doesn't count toward rate limit)
 * If data exists but is stale (>30 days), includes a suggestion to recalculate
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

    // 2. Check if requesting another athlete's data (via query param)
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get('athlete_id') || authUser.id;

    // 3. Get athlete's FMV data
    const { data: fmvData, error: fmvError } = await supabase
      .from('athlete_fmv_data')
      .select('*')
      .eq('athlete_id', athleteId)
      .single();

    if (fmvError && fmvError.code !== 'PGRST116') {
      // PGRST116 = not found
      console.error('FMV fetch error:', fmvError);
      return NextResponse.json(
        { error: 'Failed to fetch FMV data' },
        { status: 500 }
      );
    }

    // 4. If no data exists and user is requesting their own data, auto-calculate
    if (!fmvData && athleteId === authUser.id) {
      console.log('No FMV data found for athlete, auto-calculating...');

      // Get user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError || !user || user.role !== 'athlete') {
        return NextResponse.json(
          { error: 'User profile not found or not an athlete' },
          { status: 404 }
        );
      }

      // Fetch required data
      const [
        { data: socialStats },
        { data: nilDeals },
        { data: externalRankings }
      ] = await Promise.all([
        supabase.from('social_media_stats').select('*').eq('user_id', user.id),
        supabase.from('nil_deals').select('*').eq('athlete_id', user.id),
        supabase.from('scraped_athlete_data').select('*').eq('matched_user_id', user.id).eq('verified', true)
      ]);

      // Calculate FMV
      const fmvResult = await calculateFMV({
        athlete: user as User,
        socialStats: (socialStats || []) as SocialMediaStat[],
        nilDeals: (nilDeals || []) as NILDeal[],
        externalRankings: (externalRankings || []) as ScrapedAthleteData[],
      });

      // Save to database (initial calculation doesn't count toward rate limit)
      const fmvRecord = {
        athlete_id: user.id,
        fmv_score: fmvResult.fmv_score,
        fmv_tier: fmvResult.fmv_tier,
        social_score: fmvResult.social_score,
        athletic_score: fmvResult.athletic_score,
        market_score: fmvResult.market_score,
        brand_score: fmvResult.brand_score,
        percentile_rank: fmvResult.percentile_rank,
        comparable_athletes: fmvResult.comparable_athletes,
        estimated_deal_value_low: fmvResult.estimated_deal_value_low,
        estimated_deal_value_mid: fmvResult.estimated_deal_value_mid,
        estimated_deal_value_high: fmvResult.estimated_deal_value_high,
        improvement_suggestions: fmvResult.improvement_suggestions,
        strengths: fmvResult.strengths,
        weaknesses: fmvResult.weaknesses,
        score_history: [{
          score: fmvResult.fmv_score,
          calculated_at: new Date().toISOString(),
        }],
        last_calculated_at: new Date().toISOString(),
        calculation_count_today: 0, // Initial calculation doesn't count
      };

      const { data: savedFMV, error: saveError } = await supabase
        .from('athlete_fmv_data')
        .insert(fmvRecord)
        .select()
        .single();

      if (saveError) {
        console.error('FMV save error:', saveError);
        return NextResponse.json(
          { error: 'Failed to save initial FMV calculation' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        fmv: savedFMV,
        meta: {
          is_initial_calculation: true,
          can_view_full_data: true, // Own data
        }
      }, { status: 200 });
    }

    // 5. If no data exists for another athlete
    if (!fmvData) {
      return NextResponse.json(
        { error: 'FMV data not found for this athlete' },
        { status: 404 }
      );
    }

    // 6. Check privacy settings
    const isOwnData = athleteId === authUser.id;
    const isPublic = fmvData.is_public_score;

    if (!isOwnData && !isPublic) {
      return NextResponse.json(
        {
          error: 'This athlete\'s FMV score is private',
          message: 'The athlete has chosen to keep their FMV score private.'
        },
        { status: 403 }
      );
    }

    // 7. Filter data based on privacy (if viewing someone else's data)
    const responseData = isOwnData ? fmvData : {
      // Public view shows limited data
      athlete_id: fmvData.athlete_id,
      fmv_score: fmvData.fmv_score,
      fmv_tier: fmvData.fmv_tier,
      percentile_rank: fmvData.percentile_rank,
      last_calculated_at: fmvData.last_calculated_at,
      // Don't show detailed breakdowns, suggestions, or weaknesses to others
    };

    // 8. Check if data is stale (>30 days)
    const lastCalculated = new Date(fmvData.last_calculated_at);
    const daysSinceCalculation = Math.floor(
      (Date.now() - lastCalculated.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isStale = daysSinceCalculation > 30;

    // 9. Check remaining calculations for today (if own data)
    let remainingCalculations = 0;
    if (isOwnData) {
      const { data: canCalculate } = await supabase
        .rpc('can_recalculate_fmv', { p_athlete_id: authUser.id });
      remainingCalculations = canCalculate ? 3 - (fmvData.calculation_count_today || 0) : 0;
    }

    return NextResponse.json({
      success: true,
      fmv: responseData,
      meta: {
        is_own_data: isOwnData,
        is_public: isPublic,
        is_stale: isStale,
        days_since_calculation: daysSinceCalculation,
        remaining_calculations_today: isOwnData ? remainingCalculations : undefined,
        can_view_full_data: isOwnData,
      },
      suggestions: isOwnData && isStale ? [{
        type: 'recalculation',
        title: 'Your FMV Score May Be Outdated',
        message: `Your score was last calculated ${daysSinceCalculation} days ago. Consider recalculating to reflect your latest achievements.`,
      }] : [],
    }, { status: 200 });

  } catch (error) {
    console.error('FMV fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
