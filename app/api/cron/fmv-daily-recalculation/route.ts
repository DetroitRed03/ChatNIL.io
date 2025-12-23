import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateFMV } from '@/lib/fmv/fmv-calculator';
import type { User, SocialMediaStat, NILDeal, ScrapedAthleteData } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/fmv-daily-recalculation
 *
 * Daily cron job to recalculate FMV scores for active athletes
 * Should be triggered once per day (e.g., 2 AM UTC)
 *
 * Criteria for recalculation:
 * - Athletes with public scores (to keep leaderboards fresh)
 * - Athletes with scores older than 7 days
 * - Athletes with recent activity (new deals, social stats updates)
 *
 * This job does NOT count toward the athlete's daily rate limit
 *
 * Setup with Vercel Cron:
 * vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/fmv-daily-recalculation",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron request (in production, check authorization header)
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const startTime = Date.now();
    let processed = 0;
    let updated = 0;
    let errors = 0;

    console.log('🔄 Starting daily FMV recalculation job...');

    // Get athletes eligible for recalculation
    const { data: eligibleAthletes, error: fetchError } = await supabase
      .from('athlete_fmv_data')
      .select(`
        athlete_id,
        fmv_score,
        last_calculated_at,
        is_public_score
      `)
      .or('is_public_score.eq.true,last_calculated_at.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (fetchError) {
      console.error('❌ Error fetching eligible athletes:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch eligible athletes', details: fetchError.message },
        { status: 500 }
      );
    }

    console.log(`📊 Found ${eligibleAthletes?.length || 0} athletes eligible for recalculation`);

    if (!eligibleAthletes || eligibleAthletes.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No athletes eligible for recalculation',
        processed: 0,
        updated: 0,
        errors: 0,
        duration: Date.now() - startTime,
      });
    }

    // Process each athlete
    for (const athleteFMV of eligibleAthletes) {
      try {
        processed++;

        // Get full athlete profile
        const { data: athlete, error: athleteError } = await supabase
          .from('users')
          .select('*')
          .eq('id', athleteFMV.athlete_id)
          .eq('role', 'athlete')
          .single();

        if (athleteError || !athlete) {
          console.error(`⚠️ Athlete ${athleteFMV.athlete_id} not found or not an athlete`);
          errors++;
          continue;
        }

        // Fetch required data in parallel
        const [
          { data: socialStats },
          { data: nilDeals },
          { data: externalRankings }
        ] = await Promise.all([
          supabase.from('social_media_stats').select('*').eq('user_id', athlete.id),
          supabase.from('nil_deals').select('*').eq('athlete_id', athlete.id),
          supabase.from('scraped_athlete_data').select('*').eq('matched_user_id', athlete.id).eq('verified', true)
        ]);

        // Calculate new FMV score
        const fmvResult = await calculateFMV({
          athlete: athlete as User,
          socialStats: (socialStats || []) as SocialMediaStat[],
          nilDeals: (nilDeals || []) as NILDeal[],
          externalRankings: (externalRankings || []) as ScrapedAthleteData[],
        });

        // Check if score changed significantly (3+ points)
        const scoreChange = Math.abs(fmvResult.fmv_score - athleteFMV.fmv_score);
        const shouldNotify = scoreChange >= 5;

        // Get current score history
        const { data: currentFMV } = await supabase
          .from('athlete_fmv_data')
          .select('score_history, last_notified_score')
          .eq('athlete_id', athlete.id)
          .single();

        // Update score history
        const scoreHistory = currentFMV?.score_history || [];
        const newHistoryEntry = {
          score: fmvResult.fmv_score,
          calculated_at: new Date().toISOString(),
          trigger: 'daily_cron',
        };
        const updatedHistory = [...scoreHistory, newHistoryEntry].slice(-30); // Keep last 30

        // Update FMV data (does NOT increment calculation_count_today - this is automated)
        const { error: updateError } = await supabase
          .from('athlete_fmv_data')
          .update({
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
            // Update notification tracking if score increased significantly
            last_notified_score: shouldNotify ? fmvResult.fmv_score : currentFMV?.last_notified_score,
          })
          .eq('athlete_id', athlete.id);

        if (updateError) {
          console.error(`❌ Error updating FMV for athlete ${athlete.id}:`, updateError);
          errors++;
          continue;
        }

        updated++;
        console.log(`✅ Updated FMV for ${athlete.first_name} ${athlete.last_name}: ${athleteFMV.fmv_score} → ${fmvResult.fmv_score} (${scoreChange > 0 ? '+' : ''}${fmvResult.fmv_score - athleteFMV.fmv_score})`);

      } catch (error) {
        console.error(`❌ Error processing athlete ${athleteFMV.athlete_id}:`, error);
        errors++;
      }
    }

    const duration = Date.now() - startTime;

    console.log(`✅ Daily FMV recalculation complete!`);
    console.log(`   Processed: ${processed}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Duration: ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Daily FMV recalculation complete',
      processed,
      updated,
      errors,
      duration,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Daily FMV recalculation job failed:', error);
    return NextResponse.json(
      {
        error: 'Daily FMV recalculation job failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing (remove in production)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Method not allowed in production' },
      { status: 405 }
    );
  }

  // In development, allow GET to test the cron job
  return POST(request);
}
