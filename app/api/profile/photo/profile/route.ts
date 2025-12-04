import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  validatePhotoUpload,
  uploadPhoto,
  updateUserPhotoUrl,
  deleteOldPhoto,
} from '@/lib/photo-upload-utils';
import { PhotoUploadErrorCode } from '@/lib/types/photo-upload';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for image processing

/**
 * POST /api/profile/photo/profile
 *
 * Upload profile photo (avatar)
 * - Max size: 2MB
 * - Formats: JPEG, PNG, WebP
 * - Dimensions: Recommended 400x400, max 2000x2000
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
    const validation = await validatePhotoUpload(file, 'profile');
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    // 4. Get current profile photo URL (for deletion after successful upload)
    const { data: currentUser } = await supabase
      .from('users')
      .select('profile_photo_url')
      .eq('id', user.id)
      .single();

    const oldPhotoPath = currentUser?.profile_photo_url;

    // 5. Upload new photo to storage
    const uploadResult = await uploadPhoto({
      file,
      userId: user.id,
      photoType: 'profile',
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
      photoType: 'profile',
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
        console.error('Failed to delete old photo:', err)
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
    console.error('Profile photo upload error:', error);
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
