/**
 * Assessment Results API
 *
 * GET  - Get results for a user
 * POST - Submit/calculate results
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/assessment/results
 * Get results for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Get user's results
    const { data: results, error: resultsError } = await supabase
      .from('user_trait_results')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (resultsError && resultsError.code !== 'PGRST116') {
      console.error('Error fetching results:', resultsError);
      return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
    }

    if (!results) {
      return NextResponse.json({ results: null });
    }

    // Get trait details for display
    const { data: traits } = await supabase
      .from('core_traits')
      .select('*')
      .order('display_order');

    // Get archetype details
    const { data: archetypes } = await supabase
      .from('trait_archetypes')
      .select('*')
      .eq('archetype_code', results.archetype_code)
      .single();

    return NextResponse.json({
      results: {
        id: results.id,
        userId: results.user_id,
        sessionId: results.session_id,
        traitScores: results.trait_scores,
        topTraits: results.top_traits,
        archetypeCode: results.archetype_code,
        archetypeName: results.archetype_name,
        archetypeDescription: results.archetype_description,
        calculatedAt: results.calculated_at,
      },
      traits: (traits || []).map((t: any) => ({
        id: t.id,
        traitCode: t.trait_code,
        traitName: t.trait_name,
        traitDescription: t.trait_description,
        category: t.category,
        iconName: t.icon_name,
        colorHex: t.color_hex,
      })),
      archetype: archetypes
        ? {
            id: archetypes.id,
            code: archetypes.archetype_code,
            name: archetypes.archetype_name,
            description: archetypes.archetype_description,
            definingTraits: archetypes.defining_traits,
            exampleAthletes: archetypes.example_athletes,
            aiPersonalityHint: archetypes.ai_personality_hint,
            iconName: archetypes.icon_name,
            colorHex: archetypes.color_hex,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error in GET /api/assessment/results:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/assessment/results
 * Submit/calculate results
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      traitScores,
      topTraits,
      archetypeCode,
      archetypeName,
      archetypeDescription,
    } = body;

    if (!sessionId || !traitScores || !topTraits || !archetypeCode) {
      return NextResponse.json(
        { error: 'sessionId, traitScores, topTraits, and archetypeCode are required' },
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

    // Mark session as completed
    const { error: updateSessionError } = await supabase
      .from('assessment_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateSessionError) {
      console.error('Error updating session:', updateSessionError);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    // Check for existing results (upsert by user_id)
    const { data: existingResults } = await supabase
      .from('user_trait_results')
      .select('id')
      .eq('user_id', session.user_id)
      .single();

    let results;

    if (existingResults) {
      // Update existing results
      const { data: updatedResults, error: updateError } = await supabase
        .from('user_trait_results')
        .update({
          session_id: sessionId,
          trait_scores: traitScores,
          top_traits: topTraits,
          archetype_code: archetypeCode,
          archetype_name: archetypeName,
          archetype_description: archetypeDescription,
          calculated_at: new Date().toISOString(),
        })
        .eq('id', existingResults.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating results:', updateError);
        return NextResponse.json({ error: 'Failed to update results' }, { status: 500 });
      }

      results = updatedResults;
    } else {
      // Create new results
      const { data: newResults, error: insertError } = await supabase
        .from('user_trait_results')
        .insert({
          user_id: session.user_id,
          session_id: sessionId,
          trait_scores: traitScores,
          top_traits: topTraits,
          archetype_code: archetypeCode,
          archetype_name: archetypeName,
          archetype_description: archetypeDescription,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating results:', insertError);
        return NextResponse.json({ error: 'Failed to create results' }, { status: 500 });
      }

      results = newResults;
    }

    return NextResponse.json({
      results: {
        id: results.id,
        userId: results.user_id,
        sessionId: results.session_id,
        traitScores: results.trait_scores,
        topTraits: results.top_traits,
        archetypeCode: results.archetype_code,
        archetypeName: results.archetype_name,
        archetypeDescription: results.archetype_description,
        calculatedAt: results.calculated_at,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/assessment/results:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
