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
      return NextResponse.json({ error: 'Not a parent account' }, { status: 403 });
    }

    // Get request body
    const { childId, action } = await request.json();

    if (!childId || !action) {
      return NextResponse.json({ error: 'Missing childId or action' }, { status: 400 });
    }

    if (!['approve', 'deny', 'revoke'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Verify parent-child relationship exists
    const { data: relationship } = await supabaseAdmin
      .from('parent_child_relationships')
      .select('*')
      .eq('parent_id', user.id)
      .eq('child_id', childId)
      .single();

    if (!relationship) {
      return NextResponse.json({ error: 'Not your child' }, { status: 403 });
    }

    // Determine new status
    const newStatus = action === 'approve' ? 'approved' : action === 'deny' ? 'denied' : 'revoked';

    // Update parent_child_relationships
    const { error: updateError } = await supabaseAdmin
      .from('parent_child_relationships')
      .update({
        consent_status: newStatus,
        consent_given_at: action === 'approve' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', relationship.id);

    if (updateError) {
      console.error('Error updating relationship:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Also update child's athlete_profiles consent status
    await supabaseAdmin
      .from('athlete_profiles')
      .update({
        consent_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', childId);

    // Log activity (if activity_log table exists)
    try {
      await supabaseAdmin
        .from('activity_log')
        .insert({
          user_id: childId,
          type: `consent_${action}`,
          message: `Parent ${action}d consent`,
          metadata: { parentId: user.id },
          created_at: new Date().toISOString(),
        });
    } catch {
      // Activity log table may not exist, continue without it
    }

    return NextResponse.json({
      success: true,
      newStatus,
    });
  } catch (error) {
    console.error('Error updating consent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
