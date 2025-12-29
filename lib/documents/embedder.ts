/**
 * Document Embedding Generator
 *
 * Generates vector embeddings for document chunks using OpenAI's embedding model.
 */

import OpenAI from 'openai';
import type { TextChunk } from './types';

// ============================================
// Configuration
// ============================================

const EMBEDDING_MODEL = 'text-embedding-ada-002';
const EMBEDDING_DIMENSIONS = 1536;
const MAX_BATCH_SIZE = 20; // OpenAI recommends batching
const MAX_TOKENS_PER_REQUEST = 8000; // Model limit

// Lazy initialization to avoid SSR issues
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// ============================================
// Types
// ============================================

export interface EmbeddingResult {
  chunkIndex: number;
  embedding: number[];
  tokenCount: number;
}

export interface BatchEmbeddingResult {
  success: boolean;
  embeddings?: EmbeddingResult[];
  error?: string;
  totalTokens?: number;
}

// ============================================
// Single Embedding
// ============================================

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const openai = getOpenAIClient();

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.trim(),
    });

    return response.data[0].embedding;
  } catch (error: any) {
    console.error('Embedding generation failed:', error);
    return null;
  }
}

// ============================================
// Batch Embedding
// ============================================

/**
 * Generate embeddings for multiple chunks efficiently
 */
export async function generateChunkEmbeddings(
  chunks: TextChunk[]
): Promise<BatchEmbeddingResult> {
  if (chunks.length === 0) {
    return { success: true, embeddings: [], totalTokens: 0 };
  }

  try {
    const openai = getOpenAIClient();
    const allEmbeddings: EmbeddingResult[] = [];
    let totalTokens = 0;

    // Process in batches
    const batches = createBatches(chunks, MAX_BATCH_SIZE, MAX_TOKENS_PER_REQUEST);

    for (const batch of batches) {
      const texts = batch.map(c => c.text.trim());

      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: texts,
      });

      // Map embeddings back to chunks
      for (let i = 0; i < batch.length; i++) {
        allEmbeddings.push({
          chunkIndex: batch[i].index,
          embedding: response.data[i].embedding,
          tokenCount: response.usage.total_tokens / batch.length, // Approximate per chunk
        });
      }

      totalTokens += response.usage.total_tokens;
    }

    return {
      success: true,
      embeddings: allEmbeddings,
      totalTokens,
    };
  } catch (error: any) {
    console.error('Batch embedding generation failed:', error);
    return {
      success: false,
      error: error.message || 'Embedding generation failed',
    };
  }
}

// ============================================
// Batch Creation Helper
// ============================================

function createBatches(
  chunks: TextChunk[],
  maxBatchSize: number,
  maxTokens: number
): TextChunk[][] {
  const batches: TextChunk[][] = [];
  let currentBatch: TextChunk[] = [];
  let currentTokens = 0;

  for (const chunk of chunks) {
    const chunkTokens = chunk.tokenCount || Math.ceil(chunk.text.length / 4);

    // Check if adding this chunk would exceed limits
    if (
      currentBatch.length >= maxBatchSize ||
      currentTokens + chunkTokens > maxTokens
    ) {
      if (currentBatch.length > 0) {
        batches.push(currentBatch);
      }
      currentBatch = [chunk];
      currentTokens = chunkTokens;
    } else {
      currentBatch.push(chunk);
      currentTokens += chunkTokens;
    }
  }

  // Don't forget the last batch
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

// ============================================
// Query Embedding
// ============================================

/**
 * Generate embedding for a search query
 * Same as document embedding but semantically for queries
 */
export async function generateQueryEmbedding(query: string): Promise<number[] | null> {
  return generateEmbedding(query);
}

// ============================================
// Similarity Calculation
// ============================================

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find most similar chunks to a query embedding
 */
export function findSimilarChunks(
  queryEmbedding: number[],
  chunkEmbeddings: { index: number; embedding: number[] }[],
  topK: number = 5,
  minSimilarity: number = 0.7
): { index: number; similarity: number }[] {
  const similarities = chunkEmbeddings.map(chunk => ({
    index: chunk.index,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  return similarities
    .filter(s => s.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

// ============================================
// Constants Export
// ============================================

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };
