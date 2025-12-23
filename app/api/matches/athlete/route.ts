import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Helper to get authenticated user ID with multiple fallbacks
 */
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // Method 1: Try cookie-based auth (SSR client)
  try {
    const authClient = await createClient();
    const { data: { user }, error } = await authClient.auth.getUser();
    if (user && !error) {
      return user.id;
    }
  } catch (e) {
    console.log('Cookie auth failed, trying fallback...');
  }

  // Method 2: Check for X-User-ID header (sent by frontend)
  const userIdHeader = request.headers.get('X-User-ID');
  if (userIdHeader) {
    return userIdHeader;
  }

  // Method 3: Check for Authorization header with Bearer token
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const serviceClient = createServiceRoleClient();
    const { data: { user } } = await serviceClient.auth.getUser(token);
    if (user) {
      return user.id;
    }
  }

  return null;
}

/**
 * GET /api/matches/athlete
 * Get matches/opportunities for the current athlete
 * Uses the athlete_opportunities view for optimized querying
 *
 * Query params:
 * - status: Filter by match status (pending, contacted, interested, etc.)
 * - limit: Number of results (default: 20)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user with fallbacks
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const serviceClient = createServiceRoleClient();

    // Try to use the athlete_opportunities view first
    let query = serviceClient
      .from('athlete_opportunities')
      .select('*')
      .eq('athlete_id', userId)
      .order('match_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    let { data: opportunities, error: viewError } = await query;

    // If view doesn't exist or fails, fallback to direct query
    if (viewError) {
      console.log('Fallback to direct query:', viewError.message);

      // First, get matches without the join (to avoid schema cache issues)
      let fallbackQuery = serviceClient
        .from('agency_athlete_matches')
        .select('*')
        .eq('athlete_id', userId)
        .not('status', 'in', '(rejected,expired)')
        .order('match_score', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        fallbackQuery = fallbackQuery.eq('status', status);
      }

      const { data: fallbackData, error: fallbackError } = await fallbackQuery;

      if (fallbackError) {
        console.error('Error fetching athlete matches:', fallbackError);
        return NextResponse.json(
          { error: fallbackError.message },
          { status: 500 }
        );
      }

      // Get unique agency IDs and fetch agency info separately
      const agencyIds = [...new Set((fallbackData || []).map((m: any) => m.agency_id))];
      let agencyMap: Record<string, any> = {};

      if (agencyIds.length > 0) {
        const { data: agencies } = await serviceClient
          .from('users')
          .select('id, first_name, last_name, email, company_name')
          .in('id', agencyIds);

        if (agencies) {
          agencyMap = agencies.reduce((acc: Record<string, any>, agency: any) => {
            acc[agency.id] = agency;
            return acc;
          }, {});
        }
      }

      // Format fallback data to match view structure
      opportunities = (fallbackData || []).map((match: any) => {
        const agency = agencyMap[match.agency_id];
        return {
          id: match.id,
          agency_id: match.agency_id,
          athlete_id: match.athlete_id,
          match_score: match.match_score,
          match_tier: match.match_tier,
          match_reasons: match.match_reasons,
          score_breakdown: match.score_breakdown,
          status: match.status,
          contacted_at: match.contacted_at,
          created_at: match.created_at,
          deal_id: match.deal_id,
          athlete_response_status: match.athlete_response_status,
          athlete_response_at: match.athlete_response_at,
          agency_first_name: agency?.first_name,
          agency_last_name: agency?.last_name,
          agency_name: agency?.company_name || `${agency?.first_name || ''} ${agency?.last_name || ''}`.trim() || 'Unknown Agency',
          agency_email: agency?.email,
          opportunity_status: ['rejected', 'expired'].includes(match.status) ? 'inactive' : 'active'
        };
      });
    }

    // Calculate stats
    const stats = {
      total: opportunities?.length || 0,
      pending: opportunities?.filter((o: any) => o.status === 'pending').length || 0,
      contacted: opportunities?.filter((o: any) => o.status === 'contacted').length || 0,
      interested: opportunities?.filter((o: any) => o.status === 'interested').length || 0,
      partnered: opportunities?.filter((o: any) => o.status === 'partnered').length || 0
    };

    return NextResponse.json({
      success: true,
      opportunities: opportunities || [],
      stats,
      pagination: {
        limit,
        offset,
        hasMore: (opportunities?.length || 0) === limit
      }
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/matches/athlete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
