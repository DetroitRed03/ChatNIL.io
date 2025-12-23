import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Campaign Detail and Update API
 *
 * PATCH /api/agency/campaigns/[id]
 * Updates an existing campaign
 *
 * Body (all optional):
 * - name: string
 * - description: string
 * - campaign_type: 'social_media' | 'endorsement' | 'event' | 'product_launch'
 * - status: 'pending' | 'active' | 'completed'
 * - start_date: string (ISO date)
 * - end_date: string (ISO date)
 * - total_budget: number
 * - target_sports: string[]
 *
 * DELETE /api/agency/campaigns/[id]
 * Deletes a campaign
 */

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient();
    const body = await request.json();
    const campaignId = params.id;

    // Validate dates if both are provided
    if (body.start_date && body.end_date) {
      const startDate = new Date(body.start_date);
      const endDate = new Date(body.end_date);
      if (endDate < startDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Prepare update data (only include provided fields)
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.campaign_type !== undefined) updateData.campaign_type = body.campaign_type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.end_date !== undefined) updateData.end_date = body.end_date;
    if (body.total_budget !== undefined) updateData.total_budget = body.total_budget;
    if (body.target_sports !== undefined) updateData.target_sports = body.target_sports;

    // Update campaign in database (using agency_campaigns table)
    const { data: campaign, error: updateError } = await supabase
      .from('agency_campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating campaign:', updateError);
      throw updateError;
    }

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Return the updated campaign
    return NextResponse.json({
      success: true,
      campaign,
    });

  } catch (error) {
    console.error('Campaign Update API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient();
    const campaignId = params.id;

    // Delete campaign from database (using agency_campaigns table)
    const { error: deleteError } = await supabase
      .from('agency_campaigns')
      .delete()
      .eq('id', campaignId);

    if (deleteError) {
      console.error('Error deleting campaign:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });

  } catch (error) {
    console.error('Campaign Delete API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
