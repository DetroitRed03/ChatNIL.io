import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { splitProfileUpdates, mergeProfileData } from '@/lib/profile-field-mapper';

// Use service role client to bypass RLS
// Note: Using untyped client because some tables aren't in Database types
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    console.log('📋 GET /api/profile - User ID:', userId);

    // Fetch user data from users table
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('❌ Error fetching user:', userError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch athlete profile data from athlete_profiles table
    const { data: athleteProfile, error: athleteError } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (athleteError) {
      console.error('⚠️  Error fetching athlete profile:', athleteError);
      // Don't fail if athlete profile doesn't exist - just continue with user data
    }

    // Fetch social media stats from social_media_stats table
    const { data: socialStats, error: socialError } = await supabaseAdmin
      .from('social_media_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle() as { data: any; error: any };

    if (socialError) {
      console.log('⚠️  No social media stats found (non-critical)');
    }

    // Merge user data with athlete profile data
    let profile = mergeProfileData(user, athleteProfile);

    // Add social media stats if available
    if (socialStats) {
      // Convert database format to app format (object with platform keys, not array)
      profile.social_media_stats = {};

      if (socialStats.instagram_followers) {
        profile.social_media_stats.instagram = {
          followers: socialStats.instagram_followers,
          engagement_rate: socialStats.engagement_rate || 0,
          handle: '' // TODO: Store handles in database
        };
      }

      if (socialStats.tiktok_followers) {
        profile.social_media_stats.tiktok = {
          followers: socialStats.tiktok_followers,
          engagement_rate: socialStats.engagement_rate || 0,
          handle: ''
        };
      }

      if (socialStats.twitter_followers) {
        profile.social_media_stats.twitter = {
          followers: socialStats.twitter_followers,
          engagement_rate: socialStats.engagement_rate || 0,
          handle: ''
        };
      }

      if (socialStats.youtube_subscribers) {
        profile.social_media_stats.youtube = {
          subscribers: socialStats.youtube_subscribers,
          handle: ''
        };
      }

      profile.total_followers = socialStats.total_followers;
      profile.avg_engagement_rate = socialStats.engagement_rate;
    }

    console.log('✅ Profile fetched successfully', athleteProfile ? '(with athlete data)' : '(user data only)');
    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('💥 Profile API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'updates object is required' }, { status: 400 });
    }

    console.log('📝 PUT /api/profile - User ID:', userId);
    console.log('📊 Updates:', Object.keys(updates));

    // Split updates between users and athlete_profiles tables using shared utility
    const { usersUpdates, athleteUpdates, unmapped } = splitProfileUpdates(updates);

    if (unmapped.length > 0) {
      console.log('⚠️  Unmapped fields (skipping):', unmapped);
    }

    // Update users table if there are changes
    if (Object.keys(usersUpdates).length > 0) {
      console.log('📝 Updating users table:', Object.keys(usersUpdates));
      const { error: usersError } = await supabaseAdmin
        .from('users')
        .update({
          ...usersUpdates,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', userId);

      if (usersError) {
        console.error('❌ Error updating users table:', usersError);
        return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
      }
    }

    // Update athlete_profiles table if there are changes
    if (Object.keys(athleteUpdates).length > 0) {
      console.log('📝 Updating athlete_profiles table:', Object.keys(athleteUpdates));
      const { error: athleteError } = await supabaseAdmin
        .from('athlete_profiles')
        .update({
          ...athleteUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (athleteError) {
        console.error('❌ Error updating athlete_profiles table:', athleteError);
        return NextResponse.json({ error: 'Failed to update athlete profile' }, { status: 500 });
      }
    }

    // Fetch the updated complete profile
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: athleteProfile } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const completeProfile = mergeProfileData(user, athleteProfile);

    console.log('✅ Profile updated successfully');
    return NextResponse.json({ profile: completeProfile });
  } catch (error: any) {
    console.error('💥 Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
