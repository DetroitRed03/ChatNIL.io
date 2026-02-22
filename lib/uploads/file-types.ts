/**
 * Centralized file type configuration for uploads.
 * Used across upload components and API routes.
 */

export const ACCEPTED_FILE_TYPES: Record<string, string[]> = {
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],

  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/heic': ['.heic'],

  // Spreadsheets
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/csv': ['.csv'],
};

export const ACCEPTED_MIME_TYPES = Object.keys(ACCEPTED_FILE_TYPES);

export const ACCEPTED_EXTENSIONS = Object.values(ACCEPTED_FILE_TYPES).flat();

/** For <input accept="..."> attribute */
export const ACCEPT_STRING = [
  ...ACCEPTED_MIME_TYPES,
  ...ACCEPTED_EXTENSIONS,
].join(',');

/** Deal analysis accepts images + documents (PDFs, Word) */
export const DEAL_ANALYSIS_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const DEAL_ANALYSIS_ACCEPT_STRING = [
  ...DEAL_ANALYSIS_MIME_TYPES,
  '.pdf', '.doc', '.docx', '.txt',
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
].join(',');

export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024,      // 10MB
  document: 25 * 1024 * 1024,   // 25MB
  default: 25 * 1024 * 1024,    // 25MB
};

export function isAcceptedFileType(file: File): boolean {
  if (ACCEPTED_MIME_TYPES.includes(file.type)) return true;
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  return ACCEPTED_EXTENSIONS.includes(extension);
}

export function getFileCategory(file: File): 'image' | 'document' | 'spreadsheet' | 'unknown' {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.includes('pdf') || file.type.includes('word') || file.type === 'text/plain') return 'document';
  if (file.type.includes('sheet') || file.type.includes('excel') || file.type.includes('csv')) return 'spreadsheet';

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'heic', 'gif'].includes(ext || '')) return 'image';
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return 'document';
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'spreadsheet';

  return 'unknown';
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!isAcceptedFileType(file)) {
    return {
      valid: false,
      error: 'File type not accepted. Please upload: PDF, Word, images, or spreadsheets.',
    };
  }

  const category = getFileCategory(file);
  const maxSize = category === 'image' ? MAX_FILE_SIZES.image : MAX_FILE_SIZES.default;

  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024);
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxMB}MB.`,
    };
  }

  return { valid: true };
}

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isDocumentMimeType(mimeType: string): boolean {
  return [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ].includes(mimeType);
}
