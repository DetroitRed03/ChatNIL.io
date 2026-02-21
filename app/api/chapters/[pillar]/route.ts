import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Service role client for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Chapter content - in production, this would come from database
const CHAPTER_CONTENT: Record<string, {
  title: string;
  description: string;
  icon: string;
  requiredLevel: number;
  xpPerQuestion: number;
  questions: Array<{
    id: string;
    question: string;
    type: 'text' | 'multiple_choice' | 'true_false';
    options?: string[];
    correctAnswer?: string;
    explanation: string;
    // AI coaching fields (text questions only)
    minChars?: number;
    guidingPrompts?: string[];
    coachingContext?: string;
  }>;
}> = {
  identity: {
    title: 'Identity',
    description: 'Define your personal brand',
    icon: '🎭',
    requiredLevel: 1,
    xpPerQuestion: 5,
    questions: [
      {
        id: 'identity-1',
        question: 'What 3 words would your teammates use to describe you?',
        type: 'text',
        explanation: 'Those words are the start of your personal brand. How others see you often becomes the foundation of how sponsors see you too — character matters as much as stats.',
        minChars: 30,
        guidingPrompts: [
          'Think about what your coach says about you',
          'What do friends come to you for?',
          'How would you describe your energy in the locker room?'
        ],
        coachingContext: 'The athlete is identifying their personal brand through how others perceive them. Look for self-awareness and specificity in the 3 words they choose.'
      },
      {
        id: 'identity-2',
        question: 'What makes you different from other athletes in your sport?',
        type: 'text',
        explanation: 'What sets you apart is exactly what brands are looking for. Your personality, story, and interests all make you unique — and that\'s your competitive advantage in NIL.',
        minChars: 40,
        guidingPrompts: [
          'What\'s something you do that others in your sport don\'t?',
          'Think about your background or interests outside sports',
          'What would fans remember about you?'
        ],
        coachingContext: 'The athlete is identifying their unique value proposition. Look for specificity about what differentiates them — personality, background, skills, or interests beyond just athletic ability.'
      },
      {
        id: 'identity-3',
        question: 'Which social media platform do you use most?',
        type: 'multiple_choice',
        options: ['Instagram', 'TikTok', 'Twitter/X', 'YouTube', 'None'],
        explanation: 'Different platforms attract different brands. Knowing where your audience is helps you build the right presence.'
      },
      {
        id: 'identity-4',
        question: 'True or False: Your personal brand should only focus on your athletic achievements.',
        type: 'true_false',
        correctAnswer: 'False',
        explanation: 'False! Your personal brand includes your personality, interests, values, and story - not just sports stats. Brands often connect with the whole person.'
      },
      {
        id: 'identity-5',
        question: 'If a brand wanted to sponsor you today, what would they get?',
        type: 'text',
        explanation: 'Understanding your own value is the first step in any NIL deal. Your character, work ethic, and personal qualities are all part of what makes you worth sponsoring.',
        minChars: 40,
        guidingPrompts: [
          'Think about your social media following and engagement',
          'What qualities make you a good representative?',
          'Consider your community involvement'
        ],
        coachingContext: 'The athlete is articulating their sponsorship value. Look for awareness of both tangible assets (audience, reach) and intangible qualities (character, work ethic, relatability).'
      }
    ]
  },
  business: {
    title: 'Business',
    description: 'Learn how NIL deals work',
    icon: '📋',
    requiredLevel: 2,
    xpPerQuestion: 5,
    questions: [
      {
        id: 'business-1',
        question: 'What is the FIRST thing you should do when you receive an NIL offer?',
        type: 'multiple_choice',
        options: ['Sign it immediately', 'Tell your friends', 'Read the entire contract carefully', 'Post about it on social media'],
        correctAnswer: 'Read the entire contract carefully',
        explanation: 'Always read the full contract before signing anything! Look for payment terms, what\'s expected of you, and any red flags.'
      },
      {
        id: 'business-2',
        question: 'What would be a RED FLAG in an NIL deal offer?',
        type: 'text',
        explanation: 'Good instincts! Common red flags include pressure to sign quickly, unclear payment terms, exclusive rights to your entire image, or deals that seem too good to be true. Knowing what to watch for protects you.',
        minChars: 30,
        guidingPrompts: [
          'Think about deals that pressure you to decide quickly',
          'What if the payment terms are unclear?',
          'Consider what "too good to be true" looks like'
        ],
        coachingContext: 'The athlete is learning to identify predatory or unfair deal terms. Look for awareness of common red flags like rushed timelines, vague compensation, overly broad exclusivity, or unreasonable demands.'
      },
      {
        id: 'business-3',
        question: 'True or False: You should always negotiate the first offer a brand gives you.',
        type: 'true_false',
        correctAnswer: 'True',
        explanation: 'True! First offers are often negotiable. It\'s professional to counteroffer - just be respectful and reasonable.'
      },
      {
        id: 'business-4',
        question: 'Who should you talk to BEFORE signing any NIL deal?',
        type: 'multiple_choice',
        options: ['Your best friend', 'A parent or guardian and your school compliance office', 'Random people online', 'No one - keep it secret'],
        correctAnswer: 'A parent or guardian and your school compliance office',
        explanation: 'Always involve a trusted adult and your school\'s compliance office. They can spot problems you might miss and ensure the deal is legal.'
      },
      {
        id: 'business-5',
        question: 'What does "exclusivity" mean in an NIL contract?',
        type: 'text',
        explanation: 'You\'re building real business knowledge! Exclusivity means you can\'t work with competing brands — for example, a Nike deal would prevent you from promoting Adidas. Always think twice before agreeing to exclusivity.',
        minChars: 30,
        guidingPrompts: [
          'Think about what it means to only work with one brand',
          'What if Nike pays you — can you wear Adidas?',
          'Consider how exclusivity limits your future options'
        ],
        coachingContext: 'The athlete is demonstrating understanding of exclusivity clauses. Look for grasp of the concept that exclusivity restricts working with competing brands and its implications for future deals.'
      }
    ]
  },
  money: {
    title: 'Money',
    description: 'Master your finances',
    icon: '💰',
    requiredLevel: 3,
    xpPerQuestion: 5,
    questions: [
      {
        id: 'money-1',
        question: 'Approximately what percentage of NIL income goes to taxes?',
        type: 'multiple_choice',
        options: ['0% - Athletes don\'t pay taxes', '10-15%', '20-30%', '50%'],
        correctAnswer: '20-30%',
        explanation: 'NIL income is typically taxed around 20-30% (federal + state + self-employment tax). Always set aside money for taxes!'
      },
      {
        id: 'money-2',
        question: 'True or False: If you make more than $600 from NIL deals, you\'ll receive a 1099 tax form.',
        type: 'true_false',
        correctAnswer: 'True',
        explanation: 'True! Any company that pays you $600 or more must send you a 1099 form. Keep track of ALL your income for taxes.'
      },
      {
        id: 'money-3',
        question: 'What should you do with the money you earn from NIL deals?',
        type: 'text',
        explanation: 'Thinking about this now puts you ahead of most athletes. A solid approach: set aside 25-30% for taxes, save for emergencies, invest in your future, then enjoy some responsibly.',
        minChars: 35,
        guidingPrompts: [
          'Think about taxes — how much should you set aside?',
          'What about saving for emergencies?',
          'Consider investing in your future or education'
        ],
        coachingContext: 'The athlete is developing financial literacy around NIL earnings. Look for awareness of tax obligations, saving strategies, budgeting, or long-term financial planning beyond just spending.'
      },
      {
        id: 'money-4',
        question: 'What is a "1099 form"?',
        type: 'multiple_choice',
        options: ['A contract for NIL deals', 'A tax document showing how much you earned', 'A form to open a bank account', 'A school permission slip'],
        correctAnswer: 'A tax document showing how much you earned',
        explanation: 'A 1099 is a tax form that shows how much a company paid you. You\'ll need these when filing your taxes.'
      },
      {
        id: 'money-5',
        question: 'True or False: You should spend all your NIL money immediately because you earned it.',
        type: 'true_false',
        correctAnswer: 'False',
        explanation: 'False! Be smart with your money. Save for taxes, emergencies, and your future. Your athletic career won\'t last forever.'
      }
    ]
  },
  legacy: {
    title: 'Legacy',
    description: 'Build for the future',
    icon: '⭐',
    requiredLevel: 4,
    xpPerQuestion: 5,
    questions: [
      {
        id: 'legacy-1',
        question: 'What do you want to be known for AFTER your athletic career ends?',
        type: 'text',
        explanation: 'That\'s a powerful vision. Your legacy is what you leave behind — and the fact that you\'re thinking about it now shows real maturity. This becomes the "why" behind your brand.',
        minChars: 40,
        guidingPrompts: [
          'Think beyond sports — what impact do you want to make?',
          'What would you want people to say about you at 40?',
          'Consider your values and what drives you'
        ],
        coachingContext: 'The athlete is articulating their long-term vision and legacy beyond athletics. Look for depth of thought about impact, values, and identity beyond their sport.'
      },
      {
        id: 'legacy-2',
        question: 'True or False: NIL is only about making money now.',
        type: 'true_false',
        correctAnswer: 'False',
        explanation: 'False! NIL is also about building relationships, skills, and a reputation that will help you throughout your entire career and beyond.'
      },
      {
        id: 'legacy-3',
        question: 'What cause or community do you care about most?',
        type: 'text',
        explanation: 'That passion is part of what makes you unique. Brands love athletes who care about giving back — your values make you more attractive to sponsors who share them.',
        minChars: 30,
        guidingPrompts: [
          'What issue in your community fires you up?',
          'Think about who or what you\'d fight for',
          'Is there a cause connected to your personal story?'
        ],
        coachingContext: 'The athlete is identifying causes they care about, which shapes their brand and attracts value-aligned sponsors. Look for genuine passion and personal connection to the cause.'
      },
      {
        id: 'legacy-4',
        question: 'Which skill is MOST important for long-term NIL success?',
        type: 'multiple_choice',
        options: ['Being the best athlete', 'Building authentic relationships', 'Having the most followers', 'Signing the most deals'],
        correctAnswer: 'Building authentic relationships',
        explanation: 'Relationships last longer than any single deal or follower count. Authentic connections with brands, fans, and your community build lasting success.'
      },
      {
        id: 'legacy-5',
        question: 'What\'s one thing you\'ll do this year to build your legacy?',
        type: 'text',
        explanation: 'Having a concrete plan puts you ahead. Whether it\'s a community project, growing your platform, or developing new skills — every intentional step builds toward your legacy.',
        minChars: 35,
        guidingPrompts: [
          'Think about a project you could start this semester',
          'Is there a skill you want to develop?',
          'Consider how you could give back to your community'
        ],
        coachingContext: 'The athlete is making a concrete commitment to legacy-building. Look for actionable, specific plans rather than vague intentions. The more specific, the better.'
      }
    ]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pillar: string }> }
) {
  try {
    const { pillar } = await params;
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

    // Get chapter content
    const chapter = CHAPTER_CONTENT[pillar];
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Check user's level using service role client
    const { data: profile } = await supabaseAdmin
      .from('athlete_profiles')
      .select('level')
      .eq('id', user.id)
      .single();

    const userLevel = profile?.level || 1;

    if (userLevel < chapter.requiredLevel) {
      return NextResponse.json(
        { error: 'Chapter locked', requiredLevel: chapter.requiredLevel },
        { status: 403 }
      );
    }

    // Get ALL user's progress/answers in this chapter for persistence
    const { data: allProgress } = await supabaseAdmin
      .from('chapter_progress')
      .select('question_index, question_id, answer')
      .eq('user_id', user.id)
      .eq('pillar', pillar)
      .order('question_index', { ascending: true });

    // Build saved answers map
    const savedAnswers: Record<number, { questionId: string; answer: string }> = {};
    const answeredIndices: number[] = [];

    if (allProgress && allProgress.length > 0) {
      for (const item of allProgress) {
        savedAnswers[item.question_index] = {
          questionId: item.question_id,
          answer: item.answer
        };
        answeredIndices.push(item.question_index);
      }
    }

    // Current progress is the next unanswered question (or total if all done)
    const maxAnsweredIndex = answeredIndices.length > 0 ? Math.max(...answeredIndices) : -1;
    const currentProgress = maxAnsweredIndex + 1;

    return NextResponse.json({
      pillar,
      title: chapter.title,
      description: chapter.description,
      icon: chapter.icon,
      questions: chapter.questions,
      currentProgress,
      totalQuestions: chapter.questions.length,
      xpPerQuestion: chapter.xpPerQuestion,
      // Include saved answers for persistence
      savedAnswers,
      answeredIndices
    });
  } catch (error) {
    console.error('Chapter GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
