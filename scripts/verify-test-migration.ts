#!/usr/bin/env tsx
/**
 * Verify the test migration worked
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
  console.log('🔍 Verifying test migration...\n');

  const { data, error } = await supabase
    .from('migration_test')
    .select('*');

  if (error) {
    console.error('❌ Error querying migration_test table:', error);
    process.exit(1);
  }

  console.log('✅ Table exists and is queryable!');
  console.log(`📊 Found ${data.length} row(s):\n`);
  console.log(JSON.stringify(data, null, 2));
  console.log('\n🎉 Test migration was successful!');
}

verify();
