import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import OpenAI from 'openai';
import {
  getQuestionsForDay,
  getNextQuestion,
  PILLAR_ORDER,
  PillarType,
  DiscoveryQuestion,
  PILLARS,
} from '@/lib/discovery/questions';
import { getAcknowledgmentPrompt, getDataExtractionPrompt } from '@/lib/discovery/prompts';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answer, questionId } = body;

    if (!answer || !questionId) {
      return NextResponse.json({ error: 'Answer and questionId required' }, { status: 400 });
    }

    const cookieStore = await cookies();
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current conversation flow
    const { data: flowData, error: flowError } = await supabase
      .from('conversation_flows')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (flowError || !flowData) {
      return NextResponse.json({ error: 'No active session' }, { status: 400 });
    }

    const currentPillar = flowData.current_pillar as PillarType;
    const currentDay = flowData.current_day;
    const currentQuestionNumber = flowData.current_step; // Using current_step from actual schema

    // Find the current question
    const dayQuestions = getQuestionsForDay(currentPillar, currentDay);
    const currentQuestion = dayQuestions.find(q => q.id === questionId);

    if (!currentQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 400 });
    }

    // Generate acknowledgment using AI
    let acknowledgment = await generateAcknowledgment(currentQuestion, answer);

    // Extract structured data from the answer
    const extractedData = await extractDataFromAnswer(currentQuestion, answer);

    // Store the answer
    const updatedAnswers = {
      ...flowData.answers_given,
      [questionId]: {
        answer,
        extractedData,
        answeredAt: new Date().toISOString(),
      },
    };

    // Update discovery profile with extracted data
    await updateDiscoveryProfile(supabase, user.id, currentQuestion.dataField, extractedData);

    // Determine next question
    const nextQuestion = getNextQuestion(currentPillar, currentDay, currentQuestionNumber);

    // Check if pillar is complete
    let chapterUnlocked: PillarType | null = null;
    const pillarQuestions = dayQuestions.filter(q => q.pillar === currentPillar);
    const isLastQuestionInPillar =
      currentDay === 5 &&
      currentQuestionNumber === pillarQuestions.filter(q => q.day === 5).length;

    if (isLastQuestionInPillar || (nextQuestion && nextQuestion.pillar !== currentPillar)) {
      // Unlock chapter
      chapterUnlocked = currentPillar;
      await unlockChapter(supabase, user.id, currentPillar);
    }

    // Calculate new state
    let newState;
    if (nextQuestion) {
      newState = {
        currentPillar: nextQuestion.pillar,
        currentDay: nextQuestion.day,
        currentQuestionNumber: nextQuestion.questionNumber,
        answersGiven: updatedAnswers,
        unlockedChapters: chapterUnlocked
          ? [...(flowData.unlocked_chapters || []), chapterUnlocked]
          : flowData.unlocked_chapters || [],
        isComplete: false,
      };
    } else {
      newState = {
        currentPillar,
        currentDay,
        currentQuestionNumber,
        answersGiven: updatedAnswers,
        unlockedChapters: chapterUnlocked
          ? [...(flowData.unlocked_chapters || []), chapterUnlocked]
          : flowData.unlocked_chapters || [],
        isComplete: true,
      };
    }

    // Update conversation flow in database (using actual schema column names)
    const { error: updateError } = await supabase
      .from('conversation_flows')
      .update({
        current_pillar: newState.currentPillar,
        current_day: newState.currentDay,
        current_step: newState.currentQuestionNumber,
        answers_given: updatedAnswers,
        last_interaction_at: new Date().toISOString(),
        ...(newState.isComplete ? { flow_completed_at: new Date().toISOString(), status: 'completed' } : {}),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating conversation flow:', updateError);
    }

    return NextResponse.json({
      success: true,
      acknowledgment,
      nextQuestion,
      chapterUnlocked,
      newState,
      isComplete: newState.isComplete,
    });
  } catch (error) {
    console.error('Error processing discovery response:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateAcknowledgment(
  question: DiscoveryQuestion,
  answer: string
): Promise<string> {
  try {
    const prompt = getAcknowledgmentPrompt(question, answer);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a friendly NIL coach having a conversation with a high school athlete.
Generate a brief, encouraging acknowledgment (1-2 sentences) to their answer.
Be conversational, warm, and occasionally use relevant emojis.
Don't repeat their answer back verbatim.
End with a smooth transition that makes the next question feel natural.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content || "That's great! Let me ask you something else.";
  } catch (error) {
    console.error('Error generating acknowledgment:', error);
    return "Got it! Let's keep going.";
  }
}

async function extractDataFromAnswer(
  question: DiscoveryQuestion,
  answer: string
): Promise<any> {
  try {
    const prompt = getDataExtractionPrompt(question, answer);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a data extraction assistant. Extract structured data from the user's response.
Return ONLY valid JSON with the extracted data.
If the response is unclear, make reasonable inferences.
For numeric scales, extract the number.
For lists, extract as arrays.
For categories, normalize to standard values when possible.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
    return { raw: answer };
  } catch (error) {
    console.error('Error extracting data:', error);
    return { raw: answer };
  }
}

async function updateDiscoveryProfile(
  supabase: any,
  userId: string,
  dataField: string,
  extractedData: any
): Promise<void> {
  try {
    // Map data field names to actual schema column names
    const fieldMapping: Record<string, string> = {
      sport: 'sport',
      position: 'position',
      social_platforms: 'social_platforms',
      leadership_style: 'leadership_style',
      personal_brand_keywords: 'personal_brand_keywords',
      brand_values: 'brand_values',
      unique_story: 'unique_story',
      state_nil_awareness: 'nil_interest_level',
      compliance_confidence_score: 'compliance_knowledge_score',
      has_bank_account: 'has_bank_account',
      tax_awareness: 'understands_tax_obligations',
      savings_goals: 'financial_goals',
      financial_confidence_score: 'financial_independence_level',
      causes_passionate_about: 'causes_passionate_about',
      legacy_statement: 'career_aspirations',
      athletic_aspirations: 'athletic_aspirations',
    };

    const columnName = fieldMapping[dataField] || dataField;

    // Extract the value from the extracted data
    const value = extractedData.value !== undefined ? extractedData.value : extractedData;

    // Check if profile exists
    const { data: profile } = await supabase
      .from('student_discovery_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profile) {
      await supabase
        .from('student_discovery_profiles')
        .update({
          [columnName]: value,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('student_discovery_profiles')
        .insert({
          user_id: userId,
          [columnName]: value,
        });
    }
  } catch (error) {
    console.error('Error updating discovery profile:', error);
  }
}

async function unlockChapter(
  supabase: any,
  userId: string,
  pillar: PillarType
): Promise<void> {
  try {
    // Using actual schema: chapter_name (not chapter_id), requires unlocked_via
    await supabase
      .from('chapter_unlocks')
      .insert({
        user_id: userId,
        chapter_name: pillar, // Store pillar key for easy lookup
        unlocked_via: 'progression',
        unlocked_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Error unlocking chapter:', error);
  }
}
