import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🚀 === API ROUTE: GET PROFILE ===');

  try {
    const { userId } = await request.json();

    console.log('📋 Profile fetch request for userId:', userId);

    if (!userId) {
      console.log('❌ Missing userId');
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      console.log('❌ Service role client not available');
      return NextResponse.json(
        { error: 'Service role client not configured' },
        { status: 500 }
      );
    }

    console.log('🔍 Verifying user exists in auth...');
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser?.user) {
      console.log('❌ User verification failed:', authError);
      return NextResponse.json(
        { error: 'User not found or invalid' },
        { status: 404 }
      );
    }

    console.log('✅ User verified in auth system');

    console.log('🔍 Fetching user profile with admin privileges...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: profileError.message },
        { status: 500 }
      );
    }

    if (!profile) {
      console.log('⚠️ No profile found for user:', userId);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Fetch social media stats from athlete_public_profiles (primary source)
    console.log('🔍 Fetching social media stats...');
    const { data: publicProfileData } = await supabaseAdmin
      .from('athlete_public_profiles')
      .select(`
        instagram_followers, tiktok_followers, twitter_followers, youtube_subscribers,
        total_followers, avg_engagement_rate,
        instagram_handle, tiktok_handle, twitter_handle, youtube_channel,
        instagram_engagement_rate, tiktok_engagement_rate
      `)
      .eq('user_id', userId)
      .maybeSingle();

    // Build social_media_stats in the format the edit page expects
    if (publicProfileData) {
      const hasAnySocial = publicProfileData.instagram_followers || publicProfileData.tiktok_followers ||
                           publicProfileData.twitter_followers || publicProfileData.youtube_subscribers ||
                           publicProfileData.instagram_handle || publicProfileData.tiktok_handle ||
                           publicProfileData.twitter_handle || publicProfileData.youtube_channel;

      if (hasAnySocial) {
        profile.social_media_stats = {
          instagram: (publicProfileData.instagram_followers || publicProfileData.instagram_handle) ? {
            handle: publicProfileData.instagram_handle || '',
            followers: publicProfileData.instagram_followers || 0,
            engagement_rate: publicProfileData.instagram_engagement_rate || publicProfileData.avg_engagement_rate || 0,
          } : null,
          tiktok: (publicProfileData.tiktok_followers || publicProfileData.tiktok_handle) ? {
            handle: publicProfileData.tiktok_handle || '',
            followers: publicProfileData.tiktok_followers || 0,
            engagement_rate: publicProfileData.tiktok_engagement_rate || publicProfileData.avg_engagement_rate || 0,
          } : null,
          twitter: (publicProfileData.twitter_followers || publicProfileData.twitter_handle) ? {
            handle: publicProfileData.twitter_handle || '',
            followers: publicProfileData.twitter_followers || 0,
            engagement_rate: publicProfileData.avg_engagement_rate || 0,
          } : null,
          youtube: (publicProfileData.youtube_subscribers || publicProfileData.youtube_channel) ? {
            handle: publicProfileData.youtube_channel || '',
            subscribers: publicProfileData.youtube_subscribers || 0,
          } : null,
        };
        profile.total_followers = publicProfileData.total_followers;
        profile.avg_engagement_rate = publicProfileData.avg_engagement_rate;
      }
    }

    console.log('✅ Profile fetched successfully:', userId);
    console.log('🎯 onboarding_completed status:', profile.onboarding_completed);
    console.log('🏫 Phase 6B school fields:', {
      school_created: profile.school_created,
      profile_completion_tier: profile.profile_completion_tier,
      home_completion_required: profile.home_completion_required,
      school_id: profile.school_id,
      school_name: profile.school_name
    });
    console.log('📊 Profile data:', {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      onboarding_completed: profile.onboarding_completed
    });

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error: any) {
    console.error('💥 Profile fetch failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}