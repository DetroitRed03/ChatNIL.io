import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        fetch: (url: any, opts: any) => fetch(url, { ...opts, cache: 'no-store' as any }),
      }
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateCode = searchParams.get('state');
    const supabaseAdmin = getSupabaseAdmin();

    if (stateCode) {
      // Single state: return full rules + athletic association
      const { data: rules, error } = await supabaseAdmin
        .from('state_nil_rules')
        .select('*')
        .eq('state_code', stateCode.toUpperCase())
        .single();

      if (error || !rules) {
        return NextResponse.json(
          { error: `No NIL rules found for state: ${stateCode}` },
          { status: 404 }
        );
      }

      // Get athletic association data
      const { data: association } = await supabaseAdmin
        .from('state_athletic_associations')
        .select('*')
        .eq('state_code', stateCode.toUpperCase())
        .maybeSingle();

      return NextResponse.json({
        rules,
        association: association || null,
      });
    }

    // No state param: return summary list of all states
    const { data: states, error } = await supabaseAdmin
      .from('state_nil_rules')
      .select('state_code, state_name, high_school_allowed, allows_nil, short_summary, athletic_association_name, last_verified_date')
      .order('state_name', { ascending: true });

    if (error) {
      console.error('Error fetching state rules list:', error);
      return NextResponse.json({ error: 'Failed to fetch state rules' }, { status: 500 });
    }

    return NextResponse.json({ states: states || [] });
  } catch (error: any) {
    console.error('State NIL rules API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
