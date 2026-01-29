import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

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
        explanation: 'Understanding how others see you is the first step to building your brand. These words often become the foundation of how you present yourself to sponsors.'
      },
      {
        id: 'identity-2',
        question: 'What makes you different from other athletes in your sport?',
        type: 'text',
        explanation: 'Your unique qualities are what brands look for. It\'s not just about athletic ability - your personality, interests, and story all matter.'
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
        explanation: 'This is a key question for any NIL deal. Think about your reach (followers), engagement (likes, comments), and authenticity (genuine connection with audience).'
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
        explanation: 'Red flags include: pressure to sign quickly, unclear payment terms, exclusive rights to your entire image, no written contract, or deals that seem "too good to be true."'
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
        explanation: 'Exclusivity means you can\'t work with competing brands. For example, if you sign an exclusive deal with Nike, you couldn\'t also promote Adidas. Be careful with exclusive deals!'
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
        explanation: 'Smart approach: 1) Set aside 25-30% for taxes, 2) Save some for emergencies, 3) Invest in your future, 4) Then enjoy some responsibly!'
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
        explanation: 'Your legacy is what you leave behind. Think about the impact you want to make beyond sports - in your community, industry, or the world.'
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
        explanation: 'Brands love athletes who are passionate about giving back. Your causes and values make you more attractive to sponsors who share those values.'
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
        explanation: 'Taking action is key! Whether it\'s starting a community project, growing your platform authentically, or developing new skills - every step counts.'
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

    // Check user's level
    const { data: profile } = await supabase
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
    const { data: allProgress } = await supabase
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
