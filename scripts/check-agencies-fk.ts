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

async function checkAgenciesFK() {
  console.log('🔍 Checking agencies table foreign key constraints...\n');

  // Check if agencies table exists and get some info
  const { data: agencies, error: agenciesError } = await supabase
    .from('agencies')
    .select('*')
    .limit(5);

  if (agenciesError) {
    console.log('❌ Error accessing agencies table:', agenciesError.message);
    return;
  }

  console.log(`✅ agencies table exists with ${agencies?.length || 0} rows`);

  if (agencies && agencies.length > 0) {
    console.log('\nSample agency:');
    console.log(JSON.stringify(agencies[0], null, 2));
  }

  // Try to query the migration file to see FK constraint
  console.log('\n📄 Checking migration 040 for FK constraints...\n');

  const { execSync } = await import('child_process');
  try {
    const grep = execSync('grep -A 5 "FOREIGN KEY" migrations/040_agency_platform.sql || echo "Not found"', { encoding: 'utf-8' });
    console.log(grep);
  } catch (e) {
    console.log('Could not grep migration file');
  }
}

checkAgenciesFK();
