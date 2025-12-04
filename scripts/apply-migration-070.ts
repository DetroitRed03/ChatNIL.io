import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  console.log('📝 Applying Migration 070: Profile and Cover Photo Support\n');

  // Read migration file
  const migrationPath = path.join(process.cwd(), 'migrations', '070_add_profile_cover_photos.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  try {
    // Execute migration
    console.log('🚀 Executing SQL migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('\n✅ Migration 070 completed successfully!\n');
    console.log('📸 Added columns:');
    console.log('   - cover_photo_url (TEXT)');
    console.log('   - profile_photo_uploaded_at (TIMESTAMPTZ)');
    console.log('   - cover_photo_uploaded_at (TIMESTAMPTZ)');
    console.log('   - height_inches (INTEGER)');
    console.log('   - weight_lbs (INTEGER)');
    console.log('   - jersey_number (INTEGER)');
    console.log('\n🗄️  Created storage bucket:');
    console.log('   - athlete-profile-media (PUBLIC)');
    console.log('\n🔒 Created RLS policies:');
    console.log('   - Users can upload profile media to own folder');
    console.log('   - Anyone can view profile media');
    console.log('   - Users can update own profile media');
    console.log('   - Users can delete own profile media');
    console.log('\n📊 Created indexes:');
    console.log('   - idx_users_has_profile_photo');
    console.log('   - idx_users_has_cover_photo');
    console.log('\n🎉 Backend infrastructure is ready!');
    console.log('📝 Next: Create PhotoUpload component\n');
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

applyMigration();
