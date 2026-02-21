/**
 * GET /api/library/analyses
 *
 * Fetch the current user's deal analysis history.
 * Supports pagination and status filtering.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { mapDbRowToAnalysis } from '@/lib/types/deal-analysis';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const status = searchParams.get('status'); // green, yellow, red, or null for all
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('deal_analyses')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && ['green', 'yellow', 'red'].includes(status)) {
      query = query.eq('compliance_status', status);
    }

    const { data: rows, error, count } = await query;

    if (error) {
      console.error('Error fetching analyses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analyses' },
        { status: 500 }
      );
    }

    const analyses = (rows || []).map(mapDbRowToAnalysis);

    return NextResponse.json({
      success: true,
      analyses,
      total: count || 0,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Error in analyses route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
