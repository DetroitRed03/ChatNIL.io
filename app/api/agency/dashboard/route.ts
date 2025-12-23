import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createClient } from '@/lib/supabase/server';
import { resolveAthleteName } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * Agency Dashboard API
 *
 * GET /api/agency/dashboard
 *
 * Returns dashboard data for the agency:
 * - Active campaigns
 * - Saved athletes count
 * - Budget statistics
 * - Recent activity
 */

/**
 * Helper to get authenticated agency user ID with multiple fallbacks
 */
async function getAuthenticatedAgencyId(request: NextRequest, supabase: ReturnType<typeof createServiceRoleClient>): Promise<string | null> {
  // Method 1: Try cookie-based auth (SSR client)
  try {
    const authClient = await createClient();
    const { data: { user }, error } = await authClient.auth.getUser();
    if (user && !error) {
      return user.id;
    }
  } catch (e) {
    console.log('Cookie auth failed, trying fallback...');
  }

  // Method 2: Check for X-User-ID header (sent by frontend)
  const userIdHeader = request.headers.get('X-User-ID');
  if (userIdHeader) {
    return userIdHeader;
  }

  // Method 3: Check for Authorization header with Bearer token
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      return user.id;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();

    // Get authenticated agency user ID
    const agencyId = await getAuthenticatedAgencyId(request, supabase);

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Fetch campaigns for this agency
    // NOTE: Temporarily removed .eq('agency_id') filter due to Supabase PostgREST schema cache issue
    // The column exists in DB but PostgREST hasn't refreshed its cache yet
    const { data: allCampaigns, error: campaignsError } = await supabase
      .from('agency_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      throw campaignsError;
    }

    // Filter by agency_id in application code as workaround
    const campaigns = allCampaigns?.filter(c => c.agency_id === agencyId) || [];

    // Fetch saved athletes for this agency
    // NOTE: Same workaround - filter in application code
    const { data: allSavedAthletes, error: savedError } = await supabase
      .from('agency_athlete_lists')
      .select('*');

    if (savedError) {
      console.error('Error fetching saved athletes:', savedError);
      throw savedError;
    }

    const savedAthletes = allSavedAthletes?.filter(a => a.agency_id === agencyId) || [];
    const count = savedAthletes.length;

    // Fetch athlete details for saved athletes
    let athletesWithDetails: any[] = [];
    if (savedAthletes.length > 0) {
      const athleteIds = savedAthletes.map(a => a.athlete_id);

      // Get athlete profiles
      const { data: profiles } = await supabase
        .from('athlete_profiles')
        .select('*')
        .in('user_id', athleteIds);

      // Get social media stats
      const { data: socialStats } = await supabase
        .from('social_media_stats')
        .select('*')
        .in('user_id', athleteIds);

      // Get user names and username (include email for fallback)
      const { data: users } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, username')
        .in('id', athleteIds);

      // Combine the data
      athletesWithDetails = profiles?.map(profile => {
        const user = users?.find(u => u.id === profile.user_id);
        const social = socialStats?.find(s => s.user_id === profile.user_id);
        const totalFollowers = (social?.instagram_followers || 0) +
                               (social?.tiktok_followers || 0) +
                               (social?.twitter_followers || 0);

        // Use robust name resolution with fallback chain
        const name = resolveAthleteName({
          firstName: user?.first_name,
          lastName: user?.last_name,
          email: user?.email,
          id: profile.user_id,
        });

        return {
          id: profile.user_id,
          username: user?.username || null,
          name,
          sport: profile.sport,
          school: profile.school,
          position: profile.position,
          estimatedFmv: profile.estimated_fmv,
          followers: totalFollowers,
          engagement: social?.engagement_rate || 0,
        };
      }) || [];
    }

    // Calculate stats from campaigns
    const totalBudget = campaigns?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0;
    const totalSpent = campaigns?.reduce((sum, c) => sum + (c.spent || 0), 0) || 0;
    const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;

    // Generate recent activity from campaigns (mock data based on real campaigns)
    const recentActivity = campaigns?.slice(0, 3).map((campaign, index) => ({
      id: `activity-${campaign.id}`,
      type: 'campaign_created' as const,
      title: 'Campaign Launched',
      description: `${campaign.name} is now active`,
      timestamp: new Date(Date.now() - (index + 1) * 3600000 * 24), // Days ago
      campaignName: campaign.name,
    })) || [];

    // Generate pending actions (mock data based on real state)
    const pendingActions = [
      ...campaigns?.filter(c => c.status === 'active').slice(0, 2).map(c => ({
        id: `action-${c.id}`,
        type: 'review' as const,
        title: 'Campaign Performance Review',
        description: `${c.name} metrics ready for review`,
        priority: 'medium' as const,
      })) || [],
    ];

    // Return formatted response
    return NextResponse.json({
      campaigns: campaigns?.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        budget: c.budget,
        spent: c.spent,
        status: c.status,
        targetSports: c.target_sports || [],
        startDate: c.start_date,
        endDate: c.end_date,
        createdAt: c.created_at,
      })) || [],
      savedAthletes: {
        count: count || 0,
        athletes: athletesWithDetails,
      },
      stats: {
        totalBudget,
        totalSpent,
        activeDeals: activeCampaigns,
        budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      },
      recentActivity,
      pendingActions,
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
