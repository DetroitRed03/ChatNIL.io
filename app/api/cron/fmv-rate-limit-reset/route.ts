import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/cron/fmv-rate-limit-reset
 *
 * Daily cron job to reset FMV calculation rate limits
 * Should be triggered at midnight UTC every day
 *
 * Resets:
 * - calculation_count_today to 0
 * - last_calculation_reset_date to current date
 *
 * Note: The database trigger should handle this automatically,
 * but this cron job ensures it happens even if no calculations occur.
 *
 * Setup with Vercel Cron:
 * vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/fmv-rate-limit-reset",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron request
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const startTime = Date.now();

    console.log('🔄 Starting daily rate limit reset job...');

    // Get all FMV records that need reset
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const { data: needsReset, error: fetchError } = await supabase
      .from('athlete_fmv_data')
      .select('athlete_id, calculation_count_today, last_calculation_reset_date')
      .neq('last_calculation_reset_date', today);

    if (fetchError) {
      console.error('❌ Error fetching records for reset:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch records for reset', details: fetchError.message },
        { status: 500 }
      );
    }

    const recordsToReset = needsReset?.length || 0;
    console.log(`📊 Found ${recordsToReset} records needing rate limit reset`);

    if (recordsToReset === 0) {
      return NextResponse.json({
        success: true,
        message: 'No records need rate limit reset',
        reset_count: 0,
        duration: Date.now() - startTime,
      });
    }

    // Reset all records
    const { error: updateError, count } = await supabase
      .from('athlete_fmv_data')
      .update({
        calculation_count_today: 0,
        last_calculation_reset_date: today,
      })
      .neq('last_calculation_reset_date', today);

    if (updateError) {
      console.error('❌ Error resetting rate limits:', updateError);
      return NextResponse.json(
        { error: 'Failed to reset rate limits', details: updateError.message },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;

    console.log(`✅ Rate limit reset complete!`);
    console.log(`   Records reset: ${count || 0}`);
    console.log(`   Duration: ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Daily rate limit reset complete',
      reset_count: count || 0,
      duration,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Rate limit reset job failed:', error);
    return NextResponse.json(
      {
        error: 'Rate limit reset job failed',
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

  return POST(request);
}
