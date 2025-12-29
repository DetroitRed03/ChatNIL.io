#!/usr/bin/env npx tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getSchema() {
  // Get Sarah's profile to see what fields exist
  const { data, error } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', 'ca05429a-0f32-4280-8b71-99dc5baee0dc')
    .single();

  if (error) {
    console.log('Error:', error);
    return;
  }

  console.log('Athlete Profile Fields (with values):');
  for (const [key, value] of Object.entries(data || {})) {
    if (value !== null && value !== undefined && value !== '') {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    }
  }

  console.log('\nAll fields:');
  console.log(Object.keys(data || {}).join(', '));
}

getSchema().catch(console.error);
