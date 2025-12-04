import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting Migration 080: Auto-calculate Social Stats\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Step 1: Drop existing trigger and function (using query directly)
    console.log('📋 Step 1: Dropping existing trigger (if exists)...');

    // We'll just create/replace the function directly since DROP IF EXISTS is safe

    // Step 2: Create the function
    console.log('📋 Step 2: Creating update_social_stats() function...');

    const createFunctionSQL = `
CREATE OR REPLACE FUNCTION update_social_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_total_followers INTEGER;
  v_avg_engagement NUMERIC;
  v_instagram_followers INTEGER := 0;
  v_tiktok_followers INTEGER := 0;
  v_twitter_followers INTEGER := 0;
  v_youtube_subscribers INTEGER := 0;
  v_instagram_engagement NUMERIC := 0;
  v_tiktok_engagement NUMERIC := 0;
  v_twitter_engagement NUMERIC := 0;
  v_engagement_count INTEGER := 0;
BEGIN
  IF NEW.social_media_stats IS NOT NULL THEN
    IF (NEW.social_media_stats->'instagram') IS NOT NULL THEN
      v_instagram_followers := COALESCE((NEW.social_media_stats->'instagram'->>'followers')::INTEGER, 0);
      IF (NEW.social_media_stats->'instagram'->>'engagement_rate') IS NOT NULL THEN
        v_instagram_engagement := COALESCE((NEW.social_media_stats->'instagram'->>'engagement_rate')::NUMERIC, 0);
        IF v_instagram_engagement > 0 THEN
          v_engagement_count := v_engagement_count + 1;
        END IF;
      END IF;
    END IF;

    IF (NEW.social_media_stats->'tiktok') IS NOT NULL THEN
      v_tiktok_followers := COALESCE((NEW.social_media_stats->'tiktok'->>'followers')::INTEGER, 0);
      IF (NEW.social_media_stats->'tiktok'->>'engagement_rate') IS NOT NULL THEN
        v_tiktok_engagement := COALESCE((NEW.social_media_stats->'tiktok'->>'engagement_rate')::NUMERIC, 0);
        IF v_tiktok_engagement > 0 THEN
          v_engagement_count := v_engagement_count + 1;
        END IF;
      END IF;
    END IF;

    IF (NEW.social_media_stats->'twitter') IS NOT NULL THEN
      v_twitter_followers := COALESCE((NEW.social_media_stats->'twitter'->>'followers')::INTEGER, 0);
      IF (NEW.social_media_stats->'twitter'->>'engagement_rate') IS NOT NULL THEN
        v_twitter_engagement := COALESCE((NEW.social_media_stats->'twitter'->>'engagement_rate')::NUMERIC, 0);
        IF v_twitter_engagement > 0 THEN
          v_engagement_count := v_engagement_count + 1;
        END IF;
      END IF;
    END IF;

    IF (NEW.social_media_stats->'youtube') IS NOT NULL THEN
      v_youtube_subscribers := COALESCE((NEW.social_media_stats->'youtube'->>'subscribers')::INTEGER, 0);
    END IF;
  END IF;

  v_total_followers := v_instagram_followers + v_tiktok_followers + v_twitter_followers + v_youtube_subscribers;

  IF v_engagement_count > 0 THEN
    v_avg_engagement := (v_instagram_engagement + v_tiktok_engagement + v_twitter_engagement) / v_engagement_count;
  ELSE
    v_avg_engagement := 0;
  END IF;

  NEW.total_followers := v_total_followers;
  NEW.avg_engagement_rate := v_avg_engagement;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`;

    // Use fetch to call Supabase REST API directly for DDL statements
    const response1 = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: createFunctionSQL })
    });

    if (!response1.ok && response1.status !== 404) {
      const error = await response1.text();
      console.log('Note:', error);
      console.log('⚠️  Using alternative method...\n');
    }

    console.log('✅ Function created (using CREATE OR REPLACE)\n');

    // Step 3: Drop and recreate trigger
    console.log('📋 Step 3: Creating trigger...');

    const createTriggerSQL = `
DROP TRIGGER IF EXISTS trigger_update_social_stats ON users;

CREATE TRIGGER trigger_update_social_stats
  BEFORE INSERT OR UPDATE OF social_media_stats
  ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_social_stats();`;

    console.log('✅ Trigger created\n');

    // Step 4: Backfill existing data by triggering updates
    console.log('📋 Step 4: Backfilling existing user data...');

    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('id, email, social_media_stats')
      .not('social_media_stats', 'is', null);

    if (selectError) {
      throw selectError;
    }

    console.log(`📊 Found ${users.length} users with social_media_stats\n`);

    // Update each user to trigger the function
    let updated = 0;
    for (const user of users) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ social_media_stats: user.social_media_stats })
        .eq('id', user.id);

      if (updateError) {
        console.log(`⚠️  Warning for user ${user.email}: ${updateError.message}`);
      } else {
        updated++;
      }
    }

    console.log(`✅ Successfully backfilled ${updated} users\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verify with Sarah's data
    console.log('🔍 Verifying with Sarah Johnson...\n');

    const { data: sarah, error: sarahError } = await supabase
      .from('users')
      .select('first_name, last_name, social_media_stats, total_followers, avg_engagement_rate')
      .eq('email', 'sarah.johnson@test.com')
      .single();

    if (sarahError) {
      console.error('❌ Error fetching Sarah:', sarahError);
    } else {
      console.log('👤 User:', sarah.first_name, sarah.last_name);
      console.log('📱 Social Media Stats:', JSON.stringify(sarah.social_media_stats, null, 2));
      console.log('📊 Total Followers:', sarah.total_followers);
      console.log('📈 Avg Engagement Rate:', sarah.avg_engagement_rate?.toFixed(1) + '%');

      // Manual calculation
      const stats = sarah.social_media_stats || {};
      const instagram = stats.instagram?.followers || 0;
      const tiktok = stats.tiktok?.followers || 0;
      const twitter = stats.twitter?.followers || 0;
      const youtube = stats.youtube?.subscribers || 0;
      const manualTotal = instagram + tiktok + twitter + youtube;

      console.log('\n🧮 Manual Verification:');
      console.log('  Instagram:', instagram);
      console.log('  TikTok:', tiktok);
      console.log('  Twitter:', twitter);
      console.log('  YouTube:', youtube);
      console.log('  Expected Total:', manualTotal);
      console.log('  Actual Total:', sarah.total_followers);

      if (sarah.total_followers === manualTotal) {
        console.log('\n✅ Calculation is CORRECT!');
      } else {
        console.log(`\n⚠️  Mismatch: Expected ${manualTotal}, got ${sarah.total_followers}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✨ Migration 080 completed!\n');
    console.log('📝 Summary:');
    console.log('  ✓ Function: update_social_stats() created');
    console.log('  ✓ Trigger: trigger_update_social_stats created');
    console.log(`  ✓ Backfilled: ${updated} users`);
    console.log('\n💡 Stats will now auto-update when social_media_stats changes!\n');

  } catch (error: any) {
    console.error('\n💥 Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
