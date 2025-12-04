/**
 * Seed Knowledge Base Directly via SQL
 * Bypasses PostgREST entirely using exec_sql RPC
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seedDirectSQL() {
  console.log('🌟 Seeding Knowledge Base via Direct SQL\n');

  // Step 1: Fetch state NIL rules
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

  // Step 2: Fetch quiz questions
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

  // Step 3: Build SQL INSERT statements
  console.log('📤 Preparing SQL INSERT statements...');

  const stateInserts = stateRules.map(rule => {
    const title = `${rule.state_name} NIL Compliance Rules`;
    const content = `# ${rule.state_name} NIL Rules

**State Code**: ${rule.state_code}

## NIL Permission
- **Allows NIL Deals**: ${rule.allows_nil ? 'Yes' : 'No'}
- **Effective Date**: ${rule.effective_date || 'Not specified'}

## Requirements
- **Requires School Approval**: ${rule.requires_school_approval ? 'Yes' : 'No'}
- **Requires Disclosure**: ${rule.requires_disclosure ? 'Yes' : 'No'}
- **Allows Recruiting Inducements**: ${rule.allows_recruiting_inducements ? 'Yes' : 'No'}

## Additional Information
${rule.notes || 'No additional notes available.'}`;

    const escapedTitle = title.replace(/'/g, "''");
    const escapedContent = content.replace(/'/g, "''");
    const tags = `{state-compliance,nil-rules,${rule.state_code.toLowerCase()}}`;
    const metadata = JSON.stringify({
      state_code: rule.state_code,
      state_name: rule.state_name,
      allows_nil: rule.allows_nil
    }).replace(/'/g, "''");

    return `INSERT INTO public.knowledge_base (title, content, content_type, category, tags, metadata, target_roles, is_published)
VALUES ('${escapedTitle}', '${escapedContent}', 'state_law', '${rule.state_code}', '${tags}', '${metadata}'::jsonb, '{athlete,parent,agency,school}', true)
ON CONFLICT DO NOTHING;`;
  });

  const quizInserts = quizQuestions.map(q => {
    const title = q.question.substring(0, 100).replace(/'/g, "''");
    const content = `# ${q.category.toUpperCase()} - Quiz Question

## Question
${q.question}

## Answer Options
${q.options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}. ${opt}`).join('\n')}

## Correct Answer
${String.fromCharCode(65 + q.correct_answer)}. ${q.options[q.correct_answer]}`.replace(/'/g, "''");

    const tags = `{quiz,education,${q.category}}`;
    const metadata = JSON.stringify({
      quiz_category: q.category,
      difficulty: q.difficulty,
      points: q.points || 10
    }).replace(/'/g, "''");

    return `INSERT INTO public.knowledge_base (title, content, content_type, category, tags, metadata, target_roles, difficulty_level, is_published)
VALUES ('${title}', '${content}', 'educational_article', 'quiz_${q.category}', '${tags}', '${metadata}'::jsonb, '{athlete,parent}', '${q.difficulty}', true)
ON CONFLICT DO NOTHING;`;
  });

  // Step 4: Execute inserts in batches
  const allInserts = [...stateInserts, ...quizInserts];
  console.log(`📤 Inserting ${allInserts.length} entries (${stateRules.length} states + ${quizQuestions.length} quiz questions)...\n`);

  const batchSize = 10;
  let inserted = 0;

  for (let i = 0; i < allInserts.length; i += batchSize) {
    const batch = allInserts.slice(i, i + batchSize);
    const sql = batch.join('\n');

    const { error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}: ${batch.length} entries`);
    }
  }

  // Step 5: Verify by counting rows
  console.log('\n🔍 Verifying data...');
  const { data: countData, error: countError } = await supabase.rpc('exec_sql', {
    query: 'SELECT COUNT(*) as count FROM public.knowledge_base;'
  });

  if (countError) {
    console.log('❌ Could not verify count:', countError.message);
  } else {
    const count = countData?.[0]?.count || 0;
    console.log(`✅ Total entries in knowledge_base: ${count}\n`);
  }

  console.log('=' .repeat(60));
  console.log('📊 SEEDING COMPLETE');
  console.log('='.repeat(60));
  console.log(`State rules inserted:    ${stateRules.length}`);
  console.log(`Quiz questions inserted: ${quizQuestions.length}`);
  console.log(`Total attempted:         ${inserted}`);
  console.log('='.repeat(60));
  console.log('\n✨ Knowledge base ready! (Data inserted directly via SQL)\n');
  console.log('⚠️  PostgREST cache still needs refresh for API access');
  console.log('   But AI can use exec_sql to query the data!\n');
}

seedDirectSQL().catch(console.error);
