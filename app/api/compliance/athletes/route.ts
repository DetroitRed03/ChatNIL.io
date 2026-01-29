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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status')?.split(',').filter(Boolean) || [];
    const sport = searchParams.get('sport') || '';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'severity';
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

    // Get officer profile
    const { data: officer } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (officer?.role !== 'compliance_officer') {
      return NextResponse.json({ error: 'Not a compliance officer' }, { status: 403 });
    }

    const institutionId = officer.institution_id;

    // Get all college athletes at the institution
    let athleteQuery = supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('role', 'college_athlete')
      .eq('institution_id', institutionId);

    // Apply sport filter
    if (sport) {
      athleteQuery = athleteQuery.eq('sport', sport);
    }

    // Apply search
    if (search) {
      athleteQuery = athleteQuery.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: athletes } = await athleteQuery;

    // Get all deals for these athletes
    const athleteIds = athletes?.map(a => a.user_id) || [];

    const { data: deals } = await supabaseAdmin
      .from('nil_deals')
      .select(`
        *,
        compliance_scores (*)
      `)
      .in('athlete_id', athleteIds.length > 0 ? athleteIds : ['none']);

    // Process athletes to add compliance info
    let processed = (athletes || []).map(athlete => {
      const athleteDeals = deals?.filter(d => d.athlete_id === athlete.user_id) || [];
      let worstScore: number | null = null;
      let worstStatus: string | null = null;
      let totalEarnings = 0;
      let hasAnyScore = false;

      athleteDeals.forEach(deal => {
        totalEarnings += deal.compensation_amount || 0;
        const score = Array.isArray(deal.compliance_scores) ? deal.compliance_scores[0] : deal.compliance_scores;
        if (score) {
          hasAnyScore = true;
          if (worstScore === null || score.total_score < worstScore) {
            worstScore = score.total_score;
            worstStatus = score.status;
          }
        }
      });

      // Determine final status:
      // - No deals = null (shows "No Deals")
      // - Has deals but no scores = 'pending' (shows pending review badge)
      // - Has deals with scores = use worst status from scores
      let finalStatus: string | null = null;
      if (athleteDeals.length === 0) {
        finalStatus = null; // No deals
      } else if (!hasAnyScore) {
        finalStatus = 'pending'; // Has deals but no compliance scores yet
      } else {
        finalStatus = worstStatus; // Use the worst compliance status
      }

      return {
        id: athlete.id,
        name: athlete.username || athlete.full_name || 'Unknown',
        sport: athlete.sport || 'Unknown',
        dealCount: athleteDeals.length,
        worstScore,
        worstStatus: finalStatus,
        totalEarnings,
        lastDealDate: athleteDeals.length > 0
          ? athleteDeals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null
      };
    });

    // Apply status filter
    if (status.length > 0) {
      processed = processed.filter(a => {
        if (status.includes('none') && a.dealCount === 0) return true;
        if (a.worstStatus && status.includes(a.worstStatus)) return true;
        return false;
      });
    }

    // Sort
    const statusOrder: Record<string, number> = { red: 0, yellow: 1, green: 2 };
    processed.sort((a, b) => {
      switch (sortBy) {
        case 'severity':
          const aOrder = a.worstStatus ? (statusOrder[a.worstStatus] ?? 3) : 3;
          const bOrder = b.worstStatus ? (statusOrder[b.worstStatus] ?? 3) : 3;
          return sortOrder === 'asc' ? aOrder - bOrder : bOrder - aOrder;
        case 'name':
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'deals':
          return sortOrder === 'asc'
            ? a.dealCount - b.dealCount
            : b.dealCount - a.dealCount;
        case 'score':
          const aScore = a.worstScore ?? 999;
          const bScore = b.worstScore ?? 999;
          return sortOrder === 'asc' ? aScore - bScore : bScore - aScore;
        default:
          return 0;
      }
    });

    // Paginate
    const totalFiltered = processed.length;
    const start = (page - 1) * limit;
    const paginated = processed.slice(start, start + limit);

    return NextResponse.json({
      athletes: paginated,
      pagination: {
        page,
        limit,
        totalItems: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit)
      }
    });
  } catch (error) {
    console.error('Error loading athletes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
