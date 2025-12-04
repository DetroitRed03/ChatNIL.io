import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [key, ...valueParts] = trimmed.split('=');
  env[key] = valueParts.join('=');
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL!,
  env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPublicUsers() {
  console.log('🔍 Checking public.users table...\n');

  // Check if table exists
  const { data: tables, error: tablesError } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (tablesError) {
    console.log('❌ public.users table does not exist or is not accessible');
    console.log('Error:', tablesError.message);
    console.log('\nThis explains the FK constraint failure!\n');
    return;
  }

  console.log('✅ public.users table exists\n');

  // Check for the specific agency user
  const agencyId = '28f1070c-b398-4da0-a81a-921e7de352e0';
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', agencyId)
    .single();

  if (userError || !user) {
    console.log(`❌ User ${agencyId} NOT found in public.users`);
    console.log('This is why the FK constraint failed!\n');
  } else {
    console.log(`✅ User ${agencyId} found in public.users`);
    console.log('User data:', user);
  }

  // List all users
  const { data: allUsers, error: allError } = await supabase
    .from('users')
    .select('id, email, role')
    .limit(50);

  if (!allError && allUsers) {
    console.log(`\n📊 Total users in public.users: ${allUsers.length}\n`);
    if (allUsers.length > 0) {
      console.log('Sample users:');
      allUsers.slice(0, 10).forEach(u => {
        console.log(`  ${u.email || 'no-email'} (${u.id?.substring(0, 8)}...) - role: ${u.role || 'none'}`);
      });
    }
  }
}

checkPublicUsers();
