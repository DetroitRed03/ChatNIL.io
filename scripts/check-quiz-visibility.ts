import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkQuizData() {
  console.log('🔍 Checking quiz data for UI visibility...\n');

  // Check questions by category
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('category, difficulty');

  if (!questions) {
    console.log('❌ No questions found!');
    return;
  }

  console.log(`✅ Total active questions: ${questions.length}\n`);

  // Group by category
  const byCategory = questions.reduce((acc: any, q: any) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q.difficulty);
    return acc;
  }, {});

  console.log('📊 Questions by category:\n');
  Object.entries(byCategory).sort().forEach(([cat, diffs]: [string, any]) => {
    const beginnerCount = diffs.filter((d: string) => d === 'beginner').length;
    console.log(`  ${cat.padEnd(20)} Total: ${diffs.length.toString().padStart(2)} | Beginner: ${beginnerCount}`);
  });

  console.log('\n🎯 Beginner quiz availability:');
  const categoriesWithBeginner = Object.entries(byCategory)
    .filter(([_, diffs]: [string, any]) => diffs.includes('beginner'))
    .map(([cat]) => cat);

  console.log(`  ${categoriesWithBeginner.length} categories have beginner questions`);
  console.log(`  Categories: ${categoriesWithBeginner.join(', ')}`);

  // Check what the UI expects
  console.log('\n📋 Expected UI categories:');
  const expectedCategories = [
    'nil_basics',
    'contracts',
    'branding',
    'social_media',
    'compliance',
    'tax_finance',
    'negotiation',
    'legal',
    'marketing',
    'athlete_rights'
  ];

  expectedCategories.forEach(cat => {
    const count = byCategory[cat]?.length || 0;
    const hasQuestions = count > 0 ? '✅' : '❌';
    console.log(`  ${hasQuestions} ${cat.padEnd(20)} ${count} questions`);
  });
}

checkQuizData();
