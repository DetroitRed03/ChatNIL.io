import { NextRequest, NextResponse } from 'next/server';
import { startQuizSession } from '@/lib/quiz';
import { QuizCategory, QuizDifficulty } from '@/types';
import { trackEventServer } from '@/lib/analytics-server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/quizzes/start
 * Start a new quiz session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, category, difficulty, questionCount = 10, userRole } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    console.log(`🎯 Starting quiz session for user ${userId}:`, {
      category,
      difficulty,
      questionCount
    });

    const { sessionId, questions } = await startQuizSession(
      userId,
      category as QuizCategory,
      difficulty as QuizDifficulty,
      questionCount
    );

    // Track quiz started
    if (userRole) {
      trackEventServer('quiz_started', {
        user_id: userId,
        role: userRole as any,
        category: category as QuizCategory,
        difficulty: difficulty as QuizDifficulty,
        question_count: questionCount,
        session_id: sessionId,
      });
    }

    // Don't send correct answers to client
    const questionsForClient = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty,
      points: q.points
    }));

    console.log(`✅ Quiz session started: ${sessionId}, ${questions.length} questions`);

    return NextResponse.json({
      success: true,
      sessionId,
      questions: questionsForClient,
      totalQuestions: questions.length
    });
  } catch (error: any) {
    console.error('❌ Error starting quiz session:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to start quiz session'
      },
      { status: 500 }
    );
  }
}
