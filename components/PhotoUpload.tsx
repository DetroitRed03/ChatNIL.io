'use client';

import { useState, useRef, useCallback } from 'react';
import { PhotoType, PHOTO_CONSTRAINTS } from '@/lib/types/photo-upload';

interface PhotoUploadProps {
  photoType: PhotoType;
  currentPhotoUrl?: string | null;
  onUploadSuccess?: (photoUrl: string) => void;
  onUploadError?: (error: string) => void;
}

export function PhotoUpload({
  photoType,
  currentPhotoUrl,
  onUploadSuccess,
  onUploadError,
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const constraints = PHOTO_CONSTRAINTS[photoType];
  const isProfilePhoto = photoType === 'profile';

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file type
      if (!constraints.allowedMimeTypes.includes(file.type as any)) {
        const error = `Invalid file type. Please upload ${constraints.allowedMimeTypes.join(', ')}`;
        onUploadError?.(error);
        return;
      }

      // Validate file size
      if (file.size > constraints.maxSizeBytes) {
        const error = `File too large. Maximum size is ${constraints.maxSizeMB}MB`;
        onUploadError?.(error);
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const endpoint = `/api/profile/photo/${photoType}`;

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });

        setUploadProgress(100);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();

        if (result.success && result.data?.photoUrl) {
          setPreview(result.data.photoUrl);
          onUploadSuccess?.(result.data.photoUrl);
        } else {
          throw new Error('Upload failed - no photo URL returned');
        }
      } catch (error: any) {
        console.error('Photo upload error:', error);
        onUploadError?.(error.message || 'Upload failed');
        setPreview(currentPhotoUrl || null); // Revert to previous photo
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [photoType, constraints, currentPhotoUrl, onUploadSuccess, onUploadError]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleClickUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all
          ${isDragging ? 'border-green-500 bg-green-500/10' : 'border-gray-300 dark:border-gray-700'}
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-green-500'}
          ${isProfilePhoto ? 'aspect-square max-w-sm' : 'aspect-[4/1] w-full'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        {/* Preview */}
        {preview && !isUploading && (
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt={`${photoType} preview`}
              className={`w-full h-full ${isProfilePhoto ? 'object-cover' : 'object-cover'}`}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-medium">Click or drag to replace</span>
            </div>
          </div>
        )}

        {/* Upload Prompt */}
        {!preview && !isUploading && (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isDragging ? 'Drop to upload' : 'Click or drag to upload'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {constraints.allowedMimeTypes.map((type) => type.split('/')[1].toUpperCase()).join(', ')}
              {' '}&middot;{' '}
              Max {constraints.maxSizeMB}MB
              {' '}&middot;{' '}
              {isProfilePhoto
                ? `${constraints.recommendedWidth}x${constraints.recommendedHeight} recommended`
                : `${constraints.recommendedWidth}x${constraints.recommendedHeight} recommended`}
            </p>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="w-16 h-16 mb-4">
              <svg className="animate-spin text-green-500" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Uploading{uploadProgress > 0 && ` ${uploadProgress}%`}...
            </p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={constraints.allowedMimeTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Guidelines */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p className="font-medium">Guidelines:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>
            {isProfilePhoto
              ? 'Square images work best (1:1 aspect ratio)'
              : 'Wide banner images work best (4:1 aspect ratio)'}
          </li>
          <li>Images will be automatically resized and optimized</li>
          <li>Choose high-quality images for best results</li>
          {!isProfilePhoto && (
            <li>Light text will remain legible on any background</li>
          )}
        </ul>
      </div>
    </div>
  );
}
