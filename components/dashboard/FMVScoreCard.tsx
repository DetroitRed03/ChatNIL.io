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

// V3 Premium tier colors - refined, professional
const tierColors = {
  ELITE: {
    gradient: 'from-primary-600 via-primary-700 to-primary-800',
    badge: 'bg-gradient-to-r from-accent-500 to-accent-600',
    text: 'text-primary-700',
  },
  RISING: {
    gradient: 'from-primary-600 via-primary-700 to-primary-800',
    badge: 'bg-gradient-to-r from-accent-500 to-accent-600',
    text: 'text-primary-700',
  },
  ESTABLISHED: {
    gradient: 'from-primary-600 via-primary-700 to-primary-800',
    badge: 'bg-gradient-to-r from-accent-500 to-accent-600',
    text: 'text-primary-700',
  },
  EMERGING: {
    gradient: 'from-primary-600 via-primary-700 to-primary-800',
    badge: 'bg-gradient-to-r from-accent-500 to-accent-600',
    text: 'text-primary-700',
  },
  DEVELOPING: {
    gradient: 'from-primary-600 via-primary-700 to-primary-800',
    badge: 'bg-gradient-to-r from-accent-500 to-accent-600',
    text: 'text-primary-700',
  },
};

// V3 Premium tier labels - professional, no emojis in tier names
const tierLabels = {
  ELITE: 'Elite Status',
  RISING: 'Rising Star',
  ESTABLISHED: 'Established',
  EMERGING: 'Emerging Talent',
  DEVELOPING: 'Developing',
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
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`bg-[#FFFBF7] rounded-2xl border border-orange-100/50 overflow-hidden transition-all duration-300 group ${className}`}
      style={{ boxShadow: '0 4px 16px -4px rgba(234, 88, 12, 0.08), 0 2px 8px -2px rgba(234, 88, 12, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)' }}
    >
      {/* Warm Professional Header with Pattern Overlay */}
      <div className={`relative bg-gradient-to-br ${tierConfig.gradient} px-7 py-7 overflow-hidden`}>
        {/* Pattern overlay for texture */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* Subtle shimmer - less aggressive */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />

        {/* Header Content */}
        <div className="relative flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-lg">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Fair Market Value</h3>
              <p className="text-white/90 text-sm">Your NIL worth</p>
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
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Current Score</p>
            <div className="text-3xl font-semibold tracking-tight text-gray-900">
              {fmvScore.toLocaleString()}
            </div>
          </div>
          <div className={`flex items-center gap-1 pb-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-semibold">{trendValue}%</span>
          </div>
        </div>

        {/* Tier Badge - Gold Premium */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="inline-flex items-center gap-2 mb-5"
        >
          <div className={`px-4 py-2 rounded-full ${tierConfig.badge} shadow-md`}>
            <span className="text-white font-semibold text-sm tracking-wide flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              {tierLabels[fmvTier]}
            </span>
          </div>
        </motion.div>

        {/* Animated Progress Bar */}
        {showDetails && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              <span>Next Level Progress</span>
              <span className="text-sm font-semibold text-gray-900">72%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '72%' }}
                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary-600 to-primary-700 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Key Metrics - Clean Professional Style */}
        {showDetails && (
          <div className="grid grid-cols-2 gap-4 mb-5">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gray-50 rounded-lg p-4 border border-gray-100"
            >
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Social Reach</div>
              <div className="text-2xl font-semibold tracking-tight text-gray-900">
                {(metrics?.total_followers || 0).toLocaleString()}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50 rounded-lg p-4 border border-gray-100"
            >
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Active Deals</div>
              <div className="text-2xl font-semibold tracking-tight text-gray-900">
                {metrics?.total_deals || 0}
              </div>
            </motion.div>
          </div>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <NeumorphicButton
            variant="glow"
            size="md"
            className="w-full font-semibold"
            rightIcon={<ExternalLink className="h-4 w-4" />}
          >
            View Full Analytics
          </NeumorphicButton>
        </motion.div>
      </div>
    </motion.div>
  );
}
