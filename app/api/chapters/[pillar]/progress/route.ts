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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pillar: string }> }
) {
  try {
    const { pillar } = await params;
    const cookieStore = await cookies();
    const body = await request.json();
    const { questionId, answer, questionIndex, questionType, questionText, coachingContext } = body;

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

    // Auth check using SSR client
    let { data: { user } } = await supabase.auth.getUser();
    if (!user && bearerToken) {
      const { data: { user: tokenUser } } = await supabase.auth.getUser(bearerToken);
      if (tokenUser) user = tokenUser;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate AI feedback for text questions
    let aiFeedback: string | null = null;
    let qualityScore: number | null = null;

    if (questionType === 'text' && questionText && coachingContext) {
      const result = await generateChapterFeedback(
        { question: questionText, coachingContext },
        answer
      );
      aiFeedback = result.feedback;
      qualityScore = result.qualityScore;
    }

    // Save progress using service role client to bypass RLS
    const { error: progressError } = await supabaseAdmin
      .from('chapter_progress')
      .upsert({
        user_id: user.id,
        pillar,
        question_id: questionId,
        question_index: questionIndex,
        answer,
        ...(qualityScore !== null ? { quality_score: qualityScore } : {}),
        ...(aiFeedback !== null ? { ai_feedback: aiFeedback } : {}),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,pillar,question_index'
      });

    if (progressError) {
      console.error('Chapter progress save error:', progressError);
    }

    // Award XP — base + bonus for high-quality text answers
    let xpAmount = 5;
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

    // Update profile using service role client
    const { error: profileError } = await supabaseAdmin
      .from('athlete_profiles')
      .update({
        current_xp: newXP,
        lifetime_xp: newLifetimeXP,
        level: newLevel,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    // Log XP transaction using service role client
    const { error: xpError } = await supabaseAdmin
      .from('xp_transactions')
      .insert({
        user_id: user.id,
        amount: xpAmount,
        reason: `chapter_${pillar}_question`
      });

    if (xpError) {
      console.error('XP transaction log error:', xpError);
    }

    // For text questions, always correct
    // For multiple choice/true-false, could check against correct answer
    const correct = true;

    return NextResponse.json({
      success: true,
      correct,
      xpEarned: xpAmount,
      bonusXP,
      qualityScore,
      aiFeedback,
      newXP,
      newLevel,
      leveledUp: newLevel > currentLevel
    });
  } catch (error) {
    console.error('Chapter progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateChapterFeedback(
  question: { question: string; coachingContext: string },
  answer: string
): Promise<{ feedback: string; qualityScore: number }> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a friendly NIL coach for high school athletes (ages 14-18).

TASK: Evaluate the athlete's answer and provide personalized coaching feedback.

RULES:
- 2-3 sentences max
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

Context about this question: ${question.coachingContext}

Return JSON: { "feedback": "your feedback here", "qualityScore": N }`,
        },
        {
          role: 'user',
          content: `Question: "${question.question}"\nAthlete's answer: "${answer}"`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const result = JSON.parse(content);
      return {
        feedback: result.feedback || "That's a thoughtful response! Keep building on these ideas.",
        qualityScore: Math.min(5, Math.max(1, result.qualityScore || 3)),
      };
    }
    return { feedback: "That's a thoughtful response! Keep building on these ideas.", qualityScore: 3 };
  } catch (error) {
    console.error('Error generating chapter feedback:', error);
    return { feedback: "That's a thoughtful response! Keep building on these ideas.", qualityScore: 3 };
  }
}
