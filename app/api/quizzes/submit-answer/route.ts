import { NextRequest, NextResponse } from 'next/server';
import { submitQuizAnswer } from '@/lib/quiz';

export const dynamic = 'force-dynamic';

/**
 * POST /api/quizzes/submit-answer
 * Submit an answer to a quiz question
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      sessionId,
      questionId,
      answer,
      answerIndex,
      timeTaken
    } = body;

    if (!userId || !sessionId || !questionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`📝 Submitting answer for user ${userId}, question ${questionId}`);

    const result = await submitQuizAnswer(
      userId,
      questionId,
      answer,
      answerIndex,
      timeTaken || 0,
      sessionId
    );

    console.log(`✅ Answer submitted: ${result.isCorrect ? 'Correct' : 'Incorrect'}, +${result.pointsEarned} points`);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('❌ Error submitting quiz answer:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit answer'
      },
      { status: 500 }
    );
  }
}
