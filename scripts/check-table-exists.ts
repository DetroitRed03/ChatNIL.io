#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTable() {
  console.log('🔍 Checking if users table exists...\n');

  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'users';
    `
  });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📊 Query result:', data);

  if (!data || data.length === 0) {
    console.log('\n❌ users table does NOT exist in public schema!');
    console.log('   Need to run the migration again.');
  } else {
    console.log('\n✅ users table EXISTS in database');
    console.log('   The PostgREST cache issue persists.');
  }
}

checkTable();
