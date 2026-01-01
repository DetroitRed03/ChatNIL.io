import { NextResponse } from 'next/server';
import { createServiceRoleClient, createClient } from '@/lib/supabase/server';
import { resolveAthleteName } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * Agency Roster API
 *
 * Uses simple schema: agency_athlete_lists table with direct agency_id -> athlete_id mapping
 *
 * GET /api/agency/roster - Returns full list of saved athletes
 * POST /api/agency/roster - Add/toggle athlete in roster (saves if not saved, unsaves if saved)
 * DELETE /api/agency/roster - Remove athlete from roster
 *
 * GET Query params:
 * - sport: Filter by sport (optional)
 * - status: Filter by status (optional)
 * - sortBy: Sort field (followers, engagement, fmv, name)
 * - sortOrder: asc or desc
 *
 * POST Body:
 * - athleteId: UUID of athlete to add/toggle
 * - notes: (optional) Notes about the athlete
 *
 * DELETE Query params:
 * - athleteId: UUID of athlete to remove
 */
export async function GET(request: Request) {
  try {
    const supabase = createServiceRoleClient();
    const { searchParams } = new URL(request.url);

    // Try multiple auth methods for compatibility
    let agencyId: string | null = null;

    // Method 1: Try cookie-based auth (SSR client)
    try {
      const authClient = await createClient();
      const { data: { user }, error } = await authClient.auth.getUser();
      if (user && !error) {
        agencyId = user.id;
      }
    } catch (e) {
      console.log('Cookie auth failed, trying fallback...');
    }

    // Method 2: Check for X-User-ID header (sent by frontend)
    if (!agencyId) {
      const userIdHeader = request.headers.get('X-User-ID');
      if (userIdHeader) {
        agencyId = userIdHeader;
      }
    }

    // Method 3: Check for Authorization header with Bearer token
    if (!agencyId) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          agencyId = user.id;
        }
      }
    }

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Get query parameters
    const sportFilter = searchParams.get('sport');
    const statusFilter = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Fetch saved athletes for this agency
    const { data: allSavedAthletes, error: savedError } = await supabase
      .from('agency_athlete_lists')
      .select('*');

    if (savedError) {
      console.error('Error fetching saved athletes:', savedError);
      throw savedError;
    }

    const savedAthletes = allSavedAthletes?.filter(a => a.agency_id === agencyId) || [];

    if (savedAthletes.length === 0) {
      return NextResponse.json({
        athletes: [],
        total: 0,
        filters: { sport: sportFilter, status: statusFilter },
        sort: { by: sortBy, order: sortOrder },
      });
    }

    const athleteIds = savedAthletes.map(a => a.athlete_id);

    // Get athlete profiles
    const { data: profiles } = await supabase
      .from('athlete_profiles')
      .select('*')
      .in('user_id', athleteIds);

    // Get social media stats from athlete_public_profiles (primary source with correct data)
    const { data: publicProfileStats } = await supabase
      .from('athlete_public_profiles')
      .select('user_id, instagram_followers, tiktok_followers, twitter_followers, youtube_subscribers, total_followers, avg_engagement_rate')
      .in('user_id', athleteIds);

    // Get user names and usernames
    const { data: users } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, username')
      .in('id', athleteIds);

    // Combine the data
    let athletes = profiles?.map(profile => {
      const user = users?.find(u => u.id === profile.user_id);
      const social = publicProfileStats?.find(s => s.user_id === profile.user_id);
      const savedInfo = savedAthletes.find(a => a.athlete_id === profile.user_id);

      // Use total_followers from athlete_public_profiles if available, otherwise calculate
      const totalFollowers = social?.total_followers ||
                             ((social?.instagram_followers || 0) +
                             (social?.tiktok_followers || 0) +
                             (social?.twitter_followers || 0) +
                             (social?.youtube_subscribers || 0));
      const engagement = social?.avg_engagement_rate || 0;

      // Calculate status based on engagement and followers
      let status: 'excellent' | 'good' | 'needs-attention' = 'needs-attention';
      if (totalFollowers >= 100000 && engagement >= 5) status = 'excellent';
      else if (totalFollowers >= 50000 && engagement >= 4) status = 'excellent';
      else if (totalFollowers >= 20000 || engagement >= 3) status = 'good';

      // Use robust name resolution with fallback chain
      const name = resolveAthleteName({
        firstName: user?.first_name,
        lastName: user?.last_name,
        email: user?.email,
        id: profile.user_id,
      });

      // Extract first/last name for separate fields
      const nameParts = name.split(' ');
      const firstName = user?.first_name || nameParts[0] || 'Athlete';
      const lastName = user?.last_name || nameParts.slice(1).join(' ') || '';

      return {
        id: profile.user_id,
        username: user?.username || null,
        name,
        firstName,
        lastName,
        email: user?.email,
        sport: profile.sport,
        school: profile.school,
        position: profile.position,
        year: profile.year,
        estimatedFmv: profile.estimated_fmv,
        bio: profile.bio,
        achievements: profile.achievements,
        followers: {
          total: totalFollowers,
          instagram: social?.instagram_followers || 0,
          tiktok: social?.tiktok_followers || 0,
          twitter: social?.twitter_followers || 0,
        },
        engagement,
        status,
        savedAt: savedInfo?.created_at,
      };
    }) || [];

    // Apply filters
    if (sportFilter) {
      athletes = athletes.filter(a => a.sport?.toLowerCase() === sportFilter.toLowerCase());
    }
    if (statusFilter) {
      athletes = athletes.filter(a => a.status === statusFilter);
    }

    // Apply sorting
    athletes.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'followers':
          aVal = a.followers.total;
          bVal = b.followers.total;
          break;
        case 'engagement':
          aVal = a.engagement;
          bVal = b.engagement;
          break;
        case 'fmv':
          aVal = a.estimatedFmv || 0;
          bVal = b.estimatedFmv || 0;
          break;
        case 'savedAt':
          aVal = new Date(a.savedAt || 0).getTime();
          bVal = new Date(b.savedAt || 0).getTime();
          break;
        case 'name':
        default:
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
      }

      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    });

    // Get unique sports for filter options
    const uniqueSports = Array.from(new Set(athletes.map(a => a.sport).filter(Boolean))).sort();

    return NextResponse.json({
      athletes,
      total: athletes.length,
      filters: {
        sport: sportFilter,
        status: statusFilter,
        availableSports: uniqueSports,
      },
      sort: {
        by: sortBy,
        order: sortOrder,
      },
    });

  } catch (error) {
    console.error('Roster API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch roster data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agency/roster
 * Add or toggle (unsave) an athlete from the agency's roster
 * Toggle behavior: If athlete already saved, unsave them; otherwise save them
 *
 * Uses simple schema: agency_athlete_lists table with agency_id and athlete_id columns
 */
export async function POST(request: Request) {
  try {
    const supabase = createServiceRoleClient();
    const body = await request.json();
    const { athleteId, notes } = body;

    if (!athleteId) {
      return NextResponse.json(
        { error: 'athleteId is required' },
        { status: 400 }
      );
    }

    // Try multiple auth methods for compatibility
    let agencyId: string | null = null;

    // Method 1: Try cookie-based auth (SSR client)
    try {
      const authClient = await createClient();
      const { data: { user }, error } = await authClient.auth.getUser();
      if (user && !error) {
        agencyId = user.id;
      }
    } catch (e) {
      console.log('Cookie auth failed, trying fallback...');
    }

    // Method 2: Check for X-User-ID header (sent by frontend)
    if (!agencyId) {
      const userIdHeader = request.headers.get('X-User-ID');
      if (userIdHeader) {
        agencyId = userIdHeader;
      }
    }

    // Method 3: Check for Authorization header with Bearer token
    if (!agencyId) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          agencyId = user.id;
        }
      }
    }

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Check if athlete is already saved - toggle behavior
    // Simple schema: agency_athlete_lists has agency_id and athlete_id directly
    const { data: existingEntry } = await supabase
      .from('agency_athlete_lists')
      .select('id')
      .eq('agency_id', agencyId)
      .eq('athlete_id', athleteId)
      .single();

    if (existingEntry) {
      // Athlete is already saved - UNSAVE them (toggle off)
      const { error: deleteError } = await supabase
        .from('agency_athlete_lists')
        .delete()
        .eq('id', existingEntry.id);

      if (deleteError) {
        console.error('Error removing athlete from list:', deleteError);
        return NextResponse.json(
          { error: 'Failed to unsave athlete' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'unsaved',
        message: 'Athlete removed from roster',
        isSaved: false
      });
    }

    // Athlete not saved - SAVE them (toggle on)
    const { data: newEntry, error: insertError } = await supabase
      .from('agency_athlete_lists')
      .insert({
        agency_id: agencyId,
        athlete_id: athleteId,
        notes: notes || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding athlete to list:', insertError);
      return NextResponse.json(
        { error: 'Failed to save athlete' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action: 'saved',
      message: 'Athlete saved to roster',
      isSaved: true,
      data: newEntry
    });

  } catch (error) {
    console.error('Save Athlete Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save athlete',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agency/roster
 * Remove an athlete from the agency's roster
 *
 * Uses simple schema: agency_athlete_lists table with agency_id and athlete_id columns
 */
export async function DELETE(request: Request) {
  try {
    const supabase = createServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get('athleteId');

    if (!athleteId) {
      return NextResponse.json(
        { error: 'athleteId is required' },
        { status: 400 }
      );
    }

    // Try multiple auth methods for compatibility
    let agencyId: string | null = null;

    // Method 1: Try cookie-based auth (SSR client)
    try {
      const authClient = await createClient();
      const { data: { user }, error } = await authClient.auth.getUser();
      if (user && !error) {
        agencyId = user.id;
      }
    } catch (e) {
      console.log('Cookie auth failed, trying fallback...');
    }

    // Method 2: Check for X-User-ID header (sent by frontend)
    if (!agencyId) {
      const userIdHeader = request.headers.get('X-User-ID');
      if (userIdHeader) {
        agencyId = userIdHeader;
      }
    }

    // Method 3: Check for Authorization header with Bearer token
    if (!agencyId) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          agencyId = user.id;
        }
      }
    }

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Simple schema: delete directly from agency_athlete_lists by agency_id and athlete_id
    const { error: deleteError, count } = await supabase
      .from('agency_athlete_lists')
      .delete()
      .eq('agency_id', agencyId)
      .eq('athlete_id', athleteId);

    if (deleteError) {
      console.error('Error removing athlete from roster:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove athlete' },
        { status: 500 }
      );
    }

    if (count === 0) {
      return NextResponse.json(
        { error: 'Athlete not found in roster' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Athlete removed from roster'
    });

  } catch (error) {
    console.error('Remove Athlete Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove athlete',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
