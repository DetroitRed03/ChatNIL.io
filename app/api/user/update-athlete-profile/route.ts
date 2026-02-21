import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { splitProfileUpdates, ensureAthleteProfile } from '@/lib/profile-field-mapper';

export const dynamic = 'force-dynamic';

/**
 * POST /api/user/update-athlete-profile
 * Update athlete profile with Migration 016 enhanced fields
 *
 * Body:
 * - hobbies: string[]
 * - content_creation_interests: string[]
 * - brand_affinity: string[]
 * - lifestyle_interests: string[]
 * - causes_care_about: string[]
 * - social_media_stats: object
 * - nil_preferences: object
 * - bio: string
 * - profile_video_url: string
 * - content_samples: array
 * - complete_home_profile: boolean (marks home completion for school-created accounts)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is an athlete
    const { data: currentProfile, error: profileError } = await supabase
      .from('users')
      .select('role, school_created, home_completion_required')
      .eq('id', user.id)
      .single();

    if (profileError || !currentProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const athleteRoles = ['athlete', 'college_athlete', 'hs_student'];
    if (!athleteRoles.includes(currentProfile.role)) {
      return NextResponse.json(
        { error: 'This endpoint is only available for athletes' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Use service role client to ensure update succeeds
    const serviceClient = createServiceRoleClient();

    // Ensure athlete profile exists
    const { success: profileExists, error: ensureError } = await ensureAthleteProfile(serviceClient, user.id);
    if (!profileExists) {
      console.error('Failed to ensure athlete profile exists:', ensureError);
      return NextResponse.json(
        { error: 'Failed to initialize athlete profile' },
        { status: 500 }
      );
    }

    console.log('📝 Updating athlete profile for user:', user.id);
    console.log('📊 Update fields:', Object.keys(body));

    // Split updates between users and athlete_profiles tables
    const { usersUpdates, athleteUpdates, unmapped } = splitProfileUpdates(body);

    if (unmapped.length > 0) {
      console.warn('⚠️ Unmapped fields (skipping):', unmapped);
    }

    // Mark home completion if coming from school-created account
    if (body.complete_home_profile === true && currentProfile.home_completion_required) {
      usersUpdates.profile_completion_tier = 'full';
      usersUpdates.home_completed_at = new Date().toISOString();
      usersUpdates.home_completion_required = false;
      usersUpdates.onboarding_completed = true;
      usersUpdates.onboarding_completed_at = new Date().toISOString();
    }

    // Update users table if there are changes
    if (Object.keys(usersUpdates).length > 0) {
      console.log('📝 Updating users table:', Object.keys(usersUpdates));
      const { error: usersError } = await serviceClient
        .from('users')
        .update({
          ...usersUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (usersError) {
        console.error('❌ Error updating users table:', usersError);
        return NextResponse.json(
          { error: 'Failed to update user data', details: usersError.message },
          { status: 500 }
        );
      }
    }

    // Update athlete_profiles table if there are changes
    if (Object.keys(athleteUpdates).length > 0) {
      console.log('📝 Updating athlete_profiles table:', Object.keys(athleteUpdates));
      const { error: athleteError } = await serviceClient
        .from('athlete_profiles')
        .update({
          ...athleteUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (athleteError) {
        console.error('❌ Error updating athlete_profiles table:', athleteError);
        return NextResponse.json(
          { error: 'Failed to update athlete profile', details: athleteError.message },
          { status: 500 }
        );
      }
    }

    // Handle social media stats — write to athlete_public_profiles + users tables
    if (body.social_media_stats && typeof body.social_media_stats === 'object') {
      const sm = body.social_media_stats;

      const socialColumns: Record<string, any> = {
        instagram_handle: sm.instagram?.handle || null,
        instagram_followers: sm.instagram?.followers || 0,
        instagram_engagement_rate: sm.instagram?.engagement_rate || null,
        tiktok_handle: sm.tiktok?.handle || null,
        tiktok_followers: sm.tiktok?.followers || 0,
        tiktok_engagement_rate: sm.tiktok?.engagement_rate || null,
        twitter_handle: sm.twitter?.handle || null,
        twitter_followers: sm.twitter?.followers || 0,
        youtube_channel: sm.youtube?.handle || null,
        youtube_subscribers: sm.youtube?.subscribers || 0,
        // NOTE: total_followers is a GENERATED ALWAYS column — auto-calculated from individual platform followers
        updated_at: new Date().toISOString(),
      };

      // Calculate avg engagement rate
      const engRates = [
        sm.instagram?.engagement_rate,
        sm.tiktok?.engagement_rate,
        sm.twitter?.engagement_rate,
      ].filter((r): r is number => typeof r === 'number' && r > 0);
      if (engRates.length > 0) {
        socialColumns.avg_engagement_rate = +(engRates.reduce((a, b) => a + b, 0) / engRates.length).toFixed(2);
      }

      // Try update, then insert if no row exists
      const { data: updated } = await serviceClient
        .from('athlete_public_profiles')
        .update(socialColumns)
        .eq('user_id', user.id)
        .select('id');

      if (!updated || updated.length === 0) {
        const { data: userData } = await serviceClient.from('users').select('first_name, last_name, username, school_name, state, role, school_level').eq('id', user.id).single();
        await serviceClient.from('athlete_public_profiles').insert({
          user_id: user.id,
          display_name: `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || userData?.username || 'Athlete',
          sport: body.primary_sport || 'Not set',
          school_name: userData?.school_name || 'Not set',
          school_level: userData?.school_level || (userData?.role === 'hs_student' ? 'high_school' : 'college'),
          state: userData?.state || 'Unknown',
          ...socialColumns,
        });
      }

      // Also write to users.social_media_stats (trigger calculates total_followers etc.)
      const socialStatsArray: any[] = [];
      if (sm.instagram?.handle || sm.instagram?.followers) {
        socialStatsArray.push({ platform: 'instagram', handle: sm.instagram.handle || '', followers: sm.instagram.followers || 0, engagement_rate: sm.instagram.engagement_rate || 0 });
      }
      if (sm.tiktok?.handle || sm.tiktok?.followers) {
        socialStatsArray.push({ platform: 'tiktok', handle: sm.tiktok.handle || '', followers: sm.tiktok.followers || 0, engagement_rate: sm.tiktok.engagement_rate || 0 });
      }
      if (sm.twitter?.handle || sm.twitter?.followers) {
        socialStatsArray.push({ platform: 'twitter', handle: sm.twitter.handle || '', followers: sm.twitter.followers || 0, engagement_rate: sm.twitter.engagement_rate || 0 });
      }

      await serviceClient.from('users').update({ social_media_stats: socialStatsArray, updated_at: new Date().toISOString() }).eq('id', user.id);
      console.log('📱 Social media saved to athlete_public_profiles + users');
    }

    // Fetch updated complete profile
    const { data: updatedUser } = await serviceClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: athleteProfile } = await serviceClient
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const completeProfile = {
      ...updatedUser,
      ...athleteProfile,
      id: updatedUser.id,
    };

    // Calculate profile completion percentage
    const completionPercentage = calculateProfileCompletion(completeProfile);

    console.log('✅ Athlete profile updated successfully');

    return NextResponse.json({
      success: true,
      user: completeProfile,
      profile_completion: completionPercentage,
      message: 'Athlete profile updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/user/update-athlete-profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate profile completion percentage for athletes
 */
function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0;

  const fields = [
    // Basic info
    { name: 'first_name', weight: 2 },
    { name: 'last_name', weight: 2 },
    { name: 'email', weight: 1 },
    { name: 'date_of_birth', weight: 1 },
    { name: 'phone', weight: 1 },

    // School info
    { name: 'school_name', weight: 2 },
    { name: 'graduation_year', weight: 2 },
    { name: 'major', weight: 1 },

    // Sports info
    { name: 'primary_sport', weight: 3 },
    { name: 'position', weight: 1 },
    { name: 'achievements', weight: 2 },

    // NIL info
    { name: 'hobbies', weight: 2 },
    { name: 'social_media_stats', weight: 3 },
    { name: 'social_media_handles', weight: 2 },
    { name: 'nil_preferences', weight: 2 },
    { name: 'content_samples', weight: 2 },
    { name: 'bio', weight: 2 },

    // Enhanced fields
    { name: 'content_creation_interests', weight: 1 },
    { name: 'brand_affinity', weight: 1 },
    { name: 'lifestyle_interests', weight: 1 },
  ];

  let totalWeight = 0;
  let completedWeight = 0;

  for (const field of fields) {
    totalWeight += field.weight;

    const value = profile[field.name];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        if (value.length > 0) completedWeight += field.weight;
      } else if (typeof value === 'object') {
        if (Object.keys(value).length > 0) completedWeight += field.weight;
      } else if (typeof value === 'string') {
        if (value.trim().length > 0) completedWeight += field.weight;
      } else {
        completedWeight += field.weight;
      }
    }
  }

  return Math.round((completedWeight / totalWeight) * 100);
}
