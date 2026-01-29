import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/minor-status
 * Check the minor status of the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

    let { data: { user } } = await supabase.auth.getUser();
    if (!user && bearerToken) {
      const { data: { user: tokenUser } } = await supabase.auth.getUser(bearerToken);
      if (tokenUser) user = tokenUser;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's minor status
    const { data: profile, error } = await supabase
      .from('users')
      .select('is_minor, minor_status, role, date_of_birth')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching minor status:', error);
      // Return default values if columns don't exist yet
      return NextResponse.json({
        isMinor: false,
        minorStatus: null,
        role: 'hs_student',
      });
    }

    // For HS students, check if they've set up their minor status
    // If is_minor is null, they haven't gone through the consent flow yet
    // Default to requiring approval for HS students
    const isMinor = profile?.is_minor ?? (profile?.role === 'hs_student');
    const minorStatus = profile?.minor_status || null;

    return NextResponse.json({
      isMinor,
      minorStatus,
      role: profile?.role,
      dateOfBirth: profile?.date_of_birth,
    });
  } catch (error) {
    console.error('Minor status check error:', error);
    // Return safe defaults
    return NextResponse.json({
      isMinor: false,
      minorStatus: null,
    });
  }
}
