import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/nil-deals/[id]
 * Get a single NIL deal by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: deal, error } = await supabase
      .from('nil_deals')
      .select(`
        *,
        athlete:users!nil_deals_athlete_id_fkey(
          id,
          first_name,
          last_name,
          email,
          school_name,
          primary_sport,
          graduation_year,
          social_media_stats,
          hobbies
        ),
        agency:users!nil_deals_agency_id_fkey(
          id,
          company_name,
          email,
          website_url,
          industry
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching deal:', error);
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deal
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/nil-deals/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/nil-deals/[id]
 * Update a NIL deal
 *
 * Body: Partial deal object with fields to update
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Remove fields that shouldn't be directly updated
    const {
      id,
      created_at,
      created_by,
      athlete,
      agency,
      ...updates
    } = body;

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    // Update deal
    const { data: deal, error } = await supabase
      .from('nil_deals')
      .update(updates)
      .eq('id', params.id)
      .select(`
        *,
        athlete:users!nil_deals_athlete_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        agency:users!nil_deals_agency_id_fkey(
          id,
          company_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error updating deal:', error);
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deal,
      message: 'Deal updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/nil-deals/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/nil-deals/[id]
 * Delete a NIL deal
 *
 * Note: Consider using soft delete by setting status to 'cancelled' instead
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if deal exists and user has permission
    const { data: existingDeal, error: fetchError } = await supabase
      .from('nil_deals')
      .select('id, athlete_id, agency_id, status')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingDeal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Soft delete: set status to cancelled instead of hard delete
    const { error: updateError } = await supabase
      .from('nil_deals')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id);

    if (updateError) {
      console.error('Error cancelling deal:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Deal cancelled successfully'
    });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/nil-deals/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
