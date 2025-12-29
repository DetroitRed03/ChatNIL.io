/**
 * Document Retriever
 *
 * Semantic search over user's document chunks.
 * Used to inject relevant document context into AI conversations.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { generateQueryEmbedding } from './embedder';
import type { DocumentSearchOptions, DocumentSearchResult, DocumentType } from './types';

// ============================================
// Supabase Client
// ============================================

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase configuration');
    }

    supabase = createClient(url, key, {
      auth: { persistSession: false }
    });
  }
  return supabase;
}

// ============================================
// Main Search Function
// ============================================

/**
 * Search user's documents for relevant chunks
 */
export async function searchDocuments(
  options: DocumentSearchOptions
): Promise<DocumentSearchResult[]> {
  const {
    userId,
    query,
    maxResults = 5,
    minSimilarity = 0.7,
    documentTypes,
    documentIds,
  } = options;

  try {
    // Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(query);

    if (!queryEmbedding) {
      console.error('Failed to generate query embedding');
      return [];
    }

    const db = getSupabase();

    // Use the match_document_chunks function
    const { data, error } = await db.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      p_user_id: userId,
      match_count: maxResults * 2, // Fetch extra for filtering
      match_threshold: minSimilarity,
    });

    if (error) {
      console.error('Document search failed:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Apply additional filters if specified
    let results = data as DocumentSearchResult[];

    if (documentTypes && documentTypes.length > 0) {
      results = results.filter(r => documentTypes.includes(r.documentType));
    }

    if (documentIds && documentIds.length > 0) {
      results = results.filter(r => documentIds.includes(r.documentId));
    }

    // Return top results
    return results.slice(0, maxResults);

  } catch (error: any) {
    console.error('Document search error:', error);
    return [];
  }
}

// ============================================
// Retrieve Document Context for Chat
// ============================================

/**
 * Retrieve relevant document context for an AI chat message
 */
export async function retrieveDocumentContext(
  userMessage: string,
  userId: string,
  options?: {
    maxChunks?: number;
    minSimilarity?: number;
    documentIds?: string[];
  }
): Promise<{
  chunks: DocumentSearchResult[];
  formattedContext: string;
}> {
  const chunks = await searchDocuments({
    userId,
    query: userMessage,
    maxResults: options?.maxChunks || 5,
    minSimilarity: options?.minSimilarity || 0.7,
    documentIds: options?.documentIds,
  });

  if (chunks.length === 0) {
    return { chunks: [], formattedContext: '' };
  }

  // Format chunks for inclusion in prompt
  const formattedContext = formatDocumentContext(chunks);

  return { chunks, formattedContext };
}

/**
 * Format document chunks for inclusion in AI prompt
 */
export function formatDocumentContext(chunks: DocumentSearchResult[]): string {
  if (chunks.length === 0) return '';

  const contextParts: string[] = [];

  // Group chunks by document
  const byDocument = new Map<string, DocumentSearchResult[]>();
  for (const chunk of chunks) {
    const key = chunk.documentId;
    if (!byDocument.has(key)) {
      byDocument.set(key, []);
    }
    byDocument.get(key)!.push(chunk);
  }

  for (const [docId, docChunks] of Array.from(byDocument.entries())) {
    const firstChunk = docChunks[0];
    const docType = formatDocumentType(firstChunk.documentType);

    contextParts.push(`## ${firstChunk.fileName} (${docType})`);

    // Sort chunks by their order in the document
    docChunks.sort((a: DocumentSearchResult, b: DocumentSearchResult) => a.chunkIndex - b.chunkIndex);

    for (const chunk of docChunks) {
      const pageInfo = chunk.pageNumber ? ` (Page ${chunk.pageNumber})` : '';
      contextParts.push(`${chunk.chunkText}${pageInfo}`);
    }

    contextParts.push(''); // Empty line between documents
  }

  return contextParts.join('\n');
}

function formatDocumentType(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    contract: 'Contract',
    amendment: 'Amendment',
    endorsement: 'Endorsement',
    agreement: 'Agreement',
    letter: 'Letter',
    other: 'Document',
  };
  return labels[type] || 'Document';
}

// ============================================
// Get User's Documents
// ============================================

/**
 * Get list of user's processed documents
 */
export async function getUserDocuments(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    source?: 'library' | 'chat_attachment';
  }
): Promise<{
  documents: any[];
  total: number;
}> {
  const db = getSupabase();

  let query = db
    .from('documents')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('extraction_status', options.status);
  }

  if (options?.source) {
    query = query.eq('source', options.source);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Failed to get user documents:', error);
    return { documents: [], total: 0 };
  }

  return {
    documents: data || [],
    total: count || 0,
  };
}

// ============================================
// Get Document Details
// ============================================

/**
 * Get a specific document with its chunks and analysis
 */
export async function getDocument(
  documentId: string,
  userId: string
): Promise<{
  document: any | null;
  chunks: any[];
  analysis: any[];
}> {
  const db = getSupabase();

  // Get document
  const { data: doc, error: docError } = await db
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single();

  if (docError || !doc) {
    return { document: null, chunks: [], analysis: [] };
  }

  // Get chunks
  const { data: chunks } = await db
    .from('document_chunks')
    .select('id, chunk_index, chunk_text, token_count, page_number')
    .eq('document_id', documentId)
    .order('chunk_index');

  // Get analysis results
  const { data: analysis } = await db
    .from('document_analysis_results')
    .select('*')
    .eq('document_id', documentId);

  return {
    document: doc,
    chunks: chunks || [],
    analysis: analysis || [],
  };
}

// ============================================
// Delete Document
// ============================================

/**
 * Delete a document and all associated data
 */
export async function deleteDocument(
  documentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const db = getSupabase();

  try {
    // Verify ownership
    const { data: doc } = await db
      .from('documents')
      .select('id, storage_path')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (!doc) {
      return { success: false, error: 'Document not found' };
    }

    // Delete from storage if exists
    if (doc.storage_path) {
      await db.storage
        .from('user-documents')
        .remove([doc.storage_path]);
    }

    // Delete document (cascades to chunks and analysis)
    const { error } = await db
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
