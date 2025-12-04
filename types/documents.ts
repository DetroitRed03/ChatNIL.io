/**
 * Documents & File Management Types
 * Document storage, attachments, and file uploads
 */

// ============================================================================
// Documents & File Management Interfaces (Migration 050)
// ============================================================================

/**
 * User Document - Represents a file uploaded by user in chat
 * Stored in Supabase Storage and tracked in chat_attachments table
 */
export interface UserDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storagePath: string;
  publicUrl?: string;
  createdAt: string;
  sessionId: string;
  sessionTitle: string;
  messageId?: string;
  userId: string;
}

/**
 * Documents grouped by chat session
 */
export interface DocumentsBySession {
  sessionId: string;
  sessionTitle: string;
  sessionUpdatedAt: string;
  documents: UserDocument[];
  totalSize: number;
}

/**
 * Document storage statistics for user
 */
export interface DocumentsStats {
  totalDocuments: number;
  totalSize: number;
  storageLimit: number;
  storageUsedPercentage: number;
  documentsByType: Record<string, number>;
  recentDocumentsCount: number;
}

/**
 * File upload request/response
 */
export interface FileUploadRequest {
  file: File;
  sessionId: string;
  messageId?: string;
}

export interface FileUploadResponse {
  success: boolean;
  document?: UserDocument;
  error?: string;
}
