/**
 * Document Text Chunking
 *
 * Splits extracted text into chunks suitable for embedding and retrieval.
 * Preserves paragraph structure and includes overlap for context continuity.
 */

import type { TextChunk, ChunkingOptions, ExtractedPage } from './types';

// ============================================
// Default Configuration
// ============================================

const DEFAULT_OPTIONS: Required<ChunkingOptions> = {
  maxTokens: 500, // ~2000 characters
  overlapTokens: 50, // ~200 characters
  preserveParagraphs: true,
};

// Approximate characters per token (GPT models)
const CHARS_PER_TOKEN = 4;

// ============================================
// Main Chunking Function
// ============================================

/**
 * Split text into chunks with overlap
 */
export function chunkText(
  text: string,
  options: ChunkingOptions = {},
  pages?: ExtractedPage[]
): TextChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const maxChars = opts.maxTokens * CHARS_PER_TOKEN;
  const overlapChars = opts.overlapTokens * CHARS_PER_TOKEN;

  // Clean and normalize text
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  if (!cleanedText) {
    return [];
  }

  // Split into paragraphs if preserving structure
  if (opts.preserveParagraphs) {
    return chunkByParagraphs(cleanedText, maxChars, overlapChars, pages);
  }

  // Simple character-based chunking
  return chunkByCharacters(cleanedText, maxChars, overlapChars, pages);
}

// ============================================
// Paragraph-Based Chunking
// ============================================

function chunkByParagraphs(
  text: string,
  maxChars: number,
  overlapChars: number,
  pages?: ExtractedPage[]
): TextChunk[] {
  const chunks: TextChunk[] = [];
  const paragraphs = text.split(/\n\s*\n/);

  let currentChunk = '';
  let currentStartChar = 0;
  let chunkIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();

    if (!paragraph) continue;

    // If paragraph itself is too long, split it
    if (paragraph.length > maxChars) {
      // First, save current chunk if exists
      if (currentChunk) {
        chunks.push(createChunk(
          chunkIndex++,
          currentChunk,
          currentStartChar,
          currentStartChar + currentChunk.length,
          pages
        ));
        currentChunk = '';
      }

      // Split long paragraph into sentences
      const sentenceChunks = splitLongParagraph(paragraph, maxChars, overlapChars);
      const paragraphStart = text.indexOf(paragraph);

      for (const sentenceChunk of sentenceChunks) {
        chunks.push(createChunk(
          chunkIndex++,
          sentenceChunk.text,
          paragraphStart + sentenceChunk.startOffset,
          paragraphStart + sentenceChunk.endOffset,
          pages
        ));
      }

      currentStartChar = paragraphStart + paragraph.length;
      continue;
    }

    // Check if adding paragraph would exceed limit
    const separator = currentChunk ? '\n\n' : '';
    const potentialChunk = currentChunk + separator + paragraph;

    if (potentialChunk.length > maxChars && currentChunk) {
      // Save current chunk
      chunks.push(createChunk(
        chunkIndex++,
        currentChunk,
        currentStartChar,
        currentStartChar + currentChunk.length,
        pages
      ));

      // Start new chunk with overlap
      currentChunk = getOverlapText(currentChunk, overlapChars) + '\n\n' + paragraph;
      currentStartChar = text.indexOf(paragraph);
    } else {
      currentChunk = potentialChunk;
      if (!currentStartChar && i === 0) {
        currentStartChar = 0;
      }
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push(createChunk(
      chunkIndex,
      currentChunk,
      currentStartChar,
      currentStartChar + currentChunk.length,
      pages
    ));
  }

  return chunks;
}

// ============================================
// Character-Based Chunking (Fallback)
// ============================================

function chunkByCharacters(
  text: string,
  maxChars: number,
  overlapChars: number,
  pages?: ExtractedPage[]
): TextChunk[] {
  const chunks: TextChunk[] = [];
  let startChar = 0;
  let chunkIndex = 0;

  while (startChar < text.length) {
    let endChar = Math.min(startChar + maxChars, text.length);

    // Try to break at a sentence or word boundary
    if (endChar < text.length) {
      const breakPoint = findBreakPoint(text, startChar, endChar);
      if (breakPoint > startChar) {
        endChar = breakPoint;
      }
    }

    const chunkText = text.slice(startChar, endChar).trim();

    if (chunkText) {
      chunks.push(createChunk(
        chunkIndex++,
        chunkText,
        startChar,
        endChar,
        pages
      ));
    }

    // Move start with overlap
    startChar = endChar - overlapChars;
    if (startChar >= text.length) break;
    if (startChar < 0) startChar = endChar; // Avoid infinite loop
  }

  return chunks;
}

// ============================================
// Helper Functions
// ============================================

function createChunk(
  index: number,
  text: string,
  startChar: number,
  endChar: number,
  pages?: ExtractedPage[]
): TextChunk {
  return {
    index,
    text: text.trim(),
    tokenCount: Math.ceil(text.length / CHARS_PER_TOKEN),
    startChar,
    endChar,
    pageNumber: pages ? findPageNumber(startChar, pages) : undefined,
  };
}

function findPageNumber(charPosition: number, pages: ExtractedPage[]): number | undefined {
  for (const page of pages) {
    if (charPosition >= page.startChar && charPosition <= page.endChar) {
      return page.pageNumber;
    }
  }
  return undefined;
}

function getOverlapText(text: string, overlapChars: number): string {
  if (text.length <= overlapChars) {
    return text;
  }

  // Try to start at a sentence boundary
  const overlapStart = text.length - overlapChars;
  const sentenceStart = text.indexOf('. ', overlapStart);

  if (sentenceStart !== -1 && sentenceStart < text.length - 50) {
    return text.slice(sentenceStart + 2);
  }

  // Fall back to word boundary
  const wordStart = text.indexOf(' ', overlapStart);
  if (wordStart !== -1) {
    return text.slice(wordStart + 1);
  }

  return text.slice(overlapStart);
}

function findBreakPoint(text: string, start: number, end: number): number {
  // Look for sentence end within last 20% of chunk
  const searchStart = Math.floor(start + (end - start) * 0.8);

  // Try to break at period, question mark, or exclamation
  for (let i = end; i >= searchStart; i--) {
    if ('.!?'.includes(text[i]) && (i + 1 >= text.length || text[i + 1] === ' ')) {
      return i + 1;
    }
  }

  // Fall back to newline
  for (let i = end; i >= searchStart; i--) {
    if (text[i] === '\n') {
      return i + 1;
    }
  }

  // Fall back to space (word boundary)
  for (let i = end; i >= searchStart; i--) {
    if (text[i] === ' ') {
      return i + 1;
    }
  }

  return end;
}

function splitLongParagraph(
  paragraph: string,
  maxChars: number,
  overlapChars: number
): { text: string; startOffset: number; endOffset: number }[] {
  const chunks: { text: string; startOffset: number; endOffset: number }[] = [];

  // Split by sentences
  const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [paragraph];
  let currentChunk = '';
  let currentStart = 0;

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    if (currentChunk.length + trimmedSentence.length + 1 > maxChars) {
      if (currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          startOffset: currentStart,
          endOffset: currentStart + currentChunk.length,
        });
      }

      // If single sentence is too long, split by characters
      if (trimmedSentence.length > maxChars) {
        const sentenceChunks = splitLongSentence(trimmedSentence, maxChars);
        const sentenceStart = paragraph.indexOf(trimmedSentence);

        for (const sc of sentenceChunks) {
          chunks.push({
            text: sc,
            startOffset: sentenceStart,
            endOffset: sentenceStart + sc.length,
          });
        }
        currentChunk = '';
        currentStart = sentenceStart + trimmedSentence.length;
      } else {
        currentChunk = trimmedSentence;
        currentStart = paragraph.indexOf(trimmedSentence);
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      startOffset: currentStart,
      endOffset: currentStart + currentChunk.length,
    });
  }

  return chunks;
}

function splitLongSentence(sentence: string, maxChars: number): string[] {
  const chunks: string[] = [];
  const words = sentence.split(' ');
  let currentChunk = '';

  for (const word of words) {
    if (currentChunk.length + word.length + 1 > maxChars) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = word;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + word;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// ============================================
// Statistics
// ============================================

export function getChunkingStats(chunks: TextChunk[]): {
  totalChunks: number;
  totalTokens: number;
  avgTokensPerChunk: number;
  minTokens: number;
  maxTokens: number;
} {
  if (chunks.length === 0) {
    return {
      totalChunks: 0,
      totalTokens: 0,
      avgTokensPerChunk: 0,
      minTokens: 0,
      maxTokens: 0,
    };
  }

  const tokenCounts = chunks.map(c => c.tokenCount);
  const totalTokens = tokenCounts.reduce((a, b) => a + b, 0);

  return {
    totalChunks: chunks.length,
    totalTokens,
    avgTokensPerChunk: Math.round(totalTokens / chunks.length),
    minTokens: Math.min(...tokenCounts),
    maxTokens: Math.max(...tokenCounts),
  };
}
