#!/usr/bin/env tsx

/**
 * Minimal Test Data Seeding Script
 * Seeds basic test data to get dashboards working
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('🚀 Seeding minimal test data...\n');

  try {
    // Check if test athlete already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'test.athlete@example.com')
      .single();

    if (existing) {
      console.log('✅ Test data already exists!');
      console.log(`   Athlete ID: ${existing.id}`);
      console.log(`   Email: ${existing.email}`);
      return;
    }

    console.log('📊 Creating test athlete...');

    const { data: athlete, error: athleteError } = await supabase
      .from('users')
      .insert({
        email: 'test.athlete@example.com',
        role: 'athlete',
        first_name: 'Test',
        last_name: 'Athlete',
        school_name: 'Test University',
        graduation_year: 2026,
        primary_sport: 'Basketball',
        position: 'Point Guard',
        bio: 'Test athlete for development',
        onboarding_completed: true
      })
      .select()
      .single();

    if (athleteError) {
      console.error('❌ Error creating athlete:', athleteError);
      throw athleteError;
    }

    console.log(`✅ Created test athlete: ${athlete.email}`);
    console.log(`   ID: ${athlete.id}`);
    console.log('\n🎉 Minimal test data seeded successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Set password in Supabase Auth dashboard');
    console.log('   2. Login to test the dashboard');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
