'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageUpdate: (imageUrl: string) => void;
  size?: 'small' | 'medium' | 'large';
}

export default function ProfileImageUpload({
  currentImageUrl,
  onImageUpdate,
  size = 'medium'
}: ProfileImageUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const iconSizes = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  };

  const uploadImage = async (file: File) => {
    if (!user) return;

    try {
      setUploading(true);

      // Validate file
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size must be less than 5MB');
        return;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update user profile with new image URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Call the callback to update the UI
      onImageUpdate(publicUrl);

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.first_name || user.firstName || '';
    const lastName = user.last_name || user.lastName || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return 'U';
  };

  return (
    <div className="relative group">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        className={`${sizeClasses[size]} relative overflow-hidden rounded-full bg-orange-500 flex items-center justify-center cursor-pointer transition-all duration-200 ${
          dragOver ? 'ring-4 ring-orange-300 ring-opacity-50' : ''
        } ${uploading ? 'opacity-70' : 'group-hover:opacity-90'}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={`text-white font-bold ${size === 'small' ? 'text-sm' : size === 'medium' ? 'text-lg' : 'text-2xl'}`}>
            {getUserInitials()}
          </span>
        )}

        {/* Upload overlay */}
        <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200 ${
          uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          ) : (
            <Camera className={`${iconSizes[size]} text-white`} />
          )}
        </div>
      </div>

      {/* Upload indicator */}
      {uploading && (
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
          <Upload className="h-3 w-3 text-white animate-pulse" />
        </div>
      )}

      {/* Success indicator */}
      {!uploading && currentImageUrl && (
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}

      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 bg-orange-500 bg-opacity-80 rounded-full flex items-center justify-center">
          <Upload className={`${iconSizes[size]} text-white animate-bounce`} />
        </div>
      )}
    </div>
  );
}