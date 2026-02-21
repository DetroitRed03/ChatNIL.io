import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// CRITICAL: Must disable Next.js fetch caching to prevent stale reads
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: (url: any, opts: any) => fetch(url, { ...opts, cache: 'no-store' as any }),
    },
  }
);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Auth
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

    // Get institution — check institution_staff first, then athlete_profiles
    const { data: staffRecord } = await supabaseAdmin
      .from('institution_staff')
      .select('institution_id')
      .eq('user_id', user.id)
      .eq('role', 'compliance_officer')
      .single();

    let institutionId = staffRecord?.institution_id;

    if (!institutionId) {
      const { data: officerProfile } = await supabaseAdmin
        .from('athlete_profiles')
        .select('institution_id')
        .eq('user_id', user.id)
        .eq('role', 'compliance_officer')
        .single();
      institutionId = officerProfile?.institution_id;
    }

    if (!institutionId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get team members from BOTH sources to fix dual-table problem
    // Source 1: institution_staff (legacy/primary)
    const { data: staffMembers } = await supabaseAdmin
      .from('institution_staff')
      .select('user_id, title')
      .eq('institution_id', institutionId)
      .eq('role', 'compliance_officer');

    // Source 2: compliance_team_members (invite flow)
    const { data: teamMembers } = await supabaseAdmin
      .from('compliance_team_members')
      .select('user_id, role')
      .eq('institution_id', institutionId)
      .eq('status', 'active');

    // Merge — deduplicate by user_id
    const memberMap = new Map<string, { user_id: string; title?: string; teamRole?: string }>();

    (staffMembers || []).forEach(s => {
      memberMap.set(s.user_id, { user_id: s.user_id, title: s.title });
    });

    (teamMembers || []).forEach(m => {
      if (!memberMap.has(m.user_id)) {
        memberMap.set(m.user_id, { user_id: m.user_id, teamRole: m.role });
      } else {
        const existing = memberMap.get(m.user_id)!;
        existing.teamRole = m.role;
      }
    });

    const allMemberEntries = Array.from(memberMap.values());

    if (allMemberEntries.length === 0) {
      return NextResponse.json({ members: [], totalOpenItems: 0 });
    }

    const teamUserIds = allMemberEntries.map(m => m.user_id);

    // Get profiles for team members
    const { data: profiles } = await supabaseAdmin
      .from('athlete_profiles')
      .select('user_id, username')
      .in('user_id', teamUserIds);

    const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Get user info (names and emails)
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .in('id', teamUserIds);

    const usersMap = new Map(users?.map(u => [u.id, u]) || []);

    // Get assignment counts
    const { data: assignments } = await supabaseAdmin
      .from('compliance_assignments')
      .select('assigned_to, status, completed_at, assigned_at, due_date')
      .eq('institution_id', institutionId);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Aggregate stats by team member
    const memberStats = new Map<string, {
      openItems: number;
      completedThisWeek: number;
      overdueItems: number;
      resolutionTimes: number[];
    }>();

    teamUserIds.forEach(userId => {
      memberStats.set(userId, {
        openItems: 0,
        completedThisWeek: 0,
        overdueItems: 0,
        resolutionTimes: []
      });
    });

    (assignments || []).forEach(assignment => {
      const stats = memberStats.get(assignment.assigned_to);
      if (!stats) return;

      if (assignment.status === 'assigned' || assignment.status === 'in_progress') {
        stats.openItems++;

        if (assignment.due_date && new Date(assignment.due_date) < now) {
          stats.overdueItems++;
        }
      } else if (assignment.status === 'completed' && assignment.completed_at) {
        const completedAt = new Date(assignment.completed_at);
        if (completedAt >= weekAgo) {
          stats.completedThisWeek++;
        }

        if (assignment.assigned_at) {
          const resolutionHours = (completedAt.getTime() - new Date(assignment.assigned_at).getTime()) / (1000 * 60 * 60);
          stats.resolutionTimes.push(resolutionHours);
        }
      }
    });

    // Build response
    let totalOpenItems = 0;
    const members = allMemberEntries.map(entry => {
      const profile = profilesMap.get(entry.user_id);
      const userInfo = usersMap.get(entry.user_id);
      const stats = memberStats.get(entry.user_id)!;

      totalOpenItems += stats.openItems;

      // Build display name: prefer first_name + last_name, then username, then title, then email
      const fullName = userInfo?.first_name && userInfo?.last_name
        ? `${userInfo.first_name} ${userInfo.last_name}`
        : null;
      const displayName = fullName || profile?.username || entry.title || userInfo?.email?.split('@')[0] || 'Team Member';

      return {
        id: entry.user_id,
        name: displayName,
        email: userInfo?.email || '',
        openItems: stats.openItems,
        completedThisWeek: stats.completedThisWeek,
        overdueItems: stats.overdueItems,
        avgResolutionHours: stats.resolutionTimes.length > 0
          ? Math.round(stats.resolutionTimes.reduce((a, b) => a + b, 0) / stats.resolutionTimes.length * 10) / 10
          : undefined
      };
    });

    // Sort by open items (highest first)
    members.sort((a, b) => b.openItems - a.openItems);

    return NextResponse.json({
      members,
      totalOpenItems
    });
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
