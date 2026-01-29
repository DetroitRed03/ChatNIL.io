import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

// Daily challenges pool - gamified versions of the questions
const dailyChallenges = [
  {
    id: 'dc-1',
    question: 'Quick! Name ONE brand you\'d love to partner with 🎯',
    pillar: 'Identity',
    timeEstimate: '~30 seconds',
  },
  {
    id: 'dc-2',
    question: 'True or False: Your school can pay you directly for NIL deals',
    pillar: 'Business',
    timeEstimate: '~10 seconds',
  },
  {
    id: 'dc-3',
    question: 'If you earned $500 today, what % would you save?',
    pillar: 'Money',
    timeEstimate: '~20 seconds',
  },
  {
    id: 'dc-4',
    question: 'What\'s ONE thing you want to be known for after your athletic career?',
    pillar: 'Legacy',
    timeEstimate: '~30 seconds',
  },
  {
    id: 'dc-5',
    question: '3 words that describe YOUR brand - go! ⚡',
    pillar: 'Identity',
    timeEstimate: '~15 seconds',
  },
  {
    id: 'dc-6',
    question: 'What\'s a red flag 🚩 you\'d look for in an NIL deal?',
    pillar: 'Business',
    timeEstimate: '~30 seconds',
  },
  {
    id: 'dc-7',
    question: 'Name ONE financial app or tool you use (or want to try)',
    pillar: 'Money',
    timeEstimate: '~15 seconds',
  },
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

    // Get today's challenge (rotate based on day of year)
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    const challenge = dailyChallenges[dayOfYear % dailyChallenges.length];

    // Check if already completed today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingAnswer } = await supabase
      .from('daily_question_answers')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .single();

    return NextResponse.json({
      challenge: {
        ...challenge,
        completed: !!existingAnswer,
      },
      xpReward: 10,
    });
  } catch (error) {
    console.error('Daily challenge GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();
    const { challengeId, answer } = body;

    if (!challengeId || !answer) {
      return NextResponse.json({ error: 'Challenge ID and answer required' }, { status: 400 });
    }

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

    // Check if already completed today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingAnswer } = await supabase
      .from('daily_question_answers')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .single();

    if (existingAnswer) {
      return NextResponse.json({ error: 'Already completed today' }, { status: 400 });
    }

    // Store answer
    try {
      await supabase
        .from('daily_question_answers')
        .insert({
          user_id: user.id,
          question_id: challengeId,
          answer,
          created_at: new Date().toISOString(),
        });
    } catch {
      // Table might not exist - ignore error
    }

    // Update streak
    const { data: profile } = await supabase
      .from('athlete_profiles')
      .select('streak_count, longest_streak')
      .eq('id', user.id)
      .single();

    const newStreak = (profile?.streak_count || 0) + 1;
    const longestStreak = Math.max(newStreak, profile?.longest_streak || 0);

    await supabase
      .from('athlete_profiles')
      .update({
        streak_count: newStreak,
        longest_streak: longestStreak,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Award XP
    const xpEarned = 10;
    let streakBonus = 0;
    if (newStreak === 7) streakBonus = 20;
    if (newStreak === 30) streakBonus = 50;

    return NextResponse.json({
      success: true,
      xpEarned: xpEarned + streakBonus,
      newStreak,
      streakBonus,
      todayComplete: true,
    });
  } catch (error) {
    console.error('Daily challenge POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
