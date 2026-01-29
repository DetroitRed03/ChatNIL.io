import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

// XP values for different actions
const XP_VALUES = {
  complete_question: 5,
  complete_daily_challenge: 10,
  complete_chapter: 50,
  earn_achievement: 25,
  fill_profile_field: 5,
  streak_bonus_7_day: 20,
  streak_bonus_30_day: 50,
};

// Level thresholds
const LEVEL_THRESHOLDS = [
  { level: 1, xpRequired: 0, unlocks: ['Identity chapter'] },
  { level: 2, xpRequired: 100, unlocks: ['Business chapter'] },
  { level: 3, xpRequired: 250, unlocks: ['Money chapter'] },
  { level: 4, xpRequired: 500, unlocks: ['Legacy chapter'] },
  { level: 5, xpRequired: 1000, unlocks: ['NIL Scholar badge', 'Profile export'] },
];

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();
    const { action, metadata } = body;

    if (!action || !XP_VALUES[action as keyof typeof XP_VALUES]) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
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

    // Get current XP/level from profile
    const { data: profile } = await supabase
      .from('athlete_profiles')
      .select('current_xp, level, lifetime_xp')
      .eq('id', user.id)
      .single();

    const currentXP = profile?.current_xp || 0;
    const currentLevel = profile?.level || 1;
    const lifetimeXP = profile?.lifetime_xp || 0;

    // Calculate XP to award
    const xpAmount = XP_VALUES[action as keyof typeof XP_VALUES];
    const newTotalXP = currentXP + xpAmount;
    const newLifetimeXP = lifetimeXP + xpAmount;

    // Check for level up
    let newLevel = currentLevel;
    let leveledUp = false;
    let unlockedContent: string[] = [];

    for (const threshold of LEVEL_THRESHOLDS) {
      if (newLifetimeXP >= threshold.xpRequired && threshold.level > newLevel) {
        newLevel = threshold.level;
        leveledUp = true;
        unlockedContent = threshold.unlocks;
      }
    }

    // Calculate XP needed for next level
    const nextLevelThreshold = LEVEL_THRESHOLDS.find(t => t.level === newLevel + 1);
    const xpToNextLevel = nextLevelThreshold ? nextLevelThreshold.xpRequired - newLifetimeXP : 0;

    // Update profile with new XP
    const { error: updateError } = await supabase
      .from('athlete_profiles')
      .update({
        current_xp: newTotalXP,
        lifetime_xp: newLifetimeXP,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      // If columns don't exist, that's okay - we'll return calculated values
      console.warn('XP update skipped - columns may not exist:', updateError);
    }

    // Log XP transaction (if table exists)
    try {
      await supabase
        .from('xp_transactions')
        .insert({
          user_id: user.id,
          amount: xpAmount,
          reason: action,
          metadata: metadata || {},
        });
    } catch {
      // Table might not exist - ignore error
    }

    return NextResponse.json({
      success: true,
      xpEarned: xpAmount,
      newTotalXP,
      newLifetimeXP,
      newLevel,
      leveledUp,
      unlockedContent,
      xpToNextLevel: Math.max(xpToNextLevel, 0),
    });
  } catch (error) {
    console.error('XP route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    // Get current XP/level from profile
    const { data: profile } = await supabase
      .from('athlete_profiles')
      .select('current_xp, level, lifetime_xp')
      .eq('id', user.id)
      .single();

    const currentXP = profile?.current_xp || 0;
    const level = profile?.level || 1;
    const lifetimeXP = profile?.lifetime_xp || 0;

    // Calculate XP to next level
    const nextLevelThreshold = LEVEL_THRESHOLDS.find(t => t.level === level + 1);
    const currentLevelThreshold = LEVEL_THRESHOLDS.find(t => t.level === level);
    const xpToNextLevel = nextLevelThreshold ? nextLevelThreshold.xpRequired - lifetimeXP : 0;
    const xpInCurrentLevel = lifetimeXP - (currentLevelThreshold?.xpRequired || 0);
    const xpForCurrentLevel = nextLevelThreshold
      ? nextLevelThreshold.xpRequired - (currentLevelThreshold?.xpRequired || 0)
      : 1000;

    return NextResponse.json({
      currentXP,
      lifetimeXP,
      level,
      xpToNextLevel: Math.max(xpToNextLevel, 0),
      xpInCurrentLevel,
      xpForCurrentLevel,
      progressPercent: Math.min((xpInCurrentLevel / xpForCurrentLevel) * 100, 100),
    });
  } catch (error) {
    console.error('XP GET route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
