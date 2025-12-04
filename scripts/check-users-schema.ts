import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking users table schema...\n');
  
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'athlete')
    .limit(1)
    .single();

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log('✅ Available columns in users table:');
  console.log(Object.keys(users).sort().join(', '));
}

checkSchema();
