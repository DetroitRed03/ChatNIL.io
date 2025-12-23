import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getSupabaseAnon() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabaseAnon = getSupabaseAnon();
  const supabaseAdmin = getSupabaseAdmin();

  console.log('🧪 === DATABASE ACCESS TEST ===');

  const results: any = {
    timestamp: new Date().toISOString(),
    environment: {
      supabase_url: supabaseUrl,
      anon_key_configured: !!supabaseAnonKey,
      service_role_key_configured: !!supabaseServiceRoleKey,
      service_role_key_length: supabaseServiceRoleKey?.length || 0
    },
    tests: {}
  };

  // Test 1: Basic connectivity with anon client
  console.log('🔍 Test 1: Anon client basic connectivity...');
  try {
    const { data: anonTest, error: anonError } = await supabaseAnon
      .from('users')
      .select('id')
      .limit(1);

    results.tests.anon_client = {
      success: !anonError,
      error: anonError?.message || null,
      error_code: anonError?.code || null,
      data_count: anonTest?.length || 0
    };
    console.log('✅ Anon test result:', results.tests.anon_client);
  } catch (error: any) {
    results.tests.anon_client = {
      success: false,
      error: error.message,
      error_code: 'EXCEPTION'
    };
    console.log('❌ Anon test exception:', error.message);
  }

  // Test 2: Service role client connectivity
  console.log('🔍 Test 2: Service role client connectivity...');
  try {
    const { data: adminTest, error: adminError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);

    results.tests.service_role_client = {
      success: !adminError,
      error: adminError?.message || null,
      error_code: adminError?.code || null,
      data_count: adminTest?.length || 0
    };
    console.log('✅ Service role test result:', results.tests.service_role_client);
  } catch (error: any) {
    results.tests.service_role_client = {
      success: false,
      error: error.message,
      error_code: 'EXCEPTION'
    };
    console.log('❌ Service role test exception:', error.message);
  }

  // Test 3: Check table permissions (if we can access it)
  console.log('🔍 Test 3: Table permissions check...');
  try {
    const { data: permsData, error: permsError } = await supabaseAdmin
      .from('table_permissions_debug')
      .select('*');

    results.tests.table_permissions = {
      success: !permsError,
      error: permsError?.message || null,
      permissions: permsData || []
    };
    console.log('✅ Permissions test result:', results.tests.table_permissions);
  } catch (error: any) {
    results.tests.table_permissions = {
      success: false,
      error: error.message,
      note: 'table_permissions_debug view may not exist yet'
    };
    console.log('⚠️ Permissions test exception (expected if view not created):', error.message);
  }

  // Test 4: Service role access function (if it exists)
  console.log('🔍 Test 4: Service role access function...');
  try {
    const { data: funcData, error: funcError } = await supabaseAdmin
      .rpc('test_service_role_access');

    results.tests.service_role_function = {
      success: !funcError,
      error: funcError?.message || null,
      function_result: funcData || null
    };
    console.log('✅ Function test result:', results.tests.service_role_function);
  } catch (error: any) {
    results.tests.service_role_function = {
      success: false,
      error: error.message,
      note: 'test_service_role_access function may not exist yet'
    };
    console.log('⚠️ Function test exception (expected if function not created):', error.message);
  }

  console.log('📊 Final test results:', JSON.stringify(results, null, 2));

  return NextResponse.json({
    success: true,
    message: 'Database access test completed',
    results
  });
}
