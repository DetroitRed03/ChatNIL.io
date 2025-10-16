import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { awardBadgeByName } from '@/lib/badges';

/**
 * POST /api/badges/check-quiz
 * Check and award quiz-related badges based on user's quiz history
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, quizScore } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    console.log(`🎓 Checking quiz badges for user ${userId}...`);

    const awardedBadges = [];

    // Get user's quiz completion count and average score
    const { data: quizStats, error: statsError } = await supabaseAdmin
      .from('user_quiz_progress')
      .select('score_percentage, status')
      .eq('user_id', userId);

    if (statsError) {
      console.error('Error fetching quiz stats:', statsError);
      return NextResponse.json(
        { error: 'Failed to fetch quiz stats' },
        { status: 500 }
      );
    }

    const completedQuizzes = quizStats?.filter(q => q.status === 'completed') || [];
    const completedCount = completedQuizzes.length;
    const averageScore = completedCount > 0
      ? completedQuizzes.reduce((sum, q) => sum + (q.score_percentage || 0), 0) / completedCount
      : 0;

    console.log(`📊 Quiz stats: ${completedCount} completed, ${averageScore.toFixed(1)}% average`);

    // Check for "NIL Novice" badge (first quiz)
    if (completedCount === 1) {
      try {
        const badge = await awardBadgeByName(userId, 'NIL Novice', undefined, 'Completed first quiz');
        if (badge) {
          console.log('🎉 Awarded: NIL Novice');
          awardedBadges.push(badge);
        }
      } catch (error) {
        console.warn('Badge NIL Novice already earned or error:', error);
      }
    }

    // Check for "Quick Learner" badge (5 quizzes)
    if (completedCount === 5) {
      try {
        const badge = await awardBadgeByName(userId, 'Quick Learner', undefined, 'Completed 5 quizzes');
        if (badge) {
          console.log('🎉 Awarded: Quick Learner');
          awardedBadges.push(badge);
        }
      } catch (error) {
        console.warn('Badge Quick Learner already earned or error:', error);
      }
    }

    // Check for "NIL Scholar" badge (10 quizzes with 80%+ average)
    if (completedCount === 10 && averageScore >= 80) {
      try {
        const badge = await awardBadgeByName(userId, 'NIL Scholar', undefined, `Completed 10 quizzes with ${averageScore.toFixed(1)}% average`);
        if (badge) {
          console.log('🎉 Awarded: NIL Scholar');
          awardedBadges.push(badge);
        }
      } catch (error) {
        console.warn('Badge NIL Scholar already earned or error:', error);
      }
    }

    // Check for "Perfect Score" badge (100% on any quiz)
    if (quizScore === 100) {
      try {
        const badge = await awardBadgeByName(userId, 'Perfect Score', undefined, 'Scored 100% on a quiz');
        if (badge) {
          console.log('🎉 Awarded: Perfect Score');
          awardedBadges.push(badge);
        }
      } catch (error) {
        console.warn('Badge Perfect Score already earned or error:', error);
      }
    }

    if (awardedBadges.length > 0) {
      console.log(`✅ Awarded ${awardedBadges.length} badge(s)`);
      return NextResponse.json({
        success: true,
        awardedBadges,
        message: `Awarded ${awardedBadges.length} badge(s)!`
      });
    }

    return NextResponse.json({
      success: true,
      awardedBadges: [],
      message: 'No new badges awarded'
    });

  } catch (error: any) {
    console.error('❌ Error checking quiz badges:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check quiz badges'
      },
      { status: 500 }
    );
  }
}
