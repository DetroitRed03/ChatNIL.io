#!/usr/bin/env tsx
/**
 * Check what tables exist in the current database
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');
  console.log(`📊 Database: ${SUPABASE_URL}\n`);

  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `
  });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📋 Tables in database:');
  console.log('═'.repeat(80));

  if (!data || typeof data !== 'object') {
    console.log('⚠️  No tables found or unexpected response format');
    return;
  }

  // The result comes back in a specific format - let's just stringify it to see
  console.log(JSON.stringify(data, null, 2));
}

checkSchema();
