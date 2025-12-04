import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkFields() {
  const { data } = await supabase
    .from('quiz_questions')
    .select('*')
    .limit(1);

  if (data && data[0]) {
    console.log('✅ Available fields in quiz_questions:');
    console.log(Object.keys(data[0]).sort().join(', '));
    console.log('\n📋 Sample question:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('❌ No data returned');
  }
}

checkFields();
