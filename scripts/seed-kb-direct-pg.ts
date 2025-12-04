/**
 * Seed Knowledge Base via Direct PostgreSQL Connection
 *
 * This bypasses PostgREST cache issues by connecting directly to PostgreSQL
 */

import { Pool } from 'pg';

// Parse Supabase connection URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment');
  console.log('\n💡 Add this to your .env.local file:');
  console.log('DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function seedDirectPG() {
  console.log('🌟 Seeding Knowledge Base via Direct PostgreSQL Connection\n');

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database\n');

    // 1. Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'knowledge_base'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('❌ knowledge_base table does not exist!');
      console.log('   Run migration 012 first: ./migrate.sh supabase/migrations/012_enable_vector_and_knowledge_base.sql');
      client.release();
      process.exit(1);
    }

    console.log('✅ knowledge_base table exists\n');

    // 2. Fetch state rules
    console.log('📥 Fetching state NIL rules...');
    const stateRulesResult = await client.query('SELECT * FROM state_nil_rules ORDER BY state_code');
    const stateRules = stateRulesResult.rows;
    console.log(`✅ Found ${stateRules.length} state NIL rules\n`);

    // 3. Check existing entries
    const existingResult = await client.query(`
      SELECT category FROM knowledge_base WHERE content_type = 'state_law'
    `);
    const existingStateCodes = new Set(existingResult.rows.map(r => r.category));
    console.log(`   Found ${existingStateCodes.size} existing state entries\n`);

    // 4. Prepare state rule inserts
    let inserted = 0;
    let skipped = 0;

    for (const rule of stateRules) {
      if (existingStateCodes.has(rule.state_code)) {
        skipped++;
        continue;
      }

      const content = `
# ${rule.state_name} NIL Rules

**State Code**: ${rule.state_code}

## NIL Permission
- **Allows NIL Deals**: ${rule.allows_nil ? 'Yes' : 'No'}
- **Effective Date**: ${rule.effective_date || 'Not specified'}

## Requirements
- **Requires School Approval**: ${rule.requires_school_approval ? 'Yes' : 'No'}
- **Requires Disclosure**: ${rule.requires_disclosure ? 'Yes' : 'No'}
- **Allows Recruiting Inducements**: ${rule.allows_recruiting_inducements ? 'Yes' : 'No'}

## Additional Information
${rule.notes || 'No additional notes available.'}

---
**Category**: State Compliance
**State**: ${rule.state_name}
**Last Updated**: ${rule.updated_at || rule.created_at}
      `.trim();

      const metadata = {
        state_code: rule.state_code,
        state_name: rule.state_name,
        allows_nil: rule.allows_nil,
        requires_school_approval: rule.requires_school_approval,
        requires_disclosure: rule.requires_disclosure,
        allows_recruiting_inducements: rule.allows_recruiting_inducements,
        effective_date: rule.effective_date,
        source: 'state_nil_rules',
        authority: 'official',
        confidence: 1.0
      };

      const tags = [
        'state-compliance',
        'nil-rules',
        rule.state_code.toLowerCase(),
        rule.state_name.toLowerCase().replace(/\s+/g, '-'),
        rule.allows_nil ? 'nil-allowed' : 'nil-restricted'
      ];

      try {
        await client.query(`
          INSERT INTO knowledge_base (
            title, content, content_type, category, tags, metadata,
            target_roles, is_published, is_featured
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          `${rule.state_name} NIL Compliance Rules`,
          content,
          'state_law',
          rule.state_code,
          tags,
          JSON.stringify(metadata),
          ['athlete', 'parent', 'agency', 'school'],
          true,
          false
        ]);

        inserted++;
        if (inserted % 10 === 0) {
          console.log(`   Inserted ${inserted} states...`);
        }
      } catch (error: any) {
        console.error(`   ❌ Error inserting ${rule.state_code}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 STATE RULES SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total states:           ${stateRules.length}`);
    console.log(`Already in KB:          ${skipped}`);
    console.log(`Newly inserted:         ${inserted}`);
    console.log(`Final KB count:         ${existingStateCodes.size + inserted}`);
    console.log('='.repeat(60));

    // 5. Now fetch and seed quiz questions
    console.log('\n📥 Fetching quiz questions...');
    const quizResult = await client.query('SELECT * FROM quiz_questions ORDER BY category, difficulty');
    const quizQuestions = quizResult.rows;
    console.log(`✅ Found ${quizQuestions.length} quiz questions\n`);

    // Clear existing quiz content
    const deleteResult = await client.query(`DELETE FROM knowledge_base WHERE content_type = 'educational_article' AND category LIKE 'quiz_%'`);
    console.log(`🗑️  Cleared ${deleteResult.rowCount} existing quiz entries\n`);

    let quizInserted = 0;

    for (const q of quizQuestions) {
      const content = `
# ${q.category.replace(/_/g, ' ').toUpperCase()} - Quiz Question

## Question
${q.question_text}

## Answer Options
${q.options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}. ${opt}`).join('\n')}

## Correct Answer
${String.fromCharCode(65 + q.correct_answer)}. ${q.options[q.correct_answer]}

## Explanation
${q.explanation || 'No explanation provided.'}
      `.trim();

      const metadata = {
        quiz_category: q.category,
        difficulty: q.difficulty,
        points: q.points || 10,
        correct_answer: q.correct_answer,
        options_count: q.options.length,
        has_explanation: !!q.explanation
      };

      const tags = [
        'quiz',
        'education',
        q.category,
        `difficulty-${q.difficulty}`
      ];

      try {
        await client.query(`
          INSERT INTO knowledge_base (
            title, content, content_type, category, tags, metadata,
            target_roles, difficulty_level, is_published
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          q.question_text.substring(0, 100),
          content,
          'educational_article',
          `quiz_${q.category}`,
          tags,
          JSON.stringify(metadata),
          ['athlete', 'parent'],
          q.difficulty,
          true
        ]);

        quizInserted++;
        if (quizInserted % 20 === 0) {
          console.log(`   Inserted ${quizInserted} questions...`);
        }
      } catch (error: any) {
        console.error(`   ❌ Error inserting quiz:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 QUIZ CONTENT SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total questions:        ${quizQuestions.length}`);
    console.log(`Successfully inserted:  ${quizInserted}`);
    console.log('='.repeat(60));

    // Final count
    const finalCount = await client.query('SELECT COUNT(*) FROM knowledge_base');
    console.log(`\n✨ Total entries in knowledge base: ${finalCount.rows[0].count}\n`);

    client.release();
    await pool.end();

    console.log('🎉 Knowledge base seeding complete!');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

seedDirectPG();
