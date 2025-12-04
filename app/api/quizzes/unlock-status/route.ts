/**
 * API Route: GET /api/quizzes/unlock-status
 *
 * Returns the current unlock status for all quiz difficulty tiers
 * based on user progress.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || !supabaseAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = { id: userId };

    // Get user quiz stats
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('user_quiz_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (user has no stats yet)
      console.error('Error fetching quiz stats:', statsError);
      return NextResponse.json({ error: 'Failed to fetch quiz stats' }, { status: 500 });
    }

    // If no stats exist, return default (beginner only unlocked)
    if (!stats) {
      return NextResponse.json({
        unlockStatus: {
          beginner: {
            unlocked: true,
            locked_reason: null,
            progress: null,
          },
          intermediate: {
            unlocked: false,
            locked_reason: 'Complete 5 beginner quizzes to unlock',
            progress: {
              completed: 0,
              required: 5,
              percentage: 0,
            },
          },
          advanced: {
            unlocked: false,
            locked_reason: 'Complete 5 intermediate quizzes with 70% average to unlock',
            progress: {
              completed: 0,
              required: 5,
              percentage: 0,
            },
          },
          expert: {
            unlocked: false,
            locked_reason: 'Complete 5 advanced quizzes with 80% average to unlock',
            progress: {
              completed: 0,
              required: 5,
              percentage: 0,
            },
          },
        },
        stats: {
          total_quizzes_completed: 0,
          total_points: 0,
          current_streak: 0,
        },
      });
    }

    // Calculate progress for each tier
    const intermediateProgress = {
      completed: stats.beginner_completed,
      required: 5,
      percentage: Math.min((stats.beginner_completed / 5) * 100, 100),
    };

    const advancedProgress = {
      completed: stats.intermediate_completed,
      required: 5,
      percentage: Math.min((stats.intermediate_completed / 5) * 100, 100),
      avg_score: stats.intermediate_avg_score,
      score_requirement: 70,
    };

    const expertProgress = {
      completed: stats.advanced_completed,
      required: 5,
      percentage: Math.min((stats.advanced_completed / 5) * 100, 100),
      avg_score: stats.advanced_avg_score,
      score_requirement: 80,
    };

    // Build unlock status response
    const unlockStatus = {
      beginner: {
        unlocked: true,
        locked_reason: null,
        progress: null,
      },
      intermediate: {
        unlocked: stats.intermediate_unlocked,
        locked_reason: stats.intermediate_unlocked
          ? null
          : `Complete ${5 - stats.beginner_completed} more beginner quiz${5 - stats.beginner_completed === 1 ? '' : 'zes'} to unlock`,
        progress: intermediateProgress,
      },
      advanced: {
        unlocked: stats.advanced_unlocked,
        locked_reason: stats.advanced_unlocked
          ? null
          : stats.intermediate_completed < 5
          ? `Complete ${5 - stats.intermediate_completed} more intermediate quiz${5 - stats.intermediate_completed === 1 ? '' : 'zes'} to unlock`
          : `Improve your intermediate average to 70% (currently ${stats.intermediate_avg_score.toFixed(1)}%)`,
        progress: advancedProgress,
      },
      expert: {
        unlocked: stats.expert_unlocked,
        locked_reason: stats.expert_unlocked
          ? null
          : stats.advanced_completed < 5
          ? `Complete ${5 - stats.advanced_completed} more advanced quiz${5 - stats.advanced_completed === 1 ? '' : 'zes'} to unlock`
          : `Improve your advanced average to 80% (currently ${stats.advanced_avg_score.toFixed(1)}%)`,
        progress: expertProgress,
      },
    };

    return NextResponse.json({
      unlockStatus,
      stats: {
        total_quizzes_completed: stats.total_quizzes_completed,
        total_points: stats.total_points,
        current_streak: stats.current_streak,
        beginner: {
          completed: stats.beginner_completed,
          avg_score: stats.beginner_avg_score,
        },
        intermediate: {
          completed: stats.intermediate_completed,
          avg_score: stats.intermediate_avg_score,
        },
        advanced: {
          completed: stats.advanced_completed,
          avg_score: stats.advanced_avg_score,
        },
        expert: {
          completed: stats.expert_completed,
          avg_score: stats.expert_avg_score,
        },
      },
    });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/quizzes/unlock-status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
