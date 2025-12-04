#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testProfileInsert() {
  console.log('🧪 Testing athlete_public_profiles insert...\n');

  // First create a test user
  const { data: user } = await supabase
    .from('users')
    .insert({
      email: 'profile.test@example.com',
      role: 'athlete',
      first_name: 'Profile',
      last_name: 'Test'
    })
    .select()
    .single();

  if (!user) {
    console.error('❌ Failed to create test user');
    return;
  }

  console.log('✅ Created test user:', user.id);

  const testProfile = {
    user_id: user.id,
    display_name: 'Profile Test',
    bio: 'Test bio',
    sport: 'Basketball',
    position: 'Guard',
    school_name: 'Test University',
    school_level: 'college',
    graduation_year: 2026,
    state: 'KY',
    city: 'Lexington',
    instagram_followers: 5000,
    tiktok_followers: 3000,
    content_categories: ['Sports Content', 'Lifestyle'],
    interests: ['Gaming', 'Music'],
    brand_values: ['Authenticity'],
    availability_status: 'available'
  };

  const { data: profile, error } = await supabase
    .from('athlete_public_profiles')
    .insert(testProfile)
    .select();

  if (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 The error above tells us which columns DON\'T exist in athlete_public_profiles');
  } else {
    console.log('✅ Success! Inserted profile:');
    console.log(JSON.stringify(profile, null, 2));
  }

  // Clean up
  await supabase.from('athlete_public_profiles').delete().eq('user_id', user.id);
  await supabase.from('users').delete().eq('id', user.id);

  console.log('\n🧹 Cleaned up test data');
}

testProfileInsert();
