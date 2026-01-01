'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown,
  Grid3X3,
  List,
  Trophy,
  TrendingUp,
  Users,
  DollarSign,
  ChevronDown,
  Sparkles,
  Filter,
  RefreshCw,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { AthletePublicProfile, AgencyAthleteMatch } from '@/types';
import { AthleteDiscoveryCard } from './AthleteDiscoveryCard';

type SortOption = 'match_score' | 'followers' | 'engagement' | 'fmv';
type ViewMode = 'grid' | 'list';

interface EnrichedAthlete extends AthletePublicProfile {
  match_score?: number;
  match_tier?: 'excellent' | 'good' | 'potential';
  match_reasons?: string[];
}

interface DiscoverResultsProps {
  athletes: EnrichedAthlete[];
  isLoading?: boolean;
  onSaveAthlete?: (athleteId: string) => void;
  onMessageAthlete?: (athleteId: string) => void;
  savedAthleteIds?: Set<string>;
  onRefresh?: () => void;
  onOpenMobileFilters?: () => void;
  activeFilterCount?: number;
  className?: string;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: typeof Trophy }[] = [
  { value: 'match_score', label: 'Match Score', icon: Trophy },
  { value: 'followers', label: 'Followers', icon: Users },
  { value: 'engagement', label: 'Engagement', icon: TrendingUp },
  { value: 'fmv', label: 'FMV', icon: DollarSign },
];

/**
 * DiscoverResults Component
 *
 * Unified results display for the Discover page.
 * Shows hero card for #1 match and grid for remaining matches.
 * All from the same sorted/filtered data array.
 */
export function DiscoverResults({
  athletes,
  isLoading = false,
  onSaveAthlete,
  onMessageAthlete,
  savedAthleteIds = new Set(),
  onRefresh,
  onOpenMobileFilters,
  activeFilterCount = 0,
  className = ''
}: DiscoverResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('match_score');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Sort athletes based on selected option
  const sortedAthletes = [...athletes].sort((a, b) => {
    switch (sortBy) {
      case 'match_score':
        return (b.match_score || 0) - (a.match_score || 0);
      case 'followers':
        const aFollowers = (a.instagram_followers || 0) + (a.tiktok_followers || 0) + (a.twitter_followers || 0);
        const bFollowers = (b.instagram_followers || 0) + (b.tiktok_followers || 0) + (b.twitter_followers || 0);
        return bFollowers - aFollowers;
      case 'engagement':
        return (b.avg_engagement_rate || 0) - (a.avg_engagement_rate || 0);
      case 'fmv':
        const aFmv = (a as any).fmv_score || a.estimated_fmv_min || 0;
        const bFmv = (b as any).fmv_score || b.estimated_fmv_min || 0;
        return bFmv - aFmv;
      default:
        return 0;
    }
  });

  // First athlete is the hero, rest go in grid
  const heroAthlete = sortedAthletes[0];
  const gridAthletes = sortedAthletes.slice(1);

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

  const currentSortOption = SORT_OPTIONS.find(o => o.value === sortBy)!;

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className}`}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Hero skeleton */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 animate-pulse">
          <div className="grid md:grid-cols-2">
            <div className="h-80 bg-gradient-to-br from-orange-200 to-amber-200" />
            <div className="p-8 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-24 bg-gray-100 rounded-xl" />
              <div className="flex gap-4">
                <div className="h-12 bg-gray-200 rounded flex-1" />
                <div className="h-12 bg-gray-200 rounded flex-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-28 bg-gradient-to-br from-orange-200 to-amber-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-16 bg-gray-100 rounded" />
                  <div className="h-16 bg-gray-100 rounded" />
                  <div className="h-16 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!athletes.length) {
    return (
      <div className={`${className}`}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Athletes Found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Try adjusting your filters to see more results, or refresh to generate new matches.
          </p>
          <div className="flex gap-3 justify-center">
            {onOpenMobileFilters && (
              <button
                onClick={onOpenMobileFilters}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
              >
                Adjust Filters
              </button>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {athletes.length} Athlete{athletes.length !== 1 ? 's' : ''} Found
          </h2>

          {/* Mobile filter button */}
          <button
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <currentSortOption.icon className="w-4 h-4 text-gray-500" />
              <span className="hidden sm:inline">{currentSortOption.label}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSortDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSortDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[160px]"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                          sortBy === option.value ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
                        }`}
                      >
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* View mode toggle */}
          <div className="hidden sm:flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-orange-600 hover:border-orange-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hero Card - #1 Match */}
      {heroAthlete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="grid md:grid-cols-2">
              {/* Left: Large athlete visual */}
              <div className="relative h-72 md:h-auto md:min-h-[360px] bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500">
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                </div>

                {/* Avatar */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {((heroAthlete as any).profile_image_url || (heroAthlete as any).profile_photo_url) ? (
                    <div className="w-36 h-36 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden">
                      <img
                        src={(heroAthlete as any).profile_image_url || (heroAthlete as any).profile_photo_url}
                        alt={heroAthlete.display_name || 'Athlete'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-36 h-36 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                      {getInitials(heroAthlete.display_name || (heroAthlete as any).full_name)}
                    </div>
                  )}
                </div>

                {/* #1 Badge */}
                <div className="absolute top-5 left-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                    className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-lg"
                  >
                    <Trophy className="w-5 h-5 text-orange-500" />
                    <span className="font-bold text-gray-900">#1 Top Match</span>
                  </motion.div>
                </div>

                {/* Match score */}
                {heroAthlete.match_score !== undefined && (
                  <div className="absolute top-5 right-5">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                      className={`px-4 py-2 rounded-xl text-white font-bold shadow-lg ${
                        heroAthlete.match_score >= 90 ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                        heroAthlete.match_score >= 80 ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    >
                      {Math.round(heroAthlete.match_score)}% Match
                    </motion.div>
                  </div>
                )}

                {/* Sport badge */}
                <div className="absolute bottom-5 left-5">
                  <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                    {heroAthlete.sport} {heroAthlete.position && `· ${heroAthlete.position}`}
                  </div>
                </div>
              </div>

              {/* Right: Details */}
              <div className="p-6 md:p-8 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                      {heroAthlete.display_name || (heroAthlete as any).full_name || 'Athlete'}
                    </h3>
                    <p className="text-gray-500">
                      {heroAthlete.school_name || (heroAthlete as any).school || 'School'}
                      {(heroAthlete as any).state && ` · ${(heroAthlete as any).state}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">
                      {(heroAthlete as any).fmv_score ? formatCurrency((heroAthlete as any).fmv_score) :
                       heroAthlete.estimated_fmv_min ? formatCurrency(heroAthlete.estimated_fmv_min) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">Est. FMV</div>
                  </div>
                </div>

                {/* Match reasons or stats */}
                {heroAthlete.match_reasons && heroAthlete.match_reasons.length > 0 ? (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 mb-4 border border-orange-100">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      Why they're a great match:
                    </h4>
                    <ul className="space-y-1.5">
                      {heroAthlete.match_reasons.slice(0, 3).map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <Users className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                      <div className="font-bold text-gray-900">
                        {formatNumber((heroAthlete.instagram_followers || 0) + (heroAthlete.tiktok_followers || 0))}
                      </div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <TrendingUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
                      <div className="font-bold text-gray-900">
                        {heroAthlete.avg_engagement_rate?.toFixed(1) || '0'}%
                      </div>
                      <div className="text-xs text-gray-500">Engagement</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <DollarSign className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                      <div className="font-bold text-gray-900">
                        {(heroAthlete as any).fmv_score ? `$${((heroAthlete as any).fmv_score / 1000).toFixed(0)}K` :
                         heroAthlete.estimated_fmv_min ? formatCurrency(heroAthlete.estimated_fmv_min) : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">FMV</div>
                    </div>
                  </div>
                )}

                {/* Content categories */}
                {heroAthlete.content_categories && heroAthlete.content_categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {heroAthlete.content_categories.slice(0, 4).map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {/* Spacer */}
                <div className="flex-grow" />

                {/* CTA Buttons */}
                <div className="flex gap-3 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onMessageAthlete?.(heroAthlete.user_id)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-orange-500/20"
                  >
                    Start Conversation
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const profileId = heroAthlete.username || heroAthlete.user_id;
                      window.location.href = `/athletes/${profileId}`;
                    }}
                    className="flex-1 border-2 border-gray-200 hover:border-orange-300 font-semibold py-3 px-4 rounded-xl transition-all text-gray-700 hover:text-orange-700"
                  >
                    View Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSaveAthlete?.(heroAthlete.user_id)}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
                      savedAthleteIds.has(heroAthlete.user_id)
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'border-2 border-gray-200 hover:border-orange-300 text-gray-500 hover:text-orange-600'
                    }`}
                    title={savedAthleteIds.has(heroAthlete.user_id) ? 'Remove from saved' : 'Save athlete'}
                  >
                    {savedAthleteIds.has(heroAthlete.user_id) ? (
                      <BookmarkCheck className="w-5 h-5" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid of remaining athletes */}
      {gridAthletes.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            More Matches
          </h3>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
            }
          >
            {gridAthletes.map((athlete, index) => (
              <motion.div
                key={athlete.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AthleteDiscoveryCard
                  athlete={athlete}
                  matchScore={athlete.match_score}
                  matchTier={athlete.match_tier}
                  onSave={() => onSaveAthlete?.(athlete.user_id)}
                  onMessage={() => onMessageAthlete?.(athlete.user_id)}
                  isSaved={savedAthleteIds.has(athlete.user_id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}
