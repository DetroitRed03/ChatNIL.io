'use client';

import { AthletePublicProfile } from '@/types';
import { MapPin, Users, TrendingUp, DollarSign, Instagram, Music, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

interface AthleteCardProps {
  athlete: AthletePublicProfile;
}

export function AthleteCard({ athlete }: AthleteCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return `$${(num / 1000).toFixed(0)}K`;
  };

  // Use username (preferred) or user_id as fallback for profile URL
  const profileIdentifier = (athlete as any).username || athlete.user_id;

  return (
    <Link href={`/athletes/${profileIdentifier}`}>
      <div className="group bg-white rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer">
        {/* Header with availability badge */}
        <div className="relative h-32 bg-gradient-to-br from-primary-500 to-primary-600">
          {athlete.is_available_for_partnerships && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                Available
              </span>
            </div>
          )}

          {athlete.is_verified && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Profile section */}
        <div className="p-6">
          {/* Name and sport */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {athlete.display_name}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <span className="text-sm font-medium">{athlete.sport}</span>
              {athlete.position && (
                <>
                  <span className="text-gray-400">-</span>
                  <span className="text-sm">{athlete.position}</span>
                </>
              )}
            </div>
          </div>

          {/* School info */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <MapPin className="w-4 h-4" />
            <span>{athlete.school_name}</span>
            {athlete.state && (
              <>
                <span className="text-gray-400">-</span>
                <span>{athlete.state}</span>
              </>
            )}
          </div>

          {/* Bio */}
          {athlete.bio && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {athlete.bio}
            </p>
          )}

          {/* Social media stats */}
          <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Instagram className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Instagram</div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatNumber(athlete.instagram_followers)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500">TikTok</div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatNumber(athlete.tiktok_followers)}
                </div>
              </div>
            </div>

            {athlete.twitter_followers > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Twitter className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Twitter</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatNumber(athlete.twitter_followers)}
                  </div>
                </div>
              </div>
            )}

            {athlete.youtube_subscribers > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <Youtube className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">YouTube</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatNumber(athlete.youtube_subscribers)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-3 h-3 text-gray-500" />
              </div>
              <div className="text-lg font-bold text-gray-900">
                {formatNumber(athlete.total_followers)}
              </div>
              <div className="text-xs text-gray-500">Total Reach</div>
            </div>

            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-gray-500" />
              </div>
              <div className="text-lg font-bold text-gray-900">
                {athlete.avg_engagement_rate?.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Engagement</div>
            </div>

            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-3 h-3 text-gray-500" />
              </div>
              <div className="text-lg font-bold text-gray-900">
                {athlete.estimated_fmv_min && athlete.estimated_fmv_max
                  ? `${formatCurrency(athlete.estimated_fmv_min)}`
                  : 'N/A'}
              </div>
              <div className="text-xs text-gray-500">Est. Value</div>
            </div>
          </div>

          {/* Content categories */}
          {athlete.content_categories && athlete.content_categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {athlete.content_categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200"
                >
                  {category}
                </span>
              ))}
              {athlete.content_categories.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                  +{athlete.content_categories.length - 3}
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          <button className="w-full mt-2 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors group-hover:shadow-lg">
            View Profile
          </button>
        </div>
      </div>
    </Link>
  );
}
