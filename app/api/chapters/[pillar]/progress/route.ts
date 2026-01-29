import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

// Level thresholds
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pillar: string }> }
) {
  try {
    const { pillar } = await params;
    const cookieStore = await cookies();
    const body = await request.json();
    const { questionId, answer, questionIndex } = body;

    if (!questionId || answer === undefined) {
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

    // Save progress - use upsert to handle re-answering same question
    const { error: progressError } = await supabase
      .from('chapter_progress')
      .upsert({
        user_id: user.id,
        pillar,
        question_id: questionId,
        question_index: questionIndex,
        answer,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,pillar,question_index'
      });

    if (progressError) {
      console.error('Chapter progress save error:', progressError);
      // Continue anyway to still award XP even if progress save fails
    }

    // Award XP
    const xpAmount = 5;

    // Get current profile
    const { data: profile } = await supabase
      .from('athlete_profiles')
      .select('current_xp, level, lifetime_xp')
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

    // Update profile
    await supabase
      .from('athlete_profiles')
      .update({
        current_xp: newXP,
        lifetime_xp: newLifetimeXP,
        level: newLevel,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // Log XP transaction
    const { error: xpError } = await supabase
      .from('xp_transactions')
      .insert({
        user_id: user.id,
        amount: xpAmount,
        reason: `chapter_${pillar}_question`
      });

    if (xpError) {
      console.error('XP transaction log error:', xpError);
      // Non-critical, continue anyway
    }

    // For text questions, always correct
    // For multiple choice/true-false, could check against correct answer
    const correct = true; // Simplified - always mark as correct for now

    return NextResponse.json({
      success: true,
      correct,
      xpEarned: xpAmount,
      newXP,
      newLevel,
      leveledUp: newLevel > currentLevel
    });
  } catch (error) {
    console.error('Chapter progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
