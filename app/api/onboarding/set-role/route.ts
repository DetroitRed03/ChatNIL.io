import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { UserRole } from '@/lib/types/onboarding';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json() as { role: UserRole };

    if (!['hs_student', 'college_athlete', 'parent', 'compliance_officer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check for Authorization header
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

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

    // Try cookie-based auth first
    let { data: { user }, error: authError } = await supabase.auth.getUser();

    // If cookie auth fails, try bearer token
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

    // Update athlete_profiles with initial role
    const { error: updateError } = await supabase
      .from('athlete_profiles')
      .update({ role })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating role:', updateError);
      return NextResponse.json({ error: 'Failed to set role' }, { status: 500 });
    }

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('Set role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
