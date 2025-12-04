/**
 * Seed Knowledge Base: State NIL Rules
 *
 * This script populates the knowledge_base table with all 50 state NIL rules
 * from the state_nil_rules table, converting them into searchable embeddings
 * for the RAG (Retrieval Augmented Generation) system.
 */

import { supabaseAdmin } from '../lib/supabase';

async function seedStateNILRules() {
  console.log('🌟 Seeding Knowledge Base: State NIL Rules\n');

  if (!supabaseAdmin) {
    console.error('❌ Supabase admin client not available');
    process.exit(1);
  }

  try {
    // 1. Fetch all state NIL rules
    console.log('📥 Fetching state NIL rules from database...');
    const { data: stateRules, error: fetchError } = await supabaseAdmin
      .from('state_nil_rules')
      .select('*')
      .order('state_code', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching state rules:', fetchError);
      process.exit(1);
    }

    if (!stateRules || stateRules.length === 0) {
      console.log('⚠️  No state rules found in database');
      process.exit(0);
    }

    console.log(`✅ Found ${stateRules.length} state NIL rules\n`);

    // 2. Transform each state rule into knowledge base format
    const knowledgeEntries = stateRules.map(rule => {
      // Create comprehensive content for RAG
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

      return {
        title: `${rule.state_name} NIL Compliance Rules`,
        content,
        content_type: 'state_law' as const,
        category: rule.state_code,
        tags: [
          'state-compliance',
          'nil-rules',
          rule.state_code.toLowerCase(),
          rule.state_name.toLowerCase().replace(/\s+/g, '-'),
          rule.allows_nil ? 'nil-allowed' : 'nil-restricted'
        ],
        metadata: {
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
        },
        target_roles: ['athlete', 'parent', 'agency', 'school'],
        source_url: null,
        is_published: true,
        is_featured: false
      };
    });

    console.log('📝 Transformed into knowledge base format\n');

    // 3. Check if state rules already exist in knowledge base
    console.log('🔍 Checking for existing state compliance entries...');
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('knowledge_base')
      .select('id, category')
      .eq('content_type', 'state_law');

    if (checkError) {
      console.error('❌ Error checking existing entries:', checkError);
    }

    const existingStateCodes = new Set((existing || []).map(e => e.category));
    console.log(`   Found ${existingStateCodes.size} existing state entries\n`);

    // 4. Filter out already-seeded states
    const newEntries = knowledgeEntries.filter(
      entry => !existingStateCodes.has(entry.category)
    );

    if (newEntries.length === 0) {
      console.log('✨ All state NIL rules already seeded!');
      console.log(`   Total in knowledge base: ${existingStateCodes.size} states`);
      return;
    }

    console.log(`📤 Inserting ${newEntries.length} new state rules...\n`);

    // 5. Insert in batches (10 at a time to avoid overwhelming the API)
    const batchSize = 10;
    let inserted = 0;
    let failed = 0;

    for (let i = 0; i < newEntries.length; i += batchSize) {
      const batch = newEntries.slice(i, i + batchSize);

      console.log(`   Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(newEntries.length / batchSize)}: Inserting ${batch.length} entries...`);

      const { data, error: insertError } = await supabaseAdmin
        .from('knowledge_base')
        .insert(batch)
        .select('id, category, title');

      if (insertError) {
        console.error(`   ❌ Error inserting batch:`, insertError.message);
        failed += batch.length;
      } else {
        console.log(`   ✅ Inserted: ${data?.map(d => d.category).join(', ')}`);
        inserted += batch.length;
      }
    }

    // 6. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total state rules processed: ${stateRules.length}`);
    console.log(`Already in knowledge base:   ${existingStateCodes.size}`);
    console.log(`Newly inserted:              ${inserted}`);
    console.log(`Failed insertions:           ${failed}`);
    console.log(`Final knowledge base count:  ${existingStateCodes.size + inserted}`);
    console.log('='.repeat(60));

    if (inserted > 0) {
      console.log('\n✨ State NIL rules successfully seeded to knowledge base!');
      console.log('\n📝 Note: Embeddings will be generated automatically by Supabase');
      console.log('   when the AI queries the knowledge base.');
    }

  } catch (error: any) {
    console.error('\n❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the seeding
seedStateNILRules();
