import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateFMV } from '@/lib/fmv/fmv-calculator';
import type { User, SocialMediaStat, NILDeal, ScrapedAthleteData } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/fmv/calculate
 *
 * Calculate FMV score for the authenticated athlete
 * Features:
 * - Rate limiting (3 calculations per day)
 * - Auto-notification on 5+ point increase
 * - Public sharing encouragement at 70+ score
 * - Complete FMV analysis with suggestions
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
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'You can only recalculate your FMV 3 times per day. Please try again tomorrow.',
          rate_limit: {
            max_calculations: 3,
            reset_time: 'midnight UTC'
          }
        },
        { status: 429 }
      );
    }

    // 5. Fetch athlete's social media stats
    const { data: socialStats, error: socialError } = await supabase
      .from('social_media_stats')
      .select('*')
      .eq('user_id', user.id);

    if (socialError) {
      console.error('Social stats fetch error:', socialError);
    }

    // 6. Fetch athlete's NIL deals
    const { data: nilDeals, error: dealsError } = await supabase
      .from('nil_deals')
      .select('*')
      .eq('athlete_id', user.id);

    if (dealsError) {
      console.error('NIL deals fetch error:', dealsError);
    }

    // 7. Fetch external rankings for this athlete
    const { data: externalRankings, error: rankingsError } = await supabase
      .from('scraped_athlete_data')
      .select('*')
      .eq('matched_user_id', user.id)
      .eq('verified', true);

    if (rankingsError) {
      console.error('External rankings fetch error:', rankingsError);
    }

    // 8. Get previous FMV data (for notification check)
    const { data: previousFMV, error: previousError } = await supabase
      .from('athlete_fmv_data')
      .select('fmv_score, last_notified_score, calculation_count_today')
      .eq('athlete_id', user.id)
      .single();

    if (previousError && previousError.code !== 'PGRST116') {
      // PGRST116 = not found, which is OK for first calculation
      console.error('Previous FMV fetch error:', previousError);
    }

    // 9. Calculate FMV using our calculator engine
    const fmvResult = await calculateFMV({
      athlete: user as User,
      socialStats: (socialStats || []) as SocialMediaStat[],
      nilDeals: (nilDeals || []) as NILDeal[],
      externalRankings: (externalRankings || []) as ScrapedAthleteData[],
    });

    // 10. Check if we should notify about score increase
    const shouldNotify = previousFMV &&
      fmvResult.fmv_score - previousFMV.fmv_score >= 5;

    // 11. Check if we should encourage public sharing (70+ score)
    const shouldEncourageSharing = fmvResult.fmv_score >= 70;

    // 12. Prepare database record
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
      score_history: previousFMV
        ? [...(previousFMV as any).score_history || [], {
            score: fmvResult.fmv_score,
            calculated_at: new Date().toISOString(),
          }]
        : [{
            score: fmvResult.fmv_score,
            calculated_at: new Date().toISOString(),
          }],
      last_calculated_at: new Date().toISOString(),
      // Increment calculation count
      calculation_count_today: (previousFMV?.calculation_count_today || 0) + 1,
      // Update notification tracking if score increased significantly
      last_notified_score: shouldNotify ? fmvResult.fmv_score : previousFMV?.last_notified_score,
    };

    // 13. UPSERT to database
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

    // 14. Build response with helpful metadata
    return NextResponse.json({
      success: true,
      fmv: savedFMV,
      meta: {
        is_first_calculation: !previousFMV,
        score_increased: previousFMV ? fmvResult.fmv_score > previousFMV.fmv_score : false,
        score_change: previousFMV ? fmvResult.fmv_score - previousFMV.fmv_score : 0,
        should_notify_increase: shouldNotify,
        should_encourage_sharing: shouldEncourageSharing,
        remaining_calculations_today: 3 - ((previousFMV?.calculation_count_today || 0) + 1),
        calculation_count_today: (previousFMV?.calculation_count_today || 0) + 1,
      },
      notifications: shouldNotify ? [{
        type: 'score_increase',
        title: 'Your FMV Score Increased! 🎉',
        message: `Your score went up ${fmvResult.fmv_score - (previousFMV?.fmv_score || 0)} points to ${fmvResult.fmv_score}!`,
      }] : [],
      suggestions: shouldEncourageSharing && !savedFMV.is_public_score ? [{
        type: 'public_sharing',
        title: 'Share Your Score! 🌟',
        message: `Your FMV score of ${fmvResult.fmv_score} is in the ${fmvResult.fmv_tier.toUpperCase()} tier! Consider making it public to attract more NIL opportunities.`,
      }] : [],
    }, { status: 200 });

  } catch (error) {
    console.error('FMV calculation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
