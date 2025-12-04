'use client';

import { Trophy, Award, Zap, TrendingUp } from 'lucide-react';
import { TiltCard } from '@/components/ui/TiltCard';

interface BadgeHeroProps {
  stats: {
    totalBadges: number;
    earnedCount: number;
    totalPoints: number;
    completionPercentage: number;
  };
}

export function BadgeHero({ stats }: BadgeHeroProps) {
  return (
    <div className="mb-12">
      {/* Hero Header - Centered */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-lg mb-4 sm:mb-6">
          <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 px-4">
          Unlock Your NIL Knowledge Journey
        </h1>

        <p className="text-base sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto px-4">
          Earn badges as you master NIL concepts, from the basics to advanced strategies
        </p>
      </div>

      {/* Stats Cards with 3D Tilt - Centered Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
        <TiltCard intensity={10} className="group">
          <div className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-600">Total Badges</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.totalBadges}</div>
            <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">Available to earn</div>
          </div>
        </TiltCard>

        <TiltCard intensity={10} className="group">
          <div className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-600">Earned</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-orange-600">{stats.earnedCount}</div>
            <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">Badges unlocked</div>
          </div>
        </TiltCard>

        <TiltCard intensity={10} className="group">
          <div className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-600">Total Points</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-orange-600">{stats.totalPoints}</div>
            <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">Knowledge score</div>
          </div>
        </TiltCard>

        <TiltCard intensity={10} className="group">
          <div className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-600">Progress</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-orange-600">{stats.completionPercentage}%</div>
            <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">Completion rate</div>
          </div>
        </TiltCard>
      </div>

      {/* Progress Bar - Centered */}
      <div className="mt-6 sm:mt-8 max-w-3xl mx-auto px-4">
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 sm:h-3 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs sm:text-sm text-gray-600 mt-2">
          <span>Keep going!</span>
          <span className="text-right">{stats.earnedCount} of {stats.totalBadges} badges</span>
        </div>
      </div>
    </div>
  );
}
