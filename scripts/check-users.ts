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

async function checkUsers() {
  console.log('🔍 Checking auth users...\n');

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Total users:', data?.users?.length || 0);

  if (data && data.users && data.users.length > 0) {
    console.log('\nUsers:');
    data.users.forEach(u => {
      const role = u.user_metadata?.role || 'none';
      console.log(`  ${u.email} (${u.id.substring(0, 8)}...) - role: ${role}`);
    });
  }
}

checkUsers();
