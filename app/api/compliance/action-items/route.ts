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

interface FilterConfig {
  severity?: ('critical' | 'warning')[];
  sport?: string[];
  status?: string[];
  assignee?: string | null;
  dateRange?: { from: string; to: string } | null;
  sortBy?: 'severity' | 'date' | 'amount' | 'athlete';
  sortOrder?: 'asc' | 'desc';
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const { searchParams } = new URL(request.url);

    // Pagination params
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const offset = (page - 1) * pageSize;

    // Filter params
    const filters: FilterConfig = {
      severity: searchParams.get('severity')?.split(',').filter(Boolean) as ('critical' | 'warning')[] || undefined,
      sport: searchParams.get('sport')?.split(',').filter(Boolean) || undefined,
      assignee: searchParams.get('assignee') || undefined,
      sortBy: (searchParams.get('sortBy') as FilterConfig['sortBy']) || 'severity',
      sortOrder: (searchParams.get('sortOrder') as FilterConfig['sortOrder']) || 'desc'
    };

    if (searchParams.get('dateFrom') && searchParams.get('dateTo')) {
      filters.dateRange = {
        from: searchParams.get('dateFrom')!,
        to: searchParams.get('dateTo')!
      };
    }

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

    // Get institution for officer
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

    // Build athlete query
    let athleteQuery = supabaseAdmin
      .from('athlete_profiles')
      .select('id, user_id, username, sport')
      .eq('institution_id', institutionId)
      .eq('role', 'college_athlete');

    // Apply sport filter
    if (filters.sport && filters.sport.length > 0) {
      athleteQuery = athleteQuery.in('sport', filters.sport);
    }

    const { data: athletes } = await athleteQuery;

    if (!athletes || athletes.length === 0) {
      return NextResponse.json({
        items: [],
        pagination: { page, pageSize, total: 0, totalPages: 0 }
      });
    }

    const athleteUserIds = athletes.map(a => a.user_id);
    const athleteMap = new Map(athletes.map(a => [a.user_id, a]));

    // Get deals
    let dealsQuery = supabaseAdmin
      .from('nil_deals')
      .select('*')
      .in('athlete_id', athleteUserIds);

    if (filters.dateRange) {
      dealsQuery = dealsQuery
        .gte('created_at', filters.dateRange.from)
        .lte('created_at', filters.dateRange.to);
    }

    const { data: deals } = await dealsQuery;

    if (!deals || deals.length === 0) {
      return NextResponse.json({
        items: [],
        pagination: { page, pageSize, total: 0, totalPages: 0 }
      });
    }

    const dealIds = deals.map(d => d.id);

    // Get compliance scores
    const { data: scores } = await supabaseAdmin
      .from('compliance_scores')
      .select('*')
      .in('deal_id', dealIds);

    const scoresMap = new Map(scores?.map(s => [s.deal_id, s]) || []);

    // Get assignments
    const { data: assignments } = await supabaseAdmin
      .from('compliance_assignments')
      .select('deal_id, assigned_to, status')
      .in('deal_id', dealIds);

    const assignmentsMap = new Map(assignments?.map(a => [a.deal_id, a]) || []);

    // Get team member names
    const assigneeIds = [...new Set(assignments?.map(a => a.assigned_to) || [])];
    const { data: teamProfiles } = assigneeIds.length > 0
      ? await supabaseAdmin
          .from('athlete_profiles')
          .select('user_id, username')
          .in('user_id', assigneeIds)
      : { data: [] };

    const teamNamesMap = new Map(teamProfiles?.map(p => [p.user_id, p.username]) || []);

    // Build action items
    let actionItems = deals
      .filter(deal => {
        const score = scoresMap.get(deal.id);
        const status = score?.status;
        return status === 'yellow' || status === 'red' || status === 'pending' || !status;
      })
      .map(deal => {
        const athlete = athleteMap.get(deal.athlete_id);
        const score = scoresMap.get(deal.id);
        const assignment = assignmentsMap.get(deal.id);

        const severity = score?.status === 'red' ? 'critical' : 'warning';

        return {
          id: deal.id,
          athleteId: athlete?.id || '',
          athleteName: athlete?.username || 'Unknown',
          dealId: deal.id,
          dealTitle: deal.deal_title || deal.third_party_name || 'Untitled Deal',
          severity,
          issue: score?.reason_codes?.[0] || (score?.status === 'red' ? 'Critical compliance issue' : 'Needs review'),
          amount: parseFloat(deal.compensation_amount) || 0,
          action: severity === 'critical' ? 'REVIEW NOW' : 'Review required',
          sport: athlete?.sport || 'Unknown',
          dueDate: deal.created_at,
          assignedTo: assignment?.assigned_to || null,
          assignedToName: assignment?.assigned_to ? teamNamesMap.get(assignment.assigned_to) : null
        };
      });

    // Apply severity filter
    if (filters.severity && filters.severity.length > 0) {
      actionItems = actionItems.filter(item => filters.severity!.includes(item.severity as 'critical' | 'warning'));
    }

    // Apply deadline filter
    const deadlineFilter = searchParams.get('deadline');
    if (deadlineFilter) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfTomorrow = new Date(startOfToday.getTime() + 86400000);
      const startOfDayAfter = new Date(startOfTomorrow.getTime() + 86400000);
      const endOfWeek = new Date(startOfToday.getTime() + 7 * 86400000);
      const endOfNextWeek = new Date(startOfToday.getTime() + 14 * 86400000);

      actionItems = actionItems.filter(item => {
        const created = new Date(item.dueDate);
        const deadline = new Date(created.getTime() + 5 * 86400000);

        switch (deadlineFilter) {
          case 'overdue':
            return deadline < startOfToday;
          case 'today':
            return deadline >= startOfToday && deadline < startOfTomorrow;
          case 'tomorrow':
            return deadline >= startOfTomorrow && deadline < startOfDayAfter;
          case 'thisWeek':
            return deadline >= startOfDayAfter && deadline < endOfWeek;
          case 'nextWeek':
            return deadline >= endOfWeek && deadline < endOfNextWeek;
          default:
            return true;
        }
      });
    }

    // Apply assignee filter
    if (filters.assignee === 'unassigned') {
      actionItems = actionItems.filter(item => !item.assignedTo);
    } else if (filters.assignee) {
      actionItems = actionItems.filter(item => item.assignedTo === filters.assignee);
    }

    // Sort
    actionItems.sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      switch (filters.sortBy) {
        case 'severity':
          const severityOrder = { critical: 0, warning: 1 };
          return (severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder]) * order;
        case 'date':
          return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * order;
        case 'amount':
          return (a.amount - b.amount) * order;
        case 'athlete':
          return a.athleteName.localeCompare(b.athleteName) * order;
        default:
          return 0;
      }
    });

    // Paginate
    const total = actionItems.length;
    const totalPages = Math.ceil(total / pageSize);
    const paginatedItems = actionItems.slice(offset, offset + pageSize);

    return NextResponse.json({
      items: paginatedItems,
      pagination: {
        page,
        pageSize,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching action items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Bulk actions endpoint
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const { action, itemIds, assignTo, notes, priority } = await request.json();

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

    const institutionId = staffRecord?.institution_id;
    if (!institutionId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    switch (action) {
      case 'approve':
        // Update compliance scores to green
        await supabaseAdmin
          .from('compliance_scores')
          .update({
            status: 'green',
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
            review_notes: notes || 'Bulk approved'
          })
          .in('deal_id', itemIds);
        break;

      case 'reject':
        // Update compliance scores to red with rejection
        await supabaseAdmin
          .from('compliance_scores')
          .update({
            status: 'red',
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
            review_notes: notes || 'Bulk rejected'
          })
          .in('deal_id', itemIds);
        break;

      case 'assign':
        // Create or update assignments
        const assignmentData = itemIds.map((dealId: string) => ({
          deal_id: dealId,
          assigned_to: assignTo,
          assigned_by: user.id,
          institution_id: institutionId,
          priority: priority || 'normal',
          notes: notes || null,
          status: 'assigned'
        }));

        await supabaseAdmin
          .from('compliance_assignments')
          .upsert(assignmentData, { onConflict: 'deal_id,assigned_to' });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log activity
    await supabaseAdmin
      .from('compliance_activity_log')
      .insert({
        institution_id: institutionId,
        actor_id: user.id,
        action_type: action === 'approve' ? 'bulk_approve' : action === 'reject' ? 'bulk_reject' : 'assignment_created',
        target_type: 'deal',
        target_ids: itemIds,
        metadata: { count: itemIds.length, notes, assignTo }
      });

    return NextResponse.json({ success: true, count: itemIds.length });
  } catch (error) {
    console.error('Error processing bulk action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
