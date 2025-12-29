/**
 * Document Analysis Module
 *
 * Exports all document processing functionality for the ChatNIL application.
 */

// Types
export * from './types';

// Core functionality
export { extractText, cleanExtractedText, countWords, estimateTokens } from './extractor';
export { chunkText, getChunkingStats } from './chunker';
export { generateEmbedding, generateChunkEmbeddings, generateQueryEmbedding, cosineSimilarity } from './embedder';

// Processing pipeline
export { processDocument, processDocuments, reprocessDocument } from './processor';

// Retrieval
export {
  searchDocuments,
  retrieveDocumentContext,
  formatDocumentContext,
  getUserDocuments,
  getDocument,
  deleteDocument
} from './retriever';
