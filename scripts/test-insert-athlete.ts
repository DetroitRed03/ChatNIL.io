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

async function testInsert() {
  console.log('🧪 Testing athlete insert with all possible columns...\n');

  const testData = {
    email: 'schema.test@example.com',
    role: 'athlete',
    first_name: 'Schema',
    last_name: 'Test',
    date_of_birth: '2005-01-01',
    phone: '+12125551234',
    school_name: 'Test University',
    graduation_year: 2026,
    primary_sport: 'Basketball',
    position: 'Guard',
    gpa: 3.5,
    hobbies: ['Gaming', 'Music'],
    lifestyle_interests: ['Fashion', 'Technology'],
    content_creation_interests: ['Sports Content', 'Lifestyle'],
    brand_affinity: ['Authenticity', 'Excellence'],
    causes_care_about: ['Education', 'Community'],
    bio: 'Test athlete bio',
    profile_completion_score: 85,
    onboarding_completed: true
  };

  const { data, error } = await supabase
    .from('users')
    .insert(testData)
    .select();

  if (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 The error above tells us which columns DON\'T exist');
    return;
  }

  console.log('✅ Success! Inserted athlete:');
  console.log(JSON.stringify(data, null, 2));

  // Clean up
  await supabase
    .from('users')
    .delete()
    .eq('email', 'schema.test@example.com');

  console.log('\n🧹 Cleaned up test data');
}

testInsert();
