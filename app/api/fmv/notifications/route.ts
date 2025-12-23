import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/fmv/notifications
 *
 * Check for pending FMV-related notifications:
 * - Score increases of 5+ points (not yet notified)
 * - Stale score (>30 days since last calculation)
 * - Encouragement to share score (70+ score but still private)
 * - Rate limit reset availability
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

    // 2. Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // 3. Only athletes have FMV notifications
    if (user.role !== 'athlete') {
      return NextResponse.json({
        success: true,
        notifications: [],
        meta: { is_athlete: false }
      }, { status: 200 });
    }

    // 4. Get FMV data
    const { data: fmvData, error: fmvError } = await supabase
      .from('athlete_fmv_data')
      .select('*')
      .eq('athlete_id', authUser.id)
      .single();

    if (fmvError || !fmvData) {
      // No FMV data = suggest initial calculation
      return NextResponse.json({
        success: true,
        notifications: [{
          id: 'initial_calculation',
          type: 'action_required',
          priority: 'high',
          title: 'Calculate Your FMV Score',
          message: 'Get your Fair Market Value score to understand your NIL potential and attract opportunities.',
          action: {
            label: 'Calculate Now',
            endpoint: '/api/fmv/calculate',
            method: 'POST',
          },
          created_at: new Date().toISOString(),
        }],
        meta: {
          has_fmv_data: false,
          total_notifications: 1,
        }
      }, { status: 200 });
    }

    // 5. Build notifications array
    const notifications: any[] = [];

    // NOTIFICATION 1: Unnotified score increase (5+ points)
    if (fmvData.last_notified_score !== null && fmvData.last_notified_score !== undefined) {
      const scoreIncrease = fmvData.fmv_score - fmvData.last_notified_score;

      if (scoreIncrease >= 5) {
        notifications.push({
          id: 'score_increase',
          type: 'achievement',
          priority: 'high',
          title: `Your FMV Score Increased by ${scoreIncrease} Points! 🎉`,
          message: `Your score went from ${fmvData.last_notified_score} to ${fmvData.fmv_score}. Great progress!`,
          data: {
            previous_score: fmvData.last_notified_score,
            current_score: fmvData.fmv_score,
            increase: scoreIncrease,
          },
          created_at: fmvData.last_calculated_at,
        });
      }
    }

    // NOTIFICATION 2: Stale score (>30 days)
    const lastCalculated = new Date(fmvData.last_calculated_at);
    const daysSinceCalculation = Math.floor(
      (Date.now() - lastCalculated.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCalculation > 30) {
      notifications.push({
        id: 'stale_score',
        type: 'reminder',
        priority: 'medium',
        title: 'Your FMV Score May Be Outdated',
        message: `Your score was last calculated ${daysSinceCalculation} days ago. Recalculate to reflect your latest achievements and activities.`,
        data: {
          last_calculated_at: fmvData.last_calculated_at,
          days_since_calculation: daysSinceCalculation,
        },
        action: {
          label: 'Recalculate Now',
          endpoint: '/api/fmv/recalculate',
          method: 'POST',
        },
        created_at: fmvData.last_calculated_at,
      });
    }

    // NOTIFICATION 3: Encourage public sharing (70+ score, still private)
    if (fmvData.fmv_score >= 70 && !fmvData.is_public_score) {
      notifications.push({
        id: 'share_score',
        type: 'suggestion',
        priority: 'medium',
        title: 'Share Your Achievement! 🌟',
        message: `Your FMV score of ${fmvData.fmv_score} is in the ${fmvData.fmv_tier.toUpperCase()} tier! Making it public can help you attract more NIL opportunities.`,
        data: {
          fmv_score: fmvData.fmv_score,
          fmv_tier: fmvData.fmv_tier,
          is_public: false,
        },
        action: {
          label: 'Make Score Public',
          endpoint: '/api/fmv/visibility',
          method: 'POST',
          payload: { is_public: true },
        },
        created_at: fmvData.last_calculated_at,
      });
    }

    // NOTIFICATION 4: Rate limit reset available
    const { data: canCalculate } = await supabase
      .rpc('can_recalculate_fmv', { p_athlete_id: authUser.id });

    if (!canCalculate && fmvData.calculation_count_today >= 3) {
      // Rate limited, show when reset happens
      const nextReset = new Date();
      nextReset.setUTCHours(24, 0, 0, 0); // Next midnight UTC

      notifications.push({
        id: 'rate_limit',
        type: 'info',
        priority: 'low',
        title: 'Daily Calculation Limit Reached',
        message: `You've used all 3 FMV calculations today. Your limit will reset at midnight UTC.`,
        data: {
          calculations_used: fmvData.calculation_count_today,
          max_calculations: 3,
          next_reset: nextReset.toISOString(),
        },
        created_at: new Date().toISOString(),
      });
    } else if (canCalculate && fmvData.calculation_count_today > 0 && daysSinceCalculation > 7) {
      // Has calculations available and hasn't calculated in a week
      notifications.push({
        id: 'calculation_available',
        type: 'reminder',
        priority: 'low',
        title: 'FMV Calculations Available',
        message: `You have ${3 - fmvData.calculation_count_today} FMV calculation${3 - fmvData.calculation_count_today === 1 ? '' : 's'} remaining today.`,
        data: {
          remaining_calculations: 3 - fmvData.calculation_count_today,
        },
        action: {
          label: 'Recalculate Now',
          endpoint: '/api/fmv/recalculate',
          method: 'POST',
        },
        created_at: new Date().toISOString(),
      });
    }

    // NOTIFICATION 5: Top improvement suggestions
    if (fmvData.improvement_suggestions && fmvData.improvement_suggestions.length > 0) {
      const topSuggestion = fmvData.improvement_suggestions[0]; // Highest priority suggestion

      notifications.push({
        id: 'improvement_suggestion',
        type: 'suggestion',
        priority: 'medium',
        title: `Boost Your Score: ${topSuggestion.area}`,
        message: topSuggestion.action,
        data: {
          suggestion: topSuggestion,
          current_score: fmvData.fmv_score,
          potential_impact: topSuggestion.impact,
        },
        created_at: fmvData.last_calculated_at,
      });
    }

    // 6. Sort notifications by priority
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    notifications.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);

    // 7. Build response
    return NextResponse.json({
      success: true,
      notifications: notifications,
      meta: {
        has_fmv_data: true,
        total_notifications: notifications.length,
        fmv_score: fmvData.fmv_score,
        fmv_tier: fmvData.fmv_tier,
        is_public: fmvData.is_public_score,
        last_calculated_at: fmvData.last_calculated_at,
        days_since_calculation: daysSinceCalculation,
        remaining_calculations_today: canCalculate ? 3 - (fmvData.calculation_count_today || 0) : 0,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('FMV notifications error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
