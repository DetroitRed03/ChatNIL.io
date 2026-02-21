import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Server-side service role client (secure)
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
        headers: {
          'X-Client-Info': 'chatnil-profile-api'
        },
        fetch: (url: any, opts: any) => fetch(url, { ...opts, cache: 'no-store' as any }),
      }
    }
  );
}

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
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

    // Get the user profile with service role privileges - Query BOTH tables
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      // If profile doesn't exist, that's a valid state (means user needs onboarding)
      if (userError.code === 'PGRST116') {
        console.log('⚠️ Profile not found (user needs onboarding)');
        return NextResponse.json({
          profile: null,
          exists: false
        });
      }

      console.error('❌ Error fetching user:', userError);
      return NextResponse.json(
        { error: `Failed to fetch user: ${userError.message}` },
        { status: 500 }
      );
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

    // Merge user data with athlete profile data
    const profile = {
      ...user,
      ...athleteProfile,
      // Ensure user id is preserved
      id: user.id,
    };

    console.log('✅ Profile fetched for onboarding check:', {
      userId: profile.id,
      onboarding_completed: profile.onboarding_completed,
      role: profile.role,
      hasAthleteData: !!athleteProfile
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