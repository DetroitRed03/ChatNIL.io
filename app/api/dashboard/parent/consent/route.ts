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
    const { childId, status } = await request.json();

    if (!childId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate status
    if (!['approved', 'denied', 'revoked'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify parent-child relationship exists
    const { data: relationship } = await supabaseAdmin
      .from('parent_child_relationships')
      .select('*')
      .eq('parent_id', user.id)
      .eq('child_id', childId)
      .single();

    if (!relationship) {
      // Check parent_athlete_relationships as fallback
      const { data: athleteRel } = await supabaseAdmin
        .from('parent_athlete_relationships')
        .select('*')
        .eq('parent_id', user.id)
        .eq('athlete_id', childId)
        .single();

      if (!athleteRel) {
        return NextResponse.json({ error: 'Relationship not found' }, { status: 404 });
      }

      // Update parent_athlete_relationships
      await supabaseAdmin
        .from('parent_athlete_relationships')
        .update({
          verified: status === 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('parent_id', user.id)
        .eq('athlete_id', childId);
    } else {
      // Update parent_child_relationships
      await supabaseAdmin
        .from('parent_child_relationships')
        .update({
          consent_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('parent_id', user.id)
        .eq('child_id', childId);
    }

    // Also update the child's athlete_profiles consent_status
    await supabaseAdmin
      .from('athlete_profiles')
      .update({
        consent_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', childId);

    return NextResponse.json({
      success: true,
      message: `Consent ${status} successfully`,
    });
  } catch (error) {
    console.error('Error updating consent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
