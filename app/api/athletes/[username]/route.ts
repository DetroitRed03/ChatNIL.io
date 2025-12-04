import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

// Use service role client to bypass RLS
const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper to detect if a string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({ error: 'username or id is required' }, { status: 400 });
    }

    console.log('🔍 GET /api/athletes/[username] - Identifier:', username);

    let user: any;
    let userError: any;

    // Check if this looks like a UUID (user ID) vs a username
    if (isUUID(username)) {
      // Fetch by ID
      const result = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', username)
        .eq('role', 'athlete')
        .single();
      user = result.data;
      userError = result.error;
    } else {
      // Fetch by username
      const result = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('role', 'athlete')
        .single();
      user = result.data;
      userError = result.error;
    }

    if (userError) {
      if (userError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
      }
      console.error('❌ Error fetching user:', userError);
      return NextResponse.json({ error: 'Failed to fetch athlete' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
    }

    // Fetch athlete profile data from athlete_profiles table
    const { data: athleteProfile, error: athleteError } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (athleteError) {
      console.error('⚠️  Error fetching athlete profile:', athleteError);
      // Don't fail if athlete profile doesn't exist - just continue with user data
    }

    // Merge user data with athlete profile data
    const profile = {
      ...user,
      ...(athleteProfile || {}),
      // Ensure user id is preserved
      id: user.id,
    };

    // Fetch FMV data if exists
    const { data: fmvData } = await supabaseAdmin
      .from('athlete_fmv_data')
      .select('fmv_score, fmv_tier, percentile_rank, is_public_score')
      .eq('athlete_id', profile.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle() as { data: any };

    // Count active NIL deals (only public ones)
    const { count: activeDealsCount } = await supabaseAdmin
      .from('nil_deals')
      .select('*', { count: 'exact', head: true })
      .eq('athlete_id', profile.id)
      .in('status', ['active', 'completed'])
      .eq('is_public', true);

    // Fetch social media stats from athlete_public_profiles (primary source, more complete data)
    // Include handles in the query
    const { data: publicProfileData } = await supabaseAdmin
      .from('athlete_public_profiles')
      .select(`
        instagram_followers, tiktok_followers, twitter_followers, youtube_subscribers,
        total_followers, avg_engagement_rate,
        instagram_handle, tiktok_handle, twitter_handle, youtube_channel,
        instagram_engagement_rate, tiktok_engagement_rate
      `)
      .eq('user_id', profile.id)
      .maybeSingle();

    // Fallback to social_media_stats table if athlete_public_profiles doesn't have data
    const { data: socialMediaData } = await supabaseAdmin
      .from('social_media_stats')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle() as { data: any };

    // Transform social media data into expected format
    // Prefer athlete_public_profiles data over social_media_stats
    let socialMediaStats = null;
    let totalFollowers = null;
    let avgEngagementRate = null;

    // Use publicProfileData as primary source, fall back to socialMediaData
    const instagramFollowers = publicProfileData?.instagram_followers || socialMediaData?.instagram_followers;
    const tiktokFollowers = publicProfileData?.tiktok_followers || socialMediaData?.tiktok_followers;
    const twitterFollowers = publicProfileData?.twitter_followers || socialMediaData?.twitter_followers;
    const youtubeSubscribers = publicProfileData?.youtube_subscribers || socialMediaData?.youtube_subscribers;
    const engagementRate = publicProfileData?.avg_engagement_rate || socialMediaData?.engagement_rate;

    // Get handles from athlete_public_profiles
    const instagramHandle = publicProfileData?.instagram_handle;
    const tiktokHandle = publicProfileData?.tiktok_handle;
    const twitterHandle = publicProfileData?.twitter_handle;
    const youtubeChannel = publicProfileData?.youtube_channel;

    if (instagramFollowers || tiktokFollowers || twitterFollowers || youtubeSubscribers) {
      socialMediaStats = {
        instagram: instagramFollowers ? {
          handle: instagramHandle || null,
          followers: instagramFollowers,
          engagement_rate: publicProfileData?.instagram_engagement_rate || engagementRate || 4.2
        } : null,
        tiktok: tiktokFollowers ? {
          handle: tiktokHandle || null,
          followers: tiktokFollowers,
          engagement_rate: publicProfileData?.tiktok_engagement_rate || (engagementRate ? engagementRate + 2.1 : 6.8)
        } : null,
        twitter: twitterFollowers ? {
          handle: twitterHandle || null,
          followers: twitterFollowers,
          engagement_rate: engagementRate ? engagementRate - 1.6 : 3.1
        } : null,
        youtube: youtubeSubscribers ? {
          handle: youtubeChannel || null,
          subscribers: youtubeSubscribers,
          engagement_rate: engagementRate || 3.5
        } : null
      };

      totalFollowers = publicProfileData?.total_followers || socialMediaData?.total_followers;
      avgEngagementRate = engagementRate;
    }

    // Remove sensitive fields before returning public profile
    const publicProfile = {
      id: profile.id,
      username: profile.username,
      first_name: profile.first_name,
      last_name: profile.last_name,
      bio: profile.bio,
      profile_photo_url: profile.profile_photo_url,
      cover_photo_url: profile.cover_photo_url,

      // School info
      school_name: profile.school_name,
      graduation_year: profile.graduation_year,
      major: profile.major,

      // Athletic info
      primary_sport: profile.primary_sport || profile.sport, // Support both field names
      position: profile.position,
      secondary_sports: profile.secondary_sports,
      achievements: profile.achievements,
      team_name: profile.team_name,
      division: profile.division,
      coach_name: profile.coach_name,
      coach_email: profile.coach_email,

      // Physical stats
      height_inches: profile.height_inches,
      weight_lbs: profile.weight_lbs,
      jersey_number: profile.jersey_number,

      // Social media (from social_media_stats table)
      social_media_handles: profile.social_media_handles,
      social_media_stats: socialMediaStats,
      total_followers: totalFollowers,
      avg_engagement_rate: avgEngagementRate,

      // NIL info
      nil_interests: profile.nil_interests,
      nil_goals: profile.nil_goals,
      nil_concerns: profile.nil_concerns,
      nil_preferences: profile.nil_preferences,
      brand_affinity: profile.brand_affinity,
      brand_values: profile.brand_values,
      content_creation_interests: profile.content_creation_interests,
      lifestyle_interests: profile.lifestyle_interests,
      causes_care_about: profile.causes_care_about,
      hobbies: profile.hobbies,

      // Portfolio
      content_samples: profile.content_samples,
      profile_video_url: profile.profile_video_url,

      // Metrics
      profile_completion_score: profile.profile_completion_score,

      // FMV data (only if public)
      fmv_score: fmvData?.is_public_score ? fmvData.fmv_score : null,
      fmv_tier: fmvData?.is_public_score ? fmvData.fmv_tier : null,
      percentile_rank: fmvData?.is_public_score ? fmvData.percentile_rank : null,

      // NIL deals count
      active_deals_count: activeDealsCount || 0,

      // Timestamps
      created_at: profile.created_at
    };

    console.log('✅ Public athlete profile fetched successfully');
    return NextResponse.json({ profile: publicProfile });
  } catch (error: any) {
    console.error('💥 Athlete profile API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
