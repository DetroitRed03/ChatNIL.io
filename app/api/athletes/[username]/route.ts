import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// All roles that represent athlete users
const ATHLETE_ROLES = ['athlete', 'college_athlete', 'hs_student'];

export const dynamic = 'force-dynamic';

// Use UNTYPED service role client to bypass RLS
// NOTE: Do NOT use Database type generic — it's incomplete and causes queries
// to tables not in the type definition (athlete_public_profiles, social_media_stats, etc.)
// to silently return null
// CRITICAL: Must disable Next.js fetch caching — supabase-js uses fetch internally
// and Next.js App Router caches all fetch() by default, causing stale reads after writes.
function getSupabaseAdmin() {
  return createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      fetch: (url: any, opts: any) => fetch(url, { ...opts, cache: 'no-store' as any }),
    }
  }
);
}

// Helper to detect if a string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const supabaseAdmin = getSupabaseAdmin();
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
        .in('role', ATHLETE_ROLES)
        .single();
      user = result.data;
      userError = result.error;
    } else {
      // Fetch by username
      const result = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('username', username)
        .in('role', ATHLETE_ROLES)
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

    // NOTE: supabase-js returns {data: null, error: null} for tables not in the Database type.
    // Tables NOT in type: athlete_fmv_data, nil_deals, user_trait_results, athlete_public_profiles.
    // All queries below use raw fetch to bypass this issue.
    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const restHeaders = {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Accept': 'application/json',
    };

    // Check if NIL is allowed in athlete's state (for portfolio visibility)
    // State may be on users table, athlete_profiles, or athlete_public_profiles
    const athleteState = profile.state || profile.primary_state || user.state;
    let stateNilAllowed = true; // Default: show portfolio
    if (user.role === 'hs_student' && athleteState && athleteState !== 'Unknown') {
      const nilRulesUrl = `${supabaseUrl}/rest/v1/state_nil_rules?state_code=eq.${athleteState}&select=high_school_allowed&limit=1`;
      const nilRulesRes = await fetch(nilRulesUrl, { headers: restHeaders, cache: 'no-store' });
      const nilRulesRows = nilRulesRes.ok ? await nilRulesRes.json() : [];
      if (Array.isArray(nilRulesRows) && nilRulesRows.length > 0) {
        stateNilAllowed = nilRulesRows[0].high_school_allowed === true;
      }
    }

    // Fetch FMV data if exists (via raw fetch)
    const fmvUrl = `${supabaseUrl}/rest/v1/athlete_fmv_data?athlete_id=eq.${profile.id}&select=fmv_score,fmv_tier,percentile_rank,is_public_score&order=updated_at.desc&limit=1`;
    const fmvRes = await fetch(fmvUrl, { headers: restHeaders, cache: 'no-store' });
    const fmvRows = fmvRes.ok ? await fmvRes.json() : [];
    const fmvData = Array.isArray(fmvRows) && fmvRows.length > 0 ? fmvRows[0] : null;

    // Count active NIL deals (only public ones) via raw fetch
    const dealsUrl = `${supabaseUrl}/rest/v1/nil_deals?athlete_id=eq.${profile.id}&status=in.(active,completed)&is_public=eq.true&select=id`;
    const dealsRes = await fetch(dealsUrl, { headers: restHeaders, cache: 'no-store' });
    const dealsRows = dealsRes.ok ? await dealsRes.json() : [];
    const activeDealsCount = Array.isArray(dealsRows) ? dealsRows.length : 0;

    // Fetch Core Traits / Brand Identity via raw fetch
    const traitsUrl = `${supabaseUrl}/rest/v1/user_trait_results?user_id=eq.${profile.id}&select=archetype_code,archetype_name,archetype_description,top_traits,trait_scores&limit=1`;
    const traitsRes = await fetch(traitsUrl, { headers: restHeaders, cache: 'no-store' });
    const traitRows = traitsRes.ok ? await traitsRes.json() : [];
    const traitResults = Array.isArray(traitRows) && traitRows.length > 0 ? traitRows[0] : null;

    // Build brand identity object if assessment completed
    const brandIdentity = traitResults ? {
      archetypeCode: traitResults.archetype_code,
      archetypeName: traitResults.archetype_name,
      archetypeDescription: traitResults.archetype_description,
      topTraits: traitResults.top_traits,
      traitScores: traitResults.trait_scores
    } : null;

    // Fetch athlete_public_profiles (social media + interest fields)
    const appUrl = `${supabaseUrl}/rest/v1/athlete_public_profiles?user_id=eq.${profile.id}&select=instagram_followers,tiktok_followers,twitter_followers,youtube_subscribers,total_followers,avg_engagement_rate,instagram_handle,tiktok_handle,twitter_handle,youtube_channel,instagram_engagement_rate,tiktok_engagement_rate,brand_values,content_categories,brand_preferences,nil_interests,nil_concerns,nil_goals,nil_preferences`;
    const appRes = await fetch(appUrl, { headers: restHeaders, cache: 'no-store' });
    const appRows = appRes.ok ? await appRes.json() : [];
    const publicProfileData = Array.isArray(appRows) && appRows.length > 0 ? appRows[0] : null;

    // Fallback: social_media_stats table (one row per platform) via raw fetch
    const smUrl = `${supabaseUrl}/rest/v1/social_media_stats?user_id=eq.${profile.id}&select=*`;
    const smRes = await fetch(smUrl, { headers: restHeaders, cache: 'no-store' });
    const socialMediaRows = smRes.ok ? await smRes.json() : [];

    // Build per-platform lookup from social_media_stats table rows
    const smByPlatform: Record<string, any> = {};
    if (socialMediaRows && socialMediaRows.length > 0) {
      for (const row of socialMediaRows) {
        smByPlatform[row.platform] = row;
      }
    }

    // Third fallback: users.social_media_stats JSONB (set during onboarding/profile save)
    const userSocialStats = profile.social_media_stats;
    // Could be object {instagram: {...}, tiktok: {...}} or array [{platform: 'instagram', ...}]
    let userSmByPlatform: Record<string, any> = {};
    if (userSocialStats) {
      if (Array.isArray(userSocialStats)) {
        for (const entry of userSocialStats) {
          if (entry.platform) userSmByPlatform[entry.platform] = entry;
        }
      } else if (typeof userSocialStats === 'object') {
        userSmByPlatform = userSocialStats;
      }
    }

    // Transform social media data into expected format
    // Priority: athlete_public_profiles > social_media_stats table > users.social_media_stats JSONB
    let socialMediaStats = null;
    let totalFollowers = null;
    let avgEngagementRate = null;

    const instagramFollowers = publicProfileData?.instagram_followers || smByPlatform.instagram?.followers || userSmByPlatform.instagram?.followers;
    const tiktokFollowers = publicProfileData?.tiktok_followers || smByPlatform.tiktok?.followers || userSmByPlatform.tiktok?.followers;
    const twitterFollowers = publicProfileData?.twitter_followers || smByPlatform.twitter?.followers || userSmByPlatform.twitter?.followers;
    const youtubeSubscribers = publicProfileData?.youtube_subscribers || smByPlatform.youtube?.followers || smByPlatform.youtube?.subscribers || userSmByPlatform.youtube?.subscribers || userSmByPlatform.youtube?.followers;
    const engagementRate = publicProfileData?.avg_engagement_rate || smByPlatform.instagram?.engagement_rate || userSmByPlatform.instagram?.engagement_rate;

    const instagramHandle = publicProfileData?.instagram_handle || smByPlatform.instagram?.handle || userSmByPlatform.instagram?.handle;
    const tiktokHandle = publicProfileData?.tiktok_handle || smByPlatform.tiktok?.handle || userSmByPlatform.tiktok?.handle;
    const twitterHandle = publicProfileData?.twitter_handle || smByPlatform.twitter?.handle || userSmByPlatform.twitter?.handle;
    const youtubeChannel = publicProfileData?.youtube_channel || smByPlatform.youtube?.handle || userSmByPlatform.youtube?.handle;

    if (instagramFollowers || tiktokFollowers || twitterFollowers || youtubeSubscribers) {
      socialMediaStats = {
        instagram: instagramFollowers ? {
          handle: instagramHandle || null,
          followers: instagramFollowers,
          engagement_rate: publicProfileData?.instagram_engagement_rate || smByPlatform.instagram?.engagement_rate || userSmByPlatform.instagram?.engagement_rate || 0
        } : null,
        tiktok: tiktokFollowers ? {
          handle: tiktokHandle || null,
          followers: tiktokFollowers,
          engagement_rate: publicProfileData?.tiktok_engagement_rate || smByPlatform.tiktok?.engagement_rate || userSmByPlatform.tiktok?.engagement_rate || 0
        } : null,
        twitter: twitterFollowers ? {
          handle: twitterHandle || null,
          followers: twitterFollowers,
          engagement_rate: smByPlatform.twitter?.engagement_rate || userSmByPlatform.twitter?.engagement_rate || 0
        } : null,
        youtube: youtubeSubscribers ? {
          handle: youtubeChannel || null,
          subscribers: youtubeSubscribers,
          engagement_rate: smByPlatform.youtube?.engagement_rate || userSmByPlatform.youtube?.engagement_rate || 0
        } : null
      };

      // Calculate total_followers from best available source
      totalFollowers = publicProfileData?.total_followers
        || (instagramFollowers || 0) + (tiktokFollowers || 0) + (twitterFollowers || 0) + (youtubeSubscribers || 0);
      avgEngagementRate = engagementRate || 0;
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
      gpa: profile.gpa,

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

      // NIL info — sourced from athlete_public_profiles JSONB columns (users table columns don't exist)
      nil_interests: publicProfileData?.nil_interests || profile.nil_interests || null,
      nil_goals: publicProfileData?.nil_goals || profile.nil_goals || null,
      nil_concerns: publicProfileData?.nil_concerns || profile.nil_concerns || null,
      nil_preferences: (publicProfileData?.nil_preferences && Object.keys(publicProfileData.nil_preferences).length > 0)
        ? publicProfileData.nil_preferences : profile.nil_preferences || null,
      brand_affinity: publicProfileData?.brand_values || profile.brand_affinity || null,
      brand_values: publicProfileData?.brand_values || profile.brand_values || null,
      content_creation_interests: publicProfileData?.content_categories || profile.content_creation_interests || null,
      lifestyle_interests: publicProfileData?.brand_preferences?.lifestyle_interests || profile.lifestyle_interests || null,
      causes_care_about: publicProfileData?.brand_preferences?.causes_care_about || profile.causes_care_about || null,
      hobbies: publicProfileData?.brand_preferences?.hobbies || profile.hobbies || null,

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

      // Brand Identity (Core Traits Assessment results)
      brandIdentity,

      // Role info (for HS-specific rendering)
      role: profile.role,
      school_level: profile.school_level,
      parent_contact_enabled: profile.role === 'hs_student',
      highlight_video_url: profile.profile_video_url,
      state_nil_allowed: stateNilAllowed,

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
