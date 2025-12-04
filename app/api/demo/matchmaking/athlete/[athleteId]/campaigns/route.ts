/**
 * GET /api/demo/matchmaking/athlete/[athleteId]/campaigns
 * Reverse matchmaking - find campaigns for an athlete
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findCampaignMatches } from '@/lib/campaign-matchmaking';

export async function GET(
  request: Request,
  { params }: { params: { athleteId: string } }
) {
  try {
    const athleteId = params.athleteId;

    if (!athleteId) {
      return NextResponse.json(
        { error: 'Athlete ID is required' },
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

    // Fetch athlete data
    const { data: athlete, error: athleteError } = await supabase
      .from('users')
      .select('*')
      .eq('id', athleteId)
      .single();

    if (athleteError || !athlete) {
      return NextResponse.json(
        { error: 'Athlete not found', details: athleteError?.message },
        { status: 404 }
      );
    }

    // Fetch all active campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('agency_campaigns')
      .select('*')
      .in('status', ['active', 'draft']);

    if (campaignsError) {
      return NextResponse.json(
        { error: 'Failed to fetch campaigns', details: campaignsError.message },
        { status: 500 }
      );
    }

    // Fetch athlete's FMV data for offer calculations
    const { data: fmvData } = await supabase
      .from('athlete_fmv_data')
      .select('fmv_score, fmv_tier, estimated_deal_value_low, estimated_deal_value_high')
      .eq('athlete_id', athleteId)
      .single();

    // Fetch athlete profile for avatar and state
    const { data: athleteProfile } = await supabase
      .from('athlete_public_profiles')
      .select('avatar_url, state')
      .eq('user_id', athleteId)
      .single();

    // Run matchmaking for each campaign and filter for this athlete
    const athleteMatches: any[] = [];

    for (const campaign of campaigns || []) {
      try {
        const matches = await findCampaignMatches(campaign.id, {
          minMatchScore: 50,
          maxResults: 100,
          includeBreakdown: true
        });

        // Find this athlete in the matches
        const athleteMatch = matches.find((m: any) => m.athleteId === athleteId);

        if (athleteMatch) {
          // Transform to match MatchResultsTable component expectations
          // Note: For athlete view, we show campaign info but use "athlete_*" field names for consistency
          athleteMatches.push({
            // Use campaign as "athlete" in the context of what's being displayed
            athlete_id: campaign.id, // Campaign ID (what we're showing)
            athlete_name: campaign.campaign_name, // Campaign name (what we're displaying)
            sport: campaign.target_sports?.[0] || athlete.primary_sport, // Primary target sport
            fmv_score: athleteMatch.matchPercentage, // Match percentage as "score"
            fmv_tier: athleteMatch.confidence, // Confidence level as "tier"
            match_score: athleteMatch.matchPercentage, // 0-100 percentage
            confidence_level: athleteMatch.confidence,

            // Offer range (use FMV data if available, otherwise estimate from recommended)
            recommended_offer_low: fmvData?.estimated_deal_value_low || Math.floor(athleteMatch.recommendedOffer * 0.8),
            recommended_offer_high: fmvData?.estimated_deal_value_high || Math.floor(athleteMatch.recommendedOffer * 1.2),

            // Additional data
            avatar_url: athleteProfile?.avatar_url,
            state: athleteProfile?.state,

            // Match details (transform matchScore object to expected format)
            match_breakdown: {
              brand_values_match: athleteMatch.matchScore.brandValues,
              interests_match: athleteMatch.matchScore.interests,
              campaign_fit: athleteMatch.matchScore.campaignFit,
              budget_alignment: athleteMatch.matchScore.budget,
              geography_match: athleteMatch.matchScore.geography,
              demographics_match: athleteMatch.matchScore.demographics,
              engagement_potential: athleteMatch.matchScore.engagement
            },
            strengths: athleteMatch.strengths,
            concerns: athleteMatch.concerns,
            offer_justification: `Match score: ${athleteMatch.matchPercentage}% | Budget: $${(campaign.budget_per_athlete / 100).toLocaleString()}`
          });
        }
      } catch (error) {
        console.error(`Error matching campaign ${campaign.id}:`, error);
        // Continue with other campaigns
      }
    }

    // Sort by match percentage (descending)
    athleteMatches.sort((a, b) => b.match_score - a.match_score);

    return NextResponse.json({
      athlete: {
        id: athlete.id,
        name: `${athlete.first_name} ${athlete.last_name}`,
        sport: athlete.primary_sport,
        school: athlete.school_name
      },
      matches: athleteMatches,
      total: athleteMatches.length
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/demo/matchmaking/athlete/[athleteId]/campaigns:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
