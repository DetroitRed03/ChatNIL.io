'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PublicBrandCard } from '@/components/agency/PublicBrandCard';
import { Loader2, AlertCircle, ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';

interface PublicBrandProfile {
  company_name: string;
  slug: string;
  logo_url?: string;
  website?: string;
  industry: string;
  industry_display: string;
  industry_icon?: string;
  description?: string;
  tagline?: string;
  company_size?: string;
  founded_year?: number;
  location?: string;
  social_links: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  is_verified: boolean;
  brand_values: Array<{
    id: string;
    name: string;
    display_name: string;
    description?: string;
    category?: string;
    priority: number;
  }>;
  target_criteria: {
    sports: string[];
    min_followers: number;
    school_levels: string[];
    states: string[];
  } | null;
  user_id: string;
}

export default function PublicBrandPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [profile, setProfile] = useState<PublicBrandProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Check if current user is the owner
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    }
    checkUser();
  }, []);

  // Fetch brand profile
  useEffect(() => {
    async function fetchProfile() {
      if (!slug) {
        setError('Invalid brand URL');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/brands/${slug}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          if (response.status === 404) {
            setError('Brand not found');
          } else {
            setError(data.error || 'Failed to load brand profile');
          }
          return;
        }

        setProfile(data.profile);
      } catch (err) {
        console.error('Error fetching brand:', err);
        setError('Failed to load brand profile');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [slug]);

  const isOwner = currentUserId && profile?.user_id === currentUserId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading brand profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'Brand not found' ? 'Brand Not Found' : 'Error'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error === 'Brand not found'
              ? "The brand you're looking for doesn't exist or is no longer active."
              : error}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>

            {isOwner && (
              <Link
                href="/agency/profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PublicBrandCard profile={profile} isOwner={isOwner} />
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Powered by <span className="font-semibold text-primary-500">ChatNIL</span> - Connecting Athletes with Brands
          </p>
        </div>
      </div>
    </div>
  );
}
