/**
 * Test script to diagnose demo API endpoint issues
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  console.log('🔍 Testing Demo API Endpoints...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Test 1: Check if agency_campaigns table exists and has data
  console.log('1️⃣ Testing agency_campaigns table...');
  try {
    const { data: campaigns, error } = await supabase
      .from('agency_campaigns')
      .select('id, campaign_name, brand_name, status')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching campaigns:', error.message);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
    } else {
      console.log(`✅ Found ${campaigns?.length || 0} campaigns`);
      if (campaigns && campaigns.length > 0) {
        console.log('   Sample:', campaigns[0]);
      }
    }
  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message);
  }

  console.log('\n2️⃣ Testing athlete_fmv_data table...');
  try {
    const { data: fmvData, error } = await supabase
      .from('athlete_fmv_data')
      .select('id, athlete_id, fmv_score, fmv_tier')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching FMV data:', error.message);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
    } else {
      console.log(`✅ Found ${fmvData?.length || 0} FMV records`);
      if (fmvData && fmvData.length > 0) {
        console.log('   Sample:', fmvData[0]);
      }
    }
  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message);
  }

  console.log('\n3️⃣ Testing users with FMV join...');
  try {
    const { data: athletes, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        primary_sport,
        athlete_fmv_data!inner (
          fmv_score,
          fmv_tier
        )
      `)
      .eq('role', 'athlete')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching athletes with FMV:', error.message);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
    } else {
      console.log(`✅ Found ${athletes?.length || 0} athletes with FMV data`);
      if (athletes && athletes.length > 0) {
        console.log('   Sample:', JSON.stringify(athletes[0], null, 2));
      }
    }
  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message);
  }

  console.log('\n4️⃣ Testing athlete_public_profiles table...');
  try {
    const { data: profiles, error } = await supabase
      .from('athlete_public_profiles')
      .select('id, user_id, sport, is_available_for_partnerships')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching athlete profiles:', error.message);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} athlete profiles`);
      if (profiles && profiles.length > 0) {
        console.log('   Sample:', profiles[0]);
      }
    }
  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message);
  }

  console.log('\n5️⃣ Testing social_media_stats table...');
  try {
    const { data: stats, error } = await supabase
      .from('social_media_stats')
      .select('id, user_id, platform, followers, engagement_rate')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching social media stats:', error.message);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
    } else {
      console.log(`✅ Found ${stats?.length || 0} social media stats records`);
      if (stats && stats.length > 0) {
        console.log('   Sample:', stats[0]);
      }
    }
  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message);
  }

  console.log('\n6️⃣ Testing athlete count by role...');
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'athlete');

    if (error) {
      console.error('❌ Error counting athletes:', error.message);
    } else {
      console.log(`✅ Total athletes in users table: ${count}`);
    }
  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message);
  }

  console.log('\n7️⃣ Testing API endpoint: /api/demo/fmv/athletes');
  try {
    const response = await fetch('http://localhost:3001/api/demo/fmv/athletes');
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ API returned ${response.status}`);
      console.error('   Response:', JSON.stringify(data, null, 2));
    } else {
      console.log(`✅ API returned ${response.status}`);
      console.log(`   Found ${data.total || 0} athletes`);
      if (data.athletes && data.athletes.length > 0) {
        console.log('   Sample:', data.athletes[0]);
      }
    }
  } catch (err: any) {
    console.error('❌ Fetch error:', err.message);
  }

  console.log('\n8️⃣ Testing API endpoint: /api/demo/matchmaking/campaigns');
  try {
    const response = await fetch('http://localhost:3001/api/demo/matchmaking/campaigns');
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ API returned ${response.status}`);
      console.error('   Response:', JSON.stringify(data, null, 2));
    } else {
      console.log(`✅ API returned ${response.status}`);
      console.log(`   Found ${data.total || 0} campaigns`);
      if (data.campaigns && data.campaigns.length > 0) {
        console.log('   Sample:', data.campaigns[0]);
      }
    }
  } catch (err: any) {
    console.error('❌ Fetch error:', err.message);
  }

  console.log('\n✅ Test complete!');
  process.exit(0);
}

main().catch(console.error);
