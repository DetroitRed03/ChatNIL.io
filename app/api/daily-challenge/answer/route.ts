import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

// Level thresholds
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000];

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();
    const { questionId, answer } = body;

    if (!questionId || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Check if already answered today
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('daily_question_answers')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already answered today' }, { status: 400 });
    }

    // Save answer
    try {
      await supabase
        .from('daily_question_answers')
        .insert({
          user_id: user.id,
          question_id: questionId,
          answer: answer,
          created_at: new Date().toISOString()
        });
    } catch {
      // Table might not exist - continue anyway
    }

    // Award XP
    const xpAmount = 10;

    // Get current profile
    const { data: profile } = await supabase
      .from('athlete_profiles')
      .select('current_xp, level, lifetime_xp, streak_count, longest_streak')
      .eq('id', user.id)
      .single();

    const currentXP = profile?.current_xp || 0;
    const currentLevel = profile?.level || 1;
    const lifetimeXP = profile?.lifetime_xp || 0;
    const newXP = currentXP + xpAmount;
    const newLifetimeXP = lifetimeXP + xpAmount;

    // Calculate if level up
    let newLevel = currentLevel;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (newLifetimeXP >= LEVEL_THRESHOLDS[i]) {
        newLevel = i + 1;
        break;
      }
    }

    // Update streak
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = 1;
    let longestStreak = profile?.longest_streak || 0;

    // Get last activity
    const { data: lastActivity } = await supabase
      .from('daily_question_answers')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(2);

    if (lastActivity && lastActivity.length > 1) {
      const lastDate = lastActivity[1].created_at.split('T')[0];
      if (lastDate === yesterday) {
        newStreak = (profile?.streak_count || 0) + 1;
      }
    }

    if (newStreak > longestStreak) {
      longestStreak = newStreak;
    }

    // Streak bonus XP
    let streakBonus = 0;
    if (newStreak === 7) streakBonus = 20;
    if (newStreak === 30) streakBonus = 50;

    // Update profile
    await supabase
      .from('athlete_profiles')
      .update({
        current_xp: newXP + streakBonus,
        lifetime_xp: newLifetimeXP + streakBonus,
        level: newLevel,
        streak_count: newStreak,
        longest_streak: longestStreak,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // Log XP transaction
    try {
      await supabase
        .from('xp_transactions')
        .insert({
          user_id: user.id,
          amount: xpAmount + streakBonus,
          reason: 'daily_challenge'
        });
    } catch {
      // Table might not exist
    }

    // Check for achievements
    const achievementsEarned: string[] = [];

    // First answer achievement
    if (!profile || currentXP === 0) {
      try {
        await supabase.from('user_badges').insert({
          user_id: user.id,
          badge_id: 'first-steps'
        });
        achievementsEarned.push('first-steps');
      } catch {
        // Already has badge or table doesn't exist
      }
    }

    // Streak achievements
    if (newStreak === 3) {
      try {
        await supabase.from('user_badges').upsert({
          user_id: user.id,
          badge_id: 'streak-3'
        });
        achievementsEarned.push('streak-3');
      } catch {
        // Already has badge
      }
    }

    if (newStreak === 7) {
      try {
        await supabase.from('user_badges').upsert({
          user_id: user.id,
          badge_id: 'streak-7'
        });
        achievementsEarned.push('streak-7');
      } catch {
        // Already has badge
      }
    }

    return NextResponse.json({
      success: true,
      xpEarned: xpAmount + streakBonus,
      newXP: newXP + streakBonus,
      newLevel,
      leveledUp: newLevel > currentLevel,
      newStreak,
      streakBonus,
      achievementsEarned
    });
  } catch (error) {
    console.error('Daily challenge answer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
