/**
 * GET /api/demo/matchmaking/campaigns
 * Fetch all campaigns for selector dropdown
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Fetch all campaigns
    const { data: campaigns, error } = await supabase
      .from('agency_campaigns')
      .select(`
        id,
        campaign_name,
        brand_name,
        total_budget,
        target_sports,
        status
      `)
      .in('status', ['active', 'draft'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns', details: error.message },
        { status: 500 }
      );
    }

    // Transform data to match response interface
    const transformedCampaigns = campaigns.map((campaign: any) => ({
      id: campaign.id,
      name: campaign.campaign_name,
      brand: campaign.brand_name,
      budget: campaign.total_budget || 0,
      targetSports: campaign.target_sports || [],
      status: campaign.status
    }));

    return NextResponse.json({
      campaigns: transformedCampaigns,
      total: transformedCampaigns.length
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/demo/matchmaking/campaigns:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
