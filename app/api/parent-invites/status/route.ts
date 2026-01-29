import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

/**
 * GET /api/parent-invites/status
 * Get the current invite status for the authenticated HS student
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

    // Get the most recent invite for this student
    const { data: invite } = await supabase
      .from('parent_consent_invites')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!invite) {
      return NextResponse.json({
        hasInvite: false,
        status: null,
        parentEmail: null,
        createdAt: null,
        expiresAt: null,
      });
    }

    // Check if expired
    const isExpired = new Date(invite.expires_at) < new Date();
    const status = isExpired && invite.status === 'pending' ? 'expired' : invite.status;

    return NextResponse.json({
      hasInvite: true,
      status,
      parentEmail: invite.parent_email,
      parentName: invite.parent_name,
      createdAt: invite.created_at,
      expiresAt: invite.expires_at,
      viewedAt: invite.viewed_at,
      respondedAt: invite.responded_at,
    });
  } catch (error) {
    console.error('Parent invite status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
