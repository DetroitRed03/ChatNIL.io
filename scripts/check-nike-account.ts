#!/usr/bin/env tsx
/**
 * Check Nike and local business account details
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkAccounts() {
  console.log('🔍 Checking Nike and Local Business accounts...\n');

  // Check Nike agency account
  const { data: nikeUser, error: nikeError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'nike.agency@test.com')
    .single();

  console.log('👟 NIKE AGENCY ACCOUNT:');
  console.log('═'.repeat(80));

  if (nikeError || !nikeUser) {
    console.log('❌ Nike account not found');
  } else {
    console.log('✅ Nike agency user exists');
    console.log(`   Email: ${nikeUser.email}`);
    console.log(`   ID: ${nikeUser.id}`);
    console.log(`   Role: ${nikeUser.role}`);
    console.log(`   Username: ${nikeUser.username || 'Not set'}`);

    // Check for agency profile
    const { data: agencyProfile } = await supabase
      .from('agency_profiles')
      .select('*')
      .eq('user_id', nikeUser.id)
      .single();

    if (agencyProfile) {
      console.log('\n   Agency Profile:');
      console.log(`   - Agency Name: ${agencyProfile.agency_name}`);
      console.log(`   - Agency Type: ${agencyProfile.agency_type || 'Not set'}`);
    } else {
      console.log('\n   ⚠️  No agency profile found');
    }
  }

  // Check local business account
  console.log('\n\n🏪 LOCAL BUSINESS ACCOUNT:');
  console.log('═'.repeat(80));

  const { data: localUser, error: localError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'local.agency@test.com')
    .single();

  if (localError || !localUser) {
    console.log('❌ Local business account not found');
  } else {
    console.log('✅ Local business user exists');
    console.log(`   Email: ${localUser.email}`);
    console.log(`   ID: ${localUser.id}`);
    console.log(`   Role: ${localUser.role}`);
    console.log(`   Username: ${localUser.username || 'Not set'}`);

    // Check for agency profile
    const { data: agencyProfile } = await supabase
      .from('agency_profiles')
      .select('*')
      .eq('user_id', localUser.id)
      .single();

    if (agencyProfile) {
      console.log('\n   Agency Profile:');
      console.log(`   - Agency Name: ${agencyProfile.agency_name}`);
      console.log(`   - Agency Type: ${agencyProfile.agency_type || 'Not set'}`);
    } else {
      console.log('\n   ⚠️  No agency profile found');
    }
  }

  // Check Gatorade account too
  console.log('\n\n🥤 GATORADE AGENCY ACCOUNT:');
  console.log('═'.repeat(80));

  const { data: gatoradeUser, error: gatoradeError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'gatorade.agency@test.com')
    .single();

  if (gatoradeError || !gatoradeUser) {
    console.log('❌ Gatorade account not found');
  } else {
    console.log('✅ Gatorade agency user exists');
    console.log(`   Email: ${gatoradeUser.email}`);
    console.log(`   ID: ${gatoradeUser.id}`);
    console.log(`   Role: ${gatoradeUser.role}`);

    const { data: agencyProfile } = await supabase
      .from('agency_profiles')
      .select('*')
      .eq('user_id', gatoradeUser.id)
      .single();

    if (agencyProfile) {
      console.log('\n   Agency Profile:');
      console.log(`   - Agency Name: ${agencyProfile.agency_name}`);
      console.log(`   - Agency Type: ${agencyProfile.agency_type || 'Not set'}`);
    } else {
      console.log('\n   ⚠️  No agency profile found');
    }
  }

  console.log('\n\n📋 TEST CREDENTIALS:');
  console.log('═'.repeat(80));
  console.log('Nike Agency:');
  console.log('  Email: nike.agency@test.com');
  console.log('  Password: (check seeding scripts or use password reset)');
  console.log('');
  console.log('Local Business:');
  console.log('  Email: local.agency@test.com');
  console.log('  Password: (check seeding scripts or use password reset)');
  console.log('');
  console.log('Gatorade Agency:');
  console.log('  Email: gatorade.agency@test.com');
  console.log('  Password: (check seeding scripts or use password reset)');
  console.log('');
}

checkAccounts();
