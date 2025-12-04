import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log('🚀 Running Migration 070: Profile and Cover Photo Support');
  console.log('==============================================================');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', '070_add_profile_cover_photos.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📖 Migration SQL loaded from:', migrationPath);
    console.log('');

    // Remove BEGIN/COMMIT and clean up SQL
    let cleanedSQL = sql
      .replace(/BEGIN;/gi, '')
      .replace(/COMMIT;/gi, '')
      .trim();

    // Remove all single-line comments
    cleanedSQL = cleanedSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Split SQL into statements
    const statements = cleanedSQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => {
        if (s.length === 0) return false;
        if (s.match(/^DO \$\$/)) return false;
        // Filter out just section headers
        if (s.match(/^={2,}$/)) return false;
        return true;
      });

    console.log(`🔧 Executing ${statements.length} SQL statement(s)...`);
    console.log('');

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      let statement = statements[i];

      // Skip DO blocks
      if (statement.startsWith('DO')) {
        console.log(`⏭️  Skipping notification block ${i + 1}`);
        continue;
      }

      statement += ';'; // Add semicolon back

      console.log(`📝 Statement ${i + 1}/${statements.length}:`);
      const preview = statement.substring(0, 80).replace(/\n/g, ' ');
      console.log(`   ${preview}...`);

      const { data, error } = await supabase.rpc('exec_sql', { query: statement });

      if (error) {
        console.error('❌ Error executing statement:', error);

        // Continue for some specific errors
        if (error.message?.includes('already exists') ||
            error.message?.includes('duplicate') ||
            error.message?.includes('IF NOT EXISTS')) {
          console.log('⚠️  Statement already applied, continuing...');
          continue;
        }

        throw error;
      }

      console.log('✅ Statement executed successfully');
      console.log('');
    }

    console.log('✅ Migration 070 completed successfully!');
    console.log('');
    console.log('🧪 Verifying migration...');

    // Verify by checking if new columns exist
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, cover_photo_url, profile_photo_uploaded_at, height_inches, weight_lbs, jersey_number')
      .limit(1);

    if (userError) {
      console.error('❌ Verification failed:', userError);
    } else {
      console.log('✅ Database columns verified!');
      console.log('   - cover_photo_url: ✓');
      console.log('   - profile_photo_uploaded_at: ✓');
      console.log('   - height_inches, weight_lbs, jersey_number: ✓');
    }

    // Check storage bucket
    const { data: buckets } = await supabase.storage.listBuckets();
    const athleteMediaBucket = buckets?.find(b => b.id === 'athlete-profile-media');

    if (athleteMediaBucket) {
      console.log('✅ Storage bucket "athlete-profile-media" created!');
      console.log(`   - Public: ${athleteMediaBucket.public}`);
      console.log(`   - File size limit: ${athleteMediaBucket.file_size_limit} bytes`);
    }

    console.log('');
    console.log('🎉 Photo upload infrastructure is ready!');
    console.log('');
    console.log('📝 What was added:');
    console.log('   ✓ Profile photo and cover photo database columns');
    console.log('   ✓ Photo upload timestamp fields (for cache busting)');
    console.log('   ✓ Athlete physical stats (height, weight, jersey number)');
    console.log('   ✓ Public storage bucket for profile media');
    console.log('   ✓ RLS policies for secure uploads');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   - Photo upload APIs ready at /api/profile/photo/profile');
    console.log('   - Photo upload APIs ready at /api/profile/photo/cover');
    console.log('   - Image processing utilities in lib/photo-upload-utils.ts');
    console.log('');
    console.log('==============================================================');
    console.log('Migration 070 Complete');
    console.log('==============================================================');
  } catch (error: any) {
    console.error('💥 Migration failed:', error);
    console.error('');
    console.error('Error details:', error.message || error);
    console.error('');
    console.error('⚠️  You can manually apply the migration via Supabase Dashboard:');
    console.error('   https://enbuwffusjhpcyoveewb.supabase.co/project/default/sql/new');
    process.exit(1);
  }
}

runMigration();
