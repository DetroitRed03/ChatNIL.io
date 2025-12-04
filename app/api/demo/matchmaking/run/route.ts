/**
 * POST /api/demo/matchmaking/run
 * Execute matchmaking for a campaign
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findCampaignMatches } from '@/lib/campaign-matchmaking';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { campaign_id, campaignId, filters } = body;

    // Accept both campaign_id (snake_case) and campaignId (camelCase)
    const finalCampaignId = campaign_id || campaignId;

    if (!finalCampaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

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

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('agency_campaigns')
      .select('*')
      .eq('id', finalCampaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found', details: campaignError?.message },
        { status: 404 }
      );
    }

    // Run matchmaking with optional filters
    const matchOptions = {
      minMatchScore: filters?.minMatchScore || 50,
      maxResults: filters?.maxResults || 50,
      includeBreakdown: true
    };

    const rawMatches = await findCampaignMatches(finalCampaignId, matchOptions);

    // Transform matches to snake_case for frontend compatibility
    const matches = rawMatches.map((match: any) => ({
      athlete_id: match.athleteId,
      athlete_name: match.athleteName,
      sport: match.athleteProfile.sport,
      fmv_score: match.athleteProfile.fmv_score || 0,
      fmv_tier: match.athleteProfile.fmv_tier || 'developing',
      match_score: match.matchPercentage,
      confidence_level: match.confidence,
      recommended_offer_low: Math.floor(match.recommendedOffer * 0.9),
      recommended_offer_high: Math.floor(match.recommendedOffer * 1.1),
      avatar_url: match.athleteProfile.avatar_url,
      state: match.athleteProfile.state,
      // Keep original data for filters
      _original: match
    }));

    // Apply additional filters if provided
    let filteredMatches = matches;

    if (filters?.sportFilter && filters.sportFilter.length > 0) {
      filteredMatches = filteredMatches.filter((match: any) =>
        filters.sportFilter.includes(match.sport)
      );
    }

    if (filters?.stateFilter && filters.stateFilter.length > 0) {
      filteredMatches = filteredMatches.filter((match: any) =>
        filters.stateFilter.includes(match.state)
      );
    }

    // Calculate summary statistics
    const totalMatches = filteredMatches.length;
    const avgMatchScore = totalMatches > 0
      ? filteredMatches.reduce((sum: number, m: any) => sum + m.matchPercentage, 0) / totalMatches
      : 0;

    const confidenceBreakdown = {
      high: filteredMatches.filter((m: any) => m.confidence === 'high').length,
      medium: filteredMatches.filter((m: any) => m.confidence === 'medium').length,
      low: filteredMatches.filter((m: any) => m.confidence === 'low').length
    };

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.campaign_name,
        brand: campaign.brand_name,
        budget: campaign.total_budget,
        budgetPerAthlete: campaign.budget_per_athlete,
        targetSports: campaign.target_sports || [],
        targetStates: campaign.target_states || [],
        status: campaign.status
      },
      matches: filteredMatches,
      summary: {
        totalMatches,
        avgMatchScore: Math.round(avgMatchScore),
        confidenceBreakdown
      }
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/demo/matchmaking/run:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
