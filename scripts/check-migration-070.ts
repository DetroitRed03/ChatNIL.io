import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMigration() {
  console.log('🔍 Checking if Migration 070 is already applied...\n');

  // Check if columns exist by querying the users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, cover_photo_url, profile_photo_uploaded_at, cover_photo_uploaded_at, height_inches, weight_lbs, jersey_number')
    .limit(1);

  if (userError) {
    console.log('❌ Error checking users table:', userError.message);
    console.log('\n⚠️  Migration 070 has NOT been applied yet.\n');
    return false;
  }

  console.log('✅ Users table columns exist!');
  console.log('   - cover_photo_url: ✓');
  console.log('   - profile_photo_uploaded_at: ✓');
  console.log('   - cover_photo_uploaded_at: ✓');
  console.log('   - height_inches: ✓');
  console.log('   - weight_lbs: ✓');
  console.log('   - jersey_number: ✓');

  // Check if storage bucket exists
  const { data: buckets, error: bucketError } = await supabase
    .storage
    .listBuckets();

  if (bucketError) {
    console.log('\n❌ Error checking storage buckets:', bucketError.message);
    return false;
  }

  const athleteMediaBucket = buckets?.find(b => b.id === 'athlete-profile-media');
  if (athleteMediaBucket) {
    console.log('\n✅ Storage bucket "athlete-profile-media" exists!');
    console.log('   - Public:', athleteMediaBucket.public);
    console.log('   - File size limit:', athleteMediaBucket.file_size_limit, 'bytes');
  } else {
    console.log('\n⚠️  Storage bucket "athlete-profile-media" NOT found');
    return false;
  }

  console.log('\n🎉 Migration 070 appears to be fully applied!\n');
  return true;
}

checkMigration();
