import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

// Daily questions pool — enhanced with hints and coaching context
const dailyQuestions = [
  {
    id: 'dq-1',
    question: 'What 3 words would your teammates use to describe you?',
    pillar: 'identity',
    type: 'text' as const,
    hints: ['Think about what your coach says about you', 'What do friends come to you for?'],
    coachingContext: 'The athlete is identifying personal brand traits. Look for self-awareness and specificity.'
  },
  {
    id: 'dq-2',
    question: 'Quick! Name ONE brand you\'d love to partner with and WHY 🎯',
    pillar: 'identity',
    type: 'text' as const,
    hints: ['Think about brands you already use and love', 'What brands match your personality?'],
    coachingContext: 'The athlete is connecting personal identity to brand alignment. Look for genuine reasoning, not just naming a big brand.'
  },
  {
    id: 'dq-3',
    question: 'True or False: Your school can pay you directly for NIL deals',
    pillar: 'business',
    type: 'multiple_choice' as const,
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'False! Schools cannot pay athletes directly for NIL. Deals must come from third-party brands and businesses.'
  },
  {
    id: 'dq-4',
    question: 'If you earned $500 from an NIL deal today, how would you split it up?',
    pillar: 'money',
    type: 'text' as const,
    hints: ['Think about taxes — how much should you set aside?', 'What about saving vs. spending?'],
    coachingContext: 'The athlete is demonstrating financial literacy. Look for awareness of taxes, saving, and responsible spending rather than spending it all.'
  },
  {
    id: 'dq-5',
    question: 'What\'s ONE thing you want to be known for after your athletic career?',
    pillar: 'legacy',
    type: 'text' as const,
    hints: ['Think beyond sports — what impact do you want to make?', 'What would you want people to say about you at 40?'],
    coachingContext: 'The athlete is articulating their long-term legacy vision. Look for depth of thought about identity beyond athletics.'
  },
  {
    id: 'dq-6',
    question: 'What makes you DIFFERENT from other athletes in your sport?',
    pillar: 'identity',
    type: 'text' as const,
    hints: ['Think about your personality, not just your stats', 'What hobbies or interests set you apart?'],
    coachingContext: 'The athlete is identifying their unique value proposition. Look for specificity about what differentiates them beyond just athletic ability.'
  },
  {
    id: 'dq-7',
    question: 'What\'s a red flag you\'d look for in an NIL deal?',
    pillar: 'business',
    type: 'text' as const,
    hints: ['What if they pressure you to sign quickly?', 'What about deals that seem too good to be true?'],
    coachingContext: 'The athlete is learning to identify predatory deal terms. Look for awareness of red flags like rushed timelines, vague compensation, or overly broad exclusivity.'
  },
  {
    id: 'dq-8',
    question: 'What cause or community issue do you care about most?',
    pillar: 'legacy',
    type: 'text' as const,
    hints: ['What issue in your community fires you up?', 'Is there a cause connected to your personal story?'],
    coachingContext: 'The athlete is identifying causes that shape their brand. Look for genuine passion and personal connection.'
  },
  {
    id: 'dq-9',
    question: 'True or False: You need 100K followers to get an NIL deal',
    pillar: 'business',
    type: 'multiple_choice' as const,
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'False! Many NIL deals are local — small businesses, community brands. Engagement and authenticity matter more than follower count.'
  },
  {
    id: 'dq-10',
    question: 'What\'s one skill you have OUTSIDE of sports that could help your brand?',
    pillar: 'identity',
    type: 'text' as const,
    hints: ['Are you creative, funny, a good speaker?', 'Think about what you do in your free time'],
    coachingContext: 'The athlete is recognizing transferable skills. Look for self-awareness about non-athletic talents that add brand value.'
  },
  {
    id: 'dq-11',
    question: 'What does "exclusivity" mean in an NIL contract?',
    pillar: 'business',
    type: 'text' as const,
    hints: ['Think about what it means to only work with one brand', 'What if Nike pays you — can you wear Adidas?'],
    coachingContext: 'The athlete is demonstrating understanding of exclusivity clauses and their implications for future deals.'
  },
  {
    id: 'dq-12',
    question: 'If a brand asked you to promote something you don\'t believe in, what would you do?',
    pillar: 'legacy',
    type: 'text' as const,
    hints: ['Think about your values and what you stand for', 'Consider how it would look to your community'],
    coachingContext: 'The athlete is navigating authenticity vs. money. Look for awareness that saying no protects long-term brand value.'
  },
  {
    id: 'dq-13',
    question: 'What percentage of NIL income should you set aside for taxes?',
    pillar: 'money',
    type: 'multiple_choice' as const,
    options: ['0% — athletes don\'t pay taxes', '10-15%', '25-30%', '50%'],
    correctAnswer: '25-30%',
    explanation: 'NIL income is typically taxed around 25-30% (federal + state + self-employment tax). Always set money aside!'
  },
  {
    id: 'dq-14',
    question: 'Who should you talk to BEFORE signing any NIL deal?',
    pillar: 'business',
    type: 'text' as const,
    hints: ['Think about trusted adults in your life', 'What about your school\'s compliance office?'],
    coachingContext: 'The athlete is identifying their support network. Look for mentions of parents/guardians, compliance officers, or trusted mentors.'
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
        options: 'options' in question ? question.options : undefined,
        correctAnswer: 'correctAnswer' in question ? question.correctAnswer : undefined,
        explanation: 'explanation' in question ? question.explanation : undefined,
        hints: 'hints' in question ? question.hints : undefined,
        coachingContext: 'coachingContext' in question ? question.coachingContext : undefined,
      },
      alreadyAnswered: !!existingAnswer,
      xpReward: 10
    });
  } catch (error) {
    console.error('Daily challenge GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
