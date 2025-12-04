/**
 * Check users existence in both auth.users and public.users
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ATHLETE_IDS = [
  'ca05429a-0f32-4280-8b71-99dc5baee0dc', // Sarah Johnson
  '7a799d45-d306-4622-b70f-46e7444e1caa', // Marcus Williams
  'f496bd63-2c98-42af-a976-6b42528d0a59'  // James Thompson
];

async function main() {
  console.log('🔍 Checking user existence in both tables\n');

  for (const id of ATHLETE_IDS) {
    console.log(`\n📋 Checking ID: ${id}`);

    // Check public.users
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', id)
      .single();

    if (publicUser) {
      console.log(`  ✅ public.users: ${publicUser.first_name} ${publicUser.last_name} (${publicUser.email})`);
    } else {
      console.log(`  ❌ NOT in public.users:`, publicError?.message);
    }

    // Check auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(id);

    if (authData?.user) {
      console.log(`  ✅ auth.users: ${authData.user.email}`);
    } else {
      console.log(`  ❌ NOT in auth.users:`, authError?.message || 'User not found');
    }
  }

  // Also check the FK constraint definition
  console.log('\n\n📋 Checking FK constraint definition...');
  const { data: fkInfo, error: fkError } = await supabase.rpc('exec_sql', {
    sql_query: `
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'agency_athlete_matches'
        AND tc.constraint_type = 'FOREIGN KEY';
    `
  });

  if (fkError) {
    console.log('Could not fetch FK info via RPC, trying direct query...');
  } else {
    console.log('FK Constraints:', JSON.stringify(fkInfo, null, 2));
  }
}

main().catch(console.error);
