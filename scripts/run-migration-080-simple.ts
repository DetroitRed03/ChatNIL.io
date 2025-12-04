import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting Migration 080: Auto-calculate Social Stats\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Read the entire migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '080_auto_calculate_social_stats.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📋 Executing entire migration SQL...\n');

    // Execute the entire SQL as one statement
    const { data, error } = await supabase.rpc('exec_sql', {
      query: migrationSQL
    });

    if (error) {
      console.error('❌ Error:', error);
      throw error;
    }

    console.log('✅ Migration SQL executed:', data);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Wait a moment for the trigger to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

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

      const engagements = [];
      if (stats.instagram?.engagement_rate) engagements.push(stats.instagram.engagement_rate);
      if (stats.tiktok?.engagement_rate) engagements.push(stats.tiktok.engagement_rate);
      if (stats.twitter?.engagement_rate) engagements.push(stats.twitter.engagement_rate);
      const manualAvgEngagement = engagements.length > 0
        ? engagements.reduce((a, b) => a + b, 0) / engagements.length
        : 0;

      console.log('\n🧮 Manual Verification:');
      console.log('  Instagram:', instagram);
      console.log('  TikTok:', tiktok);
      console.log('  Twitter:', twitter);
      console.log('  YouTube:', youtube);
      console.log('  Expected Total Followers:', manualTotal);
      console.log('  Actual Total Followers:', sarah.total_followers);
      console.log('  Expected Avg Engagement:', manualAvgEngagement.toFixed(2) + '%');
      console.log('  Actual Avg Engagement:', sarah.avg_engagement_rate?.toFixed(2) + '%');

      if (sarah.total_followers === manualTotal) {
        console.log('\n✅ Follower count calculation is CORRECT!');
      } else {
        console.log(`\n⚠️  Follower mismatch: Expected ${manualTotal}, got ${sarah.total_followers}`);
        console.log('   (This may be because the trigger hasn\'t fired yet)');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✨ Migration 080 completed!\n');
    console.log('📝 The trigger will now automatically update:');
    console.log('   • total_followers (sum of all platforms)');
    console.log('   • avg_engagement_rate (average across platforms)');
    console.log('\n💡 Whenever social_media_stats is updated!\n');

  } catch (error: any) {
    console.error('\n💥 Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
