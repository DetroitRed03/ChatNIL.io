/**
 * Matchmaking Trigger Utility
 *
 * Provides functions to automatically trigger matchmaking when:
 * - A new campaign is created
 * - An athlete completes onboarding
 *
 * This ensures matches are pre-calculated and available immediately.
 */

import { createServiceRoleClient } from '@/lib/supabase/server';
import { findCampaignMatches } from '@/lib/campaign-matchmaking';

/**
 * Send a notification to a user about new matches
 * This stores the notification in the database and can trigger SSE events
 */
async function sendMatchNotification(
  userId: string,
  notification: {
    type: 'campaign_match' | 'athlete_match';
    title: string;
    message: string;
    data: Record<string, any>;
  }
): Promise<void> {
  try {
    const supabase = createServiceRoleClient();

    await supabase.from('notifications').insert({
      user_id: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      read: false,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to send notification (non-critical):', error);
  }
}

interface MatchResult {
  campaignId: string;
  campaignName: string;
  matchCount: number;
  topMatches: Array<{
    athleteId: string;
    athleteName: string;
    matchPercentage: number;
  }>;
}

interface TriggerResult {
  success: boolean;
  matchesGenerated: number;
  campaigns?: MatchResult[];
  error?: string;
}

/**
 * Trigger matchmaking for a newly created campaign
 * Finds and stores matches between the campaign and all eligible athletes
 */
export async function triggerMatchmakingForCampaign(campaignId: string): Promise<TriggerResult> {
  try {
    console.log(`🔄 Triggering matchmaking for campaign: ${campaignId}`);

    const matches = await findCampaignMatches(campaignId, {
      minMatchScore: 30, // Include lower scores for visibility
      maxResults: 100,
      includeBreakdown: true,
    });

    if (!matches || matches.length === 0) {
      console.log(`⚠️ No matches found for campaign: ${campaignId}`);
      return {
        success: true,
        matchesGenerated: 0,
        campaigns: [{
          campaignId,
          campaignName: 'Unknown',
          matchCount: 0,
          topMatches: []
        }]
      };
    }

    // Store matches in database for quick retrieval
    const supabase = createServiceRoleClient();

    const matchRecords = matches.map(match => ({
      campaign_id: campaignId,
      athlete_id: match.athleteId,
      match_score: match.matchPercentage,
      match_tier: match.matchPercentage >= 80 ? 'excellent' :
                  match.matchPercentage >= 60 ? 'good' :
                  match.matchPercentage >= 40 ? 'fair' : 'low',
      match_reasons: match.strengths,
      concerns: match.concerns,
      recommended_offer: match.recommendedOffer,
      confidence: match.confidence,
      score_breakdown: match.matchScore,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Upsert matches (update if exists, insert if new)
    const { error: upsertError } = await supabase
      .from('agency_athlete_matches')
      .upsert(matchRecords, {
        onConflict: 'campaign_id,athlete_id',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error('⚠️ Error storing matches (non-critical):', upsertError);
      // Continue - matches are still available via API
    } else {
      console.log(`✅ Stored ${matches.length} matches for campaign: ${campaignId}`);

      // Send notifications to athletes about new campaign matches
      const campaignName = matches[0]?.campaignName || 'New Campaign';
      for (const match of matches.slice(0, 20)) { // Limit to top 20 to avoid spam
        if (match.matchPercentage >= 50) { // Only notify for decent matches
          await sendMatchNotification(match.athleteId, {
            type: 'campaign_match',
            title: 'New Campaign Match!',
            message: `You matched ${match.matchPercentage}% with "${campaignName}"`,
            data: {
              campaignId,
              campaignName,
              matchScore: match.matchPercentage,
              matchTier: match.matchPercentage >= 80 ? 'excellent' :
                         match.matchPercentage >= 60 ? 'good' : 'fair'
            }
          });
        }
      }
    }

    const topMatches = matches.slice(0, 5).map(m => ({
      athleteId: m.athleteId,
      athleteName: m.athleteName,
      matchPercentage: m.matchPercentage
    }));

    return {
      success: true,
      matchesGenerated: matches.length,
      campaigns: [{
        campaignId,
        campaignName: matches[0]?.campaignName || 'Unknown',
        matchCount: matches.length,
        topMatches
      }]
    };
  } catch (error) {
    console.error('❌ Error triggering matchmaking for campaign:', error);
    return {
      success: false,
      matchesGenerated: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Trigger matchmaking for a newly onboarded athlete
 * Finds matches across all active campaigns
 */
export async function triggerMatchmakingForAthlete(athleteId: string): Promise<TriggerResult> {
  try {
    console.log(`🔄 Triggering matchmaking for athlete: ${athleteId}`);

    const supabase = createServiceRoleClient();

    // Get all active campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('agency_campaigns')
      .select('id, name')
      .eq('status', 'active');

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      return {
        success: false,
        matchesGenerated: 0,
        error: 'Failed to fetch active campaigns'
      };
    }

    if (!campaigns || campaigns.length === 0) {
      console.log('No active campaigns found');
      return {
        success: true,
        matchesGenerated: 0,
        campaigns: []
      };
    }

    const results: MatchResult[] = [];
    let totalMatchesGenerated = 0;

    // Run matchmaking for each active campaign and check if this athlete matches
    for (const campaign of campaigns) {
      try {
        const matches = await findCampaignMatches(campaign.id, {
          minMatchScore: 30,
          maxResults: 100,
          includeBreakdown: true,
        });

        // Find this athlete's match in the results
        const athleteMatch = matches?.find(m => m.athleteId === athleteId);

        if (athleteMatch) {
          // Store the match
          const { error: upsertError } = await supabase
            .from('agency_athlete_matches')
            .upsert({
              campaign_id: campaign.id,
              athlete_id: athleteId,
              match_score: athleteMatch.matchPercentage,
              match_tier: athleteMatch.matchPercentage >= 80 ? 'excellent' :
                          athleteMatch.matchPercentage >= 60 ? 'good' :
                          athleteMatch.matchPercentage >= 40 ? 'fair' : 'low',
              match_reasons: athleteMatch.strengths,
              concerns: athleteMatch.concerns,
              recommended_offer: athleteMatch.recommendedOffer,
              confidence: athleteMatch.confidence,
              score_breakdown: athleteMatch.matchScore,
              status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'campaign_id,athlete_id',
              ignoreDuplicates: false
            });

          if (!upsertError) {
            totalMatchesGenerated++;
            results.push({
              campaignId: campaign.id,
              campaignName: campaign.name,
              matchCount: 1,
              topMatches: [{
                athleteId: athleteMatch.athleteId,
                athleteName: athleteMatch.athleteName,
                matchPercentage: athleteMatch.matchPercentage
              }]
            });

            // Notify the agency about the new athlete match (only for good matches)
            if (athleteMatch.matchPercentage >= 50) {
              // Get the campaign's agency ID
              const { data: campaignData } = await supabase
                .from('agency_campaigns')
                .select('agency_id')
                .eq('id', campaign.id)
                .single();

              if (campaignData?.agency_id) {
                await sendMatchNotification(campaignData.agency_id, {
                  type: 'athlete_match',
                  title: 'New Athlete Match!',
                  message: `${athleteMatch.athleteName} matched ${athleteMatch.matchPercentage}% with "${campaign.name}"`,
                  data: {
                    athleteId: athleteMatch.athleteId,
                    athleteName: athleteMatch.athleteName,
                    campaignId: campaign.id,
                    campaignName: campaign.name,
                    matchScore: athleteMatch.matchPercentage,
                    matchTier: athleteMatch.matchPercentage >= 80 ? 'excellent' :
                               athleteMatch.matchPercentage >= 60 ? 'good' : 'fair'
                  }
                });
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error matching campaign ${campaign.id}:`, error);
        // Continue with other campaigns
      }
    }

    console.log(`✅ Generated ${totalMatchesGenerated} matches for athlete: ${athleteId}`);

    return {
      success: true,
      matchesGenerated: totalMatchesGenerated,
      campaigns: results
    };
  } catch (error) {
    console.error('❌ Error triggering matchmaking for athlete:', error);
    return {
      success: false,
      matchesGenerated: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Trigger full matchmaking refresh for all campaigns
 * Use sparingly - this is resource intensive
 */
export async function triggerFullMatchmakingRefresh(): Promise<TriggerResult> {
  try {
    console.log('🔄 Triggering full matchmaking refresh...');

    const supabase = createServiceRoleClient();

    // Get all active campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('agency_campaigns')
      .select('id, name')
      .eq('status', 'active');

    if (campaignsError || !campaigns) {
      return {
        success: false,
        matchesGenerated: 0,
        error: 'Failed to fetch campaigns'
      };
    }

    const results: MatchResult[] = [];
    let totalMatches = 0;

    for (const campaign of campaigns) {
      const result = await triggerMatchmakingForCampaign(campaign.id);
      if (result.success && result.campaigns) {
        results.push(...result.campaigns);
        totalMatches += result.matchesGenerated;
      }
    }

    console.log(`✅ Full refresh complete. Generated ${totalMatches} matches across ${campaigns.length} campaigns`);

    return {
      success: true,
      matchesGenerated: totalMatches,
      campaigns: results
    };
  } catch (error) {
    console.error('❌ Error in full matchmaking refresh:', error);
    return {
      success: false,
      matchesGenerated: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
