import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { checkAnonRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit';

// Server-side service role client (secure)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'chatnil-admin-api'
    }
  }
});
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    console.log('🚀 === API ROUTE: CREATE PROFILE ===');

    // ========================================
    // RATE LIMITING - Prevent spam signups
    // ========================================
    const rateLimitResult = await checkAnonRateLimit(RATE_LIMITS.AUTH_SIGNUP);
    if (!rateLimitResult.allowed) {
      console.warn('⚠️ Rate limit exceeded for create-profile');
      return rateLimitResponse(rateLimitResult);
    }

    const body = await request.json();
    const { userId, profileData } = body;

    console.log('📋 Profile creation request:', {
      userId,
      profileData: { ...profileData, email: profileData.email || '[hidden]' }
    });

    // Validate required fields
    if (!userId || !profileData) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing userId or profileData' },
        { status: 400 }
      );
    }

    // Verify the user exists in Supabase Auth
    console.log('🔍 Verifying user exists in auth...');
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser.user) {
      console.error('❌ User not found in auth:', authError?.message);
      return NextResponse.json(
        { error: 'User not found in authentication system' },
        { status: 404 }
      );
    }

    console.log('✅ User verified in auth system');

    // Check if profile already exists
    console.log('🔍 Checking if profile already exists...');
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Error checking existing profile:', checkError);
      return NextResponse.json(
        { error: 'Database error while checking existing profile' },
        { status: 500 }
      );
    }

    if (existingProfile) {
      console.log('⚠️ Profile already exists');
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 409 }
      );
    }

    // Create the profile with service role (bypasses RLS)
    console.log('💾 Creating profile with admin privileges...');
    const { data: createdProfile, error: createError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: userId,
        ...profileData,
        onboarding_completed: false // Explicitly set to false for new profiles
      }])
      .select()
      .single();

    if (createError) {
      console.error('💥 Failed to create profile:', createError);

      // Check for duplicate email error
      if (createError.code === '23505' && createError.message.includes('users_email_key')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: `Failed to create profile: ${createError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Profile created successfully:', createdProfile?.id);

    return NextResponse.json({
      success: true,
      profile: createdProfile
    });

  } catch (error: any) {
    console.error('💥 API Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}