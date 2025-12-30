'use client';

import {
  Building2,
  Globe,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  Linkedin,
  Instagram,
  Twitter,
  BadgeCheck,
  Heart,
  Target,
  GraduationCap,
} from 'lucide-react';
import { COMPANY_SIZE_LABELS, type CompanySize } from '@/types/agency';
import { SCHOOL_LEVELS } from '@/lib/agency/target-criteria-service';

interface BrandValue {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  category?: string;
  priority: number;
}

interface TargetCriteria {
  sports: string[];
  min_followers: number;
  school_levels: string[];
  states: string[];
}

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
  company_size?: CompanySize;
  founded_year?: number;
  location?: string;
  social_links: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  is_verified: boolean;
  brand_values: BrandValue[];
  target_criteria: TargetCriteria | null;
}

interface PublicBrandCardProps {
  profile: PublicBrandProfile;
  isOwner?: boolean;
}

export function PublicBrandCard({ profile, isOwner }: PublicBrandCardProps) {
  const getSchoolLevelLabel = (value: string) => {
    return SCHOOL_LEVELS.find(l => l.value === value)?.label || value;
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M+`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K+`;
    return count.toString();
  };

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-32" />

        <div className="px-6 pb-6">
          {/* Logo & Title */}
          <div className="flex items-end gap-4 -mt-12 mb-4">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
              {profile.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt={profile.company_name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Building2 className="w-10 h-10 text-gray-400" />
              )}
            </div>

            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{profile.company_name}</h1>
                {profile.is_verified && (
                  <BadgeCheck className="w-6 h-6 text-primary-500" />
                )}
              </div>
              {profile.tagline && (
                <p className="text-gray-600 mt-1">{profile.tagline}</p>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
              <Building2 className="w-4 h-4" />
              {profile.industry_display}
            </span>

            {profile.company_size && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                <Users className="w-4 h-4" />
                {COMPANY_SIZE_LABELS[profile.company_size]}
              </span>
            )}

            {profile.location && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </span>
            )}

            {profile.founded_year && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                <Calendar className="w-4 h-4" />
                Founded {profile.founded_year}
              </span>
            )}
          </div>

          {/* Description */}
          {profile.description && (
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{profile.description}</p>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
              >
                <Globe className="w-4 h-4" />
                Visit Website
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {profile.social_links.linkedin && (
              <a
                href={profile.social_links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:opacity-90 transition"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            )}

            {profile.social_links.instagram && (
              <a
                href={profile.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white rounded-lg hover:opacity-90 transition"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
            )}

            {profile.social_links.twitter && (
              <a
                href={profile.social_links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition"
              >
                <Twitter className="w-4 h-4" />
                X / Twitter
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Brand Values */}
      {profile.brand_values.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-pink-100 text-pink-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Brand Values</h2>
          </div>

          <p className="text-gray-600 mb-4">
            These are the core values that define our brand and guide our partnerships.
          </p>

          <div className="flex flex-wrap gap-2">
            {profile.brand_values
              .sort((a, b) => a.priority - b.priority)
              .map((value, idx) => (
                <div
                  key={value.id}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-xl"
                >
                  <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-primary-700">{value.display_name}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* What We're Looking For */}
      {profile.target_criteria && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">What We're Looking For</h2>
          </div>

          <p className="text-gray-600 mb-6">
            We partner with athletes who match our target audience and brand alignment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sports */}
            {profile.target_criteria.sports.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Sports of Interest
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.target_criteria.sports.map(sport => (
                    <span
                      key={sport}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* School Levels */}
            {profile.target_criteria.school_levels.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  School Levels
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.target_criteria.school_levels.map(level => (
                    <span
                      key={level}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {getSchoolLevelLabel(level)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Minimum Followers */}
            {profile.target_criteria.min_followers > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Minimum Following
                </h3>
                <span className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium">
                  {formatFollowers(profile.target_criteria.min_followers)} followers
                </span>
              </div>
            )}

            {/* Target States */}
            {profile.target_criteria.states.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Target Regions
                </h3>
                <div className="flex flex-wrap gap-1">
                  {profile.target_criteria.states.slice(0, 10).map(state => (
                    <span
                      key={state}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {state}
                    </span>
                  ))}
                  {profile.target_criteria.states.length > 10 && (
                    <span className="px-2 py-0.5 text-gray-500 text-xs">
                      +{profile.target_criteria.states.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
