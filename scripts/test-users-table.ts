#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function test() {
  console.log('🧪 Testing users table access...\n');

  const { data, error } = await supabase
    .from('users')
    .select('id, email, role')
    .limit(5);

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Users table accessible!');
    console.log('📊 Found', data.length, 'users:');
    data.forEach(u => console.log(`  - ${u.email} (${u.role})`));
  }
}

test();
