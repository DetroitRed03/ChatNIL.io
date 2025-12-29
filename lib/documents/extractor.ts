/**
 * Document Text Extraction
 *
 * Extracts text from PDFs, Word documents, and images (via OCR).
 */

import type {
  ExtractedDocument,
  ExtractedPage,
  ExtractionResult,
  ExtractionMethod
} from './types';

// ============================================
// Main Extraction Function
// ============================================

/**
 * Extract text from a document buffer based on MIME type
 */
export async function extractText(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): Promise<ExtractionResult> {
  try {
    // PDF
    if (mimeType === 'application/pdf') {
      return await extractFromPDF(buffer);
    }

    // Word Documents
    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      return await extractFromWord(buffer);
    }

    // Images (OCR)
    if (mimeType.startsWith('image/')) {
      return await extractFromImage(buffer);
    }

    // Plain text
    if (mimeType === 'text/plain') {
      return await extractFromText(buffer);
    }

    return {
      success: false,
      error: `Unsupported file type: ${mimeType}`,
    };
  } catch (error: any) {
    console.error('Text extraction failed:', error);
    return {
      success: false,
      error: error.message || 'Text extraction failed',
    };
  }
}

// ============================================
// PDF Extraction
// ============================================

async function extractFromPDF(buffer: Buffer): Promise<ExtractionResult> {
  try {
    // Dynamic import to avoid SSR issues
    // @ts-ignore - pdf-parse has inconsistent module exports
    const pdfParse = (await import('pdf-parse')).default;

    const data = await pdfParse(buffer, {
      // Options for better text extraction
      max: 0, // No page limit
    });

    // Try to extract page-by-page text
    const pages: ExtractedPage[] = [];
    let currentPos = 0;

    // pdf-parse gives us combined text, try to split by page markers
    const pageTexts = data.text.split(/\f/); // Form feed character often marks pages

    for (let i = 0; i < pageTexts.length; i++) {
      const pageText = pageTexts[i].trim();
      if (pageText) {
        pages.push({
          pageNumber: i + 1,
          text: pageText,
          startChar: currentPos,
          endChar: currentPos + pageText.length,
        });
        currentPos += pageText.length + 1;
      }
    }

    const document: ExtractedDocument = {
      text: data.text,
      pageCount: data.numpages,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : undefined,
        modificationDate: data.info?.ModDate ? new Date(data.info.ModDate) : undefined,
      },
      pages: pages.length > 0 ? pages : undefined,
      method: 'pdf-parse',
    };

    return {
      success: true,
      document,
      method: 'pdf-parse',
    };
  } catch (error: any) {
    console.error('PDF extraction failed:', error);
    return {
      success: false,
      error: `PDF extraction failed: ${error.message}`,
      method: 'pdf-parse',
    };
  }
}

// ============================================
// Word Document Extraction
// ============================================

async function extractFromWord(buffer: Buffer): Promise<ExtractionResult> {
  try {
    // Dynamic import
    const mammoth = await import('mammoth');

    // Extract as plain text (better for analysis)
    const result = await mammoth.extractRawText({ buffer });

    if (result.messages.length > 0) {
      console.log('Mammoth warnings:', result.messages);
    }

    const document: ExtractedDocument = {
      text: result.value,
      method: 'mammoth',
    };

    return {
      success: true,
      document,
      method: 'mammoth',
    };
  } catch (error: any) {
    console.error('Word extraction failed:', error);
    return {
      success: false,
      error: `Word document extraction failed: ${error.message}`,
      method: 'mammoth',
    };
  }
}

// ============================================
// Image OCR Extraction
// ============================================

async function extractFromImage(buffer: Buffer): Promise<ExtractionResult> {
  try {
    // Dynamic import for tesseract.js
    const Tesseract = await import('tesseract.js');

    // Create worker
    const worker = await Tesseract.createWorker('eng');

    try {
      // Recognize text
      const { data } = await worker.recognize(buffer);

      const document: ExtractedDocument = {
        text: data.text,
        pageCount: 1,
        pages: [{
          pageNumber: 1,
          text: data.text,
          startChar: 0,
          endChar: data.text.length,
        }],
        method: 'tesseract',
      };

      return {
        success: true,
        document,
        method: 'tesseract',
      };
    } finally {
      await worker.terminate();
    }
  } catch (error: any) {
    console.error('OCR extraction failed:', error);
    return {
      success: false,
      error: `OCR extraction failed: ${error.message}`,
      method: 'tesseract',
    };
  }
}

// ============================================
// Plain Text Extraction
// ============================================

async function extractFromText(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const text = buffer.toString('utf-8');

    const document: ExtractedDocument = {
      text,
      pageCount: 1,
      method: 'direct',
    };

    return {
      success: true,
      document,
      method: 'direct',
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Text extraction failed: ${error.message}`,
      method: 'direct',
    };
  }
}

// ============================================
// Text Cleaning Utilities
// ============================================

/**
 * Clean and normalize extracted text
 */
export function cleanExtractedText(text: string): string {
  return text
    // Normalize whitespace
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive blank lines
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace from lines
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Remove null characters and other control chars (except newline/tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Trim overall
    .trim();
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Estimate token count (rough approximation)
 * GPT models use ~4 characters per token on average
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
