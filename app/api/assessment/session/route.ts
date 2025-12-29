/**
 * Assessment Session API
 *
 * GET  - Get or check for existing session
 * POST - Create a new session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/assessment/session
 * Get existing session for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Get existing in-progress session
    const { data: session, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .single();

    if (sessionError && sessionError.code !== 'PGRST116') {
      console.error('Error fetching session:', sessionError);
      return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
    }

    if (!session) {
      // Check for completed session with results
      const { data: completedSession } = await supabase
        .from('assessment_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (completedSession) {
        // Get results for completed session
        const { data: results } = await supabase
          .from('user_trait_results')
          .select('*')
          .eq('user_id', userId)
          .single();

        return NextResponse.json({
          session: {
            id: completedSession.id,
            userId: completedSession.user_id,
            status: completedSession.status,
            currentQuestionIndex: completedSession.current_question_index,
            totalQuestions: completedSession.total_questions,
            skippedQuestionIds: completedSession.skipped_question_ids || [],
            startedAt: completedSession.started_at,
            completedAt: completedSession.completed_at,
            lastActivityAt: completedSession.last_activity_at,
            version: completedSession.version,
          },
          results: results
            ? {
                id: results.id,
                userId: results.user_id,
                sessionId: results.session_id,
                traitScores: results.trait_scores,
                topTraits: results.top_traits,
                archetypeCode: results.archetype_code,
                archetypeName: results.archetype_name,
                archetypeDescription: results.archetype_description,
                calculatedAt: results.calculated_at,
              }
            : null,
          hasCompleted: true,
        });
      }

      return NextResponse.json({ session: null, hasCompleted: false });
    }

    // Get responses for in-progress session
    const { data: responses } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('session_id', session.id);

    // Map responses to a record by question_id
    const responsesMap: Record<string, any> = {};
    for (const response of responses || []) {
      responsesMap[response.question_id] = {
        id: response.id,
        sessionId: response.session_id,
        questionId: response.question_id,
        userId: response.user_id,
        responseValue: response.response_value,
        wasSkipped: response.was_skipped,
        answeredAt: response.answered_at,
        timeSpentMs: response.time_spent_ms,
      };
    }

    return NextResponse.json({
      session: {
        id: session.id,
        userId: session.user_id,
        status: session.status,
        currentQuestionIndex: session.current_question_index,
        totalQuestions: session.total_questions,
        skippedQuestionIds: session.skipped_question_ids || [],
        startedAt: session.started_at,
        completedAt: session.completed_at,
        lastActivityAt: session.last_activity_at,
        version: session.version,
      },
      responses: responsesMap,
      hasCompleted: false,
    });
  } catch (error: any) {
    console.error('Error in GET /api/assessment/session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/assessment/session
 * Create a new assessment session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check for existing in-progress session
    const { data: existingSession } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .single();

    if (existingSession) {
      // Return existing session
      return NextResponse.json({
        session: {
          id: existingSession.id,
          userId: existingSession.user_id,
          status: existingSession.status,
          currentQuestionIndex: existingSession.current_question_index,
          totalQuestions: existingSession.total_questions,
          skippedQuestionIds: existingSession.skipped_question_ids || [],
          startedAt: existingSession.started_at,
          completedAt: existingSession.completed_at,
          lastActivityAt: existingSession.last_activity_at,
          version: existingSession.version,
        },
        isNew: false,
      });
    }

    // Get total active questions
    const { count: totalQuestions } = await supabase
      .from('assessment_questions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Create new session
    const { data: newSession, error: createError } = await supabase
      .from('assessment_sessions')
      .insert({
        user_id: userId,
        status: 'in_progress',
        current_question_index: 0,
        total_questions: totalQuestions || 0,
        skipped_question_ids: [],
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating session:', createError);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({
      session: {
        id: newSession.id,
        userId: newSession.user_id,
        status: newSession.status,
        currentQuestionIndex: newSession.current_question_index,
        totalQuestions: newSession.total_questions,
        skippedQuestionIds: newSession.skipped_question_ids || [],
        startedAt: newSession.started_at,
        completedAt: newSession.completed_at,
        lastActivityAt: newSession.last_activity_at,
        version: newSession.version,
      },
      isNew: true,
    });
  } catch (error: any) {
    console.error('Error in POST /api/assessment/session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/assessment/session
 * Delete/abandon all sessions for a user (for starting over)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Delete all in-progress sessions for this user
    const { error: deleteSessionError } = await supabase
      .from('assessment_sessions')
      .delete()
      .eq('user_id', userId)
      .eq('status', 'in_progress');

    if (deleteSessionError) {
      console.error('Error deleting sessions:', deleteSessionError);
      return NextResponse.json({ error: 'Failed to delete sessions' }, { status: 500 });
    }

    // Also delete any completed sessions and results if user wants a fresh start
    const { error: deleteCompletedError } = await supabase
      .from('assessment_sessions')
      .delete()
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (deleteCompletedError) {
      console.error('Error deleting completed sessions:', deleteCompletedError);
    }

    // Delete user trait results
    const { error: deleteResultsError } = await supabase
      .from('user_trait_results')
      .delete()
      .eq('user_id', userId);

    if (deleteResultsError) {
      console.error('Error deleting results:', deleteResultsError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/assessment/session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
