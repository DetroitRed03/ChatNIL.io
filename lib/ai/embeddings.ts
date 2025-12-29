/**
 * Embedding Generation Utilities for ChatNIL AI Brain
 * Uses OpenAI text-embedding-ada-002 (1536 dimensions)
 */

const EMBEDDING_MODEL = 'text-embedding-ada-002';
const MAX_TOKENS = 8191; // Model limit
const BATCH_SIZE = 100; // OpenAI recommends max 100 per request
const RATE_LIMIT_DELAY = 200; // ms between batches

/**
 * Truncate text to approximate token limit
 * Rough estimate: 1 token ≈ 4 characters
 */
function truncateToTokenLimit(text: string, maxTokens: number = MAX_TOKENS): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
}

/**
 * Delay helper for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate embedding for a single text string
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text');
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const truncatedText = truncateToTokenLimit(text.trim());

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: truncatedText
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    // Handle rate limiting
    if (response.status === 429) {
      await delay(1000);
      return generateEmbedding(text); // Retry once
    }

    throw new Error(`OpenAI embedding error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts in batches
 * Returns array of embeddings in same order as input
 */
export async function generateEmbeddings(
  texts: string[],
  onProgress?: (processed: number, total: number) => void
): Promise<number[][]> {
  if (!texts.length) return [];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const results: number[][] = [];
  const validTexts = texts.map(t => truncateToTokenLimit(t.trim()));

  for (let i = 0; i < validTexts.length; i += BATCH_SIZE) {
    const batch = validTexts.slice(i, i + BATCH_SIZE);

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: batch
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      // Handle rate limiting with exponential backoff
      if (response.status === 429) {
        await delay(2000);
        i -= BATCH_SIZE; // Retry this batch
        continue;
      }

      throw new Error(`OpenAI embedding error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Embeddings come back in same order as input
    for (const item of data.data) {
      results.push(item.embedding);
    }

    onProgress?.(Math.min(i + BATCH_SIZE, validTexts.length), validTexts.length);

    // Rate limiting delay between batches
    if (i + BATCH_SIZE < validTexts.length) {
      await delay(RATE_LIMIT_DELAY);
    }
  }

  return results;
}

/**
 * Prepare text for embedding by combining title and content
 */
export function prepareEmbeddingText(title: string, content: string): string {
  return `${title}\n\n${content}`;
}
