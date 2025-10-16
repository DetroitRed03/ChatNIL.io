import { NextRequest, NextResponse } from 'next/server';
import { getQuizSessionResults, getQuizSessionProgress } from '@/lib/quiz';

/**
 * GET /api/quizzes/session/[sessionId]
 * Get quiz session results and progress
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log(`📊 Fetching quiz session results: ${sessionId}`);

    const [results, progress] = await Promise.all([
      getQuizSessionResults(sessionId),
      getQuizSessionProgress(sessionId)
    ]);

    console.log(`✅ Session results fetched: ${results.score_percentage}% (${results.correct_answers}/${results.total_questions})`);

    return NextResponse.json({
      success: true,
      results,
      progress
    });
  } catch (error: any) {
    console.error('❌ Error fetching quiz session:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch quiz session'
      },
      { status: 500 }
    );
  }
}
