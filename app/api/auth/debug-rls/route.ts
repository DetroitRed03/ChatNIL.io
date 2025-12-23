import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Server-side service role client
function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  try {
    console.log('🔍 === RLS DEBUG ENDPOINT ===');

    // Check RLS status
    const { data: rlsStatus, error: rlsError } = await supabaseAdmin
      .from('rls_debug')
      .select('*');

    if (rlsError) {
      console.error('❌ Error checking RLS status:', rlsError);
    }

    // Check policies
    const { data: policies, error: policiesError } = await supabaseAdmin
      .rpc('get_policies_info', {}, { count: 'exact' });

    if (policiesError) {
      console.warn('⚠️ Could not fetch policies info:', policiesError);
    }

    // Check if users table exists and get sample
    const { data: usersCheck, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, created_at')
      .limit(5);

    const debugInfo = {
      timestamp: new Date().toISOString(),
      rls_status: rlsStatus || 'Could not fetch',
      rls_error: rlsError?.message || null,
      policies_info: policies || 'Could not fetch',
      policies_error: policiesError?.message || null,
      users_table: {
        accessible: !usersError,
        error: usersError?.message || null,
        sample_count: usersCheck?.length || 0
      },
      environment: {
        supabase_url: supabaseUrl,
        service_role_configured: !!supabaseServiceRoleKey
      }
    };

    console.log('📊 RLS Debug Info:', debugInfo);

    return NextResponse.json({
      success: true,
      debug_info: debugInfo
    });

  } catch (error: any) {
    console.error('💥 Debug endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        debug_info: {
          timestamp: new Date().toISOString(),
          environment: {
            supabase_url: supabaseUrl,
            service_role_configured: !!supabaseServiceRoleKey
          }
        }
      },
      { status: 500 }
    );
  }
}