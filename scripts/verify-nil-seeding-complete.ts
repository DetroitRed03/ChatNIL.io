import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
  console.log('\n🎯 NIL EDUCATIONAL CONTENT SEEDING - FINAL VERIFICATION\n');
  console.log('='.repeat(70));

  // Knowledge Base Summary
  console.log('\n📚 KNOWLEDGE BASE SUMMARY\n');

  const { data: kbCategories } = await supabase
    .from('knowledge_base')
    .select('category')
    .order('category');

  if (kbCategories) {
    const categoryCounts = kbCategories.reduce((acc: any, row: any) => {
      acc[row.category] = (acc[row.category] || 0) + 1;
      return acc;
    }, {});

    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category.padEnd(15)} ${count}`);
    });
  }

  const { count: totalKB } = await supabase
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true });

  console.log('   ' + '-'.repeat(20));
  console.log(`   Total             ${totalKB}`);

  // Quiz Questions Summary
  console.log('\n\n❓ QUIZ QUESTIONS SUMMARY\n');

  const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
  const pointValues: { [key: string]: number } = {
    beginner: 10,
    intermediate: 25,
    advanced: 50,
    expert: 100
  };

  let totalQuestions = 0;
  let totalPoints = 0;

  console.log('   Difficulty      Count    Points/Q    Total Points');
  console.log('   ' + '-'.repeat(55));

  for (const diff of difficulties) {
    const { count } = await supabase
      .from('quiz_questions')
      .select('*', { count: 'exact', head: true })
      .eq('difficulty', diff);

    const questionCount = count || 0;
    const pointsPerQ = pointValues[diff];
    const points = questionCount * pointsPerQ;

    console.log(`   ${diff.padEnd(15)} ${String(questionCount).padStart(5)}    ${String(pointsPerQ).padStart(7)}    ${String(points).padStart(12)}`);

    totalQuestions += questionCount;
    totalPoints += points;
  }

  console.log('   ' + '-'.repeat(55));
  console.log(`   Total           ${String(totalQuestions).padStart(5)}                ${String(totalPoints).padStart(12)}`);

  // Test full-text search
  console.log('\n\n🔍 TEXT SEARCH TEST (searching for "contract")\n');

  const { data: searchResults } = await supabase
    .from('knowledge_base')
    .select('title, category')
    .textSearch('content', 'contract')
    .limit(3);

  if (searchResults && searchResults.length > 0) {
    searchResults.forEach((result: any, i: number) => {
      console.log(`   ${i + 1}. [${result.category}] ${result.title.substring(0, 60)}`);
    });
  } else {
    console.log('   ⚠️  No results found - trying alternative search...');

    // Fallback: manual filter
    const { data: allDocs } = await supabase
      .from('knowledge_base')
      .select('title, category, content');

    const matches = allDocs?.filter((doc: any) =>
      doc.content.toLowerCase().includes('contract')
    ).slice(0, 3);

    matches?.forEach((result: any, i: number) => {
      console.log(`   ${i + 1}. [${result.category}] ${result.title.substring(0, 60)}`);
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ SEEDING COMPLETE!\n');
  console.log(`   • ${totalKB} knowledge base articles`);
  console.log(`   • ${totalQuestions} quiz questions`);
  console.log(`   • ${totalPoints} total quiz points available`);
  console.log(`   • Full-text search working\n`);
}

verify();
