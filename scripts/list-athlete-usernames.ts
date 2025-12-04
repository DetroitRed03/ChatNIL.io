import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listAthletes() {
  console.log('🔍 Listing all athlete users...\n');

  const { data: users, error } = await supabase
    .from('users')
    .select('id, username, first_name, last_name, role, content_samples')
    .eq('role', 'athlete')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log('❌ No athlete users found');
    return;
  }

  console.log(`✅ Found ${users.length} athlete users:\n`);

  users.forEach((user, index) => {
    const portfolioCount = user.content_samples?.length || 0;
    console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
    console.log(`   Username: ${user.username || 'NO USERNAME'}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Portfolio items: ${portfolioCount}`);
    console.log('');
  });
}

listAthletes();
