import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/nil-deals
 * List NIL deals for the authenticated user
 * Uses auth to filter deals where user is athlete or agency
 *
 * Query params:
 * - status: Filter by deal status (pending, active, completed, etc.)
 * - limit: Number of results (default: 20)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Use service role to get deals with joins
    const serviceClient = createServiceRoleClient();

    // Build query with joins to avoid N+1 queries
    // Filter to deals where user is athlete OR agency
    let query = serviceClient
      .from('nil_deals')
      .select(`
        *,
        athlete:users!nil_deals_athlete_id_fkey(id, first_name, last_name, email),
        agency:users!nil_deals_agency_id_fkey(id, first_name, last_name, email, company_name)
      `)
      .or(`athlete_id.eq.${user.id},agency_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: deals, error } = await query;

    if (error) {
      console.error('Error fetching NIL deals:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Format the response
    const formattedDeals = (deals || []).map((deal: any) => ({
      ...deal,
      athlete: deal.athlete ? {
        id: deal.athlete.id,
        first_name: deal.athlete.first_name,
        last_name: deal.athlete.last_name,
        email: deal.athlete.email
      } : null,
      agency: deal.agency ? {
        id: deal.agency.id,
        name: deal.agency.company_name || `${deal.agency.first_name || ''} ${deal.agency.last_name || ''}`.trim(),
        email: deal.agency.email
      } : null
    }));

    return NextResponse.json({
      success: true,
      deals: formattedDeals,
      count: formattedDeals.length,
      pagination: {
        limit,
        offset,
        hasMore: formattedDeals.length === limit
      }
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/nil-deals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nil-deals
 * Create a new NIL deal
 * Agency creates deal - agency_id is set to current user
 *
 * Body:
 * - athlete_id: string (required)
 * - deal_title: string (required)
 * - deal_type: enum (required)
 * - compensation_amount: number
 * - start_date: string (required)
 * - end_date: string
 * - description: string
 * - deliverables: array
 * - match_id: string (optional - links deal to match)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.athlete_id || !body.deal_title || !body.deal_type || !body.start_date) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['athlete_id', 'deal_title', 'deal_type', 'start_date']
        },
        { status: 400 }
      );
    }

    // Validate deal_type enum
    const validDealTypes = [
      'sponsorship', 'endorsement', 'appearance', 'content_creation',
      'social_media', 'merchandise', 'licensing', 'event', 'other'
    ];
    if (!validDealTypes.includes(body.deal_type)) {
      return NextResponse.json(
        { error: `Invalid deal_type. Must be one of: ${validDealTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const serviceClient = createServiceRoleClient();

    // Prepare deal data - agency_id is current user
    const dealData = {
      athlete_id: body.athlete_id,
      agency_id: user.id,
      deal_title: body.deal_title,
      deal_type: body.deal_type,
      brand_name: body.brand_name || null,
      description: body.description || null,
      compensation_amount: body.compensation_amount || null,
      start_date: body.start_date,
      end_date: body.end_date || null,
      status: body.status || 'draft',
      deliverables: body.deliverables || [],
      is_public: body.is_public || false
    };

    // Insert deal
    const { data: deal, error } = await serviceClient
      .from('nil_deals')
      .insert(dealData)
      .select(`
        *,
        athlete:users!nil_deals_athlete_id_fkey(id, first_name, last_name, email),
        agency:users!nil_deals_agency_id_fkey(id, first_name, last_name, email, company_name)
      `)
      .single();

    if (error) {
      console.error('Error creating NIL deal:', error);
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    // If match_id provided, update the match with deal reference
    if (body.match_id) {
      await serviceClient
        .from('agency_athlete_matches')
        .update({
          deal_id: deal.id,
          deal_created_at: new Date().toISOString(),
          status: 'partnered'
        })
        .eq('id', body.match_id)
        .eq('agency_id', user.id);
    }

    return NextResponse.json({
      success: true,
      deal: {
        ...deal,
        athlete: deal.athlete ? {
          id: deal.athlete.id,
          first_name: deal.athlete.first_name,
          last_name: deal.athlete.last_name,
          email: deal.athlete.email
        } : null,
        agency: deal.agency ? {
          id: deal.agency.id,
          name: deal.agency.company_name || `${deal.agency.first_name || ''} ${deal.agency.last_name || ''}`.trim(),
          email: deal.agency.email
        } : null
      },
      message: 'NIL deal created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/nil-deals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
