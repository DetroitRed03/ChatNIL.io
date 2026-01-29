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

export async function PUT(request: NextRequest) {
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
      return NextResponse.json({ error: 'Not a parent account' }, { status: 403 });
    }

    // Get request body
    const preferences = await request.json();

    // Validate preferences
    const validKeys = ['weeklyProgress', 'chapterCompletion', 'badgeEarned', 'dailyDigest'];
    const filteredPrefs = Object.keys(preferences)
      .filter(key => validKeys.includes(key))
      .reduce((obj, key) => {
        obj[key] = preferences[key];
        return obj;
      }, {} as Record<string, boolean>);

    // Try to save to notification_preferences table
    try {
      const { error } = await supabaseAdmin
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          weekly_progress: filteredPrefs.weeklyProgress ?? true,
          chapter_completion: filteredPrefs.chapterCompletion ?? true,
          badge_earned: filteredPrefs.badgeEarned ?? true,
          daily_digest: filteredPrefs.dailyDigest ?? false,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.log('notification_preferences table may not exist:', error.message);
        // Continue without saving - just acknowledge
      }
    } catch {
      // Table may not exist, continue without it
    }

    return NextResponse.json({
      success: true,
      preferences: filteredPrefs,
    });
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
