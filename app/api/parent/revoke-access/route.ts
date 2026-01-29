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

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();
    const { childId, reason } = body;

    if (!childId) {
      return NextResponse.json({ error: 'Missing child ID' }, { status: 400 });
    }

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

    // Verify this parent has access to this child
    const { data: relationship } = await supabaseAdmin
      .from('parent_child_relationships')
      .select('id')
      .eq('parent_id', user.id)
      .eq('child_id', childId)
      .single();

    // Also check parent_consent_invites
    const { data: consentInvite } = await supabaseAdmin
      .from('parent_consent_invites')
      .select('id')
      .eq('parent_user_id', user.id)
      .eq('student_id', childId)
      .eq('status', 'approved')
      .single();

    if (!relationship && !consentInvite) {
      return NextResponse.json({ error: 'No access to this child' }, { status: 403 });
    }

    // Revoke consent - update the child's minor_status
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        minor_status: 'revoked',
        parent_approved_at: null,
        parent_approved_by: null
      })
      .eq('id', childId);

    if (updateError) {
      console.error('Error revoking access:', updateError);
      return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 });
    }

    // Update consent invite status if exists
    if (consentInvite) {
      await supabaseAdmin
        .from('parent_consent_invites')
        .update({
          status: 'revoked',
          response_notes: reason || 'Access revoked by parent'
        })
        .eq('id', consentInvite.id);
    }

    // Log the activity
    await supabaseAdmin
      .from('child_activity_log')
      .insert({
        child_id: childId,
        parent_id: user.id,
        activity_type: 'access_revoked',
        title: 'Platform Access Revoked',
        description: reason || 'Parent revoked platform access',
        metadata: { revoked_by: user.id, reason }
      });

    return NextResponse.json({
      success: true,
      message: 'Access has been revoked'
    });
  } catch (error) {
    console.error('Revoke access error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
