import { NextRequest, NextResponse } from 'next/server';
import { getUserQuizStats, getRecommendedQuizzes } from '@/lib/quiz';

export const dynamic = 'force-dynamic';

/**
 * GET /api/quizzes/stats
 * Get user's overall quiz statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log(`📈 Fetching quiz stats for user: ${userId}`);

    const [stats, recommended] = await Promise.all([
      getUserQuizStats(userId),
      getRecommendedQuizzes(userId)
    ]);

    console.log(`✅ Quiz stats fetched: ${stats.quizzes_completed} completed, ${stats.average_score_percentage}% avg`);

    return NextResponse.json({
      success: true,
      stats,
      recommended
    });
  } catch (error: any) {
    console.error('❌ Error fetching quiz stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch quiz stats'
      },
      { status: 500 }
    );
  }
}
