#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkSchema(tableName: string) {
  console.log(`\n📋 Schema for table: ${tableName}`);
  console.log('━'.repeat(80));

  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = '${tableName}' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
  });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.table(data);
}

async function main() {
  console.log('🔍 Checking Database Schema...\n');

  await checkSchema('users');
  await checkSchema('athlete_public_profiles');
  await checkSchema('social_media_stats');
  await checkSchema('nil_deals');
  await checkSchema('agency_campaigns');

  console.log('\n✅ Schema check complete!');
}

main();
