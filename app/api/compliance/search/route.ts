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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
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

    const results: Array<{
      id: string;
      type: 'athlete' | 'deal' | 'action' | 'report';
      title: string;
      subtitle?: string;
      status?: 'green' | 'yellow' | 'red';
    }> = [];

    // Handle special query syntax
    const lowerQuery = query.toLowerCase();

    // Special filters
    if (lowerQuery.startsWith('severity:')) {
      const severity = lowerQuery.replace('severity:', '').trim();
      // Return instruction to filter by severity
      results.push({
        id: `filter-severity-${severity}`,
        type: 'action',
        title: `Filter by ${severity} severity`,
        subtitle: `Show all ${severity} items`
      });
    } else if (lowerQuery.startsWith('assignee:')) {
      const assignee = lowerQuery.replace('assignee:', '').trim();
      results.push({
        id: `filter-assignee-${assignee}`,
        type: 'action',
        title: `Filter by assignee: ${assignee}`,
        subtitle: assignee === 'none' ? 'Show unassigned items' : `Show items assigned to ${assignee}`
      });
    } else if (lowerQuery.startsWith('due:')) {
      const due = lowerQuery.replace('due:', '').trim();
      results.push({
        id: `filter-due-${due}`,
        type: 'action',
        title: `Filter by due date: ${due}`,
        subtitle: due === 'overdue' ? 'Show overdue items' : `Show items due ${due}`
      });
    } else {
      // Search athletes
      const { data: athletes } = await supabaseAdmin
        .from('athlete_profiles')
        .select('id, user_id, username, sport')
        .eq('institution_id', institutionId)
        .eq('role', 'college_athlete')
        .ilike('username', `%${query}%`)
        .limit(limit);

      // Get compliance status for athletes
      const athleteUserIds = athletes?.map(a => a.user_id) || [];
      let athleteStatuses: Record<string, string> = {};

      if (athleteUserIds.length > 0) {
        const { data: deals } = await supabaseAdmin
          .from('nil_deals')
          .select('athlete_id')
          .in('athlete_id', athleteUserIds);

        const dealIds = deals?.map(d => (d as any).id) || [];

        if (dealIds.length > 0) {
          const { data: scores } = await supabaseAdmin
            .from('compliance_scores')
            .select('deal_id, status')
            .in('deal_id', dealIds);

          // Calculate worst status per athlete
          const athleteDealMap = new Map<string, string[]>();
          deals?.forEach(d => {
            const existing = athleteDealMap.get(d.athlete_id) || [];
            existing.push((d as any).id);
            athleteDealMap.set(d.athlete_id, existing);
          });

          athleteUserIds.forEach(athleteId => {
            const athleteDealIds = athleteDealMap.get(athleteId) || [];
            const athleteScores = scores?.filter(s => athleteDealIds.includes(s.deal_id)) || [];

            if (athleteScores.some(s => s.status === 'red')) {
              athleteStatuses[athleteId] = 'red';
            } else if (athleteScores.some(s => s.status === 'yellow')) {
              athleteStatuses[athleteId] = 'yellow';
            } else {
              athleteStatuses[athleteId] = 'green';
            }
          });
        }
      }

      athletes?.forEach(athlete => {
        results.push({
          id: athlete.id,
          type: 'athlete',
          title: athlete.username || 'Unknown Athlete',
          subtitle: athlete.sport || 'Unknown Sport',
          status: (athleteStatuses[athlete.user_id] as 'green' | 'yellow' | 'red') || 'green'
        });
      });

      // Search deals
      const { data: deals } = await supabaseAdmin
        .from('nil_deals')
        .select('id, athlete_id, deal_title, third_party_name, compensation_amount')
        .in('athlete_id', athleteUserIds.length > 0 ? athleteUserIds : ['00000000-0000-0000-0000-000000000000'])
        .or(`deal_title.ilike.%${query}%,third_party_name.ilike.%${query}%`)
        .limit(limit);

      // Get compliance scores for deals
      const dealIds = deals?.map(d => d.id) || [];
      const { data: scores } = dealIds.length > 0
        ? await supabaseAdmin
            .from('compliance_scores')
            .select('deal_id, status')
            .in('deal_id', dealIds)
        : { data: [] };

      const scoresMap = new Map(scores?.map(s => [s.deal_id, s.status]) || []);

      deals?.forEach(deal => {
        results.push({
          id: deal.id,
          type: 'deal',
          title: deal.deal_title || deal.third_party_name || 'Untitled Deal',
          subtitle: `$${parseFloat(deal.compensation_amount || '0').toLocaleString()}`,
          status: (scoresMap.get(deal.id) as 'green' | 'yellow' | 'red') || undefined
        });
      });
    }

    return NextResponse.json({ results: results.slice(0, limit) });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
