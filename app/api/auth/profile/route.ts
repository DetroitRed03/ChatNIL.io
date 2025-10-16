import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Server-side service role client (secure)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'chatnil-profile-api'
    }
  }
});

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 === API ROUTE: GET PROFILE (MINIMAL) ===');
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('📋 Profile fetch request:', { userId });

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Verify the user exists in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: 'User not found in authentication system' },
        { status: 404 }
      );
    }

    // Get the user profile with service role privileges
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, onboarding_completed, onboarding_completed_at, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (profileError) {
      // If profile doesn't exist, that's a valid state (means user needs onboarding)
      if (profileError.code === 'PGRST116') {
        console.log('⚠️ Profile not found (user needs onboarding)');
        return NextResponse.json({
          profile: null,
          exists: false
        });
      }

      console.error('❌ Error fetching profile:', profileError);
      return NextResponse.json(
        { error: `Failed to fetch profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Profile fetched for onboarding check:', {
      userId: profile.id,
      onboarding_completed: profile.onboarding_completed,
      role: profile.role
    });

    return NextResponse.json({
      profile,
      exists: true
    });

  } catch (error: any) {
    console.error('💥 Profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}