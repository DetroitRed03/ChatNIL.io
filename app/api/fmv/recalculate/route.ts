import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateFMV } from '@/lib/fmv/fmv-calculator';
import type { User, SocialMediaStat, NILDeal, ScrapedAthleteData } from '@/types';

/**
 * POST /api/fmv/recalculate
 *
 * Force manual recalculation of FMV score
 * Same as /api/fmv/calculate but explicitly for user-triggered recalculations
 * Rate limited to 3 per day
 * Updates score history
 */
export async function POST(request: NextRequest) {
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

    // 2. Get full user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // 3. Verify user is an athlete
    if (user.role !== 'athlete') {
      return NextResponse.json(
        { error: 'FMV calculation is only available for athletes' },
        { status: 403 }
      );
    }

    // 4. Check rate limit (3 calculations per day)
    const { data: canCalculate, error: rateLimitError } = await supabase
      .rpc('can_recalculate_fmv', { p_athlete_id: user.id });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      return NextResponse.json(
        { error: 'Failed to check rate limit' },
        { status: 500 }
      );
    }

    if (!canCalculate) {
      // Get current count for better error message
      const { data: currentFMV } = await supabase
        .from('athlete_fmv_data')
        .select('calculation_count_today, last_calculation_reset_date')
        .eq('athlete_id', user.id)
        .single();

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'You have used all 3 FMV calculations for today. Your limit will reset at midnight UTC.',
          rate_limit: {
            max_calculations: 3,
            used_today: currentFMV?.calculation_count_today || 3,
            reset_time: 'midnight UTC',
            next_reset: new Date(new Date().setUTCHours(24, 0, 0, 0)).toISOString(),
          }
        },
        { status: 429 }
      );
    }

    // 5. Fetch all required data in parallel
    const [
      { data: socialStats, error: socialError },
      { data: nilDeals, error: dealsError },
      { data: externalRankings, error: rankingsError },
      { data: previousFMV, error: previousError }
    ] = await Promise.all([
      supabase.from('social_media_stats').select('*').eq('user_id', user.id),
      supabase.from('nil_deals').select('*').eq('athlete_id', user.id),
      supabase.from('scraped_athlete_data').select('*').eq('matched_user_id', user.id).eq('verified', true),
      supabase.from('athlete_fmv_data').select('*').eq('athlete_id', user.id).single()
    ]);

    if (socialError) console.error('Social stats fetch error:', socialError);
    if (dealsError) console.error('NIL deals fetch error:', dealsError);
    if (rankingsError) console.error('External rankings fetch error:', rankingsError);
    if (previousError && previousError.code !== 'PGRST116') {
      console.error('Previous FMV fetch error:', previousError);
    }

    // 6. Calculate new FMV score
    const fmvResult = await calculateFMV({
      athlete: user as User,
      socialStats: (socialStats || []) as SocialMediaStat[],
      nilDeals: (nilDeals || []) as NILDeal[],
      externalRankings: (externalRankings || []) as ScrapedAthleteData[],
    });

    // 7. Determine if score increased significantly (5+ points)
    const scoreChange = previousFMV ? fmvResult.fmv_score - previousFMV.fmv_score : 0;
    const shouldNotify = scoreChange >= 5;

    // 8. Check if we should encourage public sharing (70+ score)
    const shouldEncourageSharing = fmvResult.fmv_score >= 70 && (!previousFMV || !previousFMV.is_public_score);

    // 9. Update score history (keep last 30 entries)
    const scoreHistory = previousFMV?.score_history || [];
    const newHistoryEntry = {
      score: fmvResult.fmv_score,
      calculated_at: new Date().toISOString(),
      trigger: 'manual_recalculation',
    };
    const updatedHistory = [...scoreHistory, newHistoryEntry].slice(-30); // Keep last 30

    // 10. Prepare database record
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
      score_history: updatedHistory,
      last_calculated_at: new Date().toISOString(),
      // Increment calculation count
      calculation_count_today: (previousFMV?.calculation_count_today || 0) + 1,
      // Update notification tracking if score increased significantly
      last_notified_score: shouldNotify ? fmvResult.fmv_score : previousFMV?.last_notified_score,
      // Preserve privacy setting
      is_public_score: previousFMV?.is_public_score || false,
    };

    // 11. UPSERT to database
    const { data: savedFMV, error: saveError } = await supabase
      .from('athlete_fmv_data')
      .upsert(fmvRecord, {
        onConflict: 'athlete_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (saveError) {
      console.error('FMV save error:', saveError);
      return NextResponse.json(
        { error: 'Failed to save FMV calculation', details: saveError.message },
        { status: 500 }
      );
    }

    // 12. Build detailed response
    const remainingCalculations = 3 - ((previousFMV?.calculation_count_today || 0) + 1);

    return NextResponse.json({
      success: true,
      fmv: savedFMV,
      meta: {
        is_recalculation: !!previousFMV,
        previous_score: previousFMV?.fmv_score,
        score_change: scoreChange,
        score_increased: scoreChange > 0,
        score_decreased: scoreChange < 0,
        tier_changed: previousFMV ? previousFMV.fmv_tier !== fmvResult.fmv_tier : false,
        previous_tier: previousFMV?.fmv_tier,
        should_notify_increase: shouldNotify,
        should_encourage_sharing: shouldEncourageSharing,
        remaining_calculations_today: remainingCalculations,
        calculation_count_today: (previousFMV?.calculation_count_today || 0) + 1,
      },
      notifications: shouldNotify ? [{
        type: 'score_increase',
        title: `Your FMV Score Increased by ${scoreChange} Points! 🎉`,
        message: `Your score went from ${previousFMV?.fmv_score} to ${fmvResult.fmv_score}. Great progress!`,
      }] : scoreChange < -5 ? [{
        type: 'score_decrease',
        title: 'Your FMV Score Decreased',
        message: `Your score changed from ${previousFMV?.fmv_score} to ${fmvResult.fmv_score}. Check your improvement suggestions for ways to increase it.`,
      }] : [],
      suggestions: shouldEncourageSharing ? [{
        type: 'public_sharing',
        title: 'Share Your Achievement! 🌟',
        message: `Your FMV score of ${fmvResult.fmv_score} is in the ${fmvResult.fmv_tier.toUpperCase()} tier! Making it public can help you attract more NIL opportunities.`,
        action: {
          label: 'Make Score Public',
          endpoint: '/api/fmv/visibility',
          method: 'POST',
          payload: { is_public: true }
        }
      }] : [],
    }, { status: 200 });

  } catch (error) {
    console.error('FMV recalculation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
