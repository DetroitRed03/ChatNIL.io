/**
 * POST /api/profile/visibility
 *
 * Toggle profile visibility (public/private).
 * Validates profile completeness before allowing public.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { checkProfileVisibility } from '@/lib/profile/visibility';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    let { data: { user } } = await supabase.auth.getUser();
    if (!user && bearerToken) {
      const { data: { user: tokenUser } } = await supabase.auth.getUser(bearerToken);
      if (tokenUser) user = tokenUser;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isPublic } = await request.json();

    // Get current profile
    const { data: profile } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get user data for photo/bio fields that may be on users table
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('avatar_url, bio')
      .eq('id', user.id)
      .single();

    // If trying to go public, check requirements
    if (isPublic) {
      const visibility = checkProfileVisibility({
        avatar_url: userData?.avatar_url || profile.avatar_url,
        profile_photo_url: profile.profile_photo_url,
        bio: userData?.bio || profile.bio,
        sport: profile.sport,
        primary_sport: profile.primary_sport,
        school: profile.school,
        school_name: profile.school_name,
        social_media_stats: profile.social_media_stats,
        is_public: profile.is_public,
        role: profile.role,
        parent_consent_given: profile.parent_consent_given,
      });

      if (!visibility.canBePublic) {
        return NextResponse.json({
          error: 'Profile incomplete',
          missingRequirements: visibility.missingRequirements,
        }, { status: 400 });
      }
    }

    // Update visibility
    const { error: updateError } = await supabaseAdmin
      .from('athlete_profiles')
      .update({ is_public: isPublic })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Profile visibility update error:', updateError);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true, isPublic });
  } catch (error) {
    console.error('Profile visibility error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
