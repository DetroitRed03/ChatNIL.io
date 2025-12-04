import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function executeSQL(sql: string, description: string) {
  console.log(`\n🔄 ${description}...`);
  const { error } = await supabase.from('_migrations').select('*').limit(0).single();

  // Use raw SQL query via edge function or direct connection
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    console.error(`❌ Failed: ${await response.text()}`);
    return false;
  }

  console.log(`✅ ${description} - Success`);
  return true;
}

async function applyMigration() {
  console.log('📝 Applying Migration 070: Profile and Cover Photo Support\n');
  console.log('=' .repeat(60));

  // Part 1: Add photo URL columns
  const part1 = `
    ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_uploaded_at TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_photo_uploaded_at TIMESTAMPTZ;
  `;

  // Part 2: Add athlete physical stats
  const part2 = `
    ALTER TABLE users ADD COLUMN IF NOT EXISTS height_inches INTEGER;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS weight_lbs INTEGER;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS jersey_number INTEGER;
  `;

  // Part 3: Create indexes
  const part3 = `
    CREATE INDEX IF NOT EXISTS idx_users_has_profile_photo
      ON users(profile_photo_url)
      WHERE profile_photo_url IS NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_users_has_cover_photo
      ON users(cover_photo_url)
      WHERE cover_photo_url IS NOT NULL;
  `;

  // Part 4: Create storage bucket
  const part4 = `
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'athlete-profile-media',
      'athlete-profile-media',
      true,
      10485760,
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    )
    ON CONFLICT (id) DO UPDATE SET
      public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
  `;

  console.log('\n⚠️  NOTE: This script will guide you through manual migration steps.');
  console.log('Please execute the SQL in Supabase Dashboard > SQL Editor:\n');

  console.log('\n📋 STEP 1: Add photo URL columns and timestamps');
  console.log('=' .repeat(60));
  console.log(part1);

  console.log('\n📋 STEP 2: Add athlete physical stats');
  console.log('=' .repeat(60));
  console.log(part2);

  console.log('\n📋 STEP 3: Create indexes for performance');
  console.log('=' .repeat(60));
  console.log(part3);

  console.log('\n📋 STEP 4: Create storage bucket');
  console.log('=' .repeat(60));
  console.log(part4);

  console.log('\n📋 STEP 5: Create RLS policies');
  console.log('=' .repeat(60));
  console.log(`
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload profile media to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile media" ON storage.objects;

-- Policy 1: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload profile media to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'athlete-profile-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Public read access (anyone can view profile photos)
CREATE POLICY "Anyone can view profile media"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'athlete-profile-media'
);

-- Policy 3: Users can update their own files
CREATE POLICY "Users can update own profile media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'athlete-profile-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'athlete-profile-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own files
CREATE POLICY "Users can delete own profile media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'athlete-profile-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
  `);

  console.log('\n\n🔗 Quick Link:');
  console.log(`${supabaseUrl.replace('/rest/v1', '')}/project/default/sql`);

  console.log('\n📝 Alternative: Copy entire migration file content');
  console.log('File: migrations/070_add_profile_cover_photos.sql');
  console.log('\n✅ After applying migration, the backend will be ready for photo uploads!\n');
}

applyMigration();
