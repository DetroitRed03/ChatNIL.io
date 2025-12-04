/**
 * Match Notifications API - Server-Sent Events (SSE)
 * GET /api/matches/notifications?userId=xxx
 *
 * Provides real-time notifications for new matches using Server-Sent Events.
 * Both athletes and agencies can subscribe to receive match updates.
 *
 * For athletes: Notifies when new campaigns match their profile
 * For agencies: Notifies when new athletes match their campaigns
 */

import { NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// In-memory store for tracking last check times and unread notifications
// In production, this would be stored in Redis or a database
const lastCheckMap = new Map<string, Date>();
const unreadNotifications = new Map<string, any[]>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response(JSON.stringify({ error: 'userId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Set up SSE headers
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Function to send SSE event
  const sendEvent = async (event: string, data: any) => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(message));
  };

  // Start the SSE connection
  const startSSE = async () => {
    try {
      const supabase = createServiceRoleClient();

      // Get user info to determine role
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, role, first_name, last_name')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        await sendEvent('error', { message: 'User not found' });
        await writer.close();
        return;
      }

      // Send initial connection confirmation
      await sendEvent('connected', {
        userId: user.id,
        role: user.role,
        message: 'Connected to match notifications'
      });

      // Initialize last check time if not set
      if (!lastCheckMap.has(userId)) {
        lastCheckMap.set(userId, new Date());
      }

      // Send existing recent matches on initial connect (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      if (user.role === 'agency' || user.role === 'brand') {
        // First, get the list of already-saved athletes to exclude
        const { data: savedAthletes } = await supabase
          .from('agency_athlete_lists')
          .select('athlete_id')
          .eq('agency_id', userId);

        const savedAthleteIds = savedAthletes?.map(a => a.athlete_id) || [];

        // Load recent matches for agencies, EXCLUDING already-saved athletes
        let matchQuery = supabase
          .from('agency_athlete_matches')
          .select(`
            id,
            athlete_id,
            agency_id,
            match_score,
            match_tier,
            match_reasons,
            created_at
          `)
          .eq('agency_id', userId)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        // Exclude saved athletes if any exist
        if (savedAthleteIds.length > 0) {
          matchQuery = matchQuery.not('athlete_id', 'in', `(${savedAthleteIds.join(',')})`);
        }

        const { data: recentMatches } = await matchQuery;

        if (recentMatches && recentMatches.length > 0) {
          // Fetch athlete details for all matches at once
          const athleteIds = recentMatches.map(m => m.athlete_id);
          const { data: athletes } = await supabase
            .from('users')
            .select('id, first_name, last_name, username')
            .in('id', athleteIds);

          for (const match of recentMatches) {
            const athlete = athletes?.find(a => a.id === match.athlete_id);
            const athleteName = athlete
              ? `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 'New Athlete'
              : 'New Athlete';

            // Map tier from database to frontend format
            const matchTier = match.match_tier === 'excellent' ? 'excellent'
              : match.match_tier === 'strong' ? 'good'
              : match.match_tier === 'good' ? 'good'
              : match.match_tier === 'potential' ? 'fair'
              : 'low';

            await sendEvent('new_match', {
              type: 'athlete_match',
              matchId: match.id,
              athleteId: match.athlete_id,
              athleteUsername: athlete?.username,
              athleteName,
              matchScore: match.match_score,
              matchTier,
              matchReasons: match.match_reasons,
              message: `Athlete match: ${athleteName} (${match.match_score}% match)`,
              timestamp: match.created_at
            });
          }
        }
      } else if (user.role === 'athlete') {
        // Load recent campaign matches for athletes
        const { data: recentMatches } = await supabase
          .from('agency_athlete_matches')
          .select(`
            id,
            agency_id,
            match_score,
            match_tier,
            match_reasons,
            created_at
          `)
          .eq('athlete_id', userId)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        if (recentMatches && recentMatches.length > 0) {
          // Fetch agency details
          const agencyIds = recentMatches.map(m => m.agency_id);
          const { data: agencies } = await supabase
            .from('users')
            .select('id, first_name, last_name')
            .in('id', agencyIds);

          for (const match of recentMatches) {
            const agency = agencies?.find(a => a.id === match.agency_id);
            const agencyName = agency
              ? `${agency.first_name || ''} ${agency.last_name || ''}`.trim() || 'Agency'
              : 'Agency';

            // Map tier from database to frontend format
            const matchTier = match.match_tier === 'excellent' ? 'excellent'
              : match.match_tier === 'strong' ? 'good'
              : match.match_tier === 'good' ? 'good'
              : match.match_tier === 'potential' ? 'fair'
              : 'low';

            await sendEvent('new_match', {
              type: 'campaign_match',
              matchId: match.id,
              agencyId: match.agency_id,
              campaignName: agencyName,
              matchScore: match.match_score,
              matchTier,
              matchReasons: match.match_reasons,
              message: `Match from ${agencyName} (${match.match_score}% match)`,
              timestamp: match.created_at
            });
          }
        }
      }

      // Check for new matches periodically
      const checkInterval = setInterval(async () => {
        try {
          const lastCheck = lastCheckMap.get(userId) || new Date(Date.now() - 60000);

          if (user.role === 'athlete') {
            // For athletes, check for new agency matches
            const { data: newMatches, error } = await supabase
              .from('agency_athlete_matches')
              .select(`
                id,
                agency_id,
                match_score,
                match_tier,
                match_reasons,
                created_at
              `)
              .eq('athlete_id', userId)
              .gt('created_at', lastCheck.toISOString())
              .order('created_at', { ascending: false })
              .limit(10);

            if (!error && newMatches && newMatches.length > 0) {
              // Fetch agency details
              const agencyIds = newMatches.map(m => m.agency_id);
              const { data: agencies } = await supabase
                .from('users')
                .select('id, first_name, last_name')
                .in('id', agencyIds);

              for (const match of newMatches) {
                const agency = agencies?.find(a => a.id === match.agency_id);
                const agencyName = agency
                  ? `${agency.first_name || ''} ${agency.last_name || ''}`.trim() || 'Agency'
                  : 'Agency';

                const matchTier = match.match_tier === 'excellent' ? 'excellent'
                  : match.match_tier === 'strong' ? 'good'
                  : match.match_tier === 'good' ? 'good'
                  : match.match_tier === 'potential' ? 'fair'
                  : 'low';

                await sendEvent('new_match', {
                  type: 'campaign_match',
                  matchId: match.id,
                  agencyId: match.agency_id,
                  campaignName: agencyName,
                  matchScore: match.match_score,
                  matchTier,
                  matchReasons: match.match_reasons,
                  message: `New match from ${agencyName} (${match.match_score}% match)`,
                  timestamp: match.created_at
                });
              }
              lastCheckMap.set(userId, new Date());
            }
          } else if (user.role === 'agency' || user.role === 'brand') {
            // Get saved athletes to exclude
            const { data: savedAthletes } = await supabase
              .from('agency_athlete_lists')
              .select('athlete_id')
              .eq('agency_id', userId);

            const savedAthleteIds = savedAthletes?.map(a => a.athlete_id) || [];

            // For agencies, check for new athlete matches, excluding saved athletes
            let matchQuery = supabase
              .from('agency_athlete_matches')
              .select(`
                id,
                athlete_id,
                agency_id,
                match_score,
                match_tier,
                match_reasons,
                created_at
              `)
              .eq('agency_id', userId)
              .gt('created_at', lastCheck.toISOString())
              .order('created_at', { ascending: false })
              .limit(10);

            // Exclude saved athletes if any exist
            if (savedAthleteIds.length > 0) {
              matchQuery = matchQuery.not('athlete_id', 'in', `(${savedAthleteIds.join(',')})`);
            }

            const { data: newMatches, error } = await matchQuery;

            if (!error && newMatches && newMatches.length > 0) {
              // Fetch athlete details for all matches at once
              const athleteIds = newMatches.map(m => m.athlete_id);
              const { data: athletes } = await supabase
                .from('users')
                .select('id, first_name, last_name, username')
                .in('id', athleteIds);

              for (const match of newMatches) {
                const athlete = athletes?.find(a => a.id === match.athlete_id);
                const athleteName = athlete
                  ? `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 'New Athlete'
                  : 'New Athlete';

                // Map tier from database to frontend format
                const matchTier = match.match_tier === 'excellent' ? 'excellent'
                  : match.match_tier === 'strong' ? 'good'
                  : match.match_tier === 'good' ? 'good'
                  : match.match_tier === 'potential' ? 'fair'
                  : 'low';

                await sendEvent('new_match', {
                  type: 'athlete_match',
                  matchId: match.id,
                  athleteId: match.athlete_id,
                  athleteUsername: athlete?.username,
                  athleteName,
                  matchScore: match.match_score,
                  matchTier,
                  matchReasons: match.match_reasons,
                  message: `New athlete match: ${athleteName} (${match.match_score}% match)`,
                  timestamp: match.created_at
                });
              }
              lastCheckMap.set(userId, new Date());
            }

            // Check for athletes who reconsidered (changed from rejected back to contacted)
            const { data: reconsideredMatches, error: reconsiderError } = await supabase
              .from('agency_athlete_matches')
              .select(`
                id,
                athlete_id,
                agency_id,
                match_score,
                match_tier,
                athlete_response_status,
                athlete_response_at,
                updated_at
              `)
              .eq('agency_id', userId)
              .eq('athlete_response_status', 'reconsidered')
              .gt('updated_at', lastCheck.toISOString())
              .order('updated_at', { ascending: false })
              .limit(10);

            if (!reconsiderError && reconsideredMatches && reconsideredMatches.length > 0) {
              // Fetch athlete details
              const reconsiderAthleteIds = reconsideredMatches.map(m => m.athlete_id);
              const { data: reconsiderAthletes } = await supabase
                .from('users')
                .select('id, first_name, last_name, username')
                .in('id', reconsiderAthleteIds);

              for (const match of reconsideredMatches) {
                const athlete = reconsiderAthletes?.find(a => a.id === match.athlete_id);
                const athleteName = athlete
                  ? `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 'Athlete'
                  : 'Athlete';

                await sendEvent('athlete_reconsidered', {
                  type: 'reconsider',
                  matchId: match.id,
                  athleteId: match.athlete_id,
                  athleteUsername: athlete?.username,
                  athleteName,
                  matchScore: match.match_score,
                  message: `${athleteName} has reconsidered their decision and is now open to opportunities!`,
                  timestamp: match.updated_at
                });
              }
            }

            // Check for campaign invite acceptances
            // First get agency's campaigns
            const { data: agencyCampaigns } = await supabase
              .from('agency_campaigns')
              .select('id')
              .eq('agency_id', userId);

            if (agencyCampaigns && agencyCampaigns.length > 0) {
              const campaignIds = agencyCampaigns.map(c => c.id);

              // Check for recently accepted invites
              const { data: acceptedInvites, error: acceptError } = await supabase
                .from('campaign_athletes')
                .select(`
                  id,
                  campaign_id,
                  athlete_id,
                  status,
                  accepted_at,
                  responded_at
                `)
                .in('campaign_id', campaignIds)
                .eq('status', 'accepted')
                .gt('accepted_at', lastCheck.toISOString())
                .order('accepted_at', { ascending: false })
                .limit(10);

              if (!acceptError && acceptedInvites && acceptedInvites.length > 0) {
                // Fetch athlete details
                const acceptedAthleteIds = acceptedInvites.map(i => i.athlete_id);
                const { data: acceptedAthletes } = await supabase
                  .from('users')
                  .select('id, first_name, last_name, username')
                  .in('id', acceptedAthleteIds);

                // Fetch campaign names
                const { data: campaignNames } = await supabase
                  .from('agency_campaigns')
                  .select('id, name')
                  .in('id', acceptedInvites.map(i => i.campaign_id));

                for (const invite of acceptedInvites) {
                  const athlete = acceptedAthletes?.find(a => a.id === invite.athlete_id);
                  const athleteName = athlete
                    ? `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 'An athlete'
                    : 'An athlete';
                  const campaign = campaignNames?.find(c => c.id === invite.campaign_id);
                  const campaignName = campaign?.name || 'your campaign';

                  await sendEvent('invite_accepted', {
                    type: 'invite_accepted',
                    inviteId: invite.id,
                    campaignId: invite.campaign_id,
                    campaignName,
                    athleteId: invite.athlete_id,
                    athleteUsername: athlete?.username,
                    athleteName,
                    message: `${athleteName} has accepted your invite to "${campaignName}"!`,
                    timestamp: invite.accepted_at
                  });
                }
              }
            }
          }

          // Send heartbeat to keep connection alive
          await sendEvent('heartbeat', { timestamp: new Date().toISOString() });

        } catch (checkError) {
          console.error('Error checking for new matches:', checkError);
        }
      }, 10000); // Check every 10 seconds

      // Handle connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(checkInterval);
        writer.close();
      });

    } catch (error) {
      console.error('SSE Error:', error);
      await sendEvent('error', { message: 'Internal server error' });
      await writer.close();
    }
  };

  // Start SSE in background
  startSSE();

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * POST /api/matches/notifications
 * Send a notification to a specific user (called internally after matchmaking)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notification } = body;

    if (!userId || !notification) {
      return new Response(
        JSON.stringify({ error: 'userId and notification are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Store notification for the user
    const existing = unreadNotifications.get(userId) || [];
    existing.push({
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    });
    unreadNotifications.set(userId, existing);

    // Also store in database for persistence
    const supabase = createServiceRoleClient();

    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: notification.type || 'match',
        title: notification.title || 'New Match',
        message: notification.message,
        data: notification.data || {},
        read: false,
        created_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
