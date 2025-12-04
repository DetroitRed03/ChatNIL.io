/**
 * Athlete Dashboard Metrics API
 *
 * Returns aggregated dashboard metrics from the athlete_dashboard_metrics materialized view.
 * This view is auto-refreshed every 5 minutes via pg_cron for performance.
 *
 * Data includes:
 * - Active matches count
 * - Total NIL deals and lifetime earnings
 * - Current FMV score and tier
 * - Total social media followers
 * - Unread notifications count
 * - Profile completion percentage
 */

import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get user ID from query params (passed by client)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || !supabaseAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = { id: userId };

    // Query data directly from tables (no materialized view needed)

    // Get matches count
    const { count: matchesCount } = await supabaseAdmin
      .from('agency_athlete_matches')
      .select('*', { count: 'exact', head: true })
      .eq('athlete_id', userId)
      .eq('status', 'suggested');

    // Get NIL deals data
    const { data: deals } = await supabaseAdmin
      .from('nil_deals')
      .select('compensation_amount')
      .eq('athlete_id', userId);

    const totalDeals = deals?.length || 0;
    const lifetimeEarnings = deals?.reduce((sum, d) => sum + Number(d.compensation_amount || 0), 0) || 0;

    // Get FMV data
    const { data: fmvData } = await supabaseAdmin
      .from('athlete_fmv_data')
      .select('fmv_score, fmv_tier')
      .eq('athlete_id', userId)
      .maybeSingle();

    // Map lowercase tier to uppercase for UI compatibility
    const tierMap: Record<string, string> = {
      'elite': 'ELITE',
      'rising': 'RISING',
      'established': 'ESTABLISHED',
      'emerging': 'EMERGING',
      'developing': 'DEVELOPING',
      'high': 'RISING',      // Fallback mapping
      'medium': 'EMERGING',  // Fallback mapping
      'low': 'DEVELOPING'    // Fallback mapping
    };
    const normalizedTier = fmvData?.fmv_tier
      ? tierMap[fmvData.fmv_tier.toLowerCase()] || 'DEVELOPING'
      : 'DEVELOPING';

    // Get social media stats (normalized schema - multiple rows per platform)
    const { data: socialDataArray } = await supabaseAdmin
      .from('social_media_stats')
      .select('platform, followers')
      .eq('user_id', userId);

    // Aggregate social stats from normalized rows
    let totalFollowers = 0;
    let instagramFollowers = 0;
    let tiktokFollowers = 0;
    let twitterFollowers = 0;
    let youtubeSubscribers = 0;

    if (socialDataArray && socialDataArray.length > 0) {
      for (const stat of socialDataArray) {
        const followers = stat.followers || 0;
        totalFollowers += followers;

        switch (stat.platform?.toLowerCase()) {
          case 'instagram':
            instagramFollowers = followers;
            break;
          case 'tiktok':
            tiktokFollowers = followers;
            break;
          case 'twitter':
          case 'x':
            twitterFollowers = followers;
            break;
          case 'youtube':
            youtubeSubscribers = followers;
            break;
        }
      }
    }

    // Get profile completion
    const { data: profileData } = await supabaseAdmin
      .from('athlete_profiles')
      .select('profile_completion_score')
      .eq('user_id', userId)
      .maybeSingle();

    // Build metrics object
    const metrics = {
      athlete_id: userId,
      active_matches: matchesCount || 0,
      total_deals: totalDeals,
      lifetime_earnings: lifetimeEarnings,
      current_fmv_score: fmvData?.fmv_score || 0,
      fmv_tier: normalizedTier,
      total_followers: totalFollowers,
      instagram_followers: instagramFollowers,
      tiktok_followers: tiktokFollowers,
      twitter_followers: twitterFollowers,
      youtube_subscribers: youtubeSubscribers,
      unread_notifications: 0,
      unread_messages: 0,
      profile_completion_score: profileData?.profile_completion_score || 0,
      last_activity_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Return the metrics
    return NextResponse.json(metrics);

  } catch (error: any) {
    console.error('Unexpected error in athlete metrics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
