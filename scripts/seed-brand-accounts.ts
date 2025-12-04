#!/usr/bin/env tsx
/**
 * Seed brand accounts in the NEW database
 * Creates Nike, Gatorade, and Local Business accounts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  console.error('   SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const BRAND_ACCOUNTS = [
  {
    email: 'nike.agency@test.com',
    password: 'TestPassword123!',
    role: 'agency',
    metadata: {
      agency_name: 'Nike',
      company_type: 'Brand',
      industry: 'Sports & Athletic Wear'
    }
  },
  {
    email: 'gatorade.agency@test.com',
    password: 'TestPassword123!',
    role: 'agency',
    metadata: {
      agency_name: 'Gatorade',
      company_type: 'Brand',
      industry: 'Sports Nutrition'
    }
  },
  {
    email: 'localbusiness.agency@test.com',
    password: 'TestPassword123!',
    role: 'agency',
    metadata: {
      agency_name: 'Local Business',
      company_type: 'Local Business',
      industry: 'Various'
    }
  }
];

async function seedBrandAccounts() {
  console.log('🌱 Seeding Brand Accounts to NEW Database\n');
  console.log('═'.repeat(80));
  console.log(`Database: ${SUPABASE_URL}`);
  console.log('═'.repeat(80));
  console.log('');

  for (const account of BRAND_ACCOUNTS) {
    console.log(`\n📧 Creating: ${account.metadata.agency_name} (${account.email})`);

    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: account.metadata
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`   ⚠️  User already exists, skipping...`);
        continue;
      }
      console.error(`   ❌ Auth error:`, authError.message);
      continue;
    }

    console.log(`   ✅ Auth user created (ID: ${authData.user.id})`);

    // Create the users profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: account.email,
        role: account.role,
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.error(`   ❌ Profile error:`, profileError.message);
      continue;
    }

    console.log(`   ✅ User profile created`);

    // Create the agency profile
    const { error: agencyError } = await supabase
      .from('agencies')
      .insert({
        user_id: authData.user.id,
        agency_name: account.metadata.agency_name,
        company_type: account.metadata.company_type,
        industry: account.metadata.industry,
        created_at: new Date().toISOString()
      });

    if (agencyError) {
      console.error(`   ❌ Agency profile error:`, agencyError.message);
      continue;
    }

    console.log(`   ✅ Agency profile created`);
    console.log(`   🎉 ${account.metadata.agency_name} account fully set up!`);
  }

  console.log('\n' + '═'.repeat(80));
  console.log('✅ Brand accounts seeding complete!');
  console.log('═'.repeat(80));
  console.log('\n📋 Login credentials:');
  console.log('   Password for all accounts: TestPassword123!');
  console.log('   Emails:');
  BRAND_ACCOUNTS.forEach(acc => {
    console.log(`   - ${acc.email}`);
  });
}

seedBrandAccounts().catch(console.error);
