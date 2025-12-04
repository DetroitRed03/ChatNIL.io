import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedBatch(filename: string, tableName: string) {
  const filePath = join(__dirname, 'seed-data', filename);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));

  console.log(`\n📦 Seeding ${filename} (${data.length} items)...`);

  let inserted = 0;
  for (const item of data) {
    const { error } = await supabase.from(tableName).insert(item);
    if (error) {
      console.error(`  ❌ Error:`, error.message);
    } else {
      console.log(`  ✅ ${item.title || item.question?.substring(0, 50)}`);
      inserted++;
    }
  }

  return inserted;
}

async function main() {
  console.log('🚀 NIL Content Seeding - Batch Mode\n');

  const batches = [
    { file: 'core-education.json', table: 'knowledge_base', desc: 'Core Education' }
  ];

  let totalInserted = 0;

  for (const batch of batches) {
    const count = await seedBatch(batch.file, batch.table);
    totalInserted += count;
    console.log(`  📊 ${batch.desc}: ${count} inserted`);
  }

  console.log(`\n✅ Total inserted: ${totalInserted}`);

  // Verify
  const { count: kbCount } = await supabase.from('knowledge_base').select('*', { count: 'exact', head: true });
  const { count: quizCount } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true });

  console.log(`\n📊 Final counts:`);
  console.log(`   Knowledge base: ${kbCount}`);
  console.log(`   Quiz questions: ${quizCount}`);
}

main();
