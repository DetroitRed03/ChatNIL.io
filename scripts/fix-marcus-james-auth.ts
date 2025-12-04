/**
 * Fix Marcus and James Auth Users
 * Creates auth.users entries for athletes that exist in public.users
 * but are missing from auth.users (causing FK constraint violations)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Athletes that exist in public.users but not in auth.users
const MISSING_ATHLETES = [
  {
    id: '7a799d45-d306-4622-b70f-46e7444e1caa',
    expectedEmail: 'marcus.williams@test.com' // Will verify from DB
  },
  {
    id: 'f496bd63-2c98-42af-a976-6b42528d0a59',
    expectedEmail: 'james.chen@test.com' // Will verify from DB
  }
];

async function main() {
  console.log('🔧 Fix Marcus and James Auth Users');
  console.log('====================================\n');

  for (const athlete of MISSING_ATHLETES) {
    console.log(`\n📋 Processing athlete: ${athlete.id}`);

    // First, get their info from public.users
    const { data: publicUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('id', athlete.id)
      .single();

    if (fetchError || !publicUser) {
      console.log(`⚠️ Athlete ${athlete.id} not found in public.users:`, fetchError?.message);
      continue;
    }

    console.log(`✅ Found in public.users:`, {
      id: publicUser.id,
      email: publicUser.email,
      name: `${publicUser.first_name} ${publicUser.last_name}`,
      role: publicUser.role
    });

    // Check if they exist in auth.users
    const { data: authUser, error: authCheckError } = await supabase.auth.admin.getUserById(athlete.id);

    if (authUser?.user) {
      console.log(`✅ Already exists in auth.users:`, authUser.user.email);
      continue;
    }

    console.log(`❌ NOT in auth.users, creating...`);

    // Create auth user with same ID
    const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
      email: publicUser.email,
      password: 'TestPassword123!', // Temporary password
      email_confirm: true,
      user_metadata: {
        first_name: publicUser.first_name,
        last_name: publicUser.last_name,
        role: publicUser.role
      }
    });

    if (createError) {
      console.error(`❌ Failed to create auth user:`, createError.message);

      // If email already exists, try to link it
      if (createError.message.includes('already registered')) {
        console.log('📧 Email already registered, user may exist with different ID');

        // Try to find the user by email
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === publicUser.email);

        if (existingUser) {
          console.log(`📋 Found existing auth user with email: ${existingUser.id}`);
          console.log(`⚠️ Manual fix needed: Update public.users.id from ${publicUser.id} to ${existingUser.id}`);
        }
      }
      continue;
    }

    console.log(`✅ Created auth user:`, {
      id: newAuthUser?.user?.id,
      email: newAuthUser?.user?.email
    });

    // If the new auth user ID is different from public.users ID, we need to update public.users
    if (newAuthUser?.user?.id && newAuthUser.user.id !== publicUser.id) {
      console.log(`⚠️ Auth user ID (${newAuthUser.user.id}) differs from public.users ID (${publicUser.id})`);
      console.log(`🔄 Updating public.users to match auth.users ID...`);

      // Update the public.users record to use the new auth user ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ id: newAuthUser.user.id })
        .eq('id', publicUser.id);

      if (updateError) {
        console.error(`❌ Failed to update public.users:`, updateError.message);
      } else {
        console.log(`✅ Updated public.users ID to match auth.users`);
      }
    }
  }

  console.log('\n====================================');
  console.log('✅ Auth user fix completed!');
  console.log('\nNow try regenerating matches on the Discovery page.');
}

main().catch(console.error);
