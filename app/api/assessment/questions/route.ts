/**
 * Assessment Questions API
 *
 * GET - Get all active assessment questions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/assessment/questions
 * Get all active assessment questions
 */
export async function GET(request: NextRequest) {
  try {
    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('assessment_questions')
      .select('*')
      .eq('is_active', true)
      .order('question_order', { ascending: true });

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }

    // Get traits
    const { data: traits, error: traitsError } = await supabase
      .from('core_traits')
      .select('*')
      .order('display_order', { ascending: true });

    if (traitsError) {
      console.error('Error fetching traits:', traitsError);
    }

    // Get archetypes
    const { data: archetypes, error: archetypesError } = await supabase
      .from('trait_archetypes')
      .select('*');

    if (archetypesError) {
      console.error('Error fetching archetypes:', archetypesError);
    }

    return NextResponse.json({
      questions: (questions || []).map((q) => ({
        id: q.id,
        questionText: q.question_text,
        questionType: q.question_type,
        options: q.options,
        traitWeights: q.trait_weights,
        questionOrder: q.question_order,
        section: q.section,
        isRequired: q.is_required,
        helpText: q.help_text,
        isActive: q.is_active,
      })),
      traits: (traits || []).map((t) => ({
        id: t.id,
        traitCode: t.trait_code,
        traitName: t.trait_name,
        traitDescription: t.trait_description,
        category: t.category,
        iconName: t.icon_name,
        colorHex: t.color_hex,
        displayOrder: t.display_order,
      })),
      archetypes: (archetypes || []).map((a) => ({
        id: a.id,
        code: a.archetype_code,
        name: a.archetype_name,
        description: a.archetype_description,
        definingTraits: a.defining_traits,
        exampleAthletes: a.example_athletes,
        aiPersonalityHint: a.ai_personality_hint,
        iconName: a.icon_name,
        colorHex: a.color_hex,
      })),
    });
  } catch (error: any) {
    console.error('Error in GET /api/assessment/questions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
