/**
 * Document Processing Pipeline
 *
 * Orchestrates the complete document processing workflow:
 * 1. Store file in Supabase Storage
 * 2. Extract text content
 * 3. Chunk text into segments
 * 4. Generate embeddings
 * 5. Store in database
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { extractText, cleanExtractedText, countWords } from './extractor';
import { chunkText, getChunkingStats } from './chunker';
import { generateChunkEmbeddings } from './embedder';
import { detectDocumentType } from '../ai/contract-analysis';
import type {
  ProcessingOptions,
  ProcessingResult,
  Document,
  DocumentChunk,
  DocumentSource,
  ExtractionStatus,
  DocumentType,
} from './types';

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
// Main Processing Function
// ============================================

/**
 * Process a document through the complete pipeline
 */
export async function processDocument(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  options: ProcessingOptions
): Promise<ProcessingResult> {
  const { userId, source, chatId, generateEmbeddings = true, detectDocumentType: shouldDetect = true } = options;
  const db = getSupabase();

  let documentId: string | undefined;

  try {
    // Step 1: Create document record (pending status)
    const { data: doc, error: insertError } = await db
      .from('documents')
      .insert({
        user_id: userId,
        file_name: fileName,
        file_type: mimeType,
        file_size: buffer.length,
        source,
        chat_id: chatId,
        extraction_status: 'pending',
      })
      .select()
      .single();

    if (insertError || !doc) {
      throw new Error(`Failed to create document record: ${insertError?.message}`);
    }

    documentId = doc.id;

    // Step 2: Update status to processing
    await updateDocumentStatus(db, documentId!, 'processing');

    // Step 3: Upload to storage (optional but recommended)
    const storagePath = await uploadToStorage(db, buffer, fileName, userId, documentId!);

    if (storagePath) {
      await db
        .from('documents')
        .update({ storage_path: storagePath })
        .eq('id', documentId);
    }

    // Step 4: Extract text
    console.log(`Extracting text from ${fileName}...`);
    const extractionResult = await extractText(buffer, mimeType, fileName);

    if (!extractionResult.success || !extractionResult.document) {
      await updateDocumentStatus(db, documentId!, 'failed', extractionResult.error);
      return {
        success: false,
        documentId,
        error: extractionResult.error || 'Text extraction failed',
      };
    }

    const cleanedText = cleanExtractedText(extractionResult.document.text);
    const wordCount = countWords(cleanedText);

    // Step 5: Detect document type
    let documentType: DocumentType = 'other';
    if (shouldDetect) {
      documentType = detectDocumentType(cleanedText);
    }

    // Step 6: Update document with extracted text
    await db
      .from('documents')
      .update({
        extracted_text: cleanedText,
        extraction_method: extractionResult.method,
        document_type: documentType,
        page_count: extractionResult.document.pageCount,
        word_count: wordCount,
      })
      .eq('id', documentId);

    // Step 7: Chunk the text
    console.log(`Chunking text (${wordCount} words)...`);
    const chunks = chunkText(cleanedText, {}, extractionResult.document.pages);
    const stats = getChunkingStats(chunks);
    console.log(`Created ${stats.totalChunks} chunks (avg ${stats.avgTokensPerChunk} tokens each)`);

    // Step 8: Generate embeddings
    let storedChunks: DocumentChunk[] = [];

    if (generateEmbeddings && chunks.length > 0) {
      console.log('Generating embeddings...');
      const embeddingResult = await generateChunkEmbeddings(chunks);

      if (!embeddingResult.success) {
        console.warn('Embedding generation failed:', embeddingResult.error);
        // Continue without embeddings - document is still searchable by text
      } else if (embeddingResult.embeddings) {
        // Step 9: Store chunks with embeddings
        const chunkRecords = chunks.map((chunk, i) => {
          const embedding = embeddingResult.embeddings?.find(e => e.chunkIndex === chunk.index);
          return {
            document_id: documentId,
            chunk_index: chunk.index,
            chunk_text: chunk.text,
            token_count: chunk.tokenCount,
            start_char: chunk.startChar,
            end_char: chunk.endChar,
            page_number: chunk.pageNumber,
            embedding: embedding?.embedding,
          };
        });

        const { data: insertedChunks, error: chunkError } = await db
          .from('document_chunks')
          .insert(chunkRecords)
          .select();

        if (chunkError) {
          console.warn('Failed to store chunks:', chunkError.message);
        } else {
          storedChunks = insertedChunks as DocumentChunk[];
        }

        console.log(`Used ${embeddingResult.totalTokens} embedding tokens`);
      }
    }

    // Step 10: Mark as completed
    await db
      .from('documents')
      .update({
        extraction_status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    // Fetch final document
    const { data: finalDoc } = await db
      .from('documents')
      .select()
      .eq('id', documentId)
      .single();

    console.log(`✅ Document processed successfully: ${fileName}`);

    return {
      success: true,
      documentId,
      document: finalDoc as Document,
      chunks: storedChunks,
    };

  } catch (error: any) {
    console.error('Document processing failed:', error);

    if (documentId) {
      await updateDocumentStatus(
        db,
        documentId,
        'failed',
        error.message || 'Processing failed'
      );
    }

    return {
      success: false,
      documentId,
      error: error.message || 'Document processing failed',
    };
  }
}

// ============================================
// Helper Functions
// ============================================

async function updateDocumentStatus(
  db: SupabaseClient,
  documentId: string,
  status: ExtractionStatus,
  error?: string
): Promise<void> {
  await db
    .from('documents')
    .update({
      extraction_status: status,
      extraction_error: error,
      ...(status === 'completed' ? { processed_at: new Date().toISOString() } : {}),
    })
    .eq('id', documentId);
}

async function uploadToStorage(
  db: SupabaseClient,
  buffer: Buffer,
  fileName: string,
  userId: string,
  documentId: string
): Promise<string | null> {
  try {
    const path = `${userId}/${documentId}/${fileName}`;

    const { error } = await db.storage
      .from('user-documents')
      .upload(path, buffer, {
        contentType: getMimeType(fileName),
        upsert: false,
      });

    if (error) {
      // Bucket might not exist yet - log but don't fail
      console.warn('Storage upload failed:', error.message);
      return null;
    }

    return path;
  } catch (error: any) {
    console.warn('Storage upload error:', error.message);
    return null;
  }
}

function getMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    txt: 'text/plain',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

// ============================================
// Batch Processing
// ============================================

/**
 * Process multiple documents
 */
export async function processDocuments(
  files: { buffer: Buffer; fileName: string; mimeType: string }[],
  options: ProcessingOptions
): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = [];

  for (const file of files) {
    const result = await processDocument(
      file.buffer,
      file.fileName,
      file.mimeType,
      options
    );
    results.push(result);
  }

  return results;
}

// ============================================
// Re-processing (for updates)
// ============================================

/**
 * Re-process an existing document
 */
export async function reprocessDocument(
  documentId: string,
  options?: { regenerateEmbeddings?: boolean }
): Promise<ProcessingResult> {
  const db = getSupabase();

  try {
    // Fetch existing document
    const { data: doc, error: fetchError } = await db
      .from('documents')
      .select()
      .eq('id', documentId)
      .single();

    if (fetchError || !doc) {
      throw new Error(`Document not found: ${documentId}`);
    }

    // If we have storage path, download and reprocess
    if (doc.storage_path) {
      const { data: fileData, error: downloadError } = await db.storage
        .from('user-documents')
        .download(doc.storage_path);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download file: ${downloadError?.message}`);
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());

      // Delete existing chunks
      await db
        .from('document_chunks')
        .delete()
        .eq('document_id', documentId);

      // Reprocess
      return processDocument(buffer, doc.file_name, doc.file_type, {
        userId: doc.user_id,
        source: doc.source,
        chatId: doc.chat_id,
        generateEmbeddings: options?.regenerateEmbeddings ?? true,
      });
    }

    // If we only have extracted text, just regenerate chunks/embeddings
    if (doc.extracted_text && options?.regenerateEmbeddings) {
      // Delete existing chunks
      await db
        .from('document_chunks')
        .delete()
        .eq('document_id', documentId);

      const chunks = chunkText(doc.extracted_text);
      const embeddingResult = await generateChunkEmbeddings(chunks);

      if (embeddingResult.success && embeddingResult.embeddings) {
        const chunkRecords = chunks.map((chunk, i) => {
          const embedding = embeddingResult.embeddings?.find(e => e.chunkIndex === chunk.index);
          return {
            document_id: documentId,
            chunk_index: chunk.index,
            chunk_text: chunk.text,
            token_count: chunk.tokenCount,
            start_char: chunk.startChar,
            end_char: chunk.endChar,
            page_number: chunk.pageNumber,
            embedding: embedding?.embedding,
          };
        });

        await db
          .from('document_chunks')
          .insert(chunkRecords);
      }

      return {
        success: true,
        documentId,
        document: doc as Document,
      };
    }

    throw new Error('Cannot reprocess: no storage path or extracted text');

  } catch (error: any) {
    return {
      success: false,
      documentId,
      error: error.message || 'Reprocessing failed',
    };
  }
}
