/**
 * Compliance Officer Settings API
 * GET: Fetch compliance settings and institution info
 * PUT: Update compliance settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { defaultComplianceSettings, ComplianceSettings } from '@/types/settings';

export const dynamic = 'force-dynamic';

// Create Supabase client with service role for RLS bypass
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
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

    // Verify user is a compliance officer
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'compliance_officer') {
      return NextResponse.json({ error: 'Not a compliance officer' }, { status: 403 });
    }

    // Get compliance settings
    const { data: settings, error: settingsError } = await supabase
      .from('compliance_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching compliance settings:', settingsError);
      return NextResponse.json({ error: settingsError.message }, { status: 500 });
    }

    // Get institution info if linked
    let institution = null;
    let institutionId = settings?.institution_id;

    // Fall back to institution_staff table if compliance_settings doesn't have institution_id
    if (!institutionId) {
      const { data: staffRecord } = await supabase
        .from('institution_staff')
        .select('institution_id')
        .eq('user_id', user.id)
        .single();
      if (staffRecord?.institution_id) {
        institutionId = staffRecord.institution_id;
      }
    }

    if (institutionId) {
      const { data: institutionData } = await supabase
        .from('institutions')
        .select('id, name, type, state, conference')
        .eq('id', institutionId)
        .single();
      institution = institutionData;
    }

    // Return settings or defaults
    return NextResponse.json({
      settings: settings || {
        user_id: user.id,
        ...defaultComplianceSettings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      institution
    });
  } catch (error) {
    console.error('Error in GET /api/compliance/settings:', error);
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

    // Verify user is a compliance officer
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'compliance_officer') {
      return NextResponse.json({ error: 'Not a compliance officer' }, { status: 403 });
    }

    // Remove fields that shouldn't be updated directly
    const { id, user_id, created_at, ...updateData } = body;

    const { data, error } = await supabase
      .from('compliance_settings')
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
      console.error('Error updating compliance settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    console.error('Error in PUT /api/compliance/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
