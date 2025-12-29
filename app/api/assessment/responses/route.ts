/**
 * Assessment Responses API
 *
 * POST - Submit a response for a question
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/assessment/responses
 * Submit a response for a question
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, questionId, responseValue, timeSpentMs } = body;

    if (!sessionId || !questionId || responseValue === undefined) {
      return NextResponse.json(
        { error: 'sessionId, questionId, and responseValue are required' },
        { status: 400 }
      );
    }

    // Get session to verify it exists and get user_id
    const { data: session, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Session is not in progress' },
        { status: 400 }
      );
    }

    // Check if response already exists (upsert)
    const { data: existingResponse } = await supabase
      .from('assessment_responses')
      .select('id')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .single();

    let response;

    if (existingResponse) {
      // Update existing response
      const { data: updatedResponse, error: updateError } = await supabase
        .from('assessment_responses')
        .update({
          response_value: responseValue,
          was_skipped: false,
          skipped_at: null,
          answered_at: new Date().toISOString(),
          time_spent_ms: timeSpentMs,
        })
        .eq('id', existingResponse.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating response:', updateError);
        return NextResponse.json({ error: 'Failed to update response' }, { status: 500 });
      }

      response = updatedResponse;
    } else {
      // Create new response
      const { data: newResponse, error: insertError } = await supabase
        .from('assessment_responses')
        .insert({
          session_id: sessionId,
          question_id: questionId,
          user_id: session.user_id,
          response_value: responseValue,
          was_skipped: false,
          answered_at: new Date().toISOString(),
          time_spent_ms: timeSpentMs,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating response:', insertError);
        return NextResponse.json({ error: 'Failed to create response' }, { status: 500 });
      }

      response = newResponse;
    }

    // Remove from skipped list if it was skipped before
    if (session.skipped_question_ids?.includes(questionId)) {
      const updatedSkipped = session.skipped_question_ids.filter(
        (id: string) => id !== questionId
      );

      await supabase
        .from('assessment_sessions')
        .update({
          skipped_question_ids: updatedSkipped,
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', sessionId);
    } else {
      // Just update last activity
      await supabase
        .from('assessment_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', sessionId);
    }

    return NextResponse.json({
      response: {
        id: response.id,
        sessionId: response.session_id,
        questionId: response.question_id,
        userId: response.user_id,
        responseValue: response.response_value,
        wasSkipped: response.was_skipped,
        answeredAt: response.answered_at,
        timeSpentMs: response.time_spent_ms,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/assessment/responses:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
