import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

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

    // Find the relationship with this token
    const { data: relationship, error } = await supabase
      .from('parent_child_relationships')
      .select(`
        id,
        consent_status,
        child:child_id (
          id,
          full_name,
          email
        )
      `)
      .eq('verification_token', token)
      .eq('consent_status', 'pending')
      .single();

    if (error || !relationship) {
      return NextResponse.json({
        error: 'Invalid or expired consent link'
      }, { status: 400 });
    }

    // Check if token is still valid (within 7 days)
    // This would require a created_at check in production

    // Handle child as potential array (Supabase returns array for joins)
    const childData = Array.isArray(relationship.child)
      ? relationship.child[0]
      : relationship.child;

    return NextResponse.json({
      valid: true,
      child: {
        name: childData?.full_name || 'Your child',
        email: childData?.email || '',
      },
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
