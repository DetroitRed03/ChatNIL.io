import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/matches/convert-to-deal
 * Create a NIL deal from an existing match
 *
 * Body:
 * - match_id: string (required)
 * - deal_title: string (required)
 * - deal_type: string (required)
 * - description: string
 * - compensation_amount: number
 * - start_date: string (required)
 * - end_date: string
 * - deliverables: array
 * - brand_name: string
 *
 * Only the agency_id owner can convert
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
    const { match_id, deal_title, deal_type, description, compensation_amount, start_date, end_date, deliverables, brand_name } = body;

    // Validate required fields
    if (!match_id || !deal_title || !deal_type || !start_date) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['match_id', 'deal_title', 'deal_type', 'start_date']
        },
        { status: 400 }
      );
    }

    // Validate deal_type enum
    const validDealTypes = [
      'sponsorship', 'endorsement', 'appearance', 'content_creation',
      'social_media', 'merchandise', 'licensing', 'event', 'other'
    ];
    if (!validDealTypes.includes(deal_type)) {
      return NextResponse.json(
        { error: `Invalid deal_type. Must be one of: ${validDealTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const serviceClient = createServiceRoleClient();

    // Get the match and verify the user is the agency
    const { data: match, error: fetchError } = await serviceClient
      .from('agency_athlete_matches')
      .select('*')
      .eq('id', match_id)
      .single();

    if (fetchError || !match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Verify the current user is the agency
    if (match.agency_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the agency can convert a match to a deal' },
        { status: 403 }
      );
    }

    // Check if match already has a deal
    if (match.deal_id) {
      return NextResponse.json(
        { error: 'This match already has an associated deal' },
        { status: 400 }
      );
    }

    // Check if match status allows conversion
    if (match.status === 'rejected' || match.status === 'expired') {
      return NextResponse.json(
        { error: `Cannot convert a match with status: ${match.status}` },
        { status: 400 }
      );
    }

    // Create the deal
    const dealData = {
      athlete_id: match.athlete_id,
      agency_id: match.agency_id,
      deal_title,
      deal_type,
      brand_name: brand_name || null,
      description: description || null,
      compensation_amount: compensation_amount || null,
      start_date,
      end_date: end_date || null,
      status: 'draft',
      deliverables: deliverables || [],
      is_public: false
    };

    const { data: deal, error: dealError } = await serviceClient
      .from('nil_deals')
      .insert(dealData)
      .select(`
        *,
        athlete:users!nil_deals_athlete_id_fkey(id, first_name, last_name, email),
        agency:users!nil_deals_agency_id_fkey(id, first_name, last_name, email, company_name)
      `)
      .single();

    if (dealError) {
      console.error('Error creating deal:', dealError);
      return NextResponse.json(
        { error: dealError.message },
        { status: 500 }
      );
    }

    // Update the match with deal reference
    const { data: updatedMatch, error: updateError } = await serviceClient
      .from('agency_athlete_matches')
      .update({
        deal_id: deal.id,
        deal_created_at: new Date().toISOString(),
        status: 'partnered'
      })
      .eq('id', match_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating match:', updateError);
      // Don't fail - deal was created successfully
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
      match: updatedMatch,
      message: 'Deal created successfully from match'
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/matches/convert-to-deal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
