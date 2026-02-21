/**
 * Universal User Settings API
 * GET: Fetch user settings
 * PUT: Update user settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { defaultUserSettings, UserSettings } from '@/types/settings';

export const dynamic = 'force-dynamic';

// Create Supabase client with service role for RLS bypass
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
      global: {
        fetch: (url: any, opts: any) => fetch(url, { ...opts, cache: 'no-store' as any }),
      },
    }
  );
}

// Get authenticated user from cookies (async version for Next.js 14)
async function getAuthenticatedUser(request: NextRequest) {
  const cookieStore = await cookies();

  // Check for Authorization header first
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

  // Try getting user from session first
  let { data: { user }, error } = await supabase.auth.getUser();

  // If no user from session, try bearer token
  if (!user && bearerToken) {
    const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(bearerToken);
    if (tokenUser && !tokenError) {
      user = tokenUser;
    }
  }

  return user || null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is OK
      console.error('Error fetching user settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return settings or defaults
    return NextResponse.json({
      settings: settings || {
        user_id: user.id,
        ...defaultUserSettings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = getSupabaseAdmin();

    // Remove fields that shouldn't be updated directly
    const { id, user_id, created_at, ...updateData } = body;

    const { data, error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          ...updateData,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating user settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    console.error('Error in PUT /api/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
