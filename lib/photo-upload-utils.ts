/**
 * Photo Upload Utilities
 *
 * Server-side utilities for validating, processing, and uploading profile/cover photos
 */

import sharp from 'sharp';
import {
  PhotoType,
  PHOTO_CONSTRAINTS,
  FILE_SIGNATURES,
  PhotoUploadErrorCode,
  PhotoValidationResult,
  UploadPhotoParams,
  UploadPhotoResult,
  UpdateUserPhotoUrlParams,
  UpdateUserPhotoUrlResult,
} from './types/photo-upload';

/**
 * Validate uploaded photo (file size, type, dimensions, signature)
 */
export async function validatePhotoUpload(
  file: File,
  type: PhotoType
): Promise<PhotoValidationResult> {
  const constraints = PHOTO_CONSTRAINTS[type];

  // 1. Check file size
  if (file.size > constraints.maxSizeBytes) {
    return {
      valid: false,
      error: {
        code: PhotoUploadErrorCode.FILE_TOO_LARGE,
        message: `File size exceeds ${constraints.maxSizeMB}MB limit`,
        details: {
          maxSize: constraints.maxSizeMB,
          actualSize: (file.size / 1024 / 1024).toFixed(2),
        },
      },
    };
  }

  // 2. Check MIME type
  if (!constraints.allowedMimeTypes.includes(file.type as any)) {
    return {
      valid: false,
      error: {
        code: PhotoUploadErrorCode.INVALID_FILE_TYPE,
        message: `Invalid file type. Allowed: ${constraints.allowedMimeTypes.join(', ')}`,
        details: { actualType: file.type },
      },
    };
  }

  // 3. Validate file signature (first 4 bytes - prevents extension spoofing)
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const signature = Array.from(bytes.slice(0, 4))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const validSignatures = FILE_SIGNATURES[file.type as keyof typeof FILE_SIGNATURES];
  if (!validSignatures?.some((sig) => signature.startsWith(sig))) {
    return {
      valid: false,
      error: {
        code: PhotoUploadErrorCode.INVALID_FILE_TYPE,
        message: 'File content does not match declared type',
        details: { signature },
      },
    };
  }

  // 4. Validate dimensions using Sharp
  try {
    const metadata = await sharp(arrayBuffer).metadata();

    if (!metadata.width || !metadata.height) {
      return {
        valid: false,
        error: {
          code: PhotoUploadErrorCode.INVALID_DIMENSIONS,
          message: 'Could not read image dimensions',
        },
      };
    }

    if (metadata.width > constraints.maxWidth || metadata.height > constraints.maxHeight) {
      return {
        valid: false,
        error: {
          code: PhotoUploadErrorCode.INVALID_DIMENSIONS,
          message: `Image dimensions too large. Max: ${constraints.maxWidth}x${constraints.maxHeight}`,
          details: { width: metadata.width, height: metadata.height },
        },
      };
    }

    // Optional: Warn about aspect ratio (not an error, just logged)
    const aspectRatio = metadata.width / metadata.height;
    const expectedRatio = constraints.aspectRatio;
    if (Math.abs(aspectRatio - expectedRatio) > 0.5) {
      console.warn(
        `Image aspect ratio (${aspectRatio.toFixed(2)}) differs from recommended (${expectedRatio})`
      );
    }
  } catch (err) {
    return {
      valid: false,
      error: {
        code: PhotoUploadErrorCode.INVALID_FILE_TYPE,
        message: 'Could not process image file',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
    };
  }

  return { valid: true };
}

/**
 * Process and upload photo to Supabase Storage
 * - Resizes to optimal dimensions
 * - Converts to WebP for better compression
 * - Strips EXIF data for privacy
 * - Uploads to user-scoped folder
 */
export async function uploadPhoto({
  file,
  userId,
  photoType,
  supabase,
}: UploadPhotoParams): Promise<UploadPhotoResult> {
  try {
    const constraints = PHOTO_CONSTRAINTS[photoType];
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Process image with Sharp
    const processedImage = sharp(buffer)
      .resize({
        width: constraints.recommendedWidth,
        height: constraints.recommendedHeight,
        fit: 'cover', // Crop to exact dimensions
        position: 'center', // Center crop
      })
      .webp({ quality: 85 }) // Convert to WebP for 25-35% size reduction
      .withMetadata({ exif: {} }); // Strip EXIF but keep orientation

    const processedBuffer = await processedImage.toBuffer();

    // 2. Generate storage path
    const fileName = photoType === 'profile' ? 'avatar.webp' : 'cover.webp';
    const storagePath = `${userId}/${fileName}`;

    // 3. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('athlete-profile-media')
      .upload(storagePath, processedBuffer, {
        contentType: 'image/webp',
        upsert: true, // Replace existing file
        cacheControl: '3600', // Cache for 1 hour
      });

    if (error) {
      console.error('Storage upload error:', error);
      return {
        success: false,
        error: {
          code: PhotoUploadErrorCode.UPLOAD_FAILED,
          message: 'Failed to upload photo to storage',
          details: error.message,
        },
      };
    }

    // 4. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('athlete-profile-media').getPublicUrl(storagePath);

    return {
      success: true,
      storagePath,
      publicUrl,
    };
  } catch (err) {
    console.error('Photo processing error:', err);
    return {
      success: false,
      error: {
        code: PhotoUploadErrorCode.PROCESSING_FAILED,
        message: 'Failed to process image',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
    };
  }
}

/**
 * Update user record with photo URL and timestamp
 */
export async function updateUserPhotoUrl({
  userId,
  photoType,
  photoUrl,
  supabase,
}: UpdateUserPhotoUrlParams): Promise<UpdateUserPhotoUrlResult> {
  const urlField = photoType === 'profile' ? 'profile_photo_url' : 'cover_photo_url';
  const timestampField =
    photoType === 'profile' ? 'profile_photo_uploaded_at' : 'cover_photo_uploaded_at';

  const { error } = await supabase
    .from('users')
    .update({
      [urlField]: photoUrl,
      [timestampField]: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Database update error:', error);
    return {
      success: false,
      error: {
        code: PhotoUploadErrorCode.DATABASE_UPDATE_FAILED,
        message: 'Failed to update profile with photo URL',
        details: error.message,
      },
    };
  }

  return { success: true };
}

/**
 * Delete photo from storage (cleanup old photos)
 */
export async function deleteOldPhoto(storagePath: string, supabase: any): Promise<void> {
  // Extract path from full URL if needed
  const path = storagePath.includes('athlete-profile-media')
    ? storagePath.split('athlete-profile-media/')[1]
    : storagePath;

  const { error } = await supabase.storage.from('athlete-profile-media').remove([path]);

  if (error) {
    console.error('Failed to delete old photo:', error);
    // Don't throw - this is non-critical cleanup
  }
}

/**
 * Helper: Format height in inches to feet'inches" display
 */
export function formatHeight(inches: number | null | undefined): string {
  if (!inches) return '';
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

/**
 * Helper: Format weight for display
 */
export function formatWeight(lbs: number | null | undefined): string {
  if (!lbs) return '';
  return `${lbs} lbs`;
}

/**
 * Helper: Get cache-busted photo URL
 */
export function getCacheBustedPhotoUrl(
  photoUrl: string | null | undefined,
  uploadedAt: string | null | undefined
): string | null {
  if (!photoUrl) return null;

  // If no timestamp, return URL as-is
  if (!uploadedAt) return photoUrl;

  // Append timestamp as query param for cache busting
  const timestamp = new Date(uploadedAt).getTime();
  return `${photoUrl}?v=${timestamp}`;
}
