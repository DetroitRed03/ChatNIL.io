/**
 * API Endpoint for Embedding Generation & Status
 *
 * GET  /api/knowledge/embed - Check embedding status counts
 * POST /api/knowledge/embed - Generate embeddings for entries
 *
 * POST body modes:
 *   { mode: 'single', ids: ['uuid'] }     - Single entry
 *   { mode: 'batch', ids: ['uuid', ...] } - Multiple entries
 *   { mode: 'missing', limit: 50 }        - Process entries without embeddings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding, generateEmbeddings, prepareEmbeddingText } from '@/lib/ai/embeddings';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: (url: any, opts: any) => fetch(url, { ...opts, cache: 'no-store' as any }),
    }
  });
}

interface EmbedRequest {
  mode: 'single' | 'batch' | 'missing';
  ids?: string[];
  limit?: number;
}

/**
 * GET - Check embedding status
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { count: total } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true });

    const { count: withEmbeddings } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);

    const { count: withoutEmbeddings } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true })
      .is('embedding', null);

    return NextResponse.json({
      total: total || 0,
      withEmbeddings: withEmbeddings || 0,
      withoutEmbeddings: withoutEmbeddings || 0,
      percentComplete: total ? Math.round(((withEmbeddings || 0) / total) * 100) : 0
    });
  } catch (error: any) {
    console.error('Embed status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get embedding status' },
      { status: 500 }
    );
  }
}

/**
 * POST - Generate embeddings
 */
export async function POST(request: NextRequest) {
  try {
    const body: EmbedRequest = await request.json();
    const { mode, ids, limit = 50 } = body;

    const supabase = getSupabaseAdmin();

    if (mode === 'single' && ids?.length === 1) {
      return handleSingleEmbed(supabase, ids[0]);
    }

    if (mode === 'batch' && ids?.length) {
      return handleBatchEmbed(supabase, ids);
    }

    if (mode === 'missing') {
      return handleMissingEmbeds(supabase, limit);
    }

    return NextResponse.json(
      { error: 'Invalid mode. Use: single, batch, or missing' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Embed API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSingleEmbed(supabase: ReturnType<typeof createClient>, id: string) {
  // Fetch the entry
  const { data: entry, error: fetchError } = await supabase
    .from('knowledge_base')
    .select('id, title, content')
    .eq('id', id)
    .single();

  if (fetchError || !entry) {
    return NextResponse.json(
      { error: 'Entry not found' },
      { status: 404 }
    );
  }

  // Generate embedding
  const text = prepareEmbeddingText(entry.title, entry.content);
  const embedding = await generateEmbedding(text);

  // Update entry
  const { error: updateError } = await supabase
    .from('knowledge_base')
    .update({
      embedding,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to update embedding' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Embedding generated for: ${entry.title}`,
    id: entry.id
  });
}

async function handleBatchEmbed(supabase: ReturnType<typeof createClient>, ids: string[]) {
  // Fetch entries
  const { data: entries, error: fetchError } = await supabase
    .from('knowledge_base')
    .select('id, title, content')
    .in('id', ids);

  if (fetchError || !entries?.length) {
    return NextResponse.json(
      { error: 'Entries not found' },
      { status: 404 }
    );
  }

  // Generate embeddings
  const texts = entries.map((e: { title: string; content: string }) =>
    prepareEmbeddingText(e.title, e.content)
  );
  const embeddings = await generateEmbeddings(texts);

  // Update entries
  let successCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    const { error: updateError } = await supabase
      .from('knowledge_base')
      .update({
        embedding: embeddings[i],
        updated_at: new Date().toISOString()
      })
      .eq('id', entries[i].id);

    if (updateError) {
      errors.push(entries[i].id);
    } else {
      successCount++;
    }
  }

  return NextResponse.json({
    success: true,
    processed: entries.length,
    updated: successCount,
    failed: errors.length,
    failedIds: errors.length > 0 ? errors : undefined
  });
}

async function handleMissingEmbeds(supabase: ReturnType<typeof createClient>, limit: number) {
  // Fetch entries without embeddings
  const { data: entries, error: fetchError } = await supabase
    .from('knowledge_base')
    .select('id, title, content')
    .is('embedding', null)
    .limit(Math.min(limit, 100)); // Cap at 100 for safety

  if (fetchError) {
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }

  if (!entries?.length) {
    return NextResponse.json({
      success: true,
      message: 'All entries already have embeddings',
      processed: 0
    });
  }

  // Generate embeddings
  const texts = entries.map((e: { title: string; content: string }) =>
    prepareEmbeddingText(e.title, e.content)
  );
  const embeddings = await generateEmbeddings(texts);

  // Update entries
  let successCount = 0;

  for (let i = 0; i < entries.length; i++) {
    const { error: updateError } = await supabase
      .from('knowledge_base')
      .update({
        embedding: embeddings[i],
        updated_at: new Date().toISOString()
      })
      .eq('id', entries[i].id);

    if (!updateError) successCount++;
  }

  // Get remaining count
  const { count: remaining } = await supabase
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true })
    .is('embedding', null);

  return NextResponse.json({
    success: true,
    processed: entries.length,
    updated: successCount,
    remaining: remaining || 0
  });
}
