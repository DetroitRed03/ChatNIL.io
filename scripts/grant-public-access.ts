import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function grantPublicAccess() {
  console.log('🔓 Granting public SELECT access to schools table\n');

  try {
    // Method 1: Disable RLS completely
    const { error: disableError } = await supabase.rpc('exec_sql', {
      query: `ALTER TABLE schools DISABLE ROW LEVEL SECURITY;`
    });

    if (disableError) {
      console.error('❌ Error disabling RLS:', disableError);
    } else {
      console.log('✅ RLS disabled on schools table');
    }

    // Method 2: Grant SELECT to anon role (public)
    const { error: grantError } = await supabase.rpc('exec_sql', {
      query: `
        GRANT SELECT ON schools TO anon;
        GRANT SELECT ON schools TO authenticated;
      `
    });

    if (grantError) {
      console.error('❌ Error granting permissions:', grantError);
    } else {
      console.log('✅ SELECT permission granted to anon and authenticated roles');
    }

    // Test the access
    console.log('\n🧪 Testing public access...');

    const publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await publicClient
      .from('schools')
      .select('school_name, custom_slug')
      .eq('custom_slug', 'test-hs')
      .single();

    if (error) {
      console.error('❌ Public access test failed:', error.message);
    } else {
      console.log('✅ Public access test passed!');
      console.log(`   School found: ${data.school_name} (${data.custom_slug})`);
    }

  } catch (error) {
    console.error('\n💥 Failed:', error);
    throw error;
  }
}

grantPublicAccess()
  .then(() => {
    console.log('\n✅ Access granted successfully!');
    process.exit(0);
  })
  .catch(() => process.exit(1));
