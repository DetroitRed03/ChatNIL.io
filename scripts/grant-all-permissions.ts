import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function grantAllPermissions() {
  console.log('🔓 Granting ALL permissions on schools table\n');

  try {
    const { error } = await supabase.rpc('exec_sql', {
      query: `
        -- Disable RLS
        ALTER TABLE schools DISABLE ROW LEVEL SECURITY;

        -- Grant all permissions to all roles
        GRANT ALL ON schools TO anon;
        GRANT ALL ON schools TO authenticated;
        GRANT ALL ON schools TO service_role;

        -- Also grant usage on sequence if it exists
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
      `
    });

    if (error) {
      console.error('❌ Error:', error);
      throw error;
    }

    console.log('✅ All permissions granted successfully!');
    console.log('   - RLS disabled');
    console.log('   - ALL granted to anon');
    console.log('   - ALL granted to authenticated');
    console.log('   - ALL granted to service_role');

  } catch (error) {
    console.error('\n💥 Failed:', error);
    throw error;
  }
}

grantAllPermissions()
  .then(() => {
    console.log('\n✅ Complete!');
    process.exit(0);
  })
  .catch(() => process.exit(1));
