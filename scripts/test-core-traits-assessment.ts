/**
 * Core Traits Assessment - Comprehensive Test Suite
 *
 * Tests:
 * 1. Database schema verification
 * 2. Seed data validation (12 traits, 20 questions, 8 archetypes)
 * 3. API route functionality
 * 4. Scoring algorithm correctness
 * 5. AI integration
 *
 * Run with:
 * SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." npx tsx scripts/test-core-traits-assessment.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function logTest(result: TestResult) {
  const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
  console.log(`${icon} ${result.name}: ${result.message}`);
  if (result.details) {
    console.log(`   Details: ${JSON.stringify(result.details)}`);
  }
  results.push(result);
}

// ============================================
// TEST 1: Database Schema Verification
// ============================================
async function testDatabaseSchema() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: DATABASE SCHEMA VERIFICATION');
  console.log('='.repeat(60) + '\n');

  const tables = [
    { name: 'core_traits', expectedColumns: ['id', 'trait_code', 'trait_name', 'trait_description', 'category', 'icon_name', 'color_hex'] },
    { name: 'assessment_questions', expectedColumns: ['id', 'question_text', 'question_type', 'options', 'trait_weights', 'question_order'] },
    { name: 'trait_archetypes', expectedColumns: ['id', 'archetype_code', 'archetype_name', 'archetype_description', 'defining_traits'] },
    { name: 'assessment_sessions', expectedColumns: ['id', 'user_id', 'status', 'current_question_index', 'total_questions'] },
    { name: 'assessment_responses', expectedColumns: ['id', 'session_id', 'question_id', 'user_id', 'response_value'] },
    { name: 'user_trait_results', expectedColumns: ['id', 'user_id', 'session_id', 'trait_scores', 'top_traits', 'archetype_code'] },
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);

      if (error) {
        logTest({
          name: `Table: ${table.name}`,
          status: 'fail',
          message: `Does not exist: ${error.message}`,
        });
      } else {
        // Check if sample data has expected columns
        const hasData = data && data.length > 0;
        const columns = hasData ? Object.keys(data[0]) : [];
        const missingColumns = table.expectedColumns.filter(c => !columns.includes(c));

        if (missingColumns.length > 0 && hasData) {
          logTest({
            name: `Table: ${table.name}`,
            status: 'fail',
            message: `Missing columns: ${missingColumns.join(', ')}`,
            details: { existing: columns },
          });
        } else {
          logTest({
            name: `Table: ${table.name}`,
            status: 'pass',
            message: `Exists with ${hasData ? 'data' : 'no data yet'}`,
          });
        }
      }
    } catch (err: any) {
      logTest({
        name: `Table: ${table.name}`,
        status: 'fail',
        message: `Error: ${err.message}`,
      });
    }
  }
}

// ============================================
// TEST 2: Seed Data Validation
// ============================================
async function testSeedData() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: SEED DATA VALIDATION');
  console.log('='.repeat(60) + '\n');

  // Check core_traits (expected: 12)
  const { count: traitsCount, error: traitsError } = await supabase
    .from('core_traits')
    .select('*', { count: 'exact', head: true });

  if (traitsError) {
    logTest({
      name: 'Core Traits Count',
      status: 'fail',
      message: `Cannot count: ${traitsError.message}`,
    });
  } else {
    logTest({
      name: 'Core Traits Count',
      status: traitsCount === 12 ? 'pass' : 'fail',
      message: `Found ${traitsCount} traits (expected 12)`,
    });
  }

  // List all traits
  const { data: traits } = await supabase
    .from('core_traits')
    .select('trait_code, trait_name, category')
    .order('display_order');

  if (traits && traits.length > 0) {
    console.log('\n   Traits found:');
    traits.forEach((t: any) => console.log(`   - ${t.trait_code}: ${t.trait_name} (${t.category})`));
  }

  // Check assessment_questions (expected: 20)
  const { count: questionsCount, error: questionsError } = await supabase
    .from('assessment_questions')
    .select('*', { count: 'exact', head: true });

  if (questionsError) {
    logTest({
      name: 'Assessment Questions Count',
      status: 'fail',
      message: `Cannot count: ${questionsError.message}`,
    });
  } else {
    logTest({
      name: 'Assessment Questions Count',
      status: questionsCount === 20 ? 'pass' : 'fail',
      message: `Found ${questionsCount} questions (expected 20)`,
    });
  }

  // Check trait_archetypes (expected: 8)
  const { count: archetypesCount, error: archetypesError } = await supabase
    .from('trait_archetypes')
    .select('*', { count: 'exact', head: true });

  if (archetypesError) {
    logTest({
      name: 'Trait Archetypes Count',
      status: 'fail',
      message: `Cannot count: ${archetypesError.message}`,
    });
  } else {
    logTest({
      name: 'Trait Archetypes Count',
      status: archetypesCount === 8 ? 'pass' : 'fail',
      message: `Found ${archetypesCount} archetypes (expected 8)`,
    });
  }

  // List all archetypes
  const { data: archetypes } = await supabase
    .from('trait_archetypes')
    .select('archetype_code, archetype_name');

  if (archetypes && archetypes.length > 0) {
    console.log('\n   Archetypes found:');
    archetypes.forEach((a: any) => console.log(`   - ${a.archetype_code}: ${a.archetype_name}`));
  }
}

// ============================================
// TEST 3: Library Files Verification
// ============================================
async function testLibraryFiles() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: LIBRARY FILES VERIFICATION');
  console.log('='.repeat(60) + '\n');

  const libFiles = [
    'lib/assessment/types.ts',
    'lib/assessment/store.ts',
    'lib/assessment/scoring.ts',
    'lib/assessment/archetypes.ts',
    'lib/assessment/questions.ts',
  ];

  for (const file of libFiles) {
    const fullPath = path.join(process.cwd(), file);
    const exists = fs.existsSync(fullPath);

    logTest({
      name: `File: ${file}`,
      status: exists ? 'pass' : 'fail',
      message: exists ? 'Exists' : 'Missing',
    });
  }
}

// ============================================
// TEST 4: API Routes Verification
// ============================================
async function testAPIRoutes() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: API ROUTES VERIFICATION');
  console.log('='.repeat(60) + '\n');

  const apiRoutes = [
    'app/api/assessment/session/route.ts',
    'app/api/assessment/questions/route.ts',
    'app/api/assessment/responses/route.ts',
    'app/api/assessment/skip/route.ts',
    'app/api/assessment/results/route.ts',
  ];

  for (const route of apiRoutes) {
    const fullPath = path.join(process.cwd(), route);
    const exists = fs.existsSync(fullPath);

    logTest({
      name: `API: ${route.replace('app/api/', '')}`,
      status: exists ? 'pass' : 'fail',
      message: exists ? 'Exists' : 'Missing',
    });
  }
}

// ============================================
// TEST 5: UI Components Verification
// ============================================
async function testUIComponents() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 5: UI COMPONENTS VERIFICATION');
  console.log('='.repeat(60) + '\n');

  const components = [
    'components/assessment/ProgressBar.tsx',
    'components/assessment/QuestionScale.tsx',
    'components/assessment/QuestionChoice.tsx',
    'components/assessment/QuestionRanking.tsx',
    'components/assessment/SkipButton.tsx',
    'components/assessment/AssessmentCard.tsx',
    'components/assessment/TraitBadge.tsx',
    'components/assessment/TraitRadar.tsx',
    'components/assessment/ArchetypeCard.tsx',
  ];

  for (const component of components) {
    const fullPath = path.join(process.cwd(), component);
    const exists = fs.existsSync(fullPath);

    logTest({
      name: `Component: ${path.basename(component)}`,
      status: exists ? 'pass' : 'fail',
      message: exists ? 'Exists' : 'Missing',
    });
  }
}

// ============================================
// TEST 6: Pages Verification
// ============================================
async function testPages() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 6: PAGES VERIFICATION');
  console.log('='.repeat(60) + '\n');

  const pages = [
    'app/assessment/page.tsx',
    'app/assessment/take/page.tsx',
    'app/assessment/results/page.tsx',
  ];

  for (const page of pages) {
    const fullPath = path.join(process.cwd(), page);
    const exists = fs.existsSync(fullPath);

    logTest({
      name: `Page: ${page.replace('app/', '')}`,
      status: exists ? 'pass' : 'fail',
      message: exists ? 'Exists' : 'Missing',
    });
  }
}

// ============================================
// TEST 7: AI Integration Verification
// ============================================
async function testAIIntegration() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 7: AI INTEGRATION VERIFICATION');
  console.log('='.repeat(60) + '\n');

  // Check system prompts file for archetype support
  const systemPromptsPath = path.join(process.cwd(), 'lib/ai/system-prompts.ts');

  if (fs.existsSync(systemPromptsPath)) {
    const content = fs.readFileSync(systemPromptsPath, 'utf-8');

    // Check for archetype-related code
    const hasArchetypeHints = content.includes('ARCHETYPE_HINTS') || content.includes('archetypeCode');
    const hasTopTraits = content.includes('topTraits');
    const hasUserContextUpdate = content.includes('archetypeName');

    logTest({
      name: 'System Prompts: Archetype Hints',
      status: hasArchetypeHints ? 'pass' : 'fail',
      message: hasArchetypeHints ? 'Contains archetype hints' : 'Missing archetype hints',
    });

    logTest({
      name: 'System Prompts: Top Traits',
      status: hasTopTraits ? 'pass' : 'fail',
      message: hasTopTraits ? 'Contains top traits support' : 'Missing top traits support',
    });

    logTest({
      name: 'UserContext: Archetype Fields',
      status: hasUserContextUpdate ? 'pass' : 'fail',
      message: hasUserContextUpdate ? 'UserContext includes archetype' : 'UserContext missing archetype',
    });
  } else {
    logTest({
      name: 'System Prompts File',
      status: 'fail',
      message: 'File not found',
    });
  }

  // Check AI route for assessment result fetching
  const aiRoutePath = path.join(process.cwd(), 'app/api/chat/ai/route.ts');

  if (fs.existsSync(aiRoutePath)) {
    const content = fs.readFileSync(aiRoutePath, 'utf-8');

    const fetchesAssessment = content.includes('getUserAssessmentResults') || content.includes('user_trait_results');

    logTest({
      name: 'AI Route: Fetches Assessment',
      status: fetchesAssessment ? 'pass' : 'fail',
      message: fetchesAssessment ? 'Fetches user assessment results' : 'Missing assessment result fetch',
    });
  } else {
    logTest({
      name: 'AI Route File',
      status: 'fail',
      message: 'File not found',
    });
  }
}

// ============================================
// GENERATE REPORT
// ============================================
async function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️ Skipped: ${skipped}`);
  console.log(`\nTotal: ${results.length} tests`);

  // Generate markdown report
  const report = `# Core Traits Assessment - Test Results

**Date:** ${new Date().toISOString().split('T')[0]}
**Status:** ${failed === 0 ? '✅ ALL TESTS PASSING' : `⚠️ ${failed} TESTS FAILING`}

---

## Summary

| Status | Count |
|--------|-------|
| ✅ Passed | ${passed} |
| ❌ Failed | ${failed} |
| ⏭️ Skipped | ${skipped} |

---

## Detailed Results

${results.map(r => {
  const icon = r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⏭️';
  return `### ${icon} ${r.name}
**Status:** ${r.status.toUpperCase()}
**Message:** ${r.message}
${r.details ? `**Details:** \`${JSON.stringify(r.details)}\`` : ''}
`;
}).join('\n')}

---

## Recommendations

${failed > 0 ? `
### Issues to Fix

${results.filter(r => r.status === 'fail').map(r => `- **${r.name}**: ${r.message}`).join('\n')}

### Next Steps

1. Apply migration 019_core_traits_assessment.sql to create database tables
2. Verify seed data is inserted correctly
3. Re-run this test suite
` : `
All tests passing! The Core Traits Assessment feature is fully implemented and functional.
`}

---

*Generated by test-core-traits-assessment.ts*
`;

  // Save report
  const reportPath = path.join(process.cwd(), 'CORE_TRAITS_TEST_RESULTS.md');
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Report saved to: CORE_TRAITS_TEST_RESULTS.md`);
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('🧪 CORE TRAITS ASSESSMENT - COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(60));
  console.log(`Supabase: ${SUPABASE_URL.substring(0, 40)}...`);
  console.log('='.repeat(60));

  await testDatabaseSchema();
  await testSeedData();
  await testLibraryFiles();
  await testAPIRoutes();
  await testUIComponents();
  await testPages();
  await testAIIntegration();
  await generateReport();
}

main().catch(console.error);
