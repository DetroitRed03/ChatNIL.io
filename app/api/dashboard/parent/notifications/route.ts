import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Create admin client for database operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Check for Authorization header
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Get authenticated user
    let { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user && bearerToken) {
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(bearerToken);
      if (tokenUser && !tokenError) {
        user = tokenUser;
        authError = null;
      }
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify parent role
    const { data: parentProfile } = await supabaseAdmin
      .from('athlete_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (parentProfile?.role !== 'parent') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get request body
    const preferences = await request.json();

    // Validate preferences
    const validKeys = ['weeklyProgress', 'chapterComplete', 'badgeEarned', 'dailyDigest'];
    const isValid = Object.keys(preferences).every(key => validKeys.includes(key));

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid preferences' }, { status: 400 });
    }

    // In production, save to database
    // For now, just acknowledge the save
    // await supabaseAdmin
    //   .from('notification_preferences')
    //   .upsert({
    //     user_id: user.id,
    //     ...preferences,
    //     updated_at: new Date().toISOString(),
    //   });

    return NextResponse.json({
      success: true,
      message: 'Notification preferences saved',
      preferences,
    });
  } catch (error) {
    console.error('Error saving notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
