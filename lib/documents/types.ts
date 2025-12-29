/**
 * Document Processing Types
 *
 * Type definitions for the document analysis system.
 */

// ============================================
// Document Status & Classification
// ============================================

export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ExtractionMethod = 'pdf-parse' | 'mammoth' | 'tesseract' | 'direct';

export type DocumentType = 'contract' | 'amendment' | 'endorsement' | 'agreement' | 'letter' | 'other';

export type DocumentSource = 'library' | 'chat_attachment';

// ============================================
// Document Models (matching database schema)
// ============================================

export interface Document {
  id: string;
  user_id: string;

  // File metadata
  file_name: string;
  file_type: string; // MIME type
  file_size: number;
  storage_path?: string;

  // Extraction results
  extracted_text?: string;
  extraction_status: ExtractionStatus;
  extraction_method?: ExtractionMethod;
  extraction_error?: string;

  // Classification
  document_type: DocumentType;
  source: DocumentSource;
  chat_id?: string;

  // Statistics
  page_count?: number;
  word_count?: number;

  // Timestamps
  created_at: string;
  processed_at?: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;

  // Chunk content
  chunk_index: number;
  chunk_text: string;
  token_count?: number;

  // Position in original
  start_char?: number;
  end_char?: number;
  page_number?: number;

  // Embedding (stored as array in JavaScript)
  embedding?: number[];

  created_at: string;
}

export interface DocumentAnalysisResult {
  id: string;
  document_id: string;
  analysis_type: string;
  analysis_result: Record<string, any>;
  model_used?: string;
  created_at: string;
}

// ============================================
// Extraction Types
// ============================================

export interface ExtractedDocument {
  text: string;
  pageCount?: number;
  metadata?: {
    title?: string;
    author?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
  pages?: ExtractedPage[];
  method: ExtractionMethod;
}

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  startChar: number;
  endChar: number;
}

export interface ExtractionResult {
  success: boolean;
  document?: ExtractedDocument;
  error?: string;
  method?: ExtractionMethod;
}

// ============================================
// Chunking Types
// ============================================

export interface ChunkingOptions {
  maxTokens?: number; // Default: 500
  overlapTokens?: number; // Default: 50
  preserveParagraphs?: boolean; // Default: true
}

export interface TextChunk {
  index: number;
  text: string;
  tokenCount: number;
  startChar: number;
  endChar: number;
  pageNumber?: number;
}

// ============================================
// Processing Types
// ============================================

export interface ProcessingOptions {
  userId: string;
  source: DocumentSource;
  chatId?: string;
  generateEmbeddings?: boolean; // Default: true
  detectDocumentType?: boolean; // Default: true
}

export interface ProcessingResult {
  success: boolean;
  documentId?: string;
  document?: Document;
  chunks?: DocumentChunk[];
  error?: string;
}

// ============================================
// Search & Retrieval Types
// ============================================

export interface DocumentSearchOptions {
  userId: string;
  query: string;
  maxResults?: number; // Default: 5
  minSimilarity?: number; // Default: 0.7
  documentTypes?: DocumentType[];
  documentIds?: string[]; // Limit to specific documents
}

export interface DocumentSearchResult {
  chunkId: string;
  documentId: string;
  fileName: string;
  documentType: DocumentType;
  chunkText: string;
  chunkIndex: number;
  pageNumber?: number;
  similarity: number;
}

// ============================================
// Contract Analysis Types
// ============================================

export interface ContractAnalysis {
  isContract: boolean;
  confidence: number;
  contractType?: string;
  parties?: string[];
  keyTerms?: ContractTerm[];
  redFlags?: RedFlag[];
  summary?: string;
}

export interface ContractTerm {
  term: string;
  value?: string;
  section?: string;
  importance: 'high' | 'medium' | 'low';
}

export interface RedFlag {
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  excerpt?: string;
  recommendation?: string;
}

// ============================================
// API Request/Response Types
// ============================================

export interface UploadDocumentRequest {
  file: File | Buffer;
  fileName: string;
  fileType: string;
  source: DocumentSource;
  chatId?: string;
}

export interface UploadDocumentResponse {
  success: boolean;
  documentId?: string;
  message?: string;
  error?: string;
}

export interface GetDocumentResponse {
  success: boolean;
  document?: Document;
  chunks?: DocumentChunk[];
  analysis?: DocumentAnalysisResult[];
  error?: string;
}

export interface AnalyzeDocumentRequest {
  documentId: string;
  analysisType: 'contract_review' | 'red_flags' | 'summary' | 'key_terms';
}

export interface AnalyzeDocumentResponse {
  success: boolean;
  analysis?: DocumentAnalysisResult;
  error?: string;
}

// ============================================
// Helper Types
// ============================================

export interface SupportedFileType {
  mimeType: string;
  extension: string;
  method: ExtractionMethod;
}

export const SUPPORTED_FILE_TYPES: SupportedFileType[] = [
  // PDF
  { mimeType: 'application/pdf', extension: '.pdf', method: 'pdf-parse' },

  // Word Documents
  { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: '.docx', method: 'mammoth' },
  { mimeType: 'application/msword', extension: '.doc', method: 'mammoth' },

  // Images (OCR)
  { mimeType: 'image/jpeg', extension: '.jpg', method: 'tesseract' },
  { mimeType: 'image/png', extension: '.png', method: 'tesseract' },
  { mimeType: 'image/webp', extension: '.webp', method: 'tesseract' },
  { mimeType: 'image/tiff', extension: '.tiff', method: 'tesseract' },

  // Plain text
  { mimeType: 'text/plain', extension: '.txt', method: 'direct' },
];

export function isSupportedFileType(mimeType: string): boolean {
  return SUPPORTED_FILE_TYPES.some(ft => ft.mimeType === mimeType);
}

export function getExtractionMethod(mimeType: string): ExtractionMethod | null {
  const fileType = SUPPORTED_FILE_TYPES.find(ft => ft.mimeType === mimeType);
  return fileType?.method || null;
}
