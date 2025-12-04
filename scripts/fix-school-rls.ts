import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixSchoolRLS() {
  console.log('🔧 Fixing School RLS Policies\n');

  try {
    // Drop existing policy and recreate
    const { error } = await supabase.rpc('exec_sql', {
      query: `
        -- Drop existing policy
        DROP POLICY IF EXISTS "Anyone can view active schools" ON schools;

        -- Create new policy with explicit SELECT
        CREATE POLICY "Public schools are viewable by everyone"
          ON schools
          FOR SELECT
          USING (active = true);

        -- Also allow service role to do everything
        CREATE POLICY "Service role has full access"
          ON schools
          FOR ALL
          TO service_role
          USING (true)
          WITH CHECK (true);
      `
    });

    if (error) {
      console.error('❌ Error:', error);
      throw error;
    }

    console.log('✅ RLS policies updated successfully');
    console.log('\n📋 Policies created:');
    console.log('   1. Public schools viewable by everyone (active = true)');
    console.log('   2. Service role has full access');

  } catch (error) {
    console.error('\n💥 Failed to fix RLS:', error);
    throw error;
  }
}

fixSchoolRLS()
  .then(() => {
    console.log('\n✅ RLS fix complete!');
    process.exit(0);
  })
  .catch(() => process.exit(1));
