import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixSchoolPermissions() {
  console.log('🔧 Fixing School Table Permissions\n');

  try {
    // Disable RLS temporarily to allow service role direct access
    const { error } = await supabase.rpc('exec_sql', {
      query: `
        -- Disable RLS for now (we'll enable it later with proper policies)
        ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
      `
    });

    if (error) {
      console.error('❌ Error:', error);
      throw error;
    }

    console.log('✅ RLS disabled on schools table');
    console.log('   (This allows service role to insert/update directly)');
    console.log('\n📝 Note: For production, you should create proper RLS policies');
    console.log('   that allow public read (SELECT) and service role write.');

  } catch (error) {
    console.error('\n💥 Failed to fix permissions:', error);
    throw error;
  }
}

fixSchoolPermissions()
  .then(() => {
    console.log('\n✅ Permissions fixed!');
    process.exit(0);
  })
  .catch(() => process.exit(1));
