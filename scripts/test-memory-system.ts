#!/usr/bin/env npx tsx
/**
 * Test script for Conversation Memory System
 * Tests storing and retrieving memories for a user
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !openaiKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sarah Johnson's user ID (from the logs)
const TEST_USER_ID = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text.slice(0, 8000)
    })
  });
  const data = await response.json();
  return data.data[0].embedding;
}

async function testMemorySystem() {
  console.log('='.repeat(60));
  console.log('Testing Conversation Memory System');
  console.log('='.repeat(60));
  console.log('Test User: Sarah Johnson');
  console.log('User ID:', TEST_USER_ID);

  // 1. Store test memories for Sarah
  console.log('\n📝 Step 1: Storing test memories for Sarah...');

  const testMemories = [
    { type: 'context', content: 'I am a Division 1 basketball player at UCLA' },
    { type: 'fact', content: 'I have 50,000 Instagram followers' },
    { type: 'preference', content: 'I prefer deals with local businesses over national brands' },
    { type: 'goal', content: 'I want to earn enough from NIL to cover my living expenses' },
  ];

  for (const mem of testMemories) {
    const embedding = await generateEmbedding(mem.content);

    const { data, error } = await supabase
      .from('conversation_memory')
      .insert({
        user_id: TEST_USER_ID,
        memory_type: mem.type,
        content: mem.content,
        embedding,
        importance_score: 0.8,
        is_active: true
      })
      .select('id')
      .single();

    if (error) {
      if (error.message.includes('duplicate')) {
        console.log(`  ⏭️  Skipped ${mem.type}: already exists`);
      } else {
        console.log(`  ❌ Failed to store ${mem.type}: ${error.message}`);
      }
    } else {
      console.log(`  ✓ Stored ${mem.type}: "${mem.content.substring(0, 40)}..."`);
    }
  }

  // 2. Test memory search
  console.log('\n🔍 Step 2: Testing memory search...');

  const testQueries = [
    'What kind of NIL deals should I pursue?',
    'How can I grow my social media following?',
    'What are good ways to make money from NIL?',
  ];

  for (const testQuery of testQueries) {
    console.log(`\n  Query: "${testQuery}"`);

    const queryEmbedding = await generateEmbedding(testQuery);

    const { data: memories, error: searchError } = await supabase.rpc('search_conversation_memory', {
      p_user_id: TEST_USER_ID,
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 5,
      memory_types: null
    });

    if (searchError) {
      console.log(`  ❌ Search failed: ${searchError.message}`);
    } else if (!memories || memories.length === 0) {
      console.log(`  ⚠️  No relevant memories found`);
    } else {
      console.log(`  ✓ Found ${memories.length} relevant memories:`);
      for (const mem of memories) {
        console.log(`    - [${mem.memory_type}] ${mem.content.substring(0, 50)}... (${(mem.similarity * 100).toFixed(1)}%)`);
      }
    }
  }

  // 3. Verify all memories in database
  console.log('\n📊 Step 3: Verifying stored memories...');

  const { data: allMemories, error: fetchError } = await supabase
    .from('conversation_memory')
    .select('id, memory_type, content, importance_score, created_at')
    .eq('user_id', TEST_USER_ID)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.log(`  ❌ Fetch failed: ${fetchError.message}`);
  } else {
    console.log(`  ✓ Total memories for Sarah: ${allMemories?.length || 0}`);
    const byType: Record<string, number> = {};
    for (const m of (allMemories || [])) {
      byType[m.memory_type] = (byType[m.memory_type] || 0) + 1;
    }
    console.log('  By type:', byType);

    console.log('\n  All memories:');
    for (const m of (allMemories || [])) {
      console.log(`    [${m.memory_type}] ${m.content}`);
    }
  }

  // 4. Test that memories appear in chat context
  console.log('\n🧠 Step 4: Testing chat context integration...');
  console.log('  When Sarah asks a question, her memories should appear in context.');
  console.log('  Try chatting as Sarah and asking about NIL deals!');

  console.log('\n' + '='.repeat(60));
  console.log('Memory System Test Complete!');
  console.log('='.repeat(60));
}

testMemorySystem().catch(console.error);
