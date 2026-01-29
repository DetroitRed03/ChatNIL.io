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

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const { searchParams } = new URL(request.url);

    // Parse query params
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const decision = searchParams.get('decision'); // approved, rejected, etc.
    const athleteStatus = searchParams.get('athleteStatus'); // viewed, not_viewed, appealed
    const sport = searchParams.get('sport');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

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

    // Verify compliance officer role
    const { data: officer } = await supabaseAdmin
      .from('athlete_profiles')
      .select('id, institution_id, role')
      .eq('user_id', user.id)
      .single();

    if (officer?.role !== 'compliance_officer') {
      return NextResponse.json({ error: 'Not a compliance officer' }, { status: 403 });
    }

    // Build query
    let query = supabaseAdmin
      .from('nil_deals')
      .select(`
        id,
        athlete_id,
        third_party_name,
        brand_name,
        deal_title,
        compensation_amount,
        deal_type,
        status,
        compliance_decision,
        compliance_decision_at,
        compliance_decision_by,
        athlete_notes,
        athlete_notified_at,
        athlete_viewed_decision_at,
        has_active_appeal,
        appeal_count,
        compliance_scores (
          total_score,
          status
        )
      `, { count: 'exact' })
      .not('compliance_decision', 'is', null); // Only deals with decisions

    // Filter by institution
    if (officer.institution_id) {
      // Get athletes at this institution
      const { data: athletes } = await supabaseAdmin
        .from('athlete_profiles')
        .select('user_id')
        .eq('institution_id', officer.institution_id);

      const athleteIds = athletes?.map(a => a.user_id) || [];
      if (athleteIds.length > 0) {
        query = query.in('athlete_id', athleteIds);
      }
    }

    // Apply filters
    if (decision) {
      query = query.eq('compliance_decision', decision);
    }

    if (athleteStatus === 'viewed') {
      query = query.not('athlete_viewed_decision_at', 'is', null);
    } else if (athleteStatus === 'not_viewed') {
      query = query.is('athlete_viewed_decision_at', null);
    } else if (athleteStatus === 'appealed') {
      query = query.eq('has_active_appeal', true);
    }

    // Apply sorting
    const sortColumn = sortBy === 'date' ? 'compliance_decision_at' :
                       sortBy === 'amount' ? 'compensation_amount' :
                       'compliance_decision_at';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: deals, count, error: dealsError } = await query;

    if (dealsError) {
      console.error('Error fetching decision history:', dealsError);
      return NextResponse.json({ error: 'Failed to load decision history' }, { status: 500 });
    }

    // Get athlete info for the deals
    const athleteIds = Array.from(new Set(deals?.map(d => d.athlete_id) || []));
    const { data: athletes } = await supabaseAdmin
      .from('athlete_profiles')
      .select('user_id, username, sport')
      .in('user_id', athleteIds);

    const athleteMap = new Map(athletes?.map(a => [a.user_id, a]) || []);

    // Get decision maker names
    const decisionByIds = Array.from(new Set(deals?.filter(d => d.compliance_decision_by).map(d => d.compliance_decision_by) || []));
    const { data: deciders } = await supabaseAdmin
      .from('athlete_profiles')
      .select('user_id, username')
      .in('user_id', decisionByIds);

    const deciderMap = new Map(deciders?.map(d => [d.user_id, d]) || []);

    // Format response
    const decisions = deals?.map(deal => {
      const athlete = athleteMap.get(deal.athlete_id);
      const decider = deal.compliance_decision_by ? deciderMap.get(deal.compliance_decision_by) : null;
      const score = Array.isArray(deal.compliance_scores) ? deal.compliance_scores[0] : deal.compliance_scores;

      return {
        id: deal.id,
        dealId: deal.id,
        dealTitle: deal.third_party_name || deal.brand_name || deal.deal_title,
        athleteId: deal.athlete_id,
        athleteName: athlete?.username || 'Unknown',
        sport: athlete?.sport || 'Unknown',
        amount: deal.compensation_amount,
        decision: deal.compliance_decision,
        decisionAt: deal.compliance_decision_at,
        decisionBy: deal.compliance_decision_by,
        decisionByName: decider?.username || 'Unknown',
        complianceScore: score?.total_score || null,
        complianceStatus: score?.status || null,
        athleteNotes: deal.athlete_notes,
        athleteViewedAt: deal.athlete_viewed_decision_at,
        hasActiveAppeal: deal.has_active_appeal,
        appealCount: deal.appeal_count,
      };
    }) || [];

    return NextResponse.json({
      decisions,
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('Error in decision history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
