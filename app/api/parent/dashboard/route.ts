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

// Helper to clean display names
function getDisplayName(user: any): string {
  if (!user) return 'User';

  // Priority 1: full_name if it doesn't look like a username
  if (user.full_name && !user.full_name.includes('_xdv') && !user.full_name.includes('_xc0') && !user.full_name.match(/_[a-z0-9]{3,}$/i)) {
    return user.full_name;
  }

  // Priority 2: first_name + last_name
  if (user.first_name) {
    return `${user.first_name} ${user.last_name || ''}`.trim();
  }

  // Priority 3: Clean up email prefix
  if (user.email) {
    const prefix = user.email.split('@')[0];
    // Remove random suffixes like _xdv0, _xc0n
    const cleaned = prefix.replace(/_[a-z0-9]{3,}$/i, '');
    // Convert separators to spaces and capitalize
    return cleaned
      .replace(/[._-]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  return 'User';
}

// Helper to calculate next milestone
function calculateNextMilestone(
  questionsCompleted: number,
  currentPillar: string,
  badgeCount: number,
  streakCount: number
): { type: string; name: string; description: string; progress: number; total: number } | null {
  // Priority 1: First question (if no progress)
  if (questionsCompleted === 0) {
    return {
      type: 'badge',
      name: 'First Steps',
      description: 'Answer first question to earn this badge',
      progress: 0,
      total: 1
    };
  }

  // Priority 2: Complete 5 questions in current chapter
  const questionsInChapter = questionsCompleted % 5;
  if (questionsInChapter !== 0 || questionsCompleted === 0) {
    return {
      type: 'chapter',
      name: `Complete ${currentPillar.charAt(0).toUpperCase() + currentPillar.slice(1)}`,
      description: `Finish the ${currentPillar} chapter`,
      progress: questionsInChapter || 0,
      total: 5
    };
  }

  // Priority 3: Next streak milestone
  const streakMilestones = [3, 7, 14, 30];
  const nextStreakMilestone = streakMilestones.find(m => m > streakCount);
  if (nextStreakMilestone) {
    return {
      type: 'streak',
      name: `${nextStreakMilestone} Day Streak`,
      description: `Keep learning ${nextStreakMilestone} days in a row`,
      progress: streakCount,
      total: nextStreakMilestone
    };
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
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

    // Get parent profile from users table
    const { data: parentProfile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!parentProfile || parentProfile.role !== 'parent') {
      return NextResponse.json({ error: 'Not a parent account' }, { status: 403 });
    }

    // Build parent name
    const parentName = getDisplayName(parentProfile);

    // Get linked children from multiple sources
    const { data: consentInvites } = await supabaseAdmin
      .from('parent_consent_invites')
      .select('*')
      .eq('parent_email', parentProfile.email)
      .eq('status', 'approved');

    const { data: relationships } = await supabaseAdmin
      .from('parent_child_relationships')
      .select('*')
      .eq('parent_id', user.id);

    // Combine child IDs from both sources
    const childIds = new Set<string>();
    consentInvites?.forEach(inv => childIds.add(inv.student_id));
    relationships?.forEach(rel => childIds.add(rel.child_id));

    // Build children data
    const children: any[] = [];
    for (const childId of Array.from(childIds)) {
      // Get child profile from users table
      const { data: childUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', childId)
        .single();

      if (!childUser) continue;

      // Get student discovery profile for school/sport/state
      const { data: discoveryProfile } = await supabaseAdmin
        .from('student_discovery_profiles')
        .select('*')
        .eq('user_id', childId)
        .single();

      // Also get athlete profile as fallback
      const { data: athleteProfile } = await supabaseAdmin
        .from('athlete_profiles')
        .select('*')
        .eq('user_id', childId)
        .single();

      // Get chapter progress
      const { data: chapterProgress } = await supabaseAdmin
        .from('chapter_progress')
        .select('*')
        .eq('user_id', childId)
        .order('updated_at', { ascending: false });

      // Calculate total questions completed
      const totalQuestionsCompleted = chapterProgress?.reduce((sum, p) => sum + (p.questions_completed || 0), 0) || 0;
      const questionsTotal = 20; // 5 questions per chapter * 4 chapters
      const progressPercent = Math.min(Math.round((totalQuestionsCompleted / questionsTotal) * 100), 100);

      // Determine current chapter (first incomplete pillar)
      const pillarOrder = ['identity', 'business', 'money', 'legacy'];
      let currentChapter = 'identity';
      for (const pillar of pillarOrder) {
        const pillarProgress = chapterProgress?.find(p => p.pillar === pillar);
        if (!pillarProgress || !pillarProgress.completed) {
          currentChapter = pillar;
          break;
        }
      }

      const chapterTitles: Record<string, string> = {
        identity: 'Building Their Personal Brand',
        business: 'Understanding NIL Deals',
        money: 'Managing Money & Taxes',
        legacy: 'Planning for Their Future'
      };

      // Build child name
      const childName = getDisplayName(childUser);

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

      // Get badges count
      const { data: badges } = await supabaseAdmin
        .from('user_badges')
        .select('id')
        .eq('user_id', childId);

      // Check online status (active in last 5 minutes)
      const { data: recentSession } = await supabaseAdmin
        .from('user_sessions')
        .select('last_active')
        .eq('user_id', childId)
        .single();

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const isOnline = recentSession?.last_active
        ? recentSession.last_active > fiveMinutesAgo
        : false;

      // Get last activity
      const { data: lastActivity } = await supabaseAdmin
        .from('activity_log')
        .select('created_at')
        .eq('user_id', childId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const lastActive = recentSession?.last_active
        || lastActivity?.created_at
        || childUser.updated_at
        || new Date().toISOString();

      // Calculate next milestone
      const nextMilestone = calculateNextMilestone(
        totalQuestionsCompleted,
        currentChapter,
        badges?.length || 0,
        streak?.current_streak || 0
      );

      children.push({
        id: childId,
        name: childName,
        email: childUser.email,
        school: discoveryProfile?.school || athleteProfile?.school_name || childUser.school_name || 'School not set',
        sport: discoveryProfile?.sport || athleteProfile?.primary_sport || athleteProfile?.sport || 'Sport not set',
        grade: discoveryProfile?.graduation_year
          ? `Class of ${discoveryProfile.graduation_year}`
          : athleteProfile?.graduation_year
            ? `Class of ${athleteProfile.graduation_year}`
            : 'High School',
        state: discoveryProfile?.state || athleteProfile?.state || '',
        status: 'active' as const,
        isOnline,
        lastActive,
        currentChapter,
        currentChapterTitle: chapterTitles[currentChapter],
        progressPercent,
        questionsCompleted: totalQuestionsCompleted,
        questionsTotal,
        badgesEarned: badges?.length || 0,
        currentStreak: streak?.current_streak || 0,
        xp: gamification?.current_xp || 0,
        level: gamification?.level || 1,
        nextMilestone
      });
    }

    // Get action items
    const { data: actionItems } = await supabaseAdmin
      .from('parent_action_items')
      .select('*')
      .eq('parent_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get recent activity for all children from activity_log
    const childIdArray = Array.from(childIds);
    let recentActivity: any[] = [];

    if (childIdArray.length > 0) {
      const { data: activities } = await supabaseAdmin
        .from('activity_log')
        .select('*')
        .in('user_id', childIdArray)
        .order('created_at', { ascending: false })
        .limit(30);

      recentActivity = (activities || []).map(a => {
        const child = children.find(c => c.id === a.user_id);
        return {
          id: a.id,
          childId: a.user_id,
          childName: child?.name || 'Student',
          type: a.type,
          title: a.title,
          description: a.description || '',
          timestamp: a.created_at,
          metadata: a.metadata
        };
      });

      // If no activities in the log, generate some based on progress
      if (recentActivity.length === 0) {
        for (const child of children) {
          if (child.questionsCompleted > 0) {
            recentActivity.push({
              id: `progress-${child.id}`,
              childId: child.id,
              childName: child.name,
              type: 'question_answered',
              title: `${child.name.split(' ')[0]} made progress in ${child.currentChapter}`,
              description: `${child.questionsCompleted} questions completed so far`,
              timestamp: child.lastActive
            });
          }
        }
      }
    }

    // Get family members (co-parents)
    const { data: coparents } = await supabaseAdmin
      .from('coparent_invites')
      .select('*')
      .eq('inviter_id', user.id);

    const familyMembers = [
      // Current user
      {
        id: user.id,
        name: parentName,
        email: parentProfile.email,
        relationship: 'self',
        role: 'admin' as const,
        status: 'active' as const
      },
      // Invited co-parents
      ...(coparents || []).map(cp => ({
        id: cp.id,
        name: cp.invitee_name || 'Pending',
        email: cp.invitee_email,
        relationship: cp.relationship || 'parent',
        role: 'viewer' as const,
        status: (cp.status === 'accepted' ? 'active' : 'pending') as 'active' | 'pending'
      }))
    ];

    return NextResponse.json({
      parent: {
        id: user.id,
        name: parentName,
        email: parentProfile.email
      },
      children,
      actionItems: (actionItems || []).map(a => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description || '',
        priority: a.priority,
        createdAt: a.created_at
      })),
      recentActivity,
      familyMembers
    });
  } catch (error) {
    console.error('Error loading parent dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
