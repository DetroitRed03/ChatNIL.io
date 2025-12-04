#!/usr/bin/env tsx
/**
 * Test PostgREST Direct - See what PostgREST can actually see
 */

async function testPostgREST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
  }

  console.log('🔍 TESTING POSTGREST DIRECT ACCESS');
  console.log('='.repeat(80));
  console.log(`\nDatabase: ${url}\n`);

  // Test 1: Query PostgREST root endpoint to see ALL exposed tables
  console.log('1️⃣ Checking what tables PostgREST can see...\n');

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });

    const data = await response.json();
    const tables = Object.keys(data);

    if (tables.length === 0) {
      console.log('❌ PostgREST sees ZERO tables!');
      console.log('   This confirms: public schema is NOT exposed to PostgREST');
      console.log('\n💡 The fix:');
      console.log('   1. The public schema needs to be exposed in Supabase settings');
      console.log('   2. Or there is a PostgREST configuration issue');
    } else {
      console.log(`✅ PostgREST can see ${tables.length} tables:\n`);
      tables.forEach(table => console.log(`   - ${table}`));

      if (!tables.includes('users')) {
        console.log('\n⚠️  WARNING: users table is NOT in the list!');
        console.log('   Tables exist in database but PostgREST cannot see them');
      } else {
        console.log('\n✅ users table IS visible to PostgREST!');
      }
    }

  } catch (error: any) {
    console.error('❌ Error querying PostgREST root:', error.message);
  }

  // Test 2: Try to access users table directly
  console.log('\n2️⃣ Testing direct users table access...\n');

  try {
    const response = await fetch(`${url}/rest/v1/users?select=id&limit=1`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    });

    const text = await response.text();

    console.log(`Response status: ${response.status}`);

    if (response.status === 200) {
      console.log('✅ SUCCESS! Can access users table via PostgREST');
      console.log(`Response: ${text}`);
    } else if (response.status === 404 || text.includes('PGRST')) {
      console.log('❌ PGRST Error:', text);

      if (text.includes('PGRST205')) {
        console.log('\n💡 PGRST205 = Schema cache issue');
        console.log('   PostgREST is not configured to see the public schema');
      }
    } else {
      console.log(`⚠️  Unexpected response: ${text}`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  // Test 3: Check PostgREST OpenAPI schema
  console.log('\n3️⃣ Checking PostgREST OpenAPI schema...\n');

  try {
    const response = await fetch(`${url}/rest/v1/?apikey=${serviceKey}`);
    const schema = await response.json();

    const paths = Object.keys(schema.paths || {});
    console.log(`PostgREST exposes ${paths.length} API paths`);

    if (paths.length === 0) {
      console.log('❌ No API paths exposed - schema configuration issue');
    } else {
      console.log('\nAvailable endpoints:');
      paths.slice(0, 10).forEach(path => console.log(`   ${path}`));
      if (paths.length > 10) {
        console.log(`   ... and ${paths.length - 10} more`);
      }
    }

  } catch (error: any) {
    console.error('❌ Error fetching OpenAPI schema:', error.message);
  }

  // Final Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY & DIAGNOSIS');
  console.log('='.repeat(80));
  console.log('\nIf PostgREST sees 0 tables:');
  console.log('  → public schema is NOT exposed in API configuration');
  console.log('  → Contact Supabase support or check project settings\n');
  console.log('If PostgREST sees tables but not "users":');
  console.log('  → Schema exposure is working but users table is missing');
  console.log('  → Check if table actually exists in database\n');
  console.log('If you get PGRST205 error:');
  console.log('  → PostgREST schema cache is out of sync');
  console.log('  → Try pausing/unpausing project again\n');
}

testPostgREST().catch(console.error);
