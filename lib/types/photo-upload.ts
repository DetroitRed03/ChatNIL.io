/**
 * Photo Upload Types
 *
 * Type definitions for profile and cover photo upload functionality
 */

// Photo type enum
export type PhotoType = 'profile' | 'cover';

// Request types
export interface PhotoUploadRequest {
  file: File; // From FormData
}

export interface PhotoDeleteRequest {
  type: PhotoType;
}

// Response types
export interface PhotoUploadResponse {
  success: boolean;
  data?: {
    url: string;          // Storage path
    uploadedAt: string;   // ISO timestamp
    publicUrl: string;    // Full CDN URL
  };
  error?: {
    code: PhotoUploadErrorCode;
    message: string;
    details?: any;
  };
}

export interface PhotoDeleteResponse {
  success: boolean;
  error?: {
    code: PhotoUploadErrorCode;
    message: string;
  };
}

// Validation constraints (based on social media platform research)
export const PHOTO_CONSTRAINTS = {
  profile: {
    maxSizeMB: 2,
    maxSizeBytes: 2 * 1024 * 1024,
    recommendedWidth: 400,
    recommendedHeight: 400,
    maxWidth: 2000,
    maxHeight: 2000,
    aspectRatio: 1, // Square (1:1)
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  },
  cover: {
    maxSizeMB: 5,
    maxSizeBytes: 5 * 1024 * 1024,
    recommendedWidth: 1584,
    recommendedHeight: 396,
    maxWidth: 3000,
    maxHeight: 1000,
    aspectRatio: 4, // Wide banner (4:1)
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  },
} as const;

// Error codes for photo uploads
export enum PhotoUploadErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  DATABASE_UPDATE_FAILED = 'DATABASE_UPDATE_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
}

// File signature validation (magic bytes)
export const FILE_SIGNATURES = {
  'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3'],
  'image/png': ['89504e47'],
  'image/webp': ['52494646'], // RIFF header
} as const;

// Validation result type
export interface PhotoValidationResult {
  valid: boolean;
  error?: {
    code: PhotoUploadErrorCode;
    message: string;
    details?: any;
  };
}

// Upload function parameters
export interface UploadPhotoParams {
  file: File;
  userId: string;
  photoType: PhotoType;
  supabase: any; // Supabase client
}

// Upload result type
export interface UploadPhotoResult {
  success: boolean;
  storagePath?: string;
  publicUrl?: string;
  error?: {
    code: PhotoUploadErrorCode;
    message: string;
    details?: any;
  };
}

// Database update parameters
export interface UpdateUserPhotoUrlParams {
  userId: string;
  photoType: PhotoType;
  photoUrl: string;
  supabase: any;
}

// Database update result
export interface UpdateUserPhotoUrlResult {
  success: boolean;
  error?: {
    code: PhotoUploadErrorCode;
    message: string;
    details?: any;
  };
}
