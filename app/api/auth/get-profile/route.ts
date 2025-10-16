import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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

    console.log('✅ Profile fetched successfully:', userId);
    console.log('🎯 onboarding_completed status:', profile.onboarding_completed);
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