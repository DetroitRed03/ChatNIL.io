import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import {
  getQuestionsForDay,
  PILLAR_ORDER,
  PillarType,
  ALL_QUESTIONS
} from '@/lib/discovery/questions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Check for Authorization header (Bearer token from localStorage)
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Try to get user from cookies first
    let { data: { user }, error: authError } = await supabase.auth.getUser();

    // If no user from cookies and Bearer token is provided, try using the token
    if (!user && bearerToken) {
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(bearerToken);
      if (tokenUser && !tokenError) {
        user = tokenUser;
        authError = null;
      }
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create conversation flow record
    let { data: flowData, error: flowError } = await supabase
      .from('conversation_flows')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let isNewSession = false;

    if (!flowData) {
      // Create new conversation flow (using actual schema column names)
      const { data: newFlow, error: createError } = await supabase
        .from('conversation_flows')
        .insert({
          user_id: user.id,
          flow_type: 'discovery',
          current_pillar: 'identity',
          current_day: 1,
          current_step: 1,
          answers_given: {},
          status: 'active',
          flow_started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating conversation flow:', createError);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
      }

      flowData = newFlow;
      isNewSession = true;
    }

    // Get current question (using current_step instead of current_question_number)
    const currentPillar = flowData.current_pillar as PillarType;
    const currentDay = flowData.current_day;
    const currentQuestionNumber = flowData.current_step;

    const dayQuestions = getQuestionsForDay(currentPillar, currentDay);
    const currentQuestion = dayQuestions.find(q => q.questionNumber === currentQuestionNumber) || null;

    // Get unlocked chapters (using chapter_name instead of chapter_id)
    const { data: chapters } = await supabase
      .from('chapter_unlocks')
      .select('chapter_name')
      .eq('user_id', user.id);

    const unlockedChapters = chapters?.map(c => c.chapter_name as PillarType) || [];

    // Calculate if discovery is complete
    const isComplete = !currentQuestion && unlockedChapters.length === 4;

    return NextResponse.json({
      state: {
        currentPillar,
        currentDay,
        currentQuestionNumber,
        answersGiven: flowData.answers_given || {},
        unlockedChapters,
        isComplete,
      },
      currentQuestion,
      messages: [], // Messages stored in answers_given as needed
      isNewSession,
    });
  } catch (error) {
    console.error('Error getting discovery state:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
