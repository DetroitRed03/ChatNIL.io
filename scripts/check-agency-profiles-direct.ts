#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('id, business_name, business_type, email');

  if (error) {
    console.log('Error:', error);
  } else {
    console.log('✅ Business profiles found:', data.length);
    for (const profile of data) {
      console.log(`\n  • ${profile.business_name}`);
      console.log(`    Type: ${profile.business_type}`);
      console.log(`    Email: ${profile.email}`);
    }
  }
}

check();
