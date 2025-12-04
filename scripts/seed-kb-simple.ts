/**
 * Simple Knowledge Base Seeding Script
 * Uses Supabase JS client to bypass PostgREST cache issues
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedKnowledgeBase() {
  console.log('🌟 Seeding Knowledge Base\n');

  // 1. Fetch state rules
  console.log('📥 Fetching state NIL rules...');
  const { data: stateRules, error: stateError } = await supabase
    .from('state_nil_rules')
    .select('*')
    .order('state_code');

  if (stateError) {
    console.error('❌ Error fetching state rules:', stateError);
    return;
  }

  console.log(`✅ Found ${stateRules.length} state rules\n`);

  // 2. Check existing state rules
  const { data: existingStates } = await supabase
    .from('knowledge_base')
    .select('category')
    .eq('content_type', 'state_law');

  const existingCodes = new Set((existingStates || []).map((e: any) => e.category));
  console.log(`   ${existingCodes.size} states already seeded\n`);

  // 3. Prepare state rule entries
  const stateEntries = stateRules
    .filter(rule => !existingCodes.has(rule.state_code))
    .map(rule => ({
      title: `${rule.state_name} NIL Compliance Rules`,
      content: `# ${rule.state_name} NIL Rules

**State Code**: ${rule.state_code}

## NIL Permission
- **Allows NIL Deals**: ${rule.allows_nil ? 'Yes' : 'No'}
- **Effective Date**: ${rule.effective_date || 'Not specified'}

## Requirements
- **Requires School Approval**: ${rule.requires_school_approval ? 'Yes' : 'No'}
- **Requires Disclosure**: ${rule.requires_disclosure ? 'Yes' : 'No'}
- **Allows Recruiting Inducements**: ${rule.allows_recruiting_inducements ? 'Yes' : 'No'}

## Additional Information
${rule.notes || 'No additional notes available.'}`,
      content_type: 'state_law',
      category: rule.state_code,
      tags: ['state-compliance', 'nil-rules', rule.state_code.toLowerCase()],
      metadata: {
        state_code: rule.state_code,
        state_name: rule.state_name,
        allows_nil: rule.allows_nil
      },
      target_roles: ['athlete', 'parent', 'agency', 'school'],
      is_published: true
    }));

  if (stateEntries.length > 0) {
    console.log(`📤 Inserting ${stateEntries.length} state rules...`);
    const { error: insertError } = await supabase
      .from('knowledge_base')
      .insert(stateEntries);

    if (insertError) {
      console.error('❌ Error inserting states:', insertError);
    } else {
      console.log(`✅ Inserted ${stateEntries.length} state rules\n`);
    }
  }

  // 4. Fetch quiz questions
  console.log('📥 Fetching quiz questions...');
  const { data: quizQuestions, error: quizError } = await supabase
    .from('quiz_questions')
    .select('*')
    .order('category');

  if (quizError) {
    console.error('❌ Error fetching quiz questions:', quizError);
    return;
  }

  console.log(`✅ Found ${quizQuestions.length} quiz questions\n`);

  // 5. Clear existing quiz content
  console.log('🗑️  Clearing existing quiz content...');
  await supabase
    .from('knowledge_base')
    .delete()
    .eq('content_type', 'educational_article')
    .like('category', 'quiz_%');

  console.log('✅ Cleared old quiz entries\n');

  // 6. Prepare quiz entries
  const quizEntries = quizQuestions.map(q => ({
    title: q.question.substring(0, 100),
    content: `# ${q.category.toUpperCase()} - Quiz Question

## Question
${q.question}

## Answer Options
${q.options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}. ${opt}`).join('\n')}

## Correct Answer
${String.fromCharCode(65 + q.correct_answer)}. ${q.options[q.correct_answer]}`,
    content_type: 'educational_article',
    category: `quiz_${q.category}`,
    tags: ['quiz', 'education', q.category],
    metadata: {
      quiz_category: q.category,
      difficulty: q.difficulty,
      points: q.points || 10
    },
    target_roles: ['athlete', 'parent'],
    difficulty_level: q.difficulty,
    is_published: true
  }));

  // Insert in batches
  console.log(`📤 Inserting ${quizEntries.length} quiz questions...`);
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < quizEntries.length; i += batchSize) {
    const batch = quizEntries.slice(i, i + batchSize);
    const { error } = await supabase
      .from('knowledge_base')
      .insert(batch);

    if (error) {
      console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error);
    } else {
      inserted += batch.length;
      console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}: ${batch.length} questions`);
    }
  }

  // 7. Final summary
  const { count } = await supabase
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true });

  console.log('\n' + '='.repeat(60));
  console.log('📊 SEEDING COMPLETE');
  console.log('='.repeat(60));
  console.log(`State rules inserted:    ${stateEntries.length}`);
  console.log(`Quiz questions inserted: ${inserted}`);
  console.log(`Total KB entries:        ${count}`);
  console.log('='.repeat(60));
  console.log('\n✨ Knowledge base is ready for RAG!\n');
}

seedKnowledgeBase().catch(console.error);
