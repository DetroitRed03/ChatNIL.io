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
import { TrendingUp, TrendingDown, Minus, Info, Sparkles, ExternalLink, Award } from 'lucide-react';
import { useAthleteMetrics } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { NeumorphicButton } from '@/components/ui/NeumorphicButton';
import { Badge } from '@/components/ui/Badge';

interface FMVScoreCardProps {
  showDetails?: boolean;
  className?: string;
}

const tierColors = {
  ELITE: {
    gradient: 'from-purple-500 via-pink-500 to-purple-600',
    shadow: 'shadow-purple-500/30',
    badge: 'bg-gradient-to-r from-purple-500 to-pink-500',
    text: 'text-purple-600',
    warmOverlay: 'from-orange-500/5 to-amber-500/5',
  },
  RISING: {
    gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    shadow: 'shadow-blue-500/30',
    badge: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    text: 'text-blue-600',
    warmOverlay: 'from-orange-500/5 to-amber-500/5',
  },
  ESTABLISHED: {
    gradient: 'from-green-500 via-emerald-500 to-green-600',
    shadow: 'shadow-green-500/30',
    badge: 'bg-gradient-to-r from-green-500 to-emerald-500',
    text: 'text-green-600',
    warmOverlay: 'from-orange-500/5 to-amber-500/5',
  },
  EMERGING: {
    gradient: 'from-yellow-500 via-orange-500 to-orange-600',
    shadow: 'shadow-orange-500/30',
    badge: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    text: 'text-orange-600',
    warmOverlay: 'from-orange-500/5 to-amber-500/5',
  },
  DEVELOPING: {
    gradient: 'from-amber-400 via-orange-400 to-amber-500',
    shadow: 'shadow-amber-500/30',
    badge: 'bg-gradient-to-r from-amber-400 to-orange-500',
    text: 'text-amber-600',
    warmOverlay: 'from-orange-500/5 to-amber-500/5',
  },
};

const tierLabels = {
  ELITE: '🚀 ELITE STATUS',
  RISING: '✨ Rising Star',
  ESTABLISHED: '💪 Established',
  EMERGING: '🌟 On the Come Up',
  DEVELOPING: '🔥 Building Steam',
};

export function FMVScoreCard({ showDetails = true, className = '' }: FMVScoreCardProps) {
  const { user } = useAuth();
  const { data: metrics, error, isLoading } = useAthleteMetrics(user?.id);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-white rounded-2xl shadow-lg border border-border overflow-hidden ${className}`}
      >
        <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        <div className="p-6 space-y-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-red-200 p-6 ${className}`}>
        <p className="text-red-600 flex items-center gap-2">
          <Info className="h-5 w-5" />
          Failed to load FMV score
        </p>
      </div>
    );
  }

  const fmvScore = metrics?.current_fmv_score || 0;
  const fmvTier = (metrics?.fmv_tier || 'DEVELOPING') as keyof typeof tierColors;
  const tierConfig = tierColors[fmvTier];

  // Mock trend data (would come from historical comparison in real implementation)
  const trend = 'up'; // 'up', 'down', 'stable'
  const trendValue = '+5.2';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl ${tierConfig.shadow} border border-border overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Gradient Header with Warm Overlay */}
      <div className={`relative bg-gradient-to-r ${tierConfig.gradient} px-6 py-6 overflow-hidden`}>
        {/* Warm overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${tierConfig.warmOverlay} pointer-events-none`} />

        {/* Animated shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />

        {/* Header Content */}
        <div className="relative flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Your NIL Value 💎</h3>
              <p className="text-white/90 text-sm font-medium">What you're worth</p>
            </div>
          </div>
          <button
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            title="Learn about FMV scoring"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* FMV Score with Trend */}
        <div className="flex items-end gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1 font-medium">Your Power Score</p>
            <div className={`text-5xl font-bold bg-gradient-to-r ${tierConfig.gradient} bg-clip-text text-transparent`}>
              {fmvScore.toLocaleString()}
            </div>
          </div>
          <div className={`flex items-center gap-1 pb-2 ${trendColor}`}>
            <TrendIcon className="h-5 w-5" />
            <span className="text-lg font-bold">{trendValue}%</span>
            <span className="text-xs font-medium">📈</span>
          </div>
        </div>

        {/* Tier Badge with Glow */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 mb-5"
        >
          <div className={`px-4 py-2 rounded-full ${tierConfig.badge} shadow-lg ${tierConfig.shadow}`}>
            <span className="text-white font-semibold text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {tierLabels[fmvTier]}
            </span>
          </div>
        </motion.div>

        {/* Animated Progress Bar */}
        {showDetails && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">Next Level Progress 🎯</span>
              <span className="font-bold text-base">72%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '72%' }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${tierConfig.gradient} rounded-full relative overflow-hidden`}
              >
                {/* Shimmer on progress bar */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              </motion.div>
            </div>
          </div>
        )}

        {/* Key Metrics with Warm Gradient Overlays */}
        {showDetails && (
          <div className="grid grid-cols-2 gap-4 mb-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative bg-gradient-to-br from-orange-50/30 to-amber-50/20 rounded-xl p-4 border border-orange-100/40 overflow-hidden group hover:shadow-md hover:shadow-orange-200/30 transition-shadow"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="relative">
                <div className="text-xs font-semibold text-orange-600 mb-1">📱 Social Reach</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(metrics?.total_followers || 0).toLocaleString()}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative bg-gradient-to-br from-amber-50/30 to-yellow-50/20 rounded-xl p-4 border border-amber-100/40 overflow-hidden group hover:shadow-md hover:shadow-amber-200/30 transition-shadow"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-yellow-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="relative">
                <div className="text-xs font-semibold text-amber-600 mb-1">💼 Active Deals</div>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics?.total_deals || 0}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <NeumorphicButton
            variant="glow"
            size="md"
            className="w-full font-bold"
            rightIcon={<ExternalLink className="h-4 w-4" />}
          >
            See Full Stats 📊
          </NeumorphicButton>
        </motion.div>
      </div>
    </motion.div>
  );
}
