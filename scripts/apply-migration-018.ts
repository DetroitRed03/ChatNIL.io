/**
 * Apply Migration 018: AI Brain Fixes
 *
 * This script applies the AI Brain fixes directly using Supabase admin client.
 * Run with: npx tsx scripts/apply-migration-018.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function applyFixes() {
  console.log('\n🔧 AI Brain Fixes - Migration 018\n');
  console.log('='.repeat(60));

  const results: { step: string; status: 'OK' | 'ERROR' | 'SKIP'; message?: string }[] = [];

  // ============================================================
  // FIX 1: Add missing columns to users table
  // ============================================================
  console.log('\n📋 Step 1: Adding missing user profile columns...');

  const columnsToAdd = [
    { name: 'sport', type: 'text' },
    { name: 'school_level', type: 'text' },
    { name: 'state', type: 'text' },
    { name: 'age', type: 'int' },
    { name: 'instagram_followers', type: 'int', default: 0 },
    { name: 'tiktok_followers', type: 'int', default: 0 },
    { name: 'twitter_followers', type: 'int', default: 0 },
    { name: 'youtube_subscribers', type: 'int', default: 0 },
    { name: 'has_nil_deal', type: 'boolean', default: false },
  ];

  // Check existing columns
  const { data: sampleUser } = await supabase
    .from('users')
    .select('*')
    .limit(1)
    .single();

  const existingColumns = sampleUser ? Object.keys(sampleUser) : [];

  for (const col of columnsToAdd) {
    if (existingColumns.includes(col.name)) {
      console.log(`  ⏭️  Column '${col.name}' already exists`);
      results.push({ step: `Add column ${col.name}`, status: 'SKIP', message: 'Already exists' });
    } else {
      console.log(`  ⚠️  Column '${col.name}' needs to be added via Supabase dashboard SQL editor`);
      results.push({ step: `Add column ${col.name}`, status: 'ERROR', message: 'Requires SQL editor' });
    }
  }

  // ============================================================
  // FIX 2: Add source attribution to knowledge_base
  // ============================================================
  console.log('\n📚 Step 2: Adding source attribution to knowledge_base...');

  // Check if source column exists
  const { data: sampleKb } = await supabase
    .from('knowledge_base')
    .select('*')
    .limit(1)
    .single();

  if (sampleKb && 'source' in sampleKb) {
    console.log('  ✅ Source column exists');

    // Update entries without source
    const { error: updateError, count } = await supabase
      .from('knowledge_base')
      .update({ source: 'ChatNIL Knowledge Base' })
      .is('source', null);

    if (updateError) {
      console.log(`  ❌ Error updating sources: ${updateError.message}`);
      results.push({ step: 'Update knowledge_base sources', status: 'ERROR', message: updateError.message });
    } else {
      console.log(`  ✅ Updated entries with default source`);
      results.push({ step: 'Update knowledge_base sources', status: 'OK' });
    }

    // Update state laws
    const { error: stateError } = await supabase
      .from('knowledge_base')
      .update({ source: 'State Legislature Official Records' })
      .eq('content_type', 'state_law');

    if (!stateError) {
      console.log('  ✅ Updated state law sources');
    }

    // Update educational articles
    const { error: eduError } = await supabase
      .from('knowledge_base')
      .update({ source: 'ChatNIL Educational Content' })
      .eq('content_type', 'educational_article');

    if (!eduError) {
      console.log('  ✅ Updated educational article sources');
    }

  } else {
    console.log('  ⚠️  Source column needs to be added via SQL editor');
    results.push({ step: 'Add source column', status: 'ERROR', message: 'Requires SQL editor' });
  }

  // ============================================================
  // FIX 3: Test existing functions
  // ============================================================
  console.log('\n🔍 Step 3: Testing RPC functions...');

  // Test search_knowledge_base
  const { error: searchKbError } = await supabase.rpc('search_knowledge_base', {
    query_embedding: new Array(1536).fill(0.01),
    match_threshold: 0.5,
    match_count: 1
  });

  if (searchKbError) {
    console.log(`  ❌ search_knowledge_base: ${searchKbError.message}`);
    results.push({ step: 'Test search_knowledge_base', status: 'ERROR', message: searchKbError.message });
  } else {
    console.log('  ✅ search_knowledge_base: Working');
    results.push({ step: 'Test search_knowledge_base', status: 'OK' });
  }

  // Test match_knowledge (may not exist yet)
  const { error: matchKbError } = await supabase.rpc('match_knowledge', {
    query_embedding: new Array(1536).fill(0.01),
    match_threshold: 0.5,
    match_count: 1
  });

  if (matchKbError) {
    if (matchKbError.message.includes('Could not find')) {
      console.log('  ⚠️  match_knowledge: Needs to be created via SQL editor');
      results.push({ step: 'Create match_knowledge', status: 'ERROR', message: 'Function not found' });
    } else {
      console.log(`  ❌ match_knowledge: ${matchKbError.message}`);
      results.push({ step: 'Test match_knowledge', status: 'ERROR', message: matchKbError.message });
    }
  } else {
    console.log('  ✅ match_knowledge: Working');
    results.push({ step: 'Test match_knowledge', status: 'OK' });
  }

  // Test search_conversation_memory
  const { error: memError } = await supabase.rpc('search_conversation_memory', {
    p_user_id: 'ca05429a-0f32-4280-8b71-99dc5baee0dc',
    query_embedding: new Array(1536).fill(0.01),
    match_threshold: 0.5,
    match_count: 1
  });

  if (memError) {
    console.log(`  ⚠️  search_conversation_memory: ${memError.message}`);
    results.push({ step: 'Test search_conversation_memory', status: 'ERROR', message: memError.message });
  } else {
    console.log('  ✅ search_conversation_memory: Working');
    results.push({ step: 'Test search_conversation_memory', status: 'OK' });
  }

  // ============================================================
  // Summary
  // ============================================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));

  const okCount = results.filter(r => r.status === 'OK').length;
  const errorCount = results.filter(r => r.status === 'ERROR').length;
  const skipCount = results.filter(r => r.status === 'SKIP').length;

  console.log(`\n✅ Passed: ${okCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);

  if (errorCount > 0) {
    console.log('\n⚠️  MANUAL ACTION REQUIRED');
    console.log('Some changes require the Supabase Dashboard SQL Editor.');
    console.log('\nRun this SQL in the Supabase Dashboard → SQL Editor:\n');
    console.log('```sql');
    console.log(`-- AI Brain Fixes - Run in Supabase SQL Editor

-- 1. Create match_knowledge function
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  summary text,
  content_type text,
  category text,
  tags text[],
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.summary,
    kb.content_type::text,
    kb.category,
    kb.tags,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) as similarity
  FROM knowledge_base kb
  WHERE
    kb.is_published = true
    AND kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 2. Create match_memories function
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  memory_type text,
  content text,
  importance_score float,
  similarity float,
  source_session_id uuid
)
LANGUAGE sql STABLE
AS $$
  SELECT
    cm.id,
    cm.memory_type,
    cm.content,
    cm.importance_score,
    1 - (cm.embedding <=> query_embedding) as similarity,
    cm.source_session_id
  FROM conversation_memory cm
  WHERE
    (p_user_id IS NULL OR cm.user_id = p_user_id)
    AND cm.is_active = true
    AND cm.embedding IS NOT NULL
    AND (cm.expires_at IS NULL OR cm.expires_at > now())
    AND 1 - (cm.embedding <=> query_embedding) > match_threshold
  ORDER BY
    cm.importance_score DESC,
    cm.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 3. Create match_document_chunks function
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_index int,
  chunk_text text,
  token_count int,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.chunk_text,
    dc.token_count,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  WHERE
    (p_user_id IS NULL OR d.user_id = p_user_id)
    AND dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 4. Add missing user columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS sport text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS school_level text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS age int;
ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram_followers int DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tiktok_followers int DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter_followers int DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS youtube_subscribers int DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_nil_deal boolean DEFAULT false;

-- 5. Add source column to knowledge_base if missing
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS source text;

-- 6. Update knowledge_base sources
UPDATE knowledge_base SET source = 'ChatNIL Knowledge Base' WHERE source IS NULL;
UPDATE knowledge_base SET source = 'State Legislature Official Records' WHERE content_type = 'state_law';
UPDATE knowledge_base SET source = 'ChatNIL Educational Content' WHERE content_type = 'educational_article';
UPDATE knowledge_base SET source = 'NIL Industry Examples' WHERE content_type = 'deal_example';

-- 7. Create conversation_memories view
CREATE OR REPLACE VIEW conversation_memories AS SELECT * FROM conversation_memory;
`);
    console.log('```\n');
  }
}

applyFixes().catch(console.error);
