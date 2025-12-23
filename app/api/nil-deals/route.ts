import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
  validateUUID,
  validateString,
  validateEnum,
  validateDate,
  validateCompensation,
  validateArray,
  validateAll,
  DEAL_TYPES,
  DEAL_STATUSES,
  MAX_LENGTHS
} from '@/lib/validation';

export const dynamic = 'force-dynamic';

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

    // Comprehensive input validation
    const athleteIdValidation = validateUUID(body.athlete_id, 'athlete_id');
    const dealTitleValidation = validateString(body.deal_title, 'deal_title', {
      required: true,
      minLength: 3,
      maxLength: MAX_LENGTHS.title
    });
    const dealTypeValidation = validateEnum(body.deal_type, 'deal_type', DEAL_TYPES, { required: true });
    const startDateValidation = validateDate(body.start_date, 'start_date', { required: true });
    const endDateValidation = validateDate(body.end_date, 'end_date', {
      required: false,
      minDate: body.start_date ? new Date(body.start_date) : undefined
    });
    const descriptionValidation = validateString(body.description, 'description', {
      maxLength: MAX_LENGTHS.description
    });
    const brandNameValidation = validateString(body.brand_name, 'brand_name', {
      maxLength: MAX_LENGTHS.name
    });
    const compensationValidation = validateCompensation(body.compensation_amount, 'compensation_amount');
    const statusValidation = body.status
      ? validateEnum(body.status, 'status', DEAL_STATUSES)
      : { valid: true, sanitized: 'draft' };

    // Collect all validation errors
    const validation = validateAll([
      { result: athleteIdValidation, field: 'athlete_id' },
      { result: dealTitleValidation, field: 'deal_title' },
      { result: dealTypeValidation, field: 'deal_type' },
      { result: startDateValidation, field: 'start_date' },
      { result: endDateValidation, field: 'end_date' },
      { result: descriptionValidation, field: 'description' },
      { result: brandNameValidation, field: 'brand_name' },
      { result: compensationValidation, field: 'compensation_amount' },
      { result: statusValidation, field: 'status' }
    ]);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Validate deliverables array if provided
    if (body.deliverables && !Array.isArray(body.deliverables)) {
      return NextResponse.json(
        { error: 'deliverables must be an array' },
        { status: 400 }
      );
    }

    // Limit deliverables array size
    if (body.deliverables && body.deliverables.length > 50) {
      return NextResponse.json(
        { error: 'deliverables cannot exceed 50 items' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceRoleClient();

    // Prepare deal data using sanitized values - agency_id is current user
    const dealData = {
      athlete_id: athleteIdValidation.sanitized as string,
      agency_id: user.id,
      deal_title: dealTitleValidation.sanitized as string,
      deal_type: dealTypeValidation.sanitized as string,
      brand_name: brandNameValidation.sanitized || null,
      description: descriptionValidation.sanitized || null,
      compensation_amount: compensationValidation.sanitized || null,
      start_date: startDateValidation.sanitized as string,
      end_date: endDateValidation.sanitized || null,
      status: statusValidation.sanitized || 'draft',
      deliverables: body.deliverables || [],
      is_public: body.is_public === true // Explicit boolean check
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
