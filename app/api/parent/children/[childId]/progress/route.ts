import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Create admin client for database operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * GET - Fetch detailed progress for a specific child
 * Parents can only view progress for their linked children
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId } = await params;
    const cookieStore = await cookies();

    // Check for Authorization header
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

    // Get authenticated user
    let { data: { user }, error: authError } = await supabase.auth.getUser();

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

    // Get parent profile
    const { data: parentProfile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!parentProfile || parentProfile.role !== 'parent') {
      return NextResponse.json({ error: 'Not a parent account' }, { status: 403 });
    }

    // Verify parent-child relationship
    const { data: consentInvite } = await supabaseAdmin
      .from('parent_consent_invites')
      .select('*')
      .eq('parent_email', parentProfile.email)
      .eq('student_id', childId)
      .eq('status', 'approved')
      .single();

    const { data: relationship } = await supabaseAdmin
      .from('parent_child_relationships')
      .select('*')
      .eq('parent_id', user.id)
      .eq('child_id', childId)
      .single();

    if (!consentInvite && !relationship) {
      return NextResponse.json({ error: 'Not authorized to view this child' }, { status: 403 });
    }

    // Get child user data
    const { data: childUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', childId)
      .single();

    if (!childUser) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Get chapter progress for all pillars
    const { data: chapterProgress } = await supabaseAdmin
      .from('chapter_progress')
      .select('*')
      .eq('user_id', childId)
      .order('updated_at', { ascending: false });

    // Get gamification data
    const { data: gamification } = await supabaseAdmin
      .from('user_gamification')
      .select('*')
      .eq('user_id', childId)
      .single();

    // Get streak data
    const { data: streak } = await supabaseAdmin
      .from('user_streaks')
      .select('*')
      .eq('user_id', childId)
      .single();

    // Get all badges
    const { data: badges } = await supabaseAdmin
      .from('user_badges')
      .select('*')
      .eq('user_id', childId)
      .order('earned_at', { ascending: false });

    // Get question responses for detailed progress
    const { data: responses } = await supabaseAdmin
      .from('question_responses')
      .select('*')
      .eq('user_id', childId)
      .order('answered_at', { ascending: false });

    // Calculate progress by pillar
    const pillarOrder = ['identity', 'business', 'money', 'legacy'];
    const pillarTitles: Record<string, string> = {
      identity: 'Building Your Personal Brand',
      business: 'Understanding NIL Deals',
      money: 'Managing Money & Taxes',
      legacy: 'Planning for Your Future'
    };

    const pillars = pillarOrder.map(pillarName => {
      const progress = chapterProgress?.find(p => p.pillar === pillarName);
      const pillarResponses = responses?.filter(r => r.pillar === pillarName) || [];

      return {
        id: pillarName,
        name: pillarTitles[pillarName],
        questionsCompleted: progress?.questions_completed || 0,
        questionsTotal: 5,
        completed: progress?.completed || false,
        completedAt: progress?.completed_at || null,
        score: progress?.score || 0,
        lastAttempt: pillarResponses[0]?.answered_at || null
      };
    });

    // Calculate overall stats
    const totalQuestionsCompleted = pillars.reduce((sum, p) => sum + p.questionsCompleted, 0);
    const totalQuestions = pillars.reduce((sum, p) => sum + p.questionsTotal, 0);
    const completedPillars = pillars.filter(p => p.completed).length;

    // Find current pillar (first incomplete)
    const currentPillar = pillars.find(p => !p.completed) || pillars[pillars.length - 1];

    return NextResponse.json({
      success: true,
      childId,
      childName: childUser.full_name || childUser.first_name || 'Student',
      progress: {
        overall: {
          percentage: totalQuestions > 0 ? Math.round((totalQuestionsCompleted / totalQuestions) * 100) : 0,
          questionsCompleted: totalQuestionsCompleted,
          questionsTotal: totalQuestions,
          pillarsCompleted: completedPillars,
          pillarsTotal: 4
        },
        currentPillar: {
          id: currentPillar.id,
          name: currentPillar.name,
          progress: currentPillar.questionsCompleted,
          total: currentPillar.questionsTotal
        },
        pillars,
        gamification: {
          level: gamification?.level || 1,
          xp: gamification?.current_xp || 0,
          xpToNextLevel: gamification?.xp_to_next_level || 100,
          totalXpEarned: gamification?.total_xp_earned || 0
        },
        streak: {
          current: streak?.current_streak || 0,
          longest: streak?.longest_streak || 0,
          lastActiveDate: streak?.last_activity_date || null
        },
        badges: (badges || []).map(b => ({
          id: b.id,
          badgeId: b.badge_id,
          name: b.badge_name || b.badge_id,
          earnedAt: b.earned_at
        })),
        recentResponses: (responses || []).slice(0, 10).map(r => ({
          id: r.id,
          pillar: r.pillar,
          questionId: r.question_id,
          isCorrect: r.is_correct,
          answeredAt: r.answered_at
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching child progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
