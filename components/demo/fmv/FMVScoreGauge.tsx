'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FMVScoreGaugeProps {
  score: number; // 0-100
  tier: 'elite' | 'high' | 'medium' | 'developing' | 'emerging';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const tierConfig = {
  elite: {
    color: '#f59e0b', // Gold/Accent
    label: 'Elite',
    badgeVariant: 'accent' as const,
    gradient: 'from-accent-500 to-accent-600',
  },
  high: {
    color: '#f97316', // Orange/Primary
    label: 'High',
    badgeVariant: 'primary' as const,
    gradient: 'from-primary-500 to-primary-600',
  },
  medium: {
    color: '#10b981', // Green/Success
    label: 'Medium',
    badgeVariant: 'success' as const,
    gradient: 'from-success-500 to-success-600',
  },
  developing: {
    color: '#f59e0b', // Amber/Warning
    label: 'Developing',
    badgeVariant: 'warning' as const,
    gradient: 'from-warning-500 to-warning-600',
  },
  emerging: {
    color: '#6b7280', // Gray
    label: 'Emerging',
    badgeVariant: 'gray' as const,
    gradient: 'from-gray-500 to-gray-600',
  },
};

const sizeConfig = {
  sm: {
    size: 120,
    strokeWidth: 8,
    fontSize: 'text-2xl',
    tierFontSize: 'text-xs',
  },
  md: {
    size: 180,
    strokeWidth: 12,
    fontSize: 'text-4xl',
    tierFontSize: 'text-sm',
  },
  lg: {
    size: 240,
    strokeWidth: 16,
    fontSize: 'text-5xl',
    tierFontSize: 'text-base',
  },
};

export function FMVScoreGauge({ score, tier, size = 'md', className }: FMVScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const config = sizeConfig[size] || sizeConfig.md;

  // Safely get tier info with fallback to 'emerging' if tier is invalid or undefined
  const tierInfo = tier && tierConfig[tier] ? tierConfig[tier] : tierConfig.emerging;

  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((score || 0) / 100) * circumference;

  // Animate score count-up
  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;
    const duration = 1500; // 1.5 seconds
    const targetScore = score || 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayScore(Math.round(targetScore * easeOutQuart));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup function to cancel animation if component unmounts
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [score]);

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Circular Progress */}
      <div className="relative" style={{ width: config.size, height: config.size }}>
        <svg
          width={config.size}
          height={config.size}
          className="transform -rotate-90"
        >
          {/* Background Circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={config.strokeWidth}
          />

          {/* Progress Circle */}
          <motion.circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={tierInfo.color}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className={cn('font-bold text-text-primary', config.fontSize)}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {displayScore}
          </motion.div>
          <motion.div
            className={cn('text-text-tertiary font-medium', config.tierFontSize)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            out of 100
          </motion.div>
        </div>
      </div>

      {/* Tier Badge */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Badge variant={tierInfo.badgeVariant} size="lg" className="shadow-md">
          {tierInfo.label} Tier
        </Badge>
      </motion.div>
    </div>
  );
}
