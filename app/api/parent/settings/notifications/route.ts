import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// GET - Fetch notification preferences
export async function GET() {
  try {
    const cookieStore = await cookies();

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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get notification preferences (global, no specific child)
    const { data: prefs, error } = await supabaseAdmin
      .from('parent_notification_preferences')
      .select('*')
      .eq('parent_id', user.id)
      .is('child_id', null)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching notification preferences:', error);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    // Return defaults if no preferences exist
    const defaults = {
      parent_id: user.id,
      weekly_digest: true,
      inactivity_alerts: true,
      milestone_notifications: true,
      deal_alerts: true,
      urgent_only: false,
      email_enabled: true,
      push_enabled: false,
      sms_enabled: false,
      quiet_hours_start: null,
      quiet_hours_end: null
    };

    return NextResponse.json({
      success: true,
      preferences: prefs || defaults
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();

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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a parent
    const { data: parentProfile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (parentProfile?.role !== 'parent') {
      return NextResponse.json({ error: 'Not a parent account' }, { status: 403 });
    }

    // Allowed fields to update
    const allowedFields = [
      'weekly_digest',
      'inactivity_alerts',
      'milestone_notifications',
      'deal_alerts',
      'urgent_only',
      'email_enabled',
      'push_enabled',
      'sms_enabled',
      'quiet_hours_start',
      'quiet_hours_end'
    ];

    // Filter body to only allowed fields
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Check if preferences exist for this parent (global, no specific child)
    const { data: existingPrefs } = await supabaseAdmin
      .from('parent_notification_preferences')
      .select('id')
      .eq('parent_id', user.id)
      .is('child_id', null)
      .single();

    let prefs;
    let error;

    if (existingPrefs) {
      // Update existing
      const result = await supabaseAdmin
        .from('parent_notification_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPrefs.id)
        .select()
        .single();
      prefs = result.data;
      error = result.error;
    } else {
      // Insert new
      const result = await supabaseAdmin
        .from('parent_notification_preferences')
        .insert({
          parent_id: user.id,
          child_id: null, // Global preferences
          ...updates
        })
        .select()
        .single();
      prefs = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error updating notification preferences:', error);
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      preferences: prefs
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
