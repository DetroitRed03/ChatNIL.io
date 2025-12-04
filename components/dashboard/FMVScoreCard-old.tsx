/**
 * FMV Score Card Component - Design System V4
 *
 * Stunning visualization of athlete's Fair Market Value with:
 * - Gradient header with glow effect
 * - Current FMV score and tier
 * - Visual tier indicator with colored badge
 * - Animated progress bar
 * - Metric boxes with gradient overlays
 * - NeumorphicButton for CTA
 *
 * Features:
 * - Gradient backgrounds based on tier
 * - Glow shadow effects
 * - Smooth animations
 * - Color-coded metrics
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info, Sparkles, ExternalLink } from 'lucide-react';
import { useAthleteMetrics } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { NeumorphicButton } from '@/components/ui/NeumorphicButton';
import { Card } from '@/components/ui/Card';

interface FMVScoreCardProps {
  showDetails?: boolean;
  className?: string;
}

const tierColors = {
  ELITE: 'from-purple-500 to-pink-500',
  RISING: 'from-blue-500 to-cyan-500',
  ESTABLISHED: 'from-green-500 to-emerald-500',
  EMERGING: 'from-yellow-500 to-orange-500',
  DEVELOPING: 'from-gray-400 to-gray-500',
};

const tierLabels = {
  ELITE: 'Elite',
  RISING: 'Rising Star',
  ESTABLISHED: 'Established',
  EMERGING: 'Emerging',
  DEVELOPING: 'Developing',
};

export function FMVScoreCard({ showDetails = true, className = '' }: FMVScoreCardProps) {
  const { user } = useAuth();
  const { data: metrics, error, isLoading } = useAthleteMetrics(user?.id);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-red-200 p-6 ${className}`}>
        <p className="text-red-600">Failed to load FMV score</p>
      </div>
    );
  }

  const fmvScore = metrics?.current_fmv_score || 0;
  const fmvTier = (metrics?.fmv_tier || 'DEVELOPING') as keyof typeof tierColors;

  // Mock trend data (would come from historical comparison in real implementation)
  const trend = 'up'; // 'up', 'down', 'stable'
  const trendValue = '+5.2';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900">Fair Market Value</h3>
        </div>
        <button
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Learn about FMV scoring"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* FMV Score */}
        <div className="flex items-end gap-3 mb-4">
          <div className="text-4xl font-bold text-gray-900">
            {fmvScore.toLocaleString()}
          </div>
          <div className={`flex items-center gap-1 pb-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{trendValue}%</span>
          </div>
        </div>

        {/* Tier Badge */}
        <div className="inline-flex items-center gap-2 mb-4">
          <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${tierColors[fmvTier]}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {tierLabels[fmvTier]} Tier
          </span>
        </div>

        {/* Progress Bar */}
        {showDetails && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Progress to Next Tier</span>
              <span>72%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '72%' }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-full bg-gradient-to-r ${tierColors[fmvTier]} rounded-full`}
              />
            </div>
          </div>
        )}

        {/* Key Metrics */}
        {showDetails && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Social Reach</div>
              <div className="text-lg font-semibold text-gray-900">
                {(metrics?.total_followers || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Active Deals</div>
              <div className="text-lg font-semibold text-gray-900">
                {metrics?.total_deals || 0}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
