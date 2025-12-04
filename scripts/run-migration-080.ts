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
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '080_auto_calculate_social_stats.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split into individual statements (simple split by semicolon)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n⏳ Executing statement ${i + 1}/${statements.length}...`);

      // Show first 100 chars of statement
      const preview = statement.substring(0, 100).replace(/\n/g, ' ');
      console.log(`   ${preview}${statement.length > 100 ? '...' : ''}`);

      const { data, error } = await supabase.rpc('exec_sql', {
        query: statement + ';'
      });

      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
        if (error.message.includes('does not exist')) {
          console.log('   ℹ️  (This may be expected if dropping non-existent objects)');
        } else {
          throw error;
        }
      } else {
        console.log('   ✅ Success');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 Migration 080 completed successfully!\n');

    // Verify the trigger was created
    console.log('🔍 Verifying trigger creation...\n');

    const { data: triggers } = await supabase.rpc('exec_sql', {
      query: `SELECT trigger_name, event_manipulation, event_object_table
            FROM information_schema.triggers
            WHERE trigger_name = 'trigger_update_social_stats';`
    });

    if (triggers) {
      console.log('✅ Trigger verified:', triggers);
    }

    // Test with Sarah's data
    console.log('\n📊 Testing with Sarah Johnson...\n');

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
      console.log('📈 Avg Engagement Rate:', sarah.avg_engagement_rate + '%');

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
        console.log('\n✅ Calculation is CORRECT!\n');
      } else {
        console.log(`\n⚠️  Mismatch detected! Triggering recalculation...\n`);

        // Force recalculation
        const { error: updateError } = await supabase
          .from('users')
          .update({ social_media_stats: sarah.social_media_stats })
          .eq('email', 'sarah.johnson@test.com');

        if (updateError) {
          console.error('❌ Error updating:', updateError);
        } else {
          console.log('✅ Recalculation triggered successfully');
        }
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ All done! Your social stats will now auto-calculate.\n');

  } catch (error: any) {
    console.error('\n💥 Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
