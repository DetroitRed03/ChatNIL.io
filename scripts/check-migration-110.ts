import { createClient } from '@supabase/supabase-js';

// NEW Database (always use this one)
const supabaseUrl = 'https://lqskiijspudfocddhkqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMigrationData() {
  console.log('🔍 Checking Migration 110 Data...\n');
  console.log(`📊 Database: ${supabaseUrl}\n`);

  // Check Nike agency
  console.log('1️⃣ Checking Nike Agency...');
  const { data: nike, error: nikeError } = await supabase
    .from('users')
    .select('id, email, role, onboarding_completed')
    .eq('email', 'nike.agency@test.com')
    .single();

  if (nikeError) {
    console.log('❌ Error:', nikeError.message);
  } else if (nike) {
    console.log('✅ Nike Agency found:', nike.email);
    console.log('   ID:', nike.id);
    console.log('   Onboarding:', nike.onboarding_completed);
  } else {
    console.log('❌ Nike Agency not found');
  }

  // Check demo athletes
  console.log('\n2️⃣ Checking Demo Athletes...');
  const { data: athletes, error: athletesError } = await supabase
    .from('users')
    .select('id, email, full_name, role')
    .eq('role', 'athlete')
    .like('email', '%@demo.chatnil.io');

  if (athletesError) {
    console.log('❌ Error:', athletesError.message);
  } else {
    console.log(`✅ Found ${athletes?.length || 0} demo athletes`);
    athletes?.forEach(a => console.log(`   - ${a.full_name} (${a.email})`));
  }

  // Check athlete profiles
  console.log('\n3️⃣ Checking Athlete Profiles...');
  const { data: profiles, error: profilesError } = await supabase
    .from('athlete_profiles')
    .select('user_id, sport, school, estimated_fmv')
    .limit(10);

  if (profilesError) {
    console.log('❌ Error:', profilesError.message);
  } else {
    console.log(`✅ Found ${profiles?.length || 0} athlete profiles`);
    profiles?.forEach(p => console.log(`   - ${p.sport} at ${p.school} ($${p.estimated_fmv})`));
  }

  // Check campaigns
  if (nike) {
    console.log('\n4️⃣ Checking Campaigns...');
    const { data: campaigns, error: campaignsError } = await supabase
      .from('agency_campaigns')
      .select('id, name, budget, spent, status')
      .eq('agency_id', nike.id);

    if (campaignsError) {
      console.log('❌ Error:', campaignsError.message);
    } else {
      console.log(`✅ Found ${campaigns?.length || 0} campaigns`);
      campaigns?.forEach(c => console.log(`   - ${c.name}: $${c.budget} budget, $${c.spent} spent (${c.status})`));
    }

    // Check saved lists
    console.log('\n5️⃣ Checking Saved Lists...');
    const { data: lists, error: listsError } = await supabase
      .from('agency_athlete_lists')
      .select('id, name, athlete_ids')
      .eq('agency_id', nike.id);

    if (listsError) {
      console.log('❌ Error:', listsError.message);
    } else {
      console.log(`✅ Found ${lists?.length || 0} saved lists`);
      lists?.forEach(l => console.log(`   - ${l.name}: ${l.athlete_ids?.length || 0} athletes`));
    }

    // Check message threads
    console.log('\n6️⃣ Checking Message Threads...');
    const { data: threads, error: threadsError } = await supabase
      .from('agency_message_threads')
      .select('id, status, last_message')
      .eq('agency_id', nike.id);

    if (threadsError) {
      console.log('❌ Error:', threadsError.message);
    } else {
      console.log(`✅ Found ${threads?.length || 0} message threads`);
      threads?.forEach(t => console.log(`   - Status: ${t.status}`));
    }
  }

  console.log('\n✅ Check complete!');
}

checkMigrationData().catch(console.error);
