'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AgencyOnlyGuard } from '@/components/guards/AgencyOnlyGuard';
import { ProfileForm } from '@/components/agency/ProfileForm';
import { BrandValuesEditor } from '@/components/agency/BrandValuesEditor';
import { TargetCriteriaEditor } from '@/components/agency/TargetCriteriaEditor';
import {
  Loader2,
  ArrowLeft,
  Building2,
  Heart,
  Target,
  ExternalLink,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import type { AgencyProfile } from '@/types/agency';

export default function AgencyProfilePage() {
  return (
    <AgencyOnlyGuard>
      <ProfileContent />
    </AgencyOnlyGuard>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'values' | 'criteria'>('profile');

  // Get session on mount
  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
      }
    }
    getSession();
  }, []);

  // Fetch profile
  useEffect(() => {
    async function fetchProfile() {
      if (!accessToken) return;

      try {
        const response = await fetch('/api/agency/profile?include=all', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json();

        if (data.success && data.profile) {
          setProfile(data.profile);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [accessToken]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as const, label: 'Company Profile', icon: Building2 },
    { id: 'values' as const, label: 'Brand Values', icon: Heart },
    { id: 'criteria' as const, label: 'Target Criteria', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/agency/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your company information, brand values, and targeting preferences.
              </p>
            </div>

            {profile?.slug && (
              <Link
                href={`/brands/${profile.slug}`}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                <Eye className="w-4 h-4" />
                View Public Profile
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all border-b-2 -mb-px
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'}
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && accessToken && (
          <ProfileForm
            profile={profile}
            accessToken={accessToken}
            onSave={updatedProfile => setProfile(updatedProfile)}
          />
        )}

        {activeTab === 'values' && accessToken && (
          <BrandValuesEditor
            accessToken={accessToken}
            initialValues={profile?.brand_values || []}
          />
        )}

        {activeTab === 'criteria' && accessToken && (
          <TargetCriteriaEditor
            accessToken={accessToken}
            initialCriteria={profile?.target_criteria}
          />
        )}

        {/* No Profile Warning */}
        {!profile && !isLoading && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Profile Found</h2>
            <p className="text-gray-500 mb-6">
              You haven't completed your agency onboarding yet.
            </p>
            <Link
              href="/agency/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition"
            >
              Complete Onboarding
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
