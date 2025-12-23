import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  validatePhotoUpload,
  uploadPhoto,
  updateUserPhotoUrl,
  deleteOldPhoto,
} from '@/lib/photo-upload-utils';
import { PhotoUploadErrorCode } from '@/lib/types/photo-upload';

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for image processing

/**
 * POST /api/profile/photo/cover
 *
 * Upload cover photo (banner)
 * - Max size: 5MB
 * - Formats: JPEG, PNG, WebP
 * - Dimensions: Recommended 1584x396 (4:1), max 3000x1000
 * - Converts to WebP and resizes
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: PhotoUploadErrorCode.UNAUTHORIZED,
            message: 'You must be logged in to upload photos',
          },
        },
        { status: 401 }
      );
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: PhotoUploadErrorCode.INVALID_FILE_TYPE,
            message: 'No file provided',
          },
        },
        { status: 400 }
      );
    }

    // 3. Validate file (size, type, dimensions)
    const validation = await validatePhotoUpload(file, 'cover');
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    // 4. Get current cover photo URL (for deletion after successful upload)
    const { data: currentUser } = await supabase
      .from('users')
      .select('cover_photo_url')
      .eq('id', user.id)
      .single();

    const oldPhotoPath = currentUser?.cover_photo_url;

    // 5. Upload new photo to storage
    const uploadResult = await uploadPhoto({
      file,
      userId: user.id,
      photoType: 'cover',
      supabase,
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: uploadResult.error,
        },
        { status: 500 }
      );
    }

    // 6. Update users table with new URL and timestamp
    const dbUpdate = await updateUserPhotoUrl({
      userId: user.id,
      photoType: 'cover',
      photoUrl: uploadResult.publicUrl!,
      supabase,
    });

    if (!dbUpdate.success) {
      // Rollback: delete uploaded file
      await deleteOldPhoto(uploadResult.storagePath!, supabase);

      return NextResponse.json(
        {
          success: false,
          error: dbUpdate.error,
        },
        { status: 500 }
      );
    }

    // 7. Delete old photo (if exists) - fire and forget
    if (oldPhotoPath) {
      deleteOldPhoto(oldPhotoPath, supabase).catch((err) =>
        console.error('Failed to delete old cover photo:', err)
      );
    }

    // 8. Return success
    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.storagePath!,
        publicUrl: uploadResult.publicUrl!,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Cover photo upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: PhotoUploadErrorCode.UPLOAD_FAILED,
          message: 'An unexpected error occurred during upload',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
