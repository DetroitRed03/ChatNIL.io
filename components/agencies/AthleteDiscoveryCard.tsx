'use client';

import { AthletePublicProfile } from '@/types';
import { TiltCard } from '@/components/ui/TiltCard';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Instagram,
  Music,
  Twitter,
  Youtube,
  Users,
  TrendingUp,
  DollarSign,
  MapPin,
  Bookmark,
  MessageCircle,
  Eye,
  CheckCircle2,
  Trophy
} from 'lucide-react';

interface AthleteDiscoveryCardProps {
  athlete: AthletePublicProfile;
  matchScore?: number;
  matchTier?: 'excellent' | 'good' | 'potential';
  onSave?: () => void;
  onMessage?: () => void;
  isSaved?: boolean;
}

export function AthleteDiscoveryCard({
  athlete,
  matchScore,
  matchTier,
  onSave,
  onMessage,
  isSaved = false
}: AthleteDiscoveryCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const formatNumber = (num?: number) => {
    if (!num && num !== 0) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num?: number) => {
    if (!num) return 'N/A';
    return `$${(num / 1000).toFixed(0)}K`;
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTierConfig = (tier?: string) => {
    switch (tier) {
      case 'excellent':
        return { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-300', emoji: '🌟' };
      case 'good':
        return { bg: 'bg-green-500', text: 'text-white', border: 'border-green-300', emoji: '✅' };
      case 'potential':
        return { bg: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-300', emoji: '💡' };
      default:
        return null;
    }
  };

  const tierConfig = matchTier ? getTierConfig(matchTier) : null;

  const handleCardClick = () => {
    // Navigate to public athlete profile page using username (preferred) or UUID fallback
    const profileIdentifier = athlete.username || athlete.user_id || (athlete as any).user_id;

    if (profileIdentifier) {
      router.push(`/athletes/${profileIdentifier}`);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.();
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMessage?.();
  };

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <TiltCard intensity={15} className="h-full">
        <div className="p-6 flex flex-col h-full">
          {/* Header with gradient and profile photo */}
          <div className="relative -mx-6 -mt-6 mb-4 h-32 bg-gradient-to-br from-primary-500 via-primary-600 to-orange-600 overflow-hidden">
            {/* Match score badge */}
            {matchScore !== undefined && tierConfig && (
              <div className="absolute top-3 left-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${tierConfig.bg} ${tierConfig.text} text-sm font-bold shadow-lg`}>
                  <span>{tierConfig.emoji}</span>
                  <span>{matchScore}</span>
                </div>
              </div>
            )}

            {/* Availability badge */}
            {athlete.is_available_for_partnerships && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-medium shadow-lg">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Available</span>
                </div>
              </div>
            )}

            {/* Profile photo or initials */}
            <div className="absolute -bottom-8 left-6">
              <div className="w-16 h-16 rounded-full border-4 border-white bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-xl">
                {((athlete as any).profile_image_url || (athlete as any).profile_photo_url) ? (
                  <img
                    src={(athlete as any).profile_image_url || (athlete as any).profile_photo_url}
                    alt={athlete.display_name || 'Athlete'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(athlete.display_name || (athlete as any).full_name)
                )}
              </div>
            </div>
          </div>

          {/* Athlete info */}
          <div className="mt-6 mb-4">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
              {athlete.display_name || (athlete as any).full_name || 'Athlete'}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <span className="font-medium">{athlete.sport}</span>
              {athlete.position && (
                <>
                  <span>•</span>
                  <span>{athlete.position}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{athlete.school_name || (athlete as any).school || 'School'}</span>
              {athlete.state && <span>• {athlete.state}</span>}
            </div>
          </div>

          {/* Social media stats - only show if data exists */}
          {(athlete.instagram_followers || athlete.tiktok_followers || athlete.twitter_followers || athlete.youtube_subscribers) && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {athlete.instagram_followers && (
                <div className="flex items-center gap-2 bg-gradient-to-br from-purple-50 to-pink-50 p-2.5 rounded-lg border border-purple-100">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate">
                      {formatNumber(athlete.instagram_followers)}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {athlete.instagram_engagement_rate ? `${athlete.instagram_engagement_rate.toFixed(1)}%` : 'Instagram'}
                    </div>
                  </div>
                </div>
              )}

              {athlete.tiktok_followers && (
                <div className="flex items-center gap-2 bg-gray-900 p-2.5 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <Music className="w-3.5 h-3.5 text-gray-900" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {formatNumber(athlete.tiktok_followers)}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {athlete.tiktok_engagement_rate ? `${athlete.tiktok_engagement_rate.toFixed(1)}%` : 'TikTok'}
                    </div>
                  </div>
                </div>
              )}

              {athlete.twitter_followers && athlete.twitter_followers > 0 && (
                <div className="flex items-center gap-2 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Twitter className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate">
                      {formatNumber(athlete.twitter_followers)}
                    </div>
                    <div className="text-[10px] text-gray-500">Twitter</div>
                  </div>
                </div>
              )}

              {athlete.youtube_subscribers && athlete.youtube_subscribers > 0 && (
                <div className="flex items-center gap-2 bg-red-50 p-2.5 rounded-lg border border-red-100">
                  <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <Youtube className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate">
                      {formatNumber(athlete.youtube_subscribers)}
                    </div>
                    <div className="text-[10px] text-gray-500">YouTube</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Key metrics - adapted for basic schema */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {/* Show sport/position info */}
            <div className="text-center p-2.5 bg-gray-50 rounded-lg border border-gray-100 col-span-1">
              <Trophy className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <div className="text-xs font-bold text-gray-900 truncate">
                {(athlete as any).year || (athlete as any).graduation_year || 'N/A'}
              </div>
              <div className="text-[10px] text-gray-500">Class Year</div>
            </div>

            {/* Show FMV if available - prioritize actual FMV score */}
            <div className="text-center p-2.5 bg-gray-50 rounded-lg border border-gray-100 col-span-1">
              <DollarSign className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <div className="text-xs font-bold text-gray-900">
                {(athlete as any).fmv_score ? `$${((athlete as any).fmv_score / 100).toFixed(0)}K` :
                 (athlete as any).estimated_fmv ? formatCurrency((athlete as any).estimated_fmv) :
                 (athlete.estimated_fmv_min && athlete.estimated_fmv_max ? formatCurrency(athlete.estimated_fmv_min) :
                 athlete.total_followers ? formatNumber(athlete.total_followers) : 'N/A')}
              </div>
              <div className="text-[10px] text-gray-500">
                {(athlete as any).fmv_tier ? (athlete as any).fmv_tier.toUpperCase() :
                 ((athlete as any).fmv_score || (athlete as any).estimated_fmv || (athlete.estimated_fmv_min && athlete.estimated_fmv_max)) ? 'FMV Score' :
                 athlete.total_followers ? 'Total Reach' : 'Value'}
              </div>
            </div>
          </div>

          {/* Content categories */}
          {athlete.content_categories && athlete.content_categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {athlete.content_categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary-50 text-primary-700 border border-primary-200"
                >
                  {category}
                </span>
              ))}
              {athlete.content_categories.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600">
                  +{athlete.content_categories.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Spacer to push buttons to bottom */}
          <div className="flex-grow" />

          {/* Action buttons - visible on hover */}
          <div className={`grid grid-cols-3 gap-2 transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <button
              onClick={handleCardClick}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors col-span-3"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Profile</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                isSaved
                  ? 'bg-primary-100 hover:bg-primary-200 text-primary-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>

            <button
              onClick={handleMessage}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors col-span-2"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Message</span>
            </button>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
