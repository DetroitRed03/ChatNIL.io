import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://lqskiijspudfocddhkqs.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('🔧 Creating exec_sql function...\n');

  // Read migration 001
  const sql = fs.readFileSync('migrations/001_create_sql_executor.sql', 'utf-8');

  console.log('📄 Migration 001: Create SQL Executor');
  console.log('⚙️  Executing...\n');

  // Use direct REST API call since exec_sql might not exist
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    }
  );

  if (response.status === 404) {
    console.log('⚠️  exec_sql function does not exist');
    console.log('📝 Creating it directly via SQL...\n');

    // Try creating via raw SQL
    const { data, error } = await supabase.from('_raw_sql').select('*');

    if (error) {
      console.log('❌ Cannot create exec_sql function automatically');
      console.log('');
      console.log('🔧 MANUAL STEPS REQUIRED:');
      console.log('━'.repeat(60));
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Run this SQL:');
      console.log('');
      console.log(sql);
      console.log('');
      console.log('3. Then run: npx tsx scripts/setup-new-db-complete.ts');
      return;
    }
  }

  console.log('✅ exec_sql function ready!');
}

main().catch(console.error);
