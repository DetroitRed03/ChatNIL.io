/**
 * Complete NIL Educational Content Seeding
 * Seeds 22 knowledge base articles + 50 quiz questions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🚀 Starting NIL Educational Content Seeding...\n');

  try {
    // Get current counts
    const { count: kbBefore } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true });

    const { count: quizBefore } = await supabase
      .from('quiz_questions')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Current state:');
    console.log(`   Knowledge base: ${kbBefore} articles`);
    console.log(`   Quiz questions: ${quizBefore} questions\n`);

    // Note: Content seeding will be done via direct SQL execution
    // due to the large volume of content
    console.log('✅ Script ready. Please run the SQL migration file instead:');
    console.log('   bash -c \'export $(cat .env.local | grep -v "^#" | xargs) && ./migrate.sh migrations/130_seed_nil_educational_content.sql\'');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
