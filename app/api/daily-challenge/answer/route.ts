import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Service role client for bypassing RLS on writes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Level thresholds
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000];

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();
    const { questionId, answer, questionText, questionType, coachingContext } = body;

    if (!questionId || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Server-side answer validation
    const trimmedAnswer = answer.trim();
    if (trimmedAnswer.length < 20) {
      return NextResponse.json({ error: 'Answer too short. Please write at least a short sentence.' }, { status: 400 });
    }

    const lowerAnswer = trimmedAnswer.toLowerCase().replace(/[\u2018\u2019]/g, "'");
    const lowEffortExact = [
      "idk", "n/a", "none", "no", "yes", "maybe", "ok", "okay", "sure", "idc",
      "dunno", "whatever", "anything", "something", "no clue", "no idea",
      "not sure", "nothing", "dont know", "i dont know",
    ];
    if (lowEffortExact.includes(lowerAnswer)) {
      return NextResponse.json({ error: 'Please provide a more thoughtful answer.' }, { status: 400 });
    }

    const lowEffortContains = [
      "i don't know", "i dont know", "don't know", "dont know",
      "no idea", "not sure", "who cares", "beats me", "no clue",
      "whatever", "dunno",
    ];
    if (lowEffortContains.some(phrase => lowerAnswer.includes(phrase))) {
      const withoutPhrases = lowEffortContains.reduce((t, p) => t.replace(p, ''), lowerAnswer).trim();
      if (withoutPhrases.length < 15) {
        return NextResponse.json({ error: 'Please provide a more thoughtful answer.' }, { status: 400 });
      }
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

    // Generate AI feedback for text questions
    let aiFeedback: string | null = null;
    let qualityScore: number | null = null;
    let followUpQuestion: string | null = null;

    if (questionType === 'text' && questionText && coachingContext) {
      const result = await generateDailyChallengeFeedback(
        { question: questionText, coachingContext },
        answer
      );
      aiFeedback = result.feedback;
      qualityScore = result.qualityScore;
      followUpQuestion = result.followUpQuestion;
    }

    // Save answer using service role client to bypass RLS
    try {
      await supabaseAdmin
        .from('daily_question_answers')
        .insert({
          user_id: user.id,
          question_id: questionId,
          answer: answer,
          ...(qualityScore !== null ? { quality_score: qualityScore } : {}),
          ...(aiFeedback !== null ? { ai_feedback: aiFeedback } : {}),
          created_at: new Date().toISOString()
        });
    } catch {
      // Table might not exist - continue anyway
    }

    // Award XP — base + bonus for high-quality text answers
    let xpAmount = 10;
    let bonusXP = 0;
    if (qualityScore !== null) {
      if (qualityScore >= 5) {
        bonusXP = 5;
      } else if (qualityScore >= 4) {
        bonusXP = 3;
      }
      xpAmount += bonusXP;
    }

    // Get current profile using service role client
    const { data: profile } = await supabaseAdmin
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
    const { data: lastActivity } = await supabaseAdmin
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

    // Update profile using service role client
    await supabaseAdmin
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
      await supabaseAdmin
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
        await supabaseAdmin.from('user_badges').insert({
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
        await supabaseAdmin.from('user_badges').upsert({
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
        await supabaseAdmin.from('user_badges').upsert({
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
      bonusXP,
      qualityScore,
      aiFeedback,
      followUpQuestion,
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

async function generateDailyChallengeFeedback(
  question: { question: string; coachingContext: string },
  answer: string
): Promise<{ feedback: string; qualityScore: number; followUpQuestion: string | null }> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a friendly NIL coach for high school athletes (ages 14-18).

TASK: Evaluate the athlete's daily challenge answer and provide personalized coaching feedback.

RULES:
- 2-3 sentences max for feedback
- Reference something SPECIFIC from their answer
- Add one insight or connection they might not have considered
- Be warm and encouraging but substantive
- Use one emoji max
- NO generic praise like "Great answer!" without specifics
- NO bullet points or lists

Also rate the answer quality 1-5:
1 = Minimal effort or off-topic
2 = On topic but vague
3 = Decent response with some thought
4 = Good response showing real reflection
5 = Excellent, specific, and insightful

For quality scores 3+, also generate a brief follow-up question that pushes their thinking deeper.

Context about this question: ${question.coachingContext}

Return JSON: { "feedback": "your feedback here", "qualityScore": N, "followUpQuestion": "optional follow-up or null" }`,
        },
        {
          role: 'user',
          content: `Question: "${question.question}"\nAthlete's answer: "${answer}"`,
        },
      ],
      max_tokens: 250,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const result = JSON.parse(content);
      return {
        feedback: result.feedback || "That's a thoughtful response! Keep building on these ideas.",
        qualityScore: Math.min(5, Math.max(1, result.qualityScore || 3)),
        followUpQuestion: result.followUpQuestion || null,
      };
    }
    return { feedback: "That's a thoughtful response! Keep building on these ideas.", qualityScore: 3, followUpQuestion: null };
  } catch (error) {
    console.error('Error generating daily challenge feedback:', error);
    return { feedback: "That's a thoughtful response! Keep building on these ideas.", qualityScore: 3, followUpQuestion: null };
  }
}
