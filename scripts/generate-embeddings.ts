#!/usr/bin/env npx tsx
/**
 * Bulk Embedding Generation Script for ChatNIL Knowledge Base
 *
 * Usage:
 *   npx tsx scripts/generate-embeddings.ts           # Generate all missing embeddings
 *   npx tsx scripts/generate-embeddings.ts --dry-run # Preview without updating
 *   npx tsx scripts/generate-embeddings.ts --limit 10 # Process only 10 entries
 *
 * Environment variables required:
 *   SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   OPENAI_API_KEY
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment');
  process.exit(1);
}

if (!openaiApiKey) {
  console.error('Missing OPENAI_API_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EMBEDDING_MODEL = 'text-embedding-ada-002';
const BATCH_SIZE = 20; // Smaller batches for reliability
const RATE_LIMIT_DELAY = 300; // ms between batches

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  embedding: number[] | null;
}

/**
 * Generate embedding for a batch of texts
 */
async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts.map(t => t.slice(0, 8000 * 4)) // Truncate to ~8K tokens
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.data.map((item: { embedding: number[] }) => item.embedding);
}

/**
 * Prepare text for embedding
 */
function prepareText(title: string, content: string): string {
  return `${title}\n\n${content}`;
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : undefined;

  console.log('='.repeat(60));
  console.log('ChatNIL AI Brain - Embedding Generation');
  console.log('='.repeat(60));
  console.log(`Model: ${EMBEDDING_MODEL}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  if (dryRun) console.log('MODE: DRY RUN - No database updates will be made');
  if (limit) console.log(`Limit: ${limit} entries`);
  console.log('');

  // Fetch entries without embeddings
  let query = supabase
    .from('knowledge_base')
    .select('id, title, content, embedding')
    .is('embedding', null)
    .order('created_at', { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: entries, error: fetchError } = await query;

  if (fetchError) {
    console.error('Failed to fetch knowledge base entries:', fetchError);
    process.exit(1);
  }

  if (!entries || entries.length === 0) {
    console.log('All entries already have embeddings. Nothing to do.');
    return;
  }

  console.log(`Found ${entries.length} entries without embeddings\n`);

  if (dryRun) {
    console.log('DRY RUN: Would process the following entries:');
    entries.slice(0, 10).forEach((e) => {
      console.log(`  - ${e.id}: ${e.title.substring(0, 50)}...`);
    });
    if (entries.length > 10) {
      console.log(`  ... and ${entries.length - 10} more`);
    }
    return;
  }

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  // Process in batches
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(entries.length / BATCH_SIZE);

    console.log(`\nBatch ${batchNum}/${totalBatches} (${batch.length} entries)`);

    try {
      // Prepare texts for this batch
      const texts = batch.map((e: KnowledgeEntry) => prepareText(e.title, e.content));

      // Generate embeddings
      const embeddings = await generateEmbeddingsBatch(texts);

      // Update database for each entry
      for (let j = 0; j < batch.length; j++) {
        const entry = batch[j] as KnowledgeEntry;
        const embedding = embeddings[j];

        const { error: updateError } = await supabase
          .from('knowledge_base')
          .update({
            embedding: embedding,
            updated_at: new Date().toISOString()
          })
          .eq('id', entry.id);

        if (updateError) {
          console.error(`  ✗ Failed: ${entry.title.substring(0, 40)}... - ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`  ✓ ${entry.title.substring(0, 50)}...`);
          successCount++;
        }
      }

      // Rate limiting delay between batches
      if (i + BATCH_SIZE < entries.length) {
        await delay(RATE_LIMIT_DELAY);
      }

    } catch (error: any) {
      console.error(`  ✗ Batch failed: ${error.message}`);

      // If rate limited, wait longer and retry
      if (error.message.includes('rate') || error.message.includes('429')) {
        console.log('  ⏳ Rate limited, waiting 5 seconds...');
        await delay(5000);
        i -= BATCH_SIZE; // Retry this batch
      } else {
        errorCount += batch.length;
      }
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('COMPLETE');
  console.log('='.repeat(60));
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Failed: ${errorCount}`);
  console.log(`Duration: ${duration}s`);
  if (successCount > 0) {
    console.log(`Average: ${(parseFloat(duration) / successCount * 1000).toFixed(0)}ms per entry`);
  }

  // Verify final count
  const { count: remaining } = await supabase
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true })
    .is('embedding', null);

  console.log(`\nRemaining without embeddings: ${remaining || 0}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
