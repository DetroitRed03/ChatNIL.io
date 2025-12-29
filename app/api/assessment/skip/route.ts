/**
 * Assessment Skip API
 *
 * POST - Skip a question
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/assessment/skip
 * Skip a question
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, questionId } = body;

    if (!sessionId || !questionId) {
      return NextResponse.json(
        { error: 'sessionId and questionId are required' },
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

    // Add to skipped list if not already there
    const skippedIds = session.skipped_question_ids || [];
    if (!skippedIds.includes(questionId)) {
      skippedIds.push(questionId);
    }

    // Update session with skipped question
    const { error: updateError } = await supabase
      .from('assessment_sessions')
      .update({
        skipped_question_ids: skippedIds,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session:', updateError);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    // Check if response already exists
    const { data: existingResponse } = await supabase
      .from('assessment_responses')
      .select('id')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .single();

    let responseId;

    if (existingResponse) {
      // Update existing response to mark as skipped
      const { error: responseUpdateError } = await supabase
        .from('assessment_responses')
        .update({
          was_skipped: true,
          skipped_at: new Date().toISOString(),
          response_value: { value: 0 },
        })
        .eq('id', existingResponse.id);

      if (responseUpdateError) {
        console.error('Error updating response:', responseUpdateError);
      }

      responseId = existingResponse.id;
    } else {
      // Create a skipped response record
      const { data: newResponse, error: insertError } = await supabase
        .from('assessment_responses')
        .insert({
          session_id: sessionId,
          question_id: questionId,
          user_id: session.user_id,
          response_value: { value: 0 },
          was_skipped: true,
          skipped_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating skipped response:', insertError);
      }

      responseId = newResponse?.id;
    }

    return NextResponse.json({
      skippedQuestionIds: skippedIds,
      responseId,
    });
  } catch (error: any) {
    console.error('Error in POST /api/assessment/skip:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
