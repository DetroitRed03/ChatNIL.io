import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/matches/[id]
 * Update a match status and track interactions
 *
 * Body:
 * - status: Match status (viewed, contacted, interested, deal_made, rejected)
 * - nil_deal_id: Link to NIL deal (automatically sets status to deal_made)
 * - notes: Agency notes about the match
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
    const updates: any = {};

    // Track status changes with timestamps
    if (body.status) {
      const validStatuses = [
        'suggested', 'saved', 'contacted', 'interested',
        'in_discussion', 'partnered', 'rejected', 'expired'
      ];

      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }

      updates.status = body.status;

      // Set appropriate timestamps based on status
      if (body.status === 'contacted') {
        updates.contacted_at = new Date().toISOString();
        updates.contacted_by = user.id;
      }

      if (body.status === 'interested') {
        updates.athlete_response_at = new Date().toISOString();
        updates.athlete_response_status = 'interested';
      }
    }

    // Link to NIL deal
    if (body.nil_deal_id) {
      updates.deal_id = body.nil_deal_id; // Changed from nil_deal_id to deal_id
      updates.status = 'partnered'; // Changed from 'deal_made' to 'partnered'
      updates.deal_created_at = new Date().toISOString();
    }

    // Update notes
    if (body.notes !== undefined) {
      updates.agency_notes = body.notes;
    }

    // Add updated timestamp
    updates.updated_at = new Date().toISOString();

    // Update match
    const { data: match, error } = await supabase
      .from('agency_athlete_matches')
      .update(updates)
      .eq('id', params.id)
      .select(`
        *,
        athlete:users!agency_athlete_matches_athlete_id_fkey(
          id,
          first_name,
          last_name,
          email,
          primary_sport,
          school_name,
          social_media_stats
        ),
        nil_deal:nil_deals(
          id,
          deal_title,
          deal_type,
          status,
          compensation_amount
        )
      `)
      .single();

    if (error) {
      console.error('Error updating match:', error);
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      match,
      message: 'Match updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/matches/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/matches/[id]
 * Get a single match by ID
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

    const { data: match, error } = await supabase
      .from('agency_athlete_matches')
      .select(`
        *,
        athlete:users!agency_athlete_matches_athlete_id_fkey(
          id,
          first_name,
          last_name,
          email,
          phone,
          primary_sport,
          school_name,
          graduation_year,
          position,
          bio,
          hobbies,
          lifestyle_interests,
          content_creation_interests,
          social_media_stats,
          social_media_handles,
          content_samples,
          achievements,
          brand_affinity,
          nil_preferences,
          profile_image_url
        ),
        nil_deal:nil_deals(
          id,
          deal_title,
          deal_type,
          status,
          description,
          compensation_amount,
          start_date,
          end_date,
          deliverables
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching match:', error);
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      match
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/matches/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
