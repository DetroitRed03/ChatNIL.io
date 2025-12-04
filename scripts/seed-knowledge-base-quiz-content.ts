/**
 * Seed Knowledge Base: Quiz Content
 *
 * This script populates the knowledge_base table with all quiz questions
 * organized by the 10 topic categories, making them searchable for the
 * RAG system to provide study material and explanations.
 */

import { supabaseAdmin } from '../lib/supabase';

// Map quiz categories to human-readable names
const CATEGORY_NAMES: Record<string, string> = {
  nil_basics: 'NIL Basics',
  contracts: 'Contract Fundamentals',
  branding: 'Personal Branding & Marketing',
  social_media: 'Social Media Strategy',
  compliance: 'Legal Compliance',
  tax_finance: 'Tax & Financial Planning',
  negotiation: 'Deal Negotiation',
  legal: 'Legal Rights & Protections',
  marketing: 'Marketing & Promotion',
  athlete_rights: 'Athlete Rights & Advocacy'
};

async function seedQuizContent() {
  console.log('🎓 Seeding Knowledge Base: Quiz Content\n');

  if (!supabaseAdmin) {
    console.error('❌ Supabase admin client not available');
    process.exit(1);
  }

  try {
    // 1. Fetch all quiz questions
    console.log('📥 Fetching quiz questions from database...');
    const { data: quizQuestions, error: fetchError } = await supabaseAdmin
      .from('quiz_questions')
      .select('*')
      .order('category', { ascending: true })
      .order('difficulty', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching quiz questions:', fetchError);
      process.exit(1);
    }

    if (!quizQuestions || quizQuestions.length === 0) {
      console.log('⚠️  No quiz questions found in database');
      process.exit(0);
    }

    console.log(`✅ Found ${quizQuestions.length} quiz questions\n`);

    // 2. Group questions by category
    const questionsByCategory = quizQuestions.reduce((acc, q) => {
      if (!acc[q.category]) {
        acc[q.category] = [];
      }
      acc[q.category].push(q);
      return acc;
    }, {} as Record<string, typeof quizQuestions>);

    console.log('📊 Questions by category:');
    Object.entries(questionsByCategory).forEach(([category, questions]) => {
      console.log(`   ${CATEGORY_NAMES[category] || category}: ${questions.length} questions`);
    });
    console.log('');

    // 3. Transform questions into knowledge base format
    const knowledgeEntries = quizQuestions.map(question => {
      // Create comprehensive content for each Q&A
      const content = `
# ${CATEGORY_NAMES[question.category] || question.category} - Quiz Question

## Question
${question.question}

## Answer Options
${question.options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}. ${opt}`).join('\n')}

## Correct Answer
${String.fromCharCode(65 + question.correct_answer)

}. ${question.options[question.correct_answer]}

## Explanation
${question.explanation || 'No explanation provided.'}

${question.reference_links && question.reference_links.length > 0 ? `
## Additional Resources
${question.reference_links.map((link: string) => `- ${link}`).join('\n')}
` : ''}

---
**Category**: ${CATEGORY_NAMES[question.category] || question.category}
**Difficulty**: ${question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
**Points**: ${question.points || 10}
      `.trim();

      return {
        content_type: 'educational_article',
        category: question.category,
        title: question.question.substring(0, 100) + (question.question.length > 100 ? '...' : ''),
        content,
        summary: null,
        metadata: {
          quiz_category: question.category,
          quiz_category_name: CATEGORY_NAMES[question.category] || question.category,
          difficulty: question.difficulty,
          points: question.points || 10,
          correct_answer: question.correct_answer,
          options_count: question.options.length,
          has_explanation: !!question.explanation,
          source: 'quiz_questions',
          authority: 'educational',
          confidence: 0.95
        },
        tags: [
          'quiz',
          'education',
          question.category,
          `difficulty-${question.difficulty}`,
          CATEGORY_NAMES[question.category]?.toLowerCase().replace(/\s+/g, '-') || question.category
        ],
        source_url: null,
        difficulty_level: question.difficulty,
        target_roles: ['athlete', 'parent', 'coach', 'agency', 'school_admin'],
        is_published: true,
        is_featured: false
      };
    });

    console.log('📝 Transformed into knowledge base format\n');

    // 4. Check if quiz content already exists
    console.log('🔍 Checking for existing quiz content entries...');
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('knowledge_base')
      .select('id, category')
      .eq('content_type', 'educational_article')
      .contains('tags', ['quiz']);

    if (checkError) {
      console.error('❌ Error checking existing entries:', checkError);
    }

    const existingCount = existing?.length || 0;
    console.log(`   Found ${existingCount} existing quiz entries\n`);

    // 5. Clear existing quiz content to avoid duplicates
    if (existingCount > 0) {
      console.log('🗑️  Clearing existing quiz content to avoid duplicates...');
      const { error: deleteError } = await supabaseAdmin
        .from('knowledge_base')
        .delete()
        .eq('category', 'quiz_content');

      if (deleteError) {
        console.error('❌ Error clearing existing quiz content:', deleteError);
      } else {
        console.log(`✅ Cleared ${existingCount} existing quiz entries\n`);
      }
    }

    // 6. Insert all quiz questions in batches
    console.log(`📤 Inserting ${knowledgeEntries.length} quiz questions...\n`);

    const batchSize = 20;
    let inserted = 0;
    let failed = 0;

    for (let i = 0; i < knowledgeEntries.length; i += batchSize) {
      const batch = knowledgeEntries.slice(i, i + batchSize);

      console.log(`   Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(knowledgeEntries.length / batchSize)}: Inserting ${batch.length} entries...`);

      const { data, error: insertError } = await supabaseAdmin
        .from('knowledge_base')
        .insert(batch)
        .select('id, category');

      if (insertError) {
        console.error(`   ❌ Error inserting batch:`, insertError.message);
        failed += batch.length;
      } else {
        const categories = data?.map(d => d.category) || [];
        const categorySummary = categories.reduce((acc, cat) => {
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        console.log(`   ✅ Inserted ${Object.entries(categorySummary).map(([cat, count]) => `${cat}:${count}`).join(', ')}`);
        inserted += batch.length;
      }
    }

    // 7. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total quiz questions:        ${quizQuestions.length}`);
    console.log(`Categories:                  ${Object.keys(questionsByCategory).length}`);
    console.log(`Successfully inserted:       ${inserted}`);
    console.log(`Failed insertions:           ${failed}`);
    console.log('='.repeat(60));

    console.log('\n📚 Questions by category in knowledge base:');
    Object.entries(questionsByCategory).forEach(([category, questions]) => {
      console.log(`   ${CATEGORY_NAMES[category]?.padEnd(30)} ${questions.length} questions`);
    });

    if (inserted > 0) {
      console.log('\n✨ Quiz content successfully seeded to knowledge base!');
      console.log('\n📝 Note: Students can now ask questions about quiz topics');
      console.log('   and receive study material from the knowledge base.');
    }

  } catch (error: any) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the seeding
seedQuizContent();
