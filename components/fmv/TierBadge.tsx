'use client';

import { FMVTier } from '@/types';
import { Trophy, Award, Target, TrendingUp, Zap } from 'lucide-react';

interface TierBadgeProps {
  tier: FMVTier;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const TIER_CONFIG: Record<FMVTier, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: typeof Trophy;
  gradient: string;
}> = {
  elite: {
    label: 'Elite',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    icon: Trophy,
    gradient: 'from-yellow-400 to-orange-500',
  },
  high: {
    label: 'High',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    icon: Award,
    gradient: 'from-blue-400 to-purple-500',
  },
  medium: {
    label: 'Medium',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    icon: Target,
    gradient: 'from-green-400 to-teal-500',
  },
  developing: {
    label: 'Developing',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    icon: TrendingUp,
    gradient: 'from-orange-400 to-red-500',
  },
  emerging: {
    label: 'Emerging',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    icon: Zap,
    gradient: 'from-gray-400 to-gray-600',
  },
};

const SIZE_CONFIG = {
  small: {
    container: 'px-2 py-1 text-xs',
    icon: 'w-3 h-3',
    text: 'text-xs',
  },
  medium: {
    container: 'px-3 py-1.5 text-sm',
    icon: 'w-4 h-4',
    text: 'text-sm',
  },
  large: {
    container: 'px-4 py-2 text-base',
    icon: 'w-5 h-5',
    text: 'text-base',
  },
};

export function TierBadge({ tier, size = 'medium', showLabel = true }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  if (!showLabel) {
    // Icon only mode
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full ${config.bgColor} ${config.borderColor} border-2`}
        style={{ padding: size === 'small' ? '0.25rem' : size === 'medium' ? '0.5rem' : '0.75rem' }}
        title={`${config.label} Tier`}
      >
        <Icon className={`${sizeConfig.icon} ${config.color}`} />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full font-semibold ${config.bgColor} ${config.borderColor} border-2 ${sizeConfig.container}`}
    >
      <Icon className={`${sizeConfig.icon} ${config.color}`} />
      <span className={`${config.color} ${sizeConfig.text}`}>{config.label}</span>
    </div>
  );
}

/**
 * Gradient badge variant for hero sections
 */
export function TierBadgeGradient({ tier, size = 'large' }: { tier: FMVTier; size?: 'small' | 'medium' | 'large' }) {
  const config = TIER_CONFIG[tier];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${config.gradient} text-white font-bold shadow-lg ${sizeConfig.container}`}
    >
      <Icon className={sizeConfig.icon} />
      <span className={sizeConfig.text}>{config.label} Tier</span>
    </div>
  );
}

/**
 * Get tier from score (utility function)
 */
export function getTierFromScore(score: number): FMVTier {
  if (score >= 80) return 'elite';
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  if (score >= 30) return 'developing';
  return 'emerging';
}
