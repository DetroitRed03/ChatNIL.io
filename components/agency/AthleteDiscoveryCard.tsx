'use client';

import { AthletePublicProfile } from '@/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Instagram,
  Music,
  Twitter,
  Youtube,
  TrendingUp,
  DollarSign,
  MapPin,
  Bookmark,
  BookmarkCheck,
  MessageCircle,
  Eye,
  CheckCircle2,
  GraduationCap,
  Sparkles
} from 'lucide-react';

interface AthleteDiscoveryCardProps {
  athlete: AthletePublicProfile;
  matchScore?: number;
  matchTier?: 'excellent' | 'good' | 'potential';
  rank?: number; // Optional rank indicator (#2, #3, etc.)
  onSave?: () => void;
  onMessage?: () => void;
  isSaved?: boolean;
}

export function AthleteDiscoveryCard({
  athlete,
  matchScore,
  matchTier,
  rank,
  onSave,
  onMessage,
  isSaved = false
}: AthleteDiscoveryCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [saveAnimating, setSaveAnimating] = useState(false);

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

  const getTierConfig = (tier?: string, score?: number) => {
    // If tier is explicitly provided, use it
    if (tier) {
      switch (tier) {
        case 'excellent':
          return { bg: 'bg-gradient-to-r from-orange-500 to-amber-500', text: 'text-white', emoji: '🌟' };
        case 'good':
          return { bg: 'bg-green-500', text: 'text-white', emoji: '✅' };
        case 'potential':
          return { bg: 'bg-amber-500', text: 'text-white', emoji: '💡' };
      }
    }
    // Otherwise, calculate tier from score
    if (score !== undefined) {
      if (score >= 90) {
        return { bg: 'bg-gradient-to-r from-orange-500 to-amber-500', text: 'text-white', emoji: '🌟' };
      } else if (score >= 80) {
        return { bg: 'bg-green-500', text: 'text-white', emoji: '✅' };
      } else if (score >= 60) {
        return { bg: 'bg-amber-500', text: 'text-white', emoji: '💡' };
      } else {
        return { bg: 'bg-gray-500', text: 'text-white', emoji: '' };
      }
    }
    return null;
  };

  const tierConfig = getTierConfig(matchTier, matchScore);

  const handleCardClick = () => {
    const profileIdentifier = athlete.username || athlete.user_id || (athlete as any).user_id;
    if (profileIdentifier) {
      router.push(`/athletes/${profileIdentifier}`);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaveAnimating(true);
    setTimeout(() => setSaveAnimating(false), 300);
    onSave?.();
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMessage?.();
  };

  // Calculate total engagement for display
  const totalFollowers = (athlete.instagram_followers || 0) +
                         (athlete.tiktok_followers || 0) +
                         (athlete.twitter_followers || 0) +
                         (athlete.youtube_subscribers || 0);

  return (
    <motion.div
      className="group cursor-pointer h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="relative h-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        {/* Header with gradient and profile photo */}
        <div className="relative h-28 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 overflow-hidden">
          {/* Animated pattern overlay */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{ backgroundPosition: isHovered ? '100% 100%' : '0% 0%' }}
            transition={{ duration: 3, ease: 'linear' }}
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '30px 30px'
            }}
          />

          {/* Match score badge */}
          {matchScore !== undefined && tierConfig && (
            <motion.div
              className="absolute top-3 left-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
            >
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${tierConfig.bg} ${tierConfig.text} text-sm font-bold shadow-lg backdrop-blur-sm`}>
                {tierConfig.emoji && <span>{tierConfig.emoji}</span>}
                <span>{Math.round(matchScore)}%</span>
              </div>
            </motion.div>
          )}

          {/* Rank badge */}
          {rank !== undefined && rank > 1 && (
            <motion.div
              className="absolute top-3 left-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
              style={{ left: matchScore !== undefined && tierConfig ? '5.5rem' : '0.75rem' }}
            >
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold shadow">
                #{rank}
              </div>
            </motion.div>
          )}

          {/* Availability badge */}
          {athlete.is_available_for_partnerships && (
            <motion.div
              className="absolute top-3 right-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, delay: 0.2 }}
            >
              <div className="flex items-center gap-1 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg">
                <CheckCircle2 className="w-3 h-3" />
                <span>Available</span>
              </div>
            </motion.div>
          )}

          {/* Profile photo or initials */}
          <div className="absolute -bottom-10 left-5">
            <motion.div
              className="w-20 h-20 rounded-2xl border-4 border-white bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {((athlete as any).profile_image_url || (athlete as any).profile_photo_url) ? (
                <img
                  src={(athlete as any).profile_image_url || (athlete as any).profile_photo_url}
                  alt={athlete.display_name || 'Athlete'}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(athlete.display_name || (athlete as any).full_name)
              )}
            </motion.div>
          </div>

          {/* Quick save button in corner */}
          <motion.button
            onClick={handleSave}
            className={`absolute bottom-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-lg ${
              isSaved
                ? 'bg-orange-500 text-white'
                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:text-orange-600'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={saveAnimating ? { scale: [1, 1.3, 1] } : {}}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Card content */}
        <div className="pt-12 px-5 pb-5 flex flex-col h-[calc(100%-7rem)]">
          {/* Athlete info */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
              {athlete.display_name || (athlete as any).full_name || 'Athlete'}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <span className="font-medium text-orange-600">{athlete.sport}</span>
              {athlete.position && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{athlete.position}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{athlete.school_name || (athlete as any).school || 'School'}</span>
            </div>
          </div>

          {/* Key metrics row - always visible */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2.5 bg-gray-50 rounded-xl">
              <TrendingUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
              <div className="text-sm font-bold text-gray-900">
                {athlete.avg_engagement_rate?.toFixed(1) || (athlete as any).engagement_rate?.toFixed(1) || '0'}%
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Engage</div>
            </div>

            <div className="text-center p-2.5 bg-gray-50 rounded-xl">
              <DollarSign className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <div className="text-sm font-bold text-gray-900">
                {(athlete as any).fmv_score ? `$${((athlete as any).fmv_score / 100).toFixed(0)}K` :
                 (athlete as any).estimated_fmv ? formatCurrency((athlete as any).estimated_fmv) :
                 (athlete.estimated_fmv_min ? formatCurrency(athlete.estimated_fmv_min) : 'N/A')}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">FMV</div>
            </div>

            <div className="text-center p-2.5 bg-gray-50 rounded-xl">
              <GraduationCap className="w-4 h-4 text-orange-500 mx-auto mb-1" />
              <div className="text-sm font-bold text-gray-900">
                {(athlete as any).year || (athlete as any).graduation_year || 'N/A'}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Class</div>
            </div>
          </div>

          {/* Social platforms - compact row */}
          <div className="flex items-center gap-2 mb-4">
            {athlete.instagram_followers && athlete.instagram_followers > 0 && (
              <motion.div
                className="flex items-center gap-1.5 bg-gradient-to-r from-orange-50 to-amber-50 px-2.5 py-1.5 rounded-lg border border-orange-100"
                whileHover={{ scale: 1.05 }}
              >
                <Instagram className="w-3.5 h-3.5 text-orange-600" />
                <span className="text-xs font-semibold text-gray-800">{formatNumber(athlete.instagram_followers)}</span>
              </motion.div>
            )}

            {athlete.tiktok_followers && athlete.tiktok_followers > 0 && (
              <motion.div
                className="flex items-center gap-1.5 bg-gray-900 px-2.5 py-1.5 rounded-lg"
                whileHover={{ scale: 1.05 }}
              >
                <Music className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-semibold text-white">{formatNumber(athlete.tiktok_followers)}</span>
              </motion.div>
            )}

            {athlete.twitter_followers && athlete.twitter_followers > 0 && (
              <motion.div
                className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100"
                whileHover={{ scale: 1.05 }}
              >
                <Twitter className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-semibold text-gray-800">{formatNumber(athlete.twitter_followers)}</span>
              </motion.div>
            )}

            {/* Total reach if multiple platforms */}
            {totalFollowers > 0 && (
              <div className="ml-auto text-xs text-gray-500">
                <span className="font-semibold text-gray-700">{formatNumber(totalFollowers)}</span> total
              </div>
            )}
          </div>

          {/* Content categories */}
          {athlete.content_categories && athlete.content_categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {athlete.content_categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-100"
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

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Action buttons - always visible but enhanced on hover */}
          <div className="flex gap-2">
            <motion.button
              onClick={handleCardClick}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Eye className="w-4 h-4" />
              <span>View Profile</span>
            </motion.button>

            <motion.button
              onClick={handleMessage}
              className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Hover glow effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'linear-gradient(180deg, rgba(249, 115, 22, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
