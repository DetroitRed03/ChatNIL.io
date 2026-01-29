import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
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

    // Get institution
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

    // Get all compliance officers at this institution
    const { data: teamStaff } = await supabaseAdmin
      .from('institution_staff')
      .select('user_id, title')
      .eq('institution_id', institutionId)
      .eq('role', 'compliance_officer');

    if (!teamStaff || teamStaff.length === 0) {
      return NextResponse.json({ members: [], totalOpenItems: 0 });
    }

    const teamUserIds = teamStaff.map(s => s.user_id);

    // Get profiles for team members
    const { data: profiles } = await supabaseAdmin
      .from('athlete_profiles')
      .select('user_id, username')
      .in('user_id', teamUserIds);

    const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Get auth users for emails
    const { data: authUsers } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .in('id', teamUserIds);

    const emailsMap = new Map(authUsers?.map(u => [u.id, u.email]) || []);

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
      avgResolutionHours?: number;
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

        // Check if overdue
        if (assignment.due_date && new Date(assignment.due_date) < now) {
          stats.overdueItems++;
        }
      } else if (assignment.status === 'completed' && assignment.completed_at) {
        const completedAt = new Date(assignment.completed_at);
        if (completedAt >= weekAgo) {
          stats.completedThisWeek++;
        }

        // Calculate resolution time
        if (assignment.assigned_at) {
          const resolutionHours = (completedAt.getTime() - new Date(assignment.assigned_at).getTime()) / (1000 * 60 * 60);
          stats.resolutionTimes.push(resolutionHours);
        }
      }
    });

    // Build response
    let totalOpenItems = 0;
    const members = teamStaff.map(staff => {
      const profile = profilesMap.get(staff.user_id);
      const email = emailsMap.get(staff.user_id);
      const stats = memberStats.get(staff.user_id)!;

      totalOpenItems += stats.openItems;

      return {
        id: staff.user_id,
        name: profile?.username || staff.title || email?.split('@')[0] || 'Team Member',
        email: email || '',
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
