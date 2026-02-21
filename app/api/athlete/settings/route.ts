/**
 * Athlete Settings API
 * GET: Fetch athlete settings (works for both HS students and college athletes)
 * PUT: Update athlete settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { defaultAthleteSettings, AthleteSettings } from '@/types/settings';
import { isAthleteRole } from '@/types/common';

export const dynamic = 'force-dynamic';

// Create Supabase client with service role for RLS bypass
// CRITICAL: Must disable Next.js fetch caching — supabase-js uses fetch internally
// and Next.js App Router caches all fetch() by default, causing stale reads after writes.
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify user is an athlete
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!isAthleteRole(userData?.role || '')) {
      return NextResponse.json({ error: 'Not an athlete' }, { status: 403 });
    }

    // Get athlete settings
    const { data: settings, error: settingsError } = await supabase
      .from('athlete_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching athlete settings:', settingsError);
      return NextResponse.json({ error: settingsError.message }, { status: 500 });
    }

    // Return settings or defaults
    return NextResponse.json({
      settings: settings || {
        user_id: userId,
        ...defaultAthleteSettings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      userRole: userData?.role
    });
  } catch (error) {
    console.error('Error in GET /api/athlete/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify user is an athlete
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!isAthleteRole(userData?.role || '')) {
      return NextResponse.json({ error: 'Not an athlete' }, { status: 403 });
    }

    // Remove fields that shouldn't be updated directly
    const { id, user_id, userId: _, created_at, ...updateData } = body;

    // For HS students, enforce certain restrictions
    if (userData?.role === 'hs_student') {
      // HS students cannot make their profile public
      if (updateData.profile_visibility === 'public') {
        updateData.profile_visibility = 'school_only';
      }
      // HS students cannot allow brand contact
      updateData.allow_brand_contact = false;
    }

    const { data, error } = await supabase
      .from('athlete_settings')
      .upsert(
        {
          user_id: userId,
          ...updateData,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating athlete settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    console.error('Error in PUT /api/athlete/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
