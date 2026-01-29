import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

// Daily questions pool
const dailyQuestions = [
  {
    id: 'dq-1',
    question: 'What 3 words would your teammates use to describe you?',
    pillar: 'identity',
    type: 'text' as const
  },
  {
    id: 'dq-2',
    question: 'Quick! Name ONE brand you\'d love to partner with 🎯',
    pillar: 'identity',
    type: 'text' as const
  },
  {
    id: 'dq-3',
    question: 'True or False: Your school can pay you directly for NIL deals',
    pillar: 'business',
    type: 'multiple_choice' as const,
    options: ['True', 'False']
  },
  {
    id: 'dq-4',
    question: 'If you earned $500 today, what % would you save?',
    pillar: 'money',
    type: 'text' as const
  },
  {
    id: 'dq-5',
    question: 'What\'s ONE thing you want to be known for after your athletic career?',
    pillar: 'legacy',
    type: 'text' as const
  },
  {
    id: 'dq-6',
    question: '3 words that describe YOUR brand - go! ⚡',
    pillar: 'identity',
    type: 'text' as const
  },
  {
    id: 'dq-7',
    question: 'What\'s a red flag 🚩 you\'d look for in an NIL deal?',
    pillar: 'business',
    type: 'text' as const
  }
];

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

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

    let { data: { user } } = await supabase.auth.getUser();
    if (!user && bearerToken) {
      const { data: { user: tokenUser } } = await supabase.auth.getUser(bearerToken);
      if (tokenUser) user = tokenUser;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Get today's question (rotate based on day of year)
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    const question = dailyQuestions[dayOfYear % dailyQuestions.length];

    // Check if already answered today
    const { data: existingAnswer } = await supabase
      .from('daily_question_answers')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .single();

    return NextResponse.json({
      question: {
        id: question.id,
        question: question.question,
        pillar: question.pillar,
        type: question.type,
        options: question.options
      },
      alreadyAnswered: !!existingAnswer,
      xpReward: 10
    });
  } catch (error) {
    console.error('Daily challenge GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
