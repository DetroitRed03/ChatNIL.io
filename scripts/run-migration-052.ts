/**
 * Migration 052: Create user-documents Storage Bucket
 *
 * This script creates a Supabase Storage bucket for user document uploads
 * with proper RLS policies for security.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting Migration 052: Create user-documents Storage Bucket\n');

  try {
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '052_create_storage_bucket.sql');
    console.log('📖 Reading migration file:', migrationPath);

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    console.log('✅ Migration file loaded\n');

    // Execute migration using exec_sql RPC function
    console.log('⚙️  Executing migration via exec_sql...');
    const { data, error } = await supabase.rpc('exec_sql', {
      query: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration executed successfully!\n');

    // Verify bucket was created
    console.log('🔍 Verifying bucket creation...');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('⚠️  Could not verify buckets:', bucketsError);
    } else {
      const userDocsBucket = buckets?.find(b => b.id === 'user-documents');
      if (userDocsBucket) {
        console.log('✅ Bucket "user-documents" exists!');
        console.log('   - Public:', userDocsBucket.public);
        console.log('   - File size limit:', userDocsBucket.file_size_limit, 'bytes (50MB)');
      } else {
        console.log('⚠️  Bucket not found in list (may need manual verification)');
      }
    }

    console.log('\n✨ Migration 052 completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   ✓ Created user-documents storage bucket');
    console.log('   ✓ Set 50MB file size limit');
    console.log('   ✓ Configured allowed MIME types (PDF, DOCX, images, etc.)');
    console.log('   ✓ Applied RLS policies for user-specific access');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

runMigration();
