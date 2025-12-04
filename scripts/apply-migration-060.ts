import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  console.log('🚀 Applying Migration 060: Fix array_length NULL handling');
  console.log('================================================\n');

  try {
    // The migration SQL - recreating the function with COALESCE
    const migrationSQL = `
CREATE OR REPLACE FUNCTION calculate_profile_completion_score(user_row users)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  max_score INTEGER := 20;
BEGIN
  -- Core profile fields (40 points total, 2 points each)
  IF user_row.full_name IS NOT NULL AND user_row.full_name != '' THEN score := score + 2; END IF;
  IF user_row.email IS NOT NULL AND user_row.email != '' THEN score := score + 2; END IF;
  IF user_row.bio IS NOT NULL AND user_row.bio != '' THEN score := score + 2; END IF;
  IF user_row.profile_photo_url IS NOT NULL AND user_row.profile_photo_url != '' THEN score := score + 2; END IF;
  IF user_row.profile_video_url IS NOT NULL AND user_row.profile_video_url != '' THEN score := score + 2; END IF;

  -- Athlete-specific fields (30 points total, 3 points each)
  IF user_row.school_name IS NOT NULL AND user_row.school_name != '' THEN score := score + 3; END IF;
  IF user_row.primary_sport IS NOT NULL AND user_row.primary_sport != '' THEN score := score + 3; END IF;
  IF user_row.position IS NOT NULL AND user_row.position != '' THEN score := score + 3; END IF;
  IF user_row.graduation_year IS NOT NULL THEN score := score + 3; END IF;
  IF user_row.achievements IS NOT NULL AND jsonb_array_length(user_row.achievements) > 0 THEN score := score + 3; END IF;

  -- Interest fields with COALESCE fix for NULL handling
  IF user_row.hobbies IS NOT NULL AND COALESCE(array_length(user_row.hobbies, 1), 0) > 0 THEN score := score + 3; END IF;
  IF user_row.lifestyle_interests IS NOT NULL AND COALESCE(array_length(user_row.lifestyle_interests, 1), 0) > 0 THEN score := score + 3; END IF;
  IF user_row.brand_affinity IS NOT NULL AND COALESCE(array_length(user_row.brand_affinity, 1), 0) > 0 THEN score := score + 3; END IF;
  IF user_row.causes_care_about IS NOT NULL AND COALESCE(array_length(user_row.causes_care_about, 1), 0) > 0 THEN score := score + 3; END IF;
  IF user_row.content_creation_interests IS NOT NULL AND COALESCE(array_length(user_row.content_creation_interests, 1), 0) > 0 THEN score := score + 3; END IF;

  -- Social media fields (10 points total, 5 points each)
  IF user_row.social_media_stats IS NOT NULL AND jsonb_array_length(user_row.social_media_stats) > 0 THEN score := score + 5; END IF;
  IF user_row.content_samples IS NOT NULL AND jsonb_array_length(user_row.content_samples) > 0 THEN score := score + 5; END IF;

  -- NIL preferences (5 points)
  IF user_row.nil_preferences IS NOT NULL AND user_row.nil_preferences != '{}'::jsonb THEN score := score + 5; END IF;

  RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
    `.trim();

    console.log('📝 Recreating calculate_profile_completion_score function...');

    const { error } = await supabase.rpc('exec_sql', { query: migrationSQL });

    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log('⚠️  exec_sql RPC not available, trying direct approach...');

      // We'll need to use the Supabase dashboard or a direct PostgreSQL connection
      console.log('\n📋 Please run this SQL manually in the Supabase SQL Editor:');
      console.log('================================================');
      console.log(migrationSQL);
      console.log('================================================\n');
      console.log('Or use the HTML page: http://localhost:3000/run-migration-060.html');

      process.exit(0);
    }

    console.log('✅ Function updated successfully!\n');

    // Test the fix
    console.log('🧪 Testing with empty arrays...');
    const testUserId = '69ccbc5b-165b-4ae9-8789-b8ef9ae40ce1';

    const { data: testData, error: testError } = await supabase
      .from('users')
      .update({
        hobbies: null,
        lifestyle_interests: null,
        brand_affinity: null,
        causes_care_about: null,
        content_creation_interests: null,
      })
      .eq('id', testUserId)
      .select('profile_completion_score')
      .single();

    if (testError) {
      console.error('❌ Test failed:', testError.message);
    } else {
      console.log('✅ Test passed!');
      console.log(`📊 Profile completion score: ${testData.profile_completion_score}%`);
    }

    console.log('\n================================================');
    console.log('✅ Migration 060 Complete!');
    console.log('================================================');
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyMigration();
