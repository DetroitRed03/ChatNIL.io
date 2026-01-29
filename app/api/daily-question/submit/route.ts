import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, answer } = body;

    if (!questionId || !answer) {
      return NextResponse.json({ error: 'Question ID and answer required' }, { status: 400 });
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

    // Generate encouraging feedback using AI
    let feedback = 'Great thinking! Keep reflecting on these important topics. 🌟';

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an encouraging NIL coach for high school athletes.
Generate a brief, positive response (1-2 sentences) to their daily reflection answer.
Be warm, encouraging, and occasionally add relevant insights.
Use an emoji when appropriate.`,
          },
          {
            role: 'user',
            content: `The student answered a daily reflection question. Their answer: "${answer}"

Generate a brief encouraging response.`,
          },
        ],
        max_tokens: 100,
        temperature: 0.8,
      });

      feedback = response.choices[0]?.message?.content || feedback;
    } catch (aiError) {
      console.error('Error generating AI feedback:', aiError);
      // Use default feedback
    }

    // Update streak count
    const today = new Date().toISOString().split('T')[0];

    await supabase
      .from('athlete_profiles')
      .update({
        last_activity_date: today,
        streak_count: supabase.rpc('increment_streak', { user_id: user.id }),
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error('Error submitting daily question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
