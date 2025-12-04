'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge, UserBadge } from '@/types';
import { getBadgesWithStatus, getBadgeStats, getBadgeProgress } from '@/lib/badges';
import BadgeCard from './BadgeCard';
import BadgeUnlockModal from './BadgeUnlockModal';
import { Trophy, Award, Filter, TrendingUp, Zap, Lock } from 'lucide-react';

interface BadgeShowcaseProps {
  userId: string;
}

type FilterType = 'all' | 'earned' | 'locked';
type SortType = 'rarity' | 'date' | 'points';

export default function BadgeShowcase({ userId }: BadgeShowcaseProps) {
  const [badges, setBadges] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBadges: 0,
    earnedCount: 0,
    totalPoints: 0,
    completionPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('rarity');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const [badgesData, statsData] = await Promise.all([
        getBadgesWithStatus(userId),
        getBadgeStats(userId)
      ]);

      setBadges(badgesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = badges.filter(badge => {
    if (filter === 'earned') return badge.isEarned;
    if (filter === 'locked') return !badge.isEarned;
    return true;
  });

  const sortedBadges = [...filteredBadges].sort((a, b) => {
    if (sort === 'date') {
      if (!a.isEarned && !b.isEarned) return 0;
      if (!a.isEarned) return 1;
      if (!b.isEarned) return -1;
      return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
    }
    if (sort === 'points') {
      return b.points - a.points;
    }
    // Sort by rarity (default)
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    return rarityOrder[a.rarity as keyof typeof rarityOrder] - rarityOrder[b.rarity as keyof typeof rarityOrder];
  });

  const handleBadgeClick = (badge: any) => {
    setSelectedBadge(badge);
    if (badge.isEarned) {
      setShowUnlockModal(true);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Achievements & Badges</h2>
              <p className="text-blue-100 text-xs sm:text-sm">Your gamification progress</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
              <span className="text-[10px] sm:text-xs text-blue-100">Total Badges</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalBadges}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
              <span className="text-[10px] sm:text-xs text-blue-100">Earned</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{stats.earnedCount}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
              <span className="text-[10px] sm:text-xs text-blue-100">Total Points</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalPoints}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
              <span className="text-[10px] sm:text-xs text-blue-100">Completion</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{stats.completionPercentage}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-3 rounded-full relative overflow-hidden transition-all duration-500"
              style={{ width: `${stats.completionPercentage}%` }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
          <div className="hidden sm:flex items-center">
            <Filter className="w-4 h-4 text-gray-500 mr-2" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({badges.length})
            </button>
            <button
              onClick={() => setFilter('earned')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                filter === 'earned'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Earned ({stats.earnedCount})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                filter === 'locked'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Locked ({stats.totalBadges - stats.earnedCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-600">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="flex-1 sm:flex-none px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rarity">Rarity</option>
            <option value="date">Date Earned</option>
            <option value="points">Points</option>
          </select>
        </div>
      </div>

      {/* Badge Grid */}
      {sortedBadges.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isEarned={badge.isEarned}
              earnedAt={badge.earnedAt}
              onClick={() => handleBadgeClick(badge)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No badges to display</p>
          <p className="text-sm text-gray-500 mt-1">
            {filter === 'earned' ? 'Start earning badges by completing activities!' : 'Check back later for new badges.'}
          </p>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && showUnlockModal && (
        <BadgeUnlockModal
          badge={selectedBadge}
          isOpen={showUnlockModal}
          onClose={() => {
            setShowUnlockModal(false);
            setSelectedBadge(null);
          }}
          autoCloseAfter={0} // Don't auto-close when viewing existing badges
        />
      )}
    </div>
  );
}
