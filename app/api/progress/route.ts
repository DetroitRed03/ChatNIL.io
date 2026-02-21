import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { getUserQuizStats, getQuizCategories } from '@/lib/quiz';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000];

function calculateLevel(lifetimeXP: number) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (lifetimeXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const xpInLevel = lifetimeXP - currentThreshold;
  const xpToNextLevel = Math.max(nextThreshold - lifetimeXP, 0);
  const levelThreshold = nextThreshold - currentThreshold;

  return { level, xpInLevel, xpToNextLevel, levelThreshold };
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

    // Fetch all data in parallel using supabaseAdmin for reliable server-side reads
    const [
      profileResult,
      quizStats,
      quizCategories,
      chapterProgressResult,
      badgesResult,
      allBadgesResult,
      dealsResult,
      activityResult,
    ] = await Promise.all([
      // 1. Profile — use supabaseAdmin for reliable server-side read
      supabaseAdmin
        .from('athlete_profiles')
        .select('*')
        .eq('id', user.id)
        .single(),

      // 2. Quiz stats
      getUserQuizStats(user.id),

      // 3. Quiz categories
      getQuizCategories(user.id),

      // 4. Chapter progress — the actual table where discovery chapters save data
      supabaseAdmin
        .from('chapter_progress')
        .select('pillar, question_id, question_index, created_at')
        .eq('user_id', user.id),

      // 5. User badges
      supabaseAdmin
        .from('user_badges')
        .select(`
          id,
          earned_at,
          badge:badges(id, name, description, icon_url, rarity, points)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false }),

      // 6. Total badges
      supabaseAdmin
        .from('badges')
        .select('id')
        .eq('is_active', true),

      // 7. Deals
      supabaseAdmin
        .from('nil_deals')
        .select('id, third_party_name, brand_name, compensation_amount, status, compliance_status, created_at')
        .eq('athlete_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),

      // 8. Activity log
      supabaseAdmin
        .from('activity_log')
        .select('id, type, title, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(15),
    ]);

    const profile = profileResult.data;
    if (!profile) {
      console.error('Progress API: Profile not found', {
        userId: user.id,
        profileError: profileResult.error,
      });
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const isHSStudent = profile.role === 'hs_student';
    const lifetimeXP = profile.lifetime_xp || profile.current_xp || 0;
    const { level, xpInLevel, xpToNextLevel, levelThreshold } = calculateLevel(lifetimeXP);

    // Build discovery data from chapter_progress table (HS students only)
    let discovery = null;
    if (isHSStudent) {
      const chapterRows = chapterProgressResult.data || [];
      const pillarOrder = ['identity', 'business', 'money', 'legacy'];
      const totalPillars = 4;
      const questionsPerPillar = 5;

      // Count unique questions answered per pillar
      const pillarCounts: Record<string, number> = {};
      for (const row of chapterRows) {
        if (!pillarCounts[row.pillar]) pillarCounts[row.pillar] = 0;
        pillarCounts[row.pillar]++;
      }

      // Determine completed pillars (all 5 questions answered)
      const completedPillars = pillarOrder.filter(p => (pillarCounts[p] || 0) >= questionsPerPillar);

      // Current pillar = first incomplete pillar in order
      const currentPillar = pillarOrder.find(p => !completedPillars.includes(p)) || pillarOrder[pillarOrder.length - 1];

      // Current day = questions answered in current pillar + 1 (1-indexed for UI)
      const answeredInCurrent = pillarCounts[currentPillar] || 0;
      const currentDay = Math.min(answeredInCurrent + 1, questionsPerPillar + 1);

      discovery = {
        currentPillar,
        currentDay,
        completedPillars,
        totalPillars,
        completionPercentage: Math.round((completedPillars.length / totalPillars) * 100),
        isComplete: completedPillars.length >= totalPillars,
        profileCompleteness: 0,
      };
    }

    // Build badges data
    const earnedBadges = (badgesResult.data || []).map((ub: any) => ({
      id: ub.badge?.id || ub.id,
      name: ub.badge?.name || 'Badge',
      description: ub.badge?.description || '',
      icon: ub.badge?.icon_url || '',
      rarity: ub.badge?.rarity || 'common',
      points: ub.badge?.points || 0,
      earnedAt: ub.earned_at,
    }));

    // Build streak weekActivity from profile's last_activity_at and chapter_progress timestamps
    const weekActivity = [false, false, false, false, false, false, false];
    const lastInteraction = profile.last_activity_at || profile.updated_at;

    // Also mark days with chapter activity in the past week
    const chapterRows = chapterProgressResult.data || [];
    const now = new Date();
    for (const row of chapterRows) {
      if (!row.created_at) continue;
      const activityDate = new Date(row.created_at);
      const daysSince = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince >= 0 && daysSince < 7) {
        weekActivity[6 - daysSince] = true;
      }
    }

    // Also mark from profile last activity
    if (lastInteraction) {
      const lastActivity = new Date(lastInteraction);
      const daysSince = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince >= 0 && daysSince < 7) {
        weekActivity[6 - daysSince] = true;
      }
    }

    // Build deals data
    const deals = (dealsResult.data || []).map((d: any) => ({
      id: d.id,
      brandName: d.brand_name || d.third_party_name || 'Unknown',
      compensationAmount: d.compensation_amount,
      status: d.status,
      complianceStatus: d.compliance_status,
      createdAt: d.created_at,
    }));

    // Build activity data
    const activity = (activityResult.data || []).map((a: any) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      createdAt: a.created_at,
    }));

    return NextResponse.json({
      user: {
        fullName: profile.username || user.email?.split('@')[0] || 'Athlete',
        sport: profile.sport || 'Not set',
        school: profile.school_name || '',
        role: profile.role,
        avatar: profile.avatar_url,
      },
      gamification: {
        level,
        currentXP: profile.current_xp || 0,
        lifetimeXP,
        xpToNextLevel,
        xpInLevel,
        levelThreshold,
      },
      discovery,
      quizStats: quizStats || {
        total_questions_attempted: 0,
        total_questions_correct: 0,
        average_score_percentage: 0,
        quizzes_completed: 0,
        total_points_earned: 0,
        total_time_spent_seconds: 0,
      },
      quizCategories: quizCategories || [],
      badges: {
        earned: earnedBadges,
        totalAvailable: allBadgesResult.data?.length || 0,
        earnedCount: earnedBadges.length,
      },
      deals,
      streak: {
        current: profile.streak_count || 0,
        longest: profile.longest_streak || 0,
        weekActivity,
        lastActivity: lastInteraction || null,
      },
      activity,
    });
  } catch (error) {
    console.error('Error loading progress data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
