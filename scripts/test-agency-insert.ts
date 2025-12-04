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

async function testAgency() {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: 'test.agency@example.com',
      role: 'agency',
      first_name: 'Test',
      last_name: 'Agency',
      company_name: 'Test Company',
      bio: 'Test bio'
    })
    .select();

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Success:', data);
    // Cleanup
    await supabase.from('users').delete().eq('email', 'test.agency@example.com');
  }
}

testAgency();
