import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();
    const { questionId, answer } = body;

    if (!questionId || !answer) {
      return NextResponse.json(
        { error: 'Question ID and answer are required' },
        { status: 400 }
      );
    }

    // Check for Authorization header (Bearer token from localStorage)
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

    // Try to get user from cookies first
    let { data: { user }, error: authError } = await supabase.auth.getUser();

    // If no user from cookies and Bearer token is provided, try using the token
    if (!user && bearerToken) {
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(bearerToken);
      if (tokenUser && !tokenError) {
        user = tokenUser;
        authError = null;
      }
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('athlete_profiles')
      .select('role, streak_count, longest_streak')
      .eq('id', user.id)
      .single();

    // Check if user is HS student
    if (profile?.role !== 'hs_student') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if question was already answered today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingAnswer } = await supabase
      .from('daily_question_answers')
      .select('id')
      .eq('user_id', user.id)
      .eq('question_id', questionId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .single();

    if (existingAnswer) {
      return NextResponse.json(
        { error: 'Already answered today' },
        { status: 400 }
      );
    }

    // Store the answer
    const { error: insertError } = await supabase
      .from('daily_question_answers')
      .insert({
        user_id: user.id,
        question_id: questionId,
        answer: answer,
        created_at: new Date().toISOString(),
      });

    // If table doesn't exist, that's okay - we'll still update streak
    if (insertError && !insertError.message.includes('does not exist')) {
      console.error('Error storing answer:', insertError);
    }

    // Update streak count
    const lastActivity = profile?.streak_count ? new Date() : null;
    const currentStreak = (profile?.streak_count || 0) + 1;
    const longestStreak = Math.max(currentStreak, profile?.longest_streak || 0);

    await supabase
      .from('athlete_profiles')
      .update({
        streak_count: currentStreak,
        longest_streak: longestStreak,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Update conversation flow to mark activity
    await supabase
      .from('conversation_flows')
      .update({
        last_interaction_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // Calculate XP earned (base 10, with streak bonus)
    const streakBonus = currentStreak >= 3 ? 5 : 0;
    const xpEarned = 10 + streakBonus;

    return NextResponse.json({
      success: true,
      xpEarned,
      newStreak: currentStreak,
      streakBonus: streakBonus > 0,
    });
  } catch (error) {
    console.error('Error submitting daily question answer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
