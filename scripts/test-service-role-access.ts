import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testServiceRole() {
  console.log('🧪 Testing service role access to schools table...\n');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Service Key (first 20 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...');

  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('custom_slug', 'test-hs')
    .single();

  if (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } else {
    console.log('\n✅ Success! School found:');
    console.log('   Name:', data.school_name);
    console.log('   ID:', data.id);
    console.log('   Slug:', data.custom_slug);
    process.exit(0);
  }
}

testServiceRole();
