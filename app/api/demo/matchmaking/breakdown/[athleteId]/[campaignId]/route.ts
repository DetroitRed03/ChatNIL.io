/**
 * GET /api/demo/matchmaking/breakdown/[athleteId]/[campaignId]
 * Detailed match breakdown between specific athlete and campaign
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  calculateBrandValuesScore,
  calculateInterestScore,
  calculateCampaignFitScore,
  calculateBudgetScore,
  calculateGeographyScore,
  calculateDemographicsScore,
  calculateEngagementScore,
  calculateRecommendedOffer,
  getMatchConfidence,
  generateMatchInsights,
  type MatchScore
} from '@/lib/campaign-matchmaking';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { athleteId: string; campaignId: string } }
) {
  try {
    const { athleteId, campaignId } = params;

    if (!athleteId || !campaignId) {
      return NextResponse.json(
        { error: 'Athlete ID and Campaign ID are required' },
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

    // Fetch athlete with all related data
    const { data: athlete, error: athleteError } = await supabase
      .from('users')
      .select(`
        *,
        athlete_public_profiles!inner(*),
        athlete_fmv_data!inner(*)
      `)
      .eq('id', athleteId)
      .single();

    if (athleteError || !athlete) {
      return NextResponse.json(
        { error: 'Athlete not found', details: athleteError?.message },
        { status: 404 }
      );
    }

    // Fetch social media stats separately to avoid PostgREST relationship cache issues
    const { data: socialStats } = await supabase
      .from('social_media_stats')
      .select('*')
      .eq('user_id', athleteId);

    // Attach social stats to athlete
    athlete.social_media_stats = socialStats || [];

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('agency_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found', details: campaignError?.message },
        { status: 404 }
      );
    }

    const profile = athlete.athlete_public_profiles[0];
    const fmvData = athlete.athlete_fmv_data[0];
    // socialStats is already defined above from the fetch, no need to redefine

    // Calculate total followers and avg engagement
    const totalFollowers = (socialStats || []).reduce((sum: number, s: any) => sum + (s.followers || 0), 0);
    const avgEngagement = (socialStats || []).length > 0
      ? (socialStats || []).reduce((sum: number, s: any) => sum + (s.engagement_rate || 0), 0) / (socialStats || []).length
      : 0;

    // Calculate all component scores with detailed breakdowns
    const brandValuesResult = calculateBrandValuesScore(
      athlete.brand_affinity || [],
      athlete.causes_care_about || [],
      campaign.brand_values,
      campaign.target_causes
    );

    const interestResult = calculateInterestScore(
      athlete.hobbies || [],
      athlete.lifestyle_interests || [],
      athlete.content_creation_interests || [],
      campaign.target_interests,
      campaign.content_categories
    );

    const campaignFitResult = calculateCampaignFitScore(
      profile.sport,
      athlete.secondary_sports || [],
      athlete.school_level,
      campaign.target_sports || [],
      campaign.target_school_levels || []
    );

    const budgetResult = calculateBudgetScore(
      fmvData.estimated_deal_value_low,
      fmvData.estimated_deal_value_high,
      campaign.budget_per_athlete || 0
    );

    const geographyResult = calculateGeographyScore(
      profile.state,
      profile.city || '',
      campaign.target_states || [],
      campaign.target_cities
    );

    const demographicsResult = calculateDemographicsScore(
      profile.gender || 'any',
      profile.graduation_year,
      campaign.target_gender,
      campaign.target_age_range
    );

    const engagementResult = calculateEngagementScore(
      totalFollowers,
      avgEngagement,
      campaign.min_followers || 0,
      campaign.min_engagement_rate || 0
    );

    // Build match score
    const matchScore: MatchScore = {
      total: Math.round(
        brandValuesResult.score +
        interestResult.score +
        campaignFitResult.score +
        budgetResult.score +
        geographyResult.score +
        demographicsResult.score +
        engagementResult.score
      ),
      brandValues: brandValuesResult.score,
      interests: interestResult.score,
      campaignFit: campaignFitResult.score,
      budget: budgetResult.score,
      geography: geographyResult.score,
      demographics: demographicsResult.score,
      engagement: engagementResult.score
    };

    const matchPercentage = matchScore.total;
    const confidence = getMatchConfidence(matchPercentage);

    const { strengths, concerns } = generateMatchInsights(matchScore, {
      brandValues: brandValuesResult.breakdown,
      interests: interestResult.breakdown,
      campaignFit: campaignFitResult.breakdown,
      budget: budgetResult.breakdown,
      geography: geographyResult.breakdown,
      demographics: demographicsResult.breakdown,
      engagement: engagementResult.breakdown
    });

    const recommendedOffer = calculateRecommendedOffer(
      fmvData.estimated_deal_value_low,
      fmvData.estimated_deal_value_high,
      matchPercentage,
      campaign.budget_per_athlete || 0
    );

    return NextResponse.json({
      athlete: {
        id: athlete.id,
        name: `${athlete.first_name} ${athlete.last_name}`,
        sport: profile.sport,
        school: athlete.school_name,
        profilePhoto: profile.profile_photo_url
      },
      campaign: {
        id: campaign.id,
        name: campaign.name,
        brand: campaign.name,  // Use campaign name as brand fallback
        budgetPerAthlete: campaign.budget_per_athlete
      },
      matchScore,
      matchPercentage,
      confidence,
      strengths,
      concerns,
      recommendedOffer,
      detailedBreakdown: {
        brandValues: {
          score: brandValuesResult.score,
          maxScore: 20,
          percentage: Math.round((brandValuesResult.score / 20) * 100),
          details: brandValuesResult.breakdown
        },
        interests: {
          score: interestResult.score,
          maxScore: 15,
          percentage: Math.round((interestResult.score / 15) * 100),
          details: interestResult.breakdown
        },
        campaignFit: {
          score: campaignFitResult.score,
          maxScore: 20,
          percentage: Math.round((campaignFitResult.score / 20) * 100),
          details: campaignFitResult.breakdown
        },
        budget: {
          score: budgetResult.score,
          maxScore: 15,
          percentage: Math.round((budgetResult.score / 15) * 100),
          details: budgetResult.breakdown
        },
        geography: {
          score: geographyResult.score,
          maxScore: 10,
          percentage: Math.round((geographyResult.score / 10) * 100),
          details: geographyResult.breakdown
        },
        demographics: {
          score: demographicsResult.score,
          maxScore: 10,
          percentage: Math.round((demographicsResult.score / 10) * 100),
          details: demographicsResult.breakdown
        },
        engagement: {
          score: engagementResult.score,
          maxScore: 10,
          percentage: Math.round((engagementResult.score / 10) * 100),
          details: engagementResult.breakdown
        }
      },
      athleteFMV: {
        score: fmvData.fmv_score,
        tier: fmvData.fmv_tier,
        estimatedValueLow: fmvData.estimated_deal_value_low,
        estimatedValueMid: (fmvData.estimated_deal_value_low + fmvData.estimated_deal_value_high) / 2,
        estimatedValueHigh: fmvData.estimated_deal_value_high
      },
      athleteSocialStats: {
        totalFollowers,
        avgEngagement,
        platforms: (socialStats || []).map((s: any) => ({
          platform: s.platform,
          followers: s.followers,
          engagement: s.engagement_rate
        }))
      }
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/demo/matchmaking/breakdown:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
