/**
 * Campaign Athlete Matching API
 * GET /api/campaigns/[id]/matches
 *
 * Finds and scores athletes that match a campaign's criteria using the matchmaking engine
 */

import { NextRequest, NextResponse } from 'next/server';
import { findCampaignMatches } from '@/lib/campaign-matchmaking';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const campaignId = resolvedParams.id;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const minScore = parseFloat(searchParams.get('minScore') || '0');

    console.log(`Finding matches for campaign: ${campaignId}`);

    // Use the campaign matchmaking engine to find matches
    const matches = await findCampaignMatches(campaignId, {
      minMatchScore: minScore,
      maxResults: limit,
      includeBreakdown: true,
    });

    // Handle empty matches gracefully
    if (!matches || matches.length === 0) {
      return NextResponse.json({
        matches: [],
        total: 0,
        campaign: {
          id: campaignId,
          name: 'Unknown Campaign',
        },
        message: 'No matching athletes found for this campaign criteria',
      });
    }

    // Transform matches to the expected response format
    const scoredMatches = matches.map((match) => ({
      athlete_id: match.athleteId,
      user_id: match.athleteId,
      score: match.matchPercentage,
      score_breakdown: match.matchScore,
      match_reasons: match.strengths,
      concerns: match.concerns,
      confidence: match.confidence,
      recommended_offer: match.recommendedOffer,
      athlete: {
        id: match.athleteId,
        full_name: match.athleteName,
        profile_photo_url: match.athleteProfile?.avatar_url,
        primary_sport: match.athleteProfile?.sport,
        school_name: match.athleteProfile?.school_name,
        total_followers: match.athleteProfile?.total_followers,
        engagement_rate: match.athleteProfile?.avg_engagement_rate,
        fmv_score: match.athleteProfile?.fmv_score,
        fmv_tier: match.athleteProfile?.fmv_tier,
      },
    }));

    return NextResponse.json({
      matches: scoredMatches,
      total: scoredMatches.length,
      campaign: {
        id: campaignId,
        name: matches[0]?.campaignName || 'Unknown Campaign',
      },
    });
  } catch (error) {
    console.error('Error in campaign matching:', error);

    // Handle "Campaign not found" specifically
    if (error instanceof Error && error.message === 'Campaign not found') {
      return NextResponse.json(
        { error: 'Campaign not found', campaignId: (await params).id },
        { status: 404 }
      );
    }

    // Handle "Failed to fetch athletes" specifically
    if (error instanceof Error && error.message === 'Failed to fetch athletes') {
      return NextResponse.json(
        { error: 'Failed to fetch athletes for matching' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
