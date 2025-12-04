import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  console.log('📝 Applying Migration 070: Profile and Cover Photo Support\n');
  console.log('=' .repeat(70));

  const migrationPath = path.join(process.cwd(), 'migrations', '070_add_profile_cover_photos.sql');
  const fullSQL = fs.readFileSync(migrationPath, 'utf-8');

  console.log('\n🔄 Executing migration via exec_sql function...\n');

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_string: fullSQL
    });

    if (error) {
      console.log('❌ Error:', error.message);
      console.log('\nDetails:', JSON.stringify(error, null, 2));

      console.log('\n⚠️  exec_sql function may not be available or requires special permissions.');
      console.log('\n📝 Alternative: Execute via Supabase Dashboard');
      console.log('   1. Open: https://enbuwffusjhpcyoveewb.supabase.co/project/default/sql/new');
      console.log('   2. Paste the migration SQL');
      console.log('   3. Click Run\n');
      return false;
    }

    console.log('✅ Migration executed successfully!');
    console.log('\nResult:', data);

    console.log('\n🎉 Migration 070 completed!\n');
    console.log('Next steps:');
    console.log('  - Photo upload APIs are ready at /api/profile/photo/profile and /api/profile/photo/cover');
    console.log('  - Image processing utilities ready in lib/photo-upload-utils.ts');
    console.log('  - Storage bucket "athlete-profile-media" created\n');

    return true;
  } catch (err: any) {
    console.log('❌ Unexpected error:', err.message);
    return false;
  }
}

applyMigration();
