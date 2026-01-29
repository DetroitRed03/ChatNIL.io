/**
 * Setup Compliance Officer Script
 *
 * This script sets up a user as a compliance officer by:
 * 1. Finding or creating their institution
 * 2. Creating an entry in the institution_staff table
 *
 * Usage:
 *   npx tsx scripts/setup-compliance-officer.ts <email> <institution_name> [state]
 *
 * Example:
 *   npx tsx scripts/setup-compliance-officer.ts robert.chen@oregonstate.edu "Oregon State University" OR
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    });
  } catch (e) {
    // Env vars may already be set
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function setupComplianceOfficer(
  email: string,
  institutionName: string,
  state: string = 'OR'
) {
  console.log('\n=== Setting up Compliance Officer ===');
  console.log(`Email: ${email}`);
  console.log(`Institution: ${institutionName}`);
  console.log(`State: ${state}`);

  // Step 1: Find the user by email
  console.log('\n1. Finding user by email...');
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();

  if (userError) {
    console.error('Error listing users:', userError);
    process.exit(1);
  }

  const user = users.users.find(u => u.email === email);
  if (!user) {
    console.error(`User not found with email: ${email}`);
    console.log('Available users:');
    users.users.forEach(u => console.log(`  - ${u.email}`));
    process.exit(1);
  }

  console.log(`   Found user: ${user.id} (${user.email})`);

  // Step 2: Find or create the institution
  console.log('\n2. Finding or creating institution...');
  let { data: institution, error: instError } = await supabase
    .from('institutions')
    .select('*')
    .ilike('name', `%${institutionName}%`)
    .single();

  if (instError || !institution) {
    console.log('   Institution not found, creating new one...');

    const { data: newInst, error: createError } = await supabase
      .from('institutions')
      .insert({
        name: institutionName,
        type: institutionName.toLowerCase().includes('university') ? 'university' : 'college',
        state: state,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating institution:', createError);
      process.exit(1);
    }

    institution = newInst;
    console.log(`   Created institution: ${institution.id}`);
  } else {
    console.log(`   Found existing institution: ${institution.id} (${institution.name})`);
  }

  // Step 3: Check for existing staff record
  console.log('\n3. Checking for existing staff record...');
  const { data: existingStaff } = await supabase
    .from('institution_staff')
    .select('*')
    .eq('user_id', user.id)
    .eq('institution_id', institution.id)
    .single();

  if (existingStaff) {
    console.log('   Staff record already exists:');
    console.log(`   - Role: ${existingStaff.role}`);
    console.log(`   - Title: ${existingStaff.title}`);

    if (existingStaff.role !== 'compliance_officer') {
      console.log('   Updating role to compliance_officer...');
      const { error: updateError } = await supabase
        .from('institution_staff')
        .update({
          role: 'compliance_officer',
          permissions: {
            can_view_athletes: true,
            can_review_deals: true,
            can_approve_deals: true
          }
        })
        .eq('id', existingStaff.id);

      if (updateError) {
        console.error('Error updating staff record:', updateError);
        process.exit(1);
      }
      console.log('   Role updated successfully!');
    }
  } else {
    console.log('   Creating new staff record...');
    const { error: staffError } = await supabase
      .from('institution_staff')
      .insert({
        user_id: user.id,
        institution_id: institution.id,
        role: 'compliance_officer',
        title: 'Compliance Officer',
        is_primary_contact: true,
        permissions: {
          can_view_athletes: true,
          can_review_deals: true,
          can_approve_deals: true
        }
      });

    if (staffError) {
      console.error('Error creating staff record:', staffError);
      process.exit(1);
    }
    console.log('   Staff record created successfully!');
  }

  // Step 4: Update or create profile
  console.log('\n4. Updating user profile...');
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (existingProfile) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'compliance_officer',
        institution_id: institution.id
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    } else {
      console.log('   Profile updated with compliance_officer role');
    }
  } else {
    console.log('   No profile found - will be created on next login');
  }

  console.log('\n=== Setup Complete ===');
  console.log(`User ${email} is now a compliance officer at ${institutionName}`);
  console.log('\nThey can now access the compliance dashboard at /compliance/dashboard');
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: npx tsx scripts/setup-compliance-officer.ts <email> <institution_name> [state]');
  console.error('Example: npx tsx scripts/setup-compliance-officer.ts robert.chen@oregonstate.edu "Oregon State University" OR');
  process.exit(1);
}

const [email, institutionName, state = 'OR'] = args;

setupComplianceOfficer(email, institutionName, state)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
