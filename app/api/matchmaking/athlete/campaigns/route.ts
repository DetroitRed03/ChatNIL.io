/**
 * GET /api/matchmaking/athlete/campaigns
 * Find matching campaigns for the authenticated athlete
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { findCampaignMatches } from '@/lib/campaign-matchmaking';
import { isAthleteRole } from '@/types/common';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get userId from query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const minMatchScore = parseInt(searchParams.get('minScore') || '50', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!userId || !supabaseAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is an athlete
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role, first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError || !userData || !isAthleteRole(userData.role)) {
      return NextResponse.json(
        { error: 'Only athletes can access campaign matches' },
        { status: 403 }
      );
    }

    // Fetch all active campaigns
    const { data: campaigns, error: campaignsError } = await supabaseAdmin
      .from('agency_campaigns')
      .select('id, name, description, status, budget, agency_id')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({
        athlete: {
          id: userId,
          name: `${userData.first_name} ${userData.last_name}`
        },
        campaigns: [],
        total: 0,
        pagination: {
          total: 0,
          limit,
          offset,
          hasMore: false
        }
      });
    }

    // Run matchmaking for each campaign and collect results
    const allMatches: any[] = [];

    for (const campaign of campaigns) {
      try {
        const matches = await findCampaignMatches(campaign.id, {
          minMatchScore: 50,
          maxResults: 100,
          includeBreakdown: true
        });

        // Find this athlete in the matches
        const athleteMatch = matches.find(m => m.athleteId === userId);

        if (athleteMatch) {
          // Fetch agency name for this campaign
          const { data: agencyUser } = await supabaseAdmin
            .from('users')
            .select('first_name, last_name')
            .eq('id', campaign.agency_id)
            .single();

          const brandName = `${agencyUser?.first_name || ''} ${agencyUser?.last_name || ''}`.trim() || 'Brand';

          // Transform to campaign-centric view for athlete
          allMatches.push({
            campaign_id: campaign.id,
            agency_id: campaign.agency_id, // Include agency_id for express interest
            campaign_name: campaign.name,
            brand_name: brandName,
            match_score: athleteMatch.matchPercentage,
            confidence_level: athleteMatch.confidence,
            recommended_offer_low: Math.floor(athleteMatch.recommendedOffer * 0.9),
            recommended_offer_high: Math.floor(athleteMatch.recommendedOffer * 1.1),
            strengths: athleteMatch.strengths,
            concerns: athleteMatch.concerns,
            match_breakdown: {
              brand_values: athleteMatch.matchScore.brandValues,
              interests: athleteMatch.matchScore.interests,
              campaign_fit: athleteMatch.matchScore.campaignFit,
              budget: athleteMatch.matchScore.budget,
              geography: athleteMatch.matchScore.geography,
              demographics: athleteMatch.matchScore.demographics,
              engagement: athleteMatch.matchScore.engagement
            }
          });
        }
      } catch (error) {
        console.error(`Error matching campaign ${campaign.id}:`, error);
        // Continue with other campaigns
      }
    }

    // Sort by match score descending
    allMatches.sort((a, b) => b.match_score - a.match_score);

    // Filter by minimum match score
    const filteredMatches = allMatches.filter(m => m.match_score >= minMatchScore);

    // Apply pagination
    const paginatedMatches = filteredMatches.slice(offset, offset + limit);

    return NextResponse.json({
      athlete: {
        id: userId,
        name: `${userData.first_name} ${userData.last_name}`
      },
      campaigns: paginatedMatches,
      total: filteredMatches.length,
      summary: {
        highConfidence: filteredMatches.filter(m => m.confidence_level === 'high').length,
        mediumConfidence: filteredMatches.filter(m => m.confidence_level === 'medium').length,
        lowConfidence: filteredMatches.filter(m => m.confidence_level === 'low').length,
        avgMatchScore: filteredMatches.length > 0
          ? Math.round(filteredMatches.reduce((sum, m) => sum + m.match_score, 0) / filteredMatches.length)
          : 0
      },
      pagination: {
        total: filteredMatches.length,
        limit,
        offset,
        hasMore: filteredMatches.length > offset + limit
      }
    });

  } catch (error: any) {
    console.error('Unexpected error in /api/matchmaking/athlete/campaigns:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
