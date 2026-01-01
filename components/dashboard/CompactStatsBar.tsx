/**
 * Compact Stats Bar Component
 *
 * Redesigned stats bar that combines key metrics into a single horizontal row.
 * Includes FMV as 5th stat and maintains compact above-the-fold presence.
 *
 * Features:
 * - 5 key metrics in horizontal layout
 * - Horizontally scrollable on mobile
 * - FMV integrated (no separate card needed)
 * - Trend indicators
 * - Click navigation to relevant pages
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  DollarSign,
  TrendingUp,
  Bell,
  User,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAthleteMetrics } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface CompactStatsBarProps {
  className?: string;
}

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  color: 'orange' | 'green' | 'blue' | 'purple' | 'amber';
  href?: string;
  badge?: boolean;
  onClick?: () => void;
}

function StatItem({ icon: Icon, label, value, trend, color, href, badge, onClick }: StatItemProps) {
  const router = useRouter();

  const colorConfig = {
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      border: 'border-orange-100',
      hover: 'hover:border-orange-200 hover:bg-orange-50/80',
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      border: 'border-green-100',
      hover: 'hover:border-green-200 hover:bg-green-50/80',
    },
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      border: 'border-blue-100',
      hover: 'hover:border-blue-200 hover:bg-blue-50/80',
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      border: 'border-purple-100',
      hover: 'hover:border-purple-200 hover:bg-purple-50/80',
    },
    amber: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      border: 'border-amber-100',
      hover: 'hover:border-amber-200 hover:bg-amber-50/80',
    },
  };

  const config = colorConfig[color];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border bg-white transition-all min-w-[140px]',
        config.border,
        config.hover,
        'cursor-pointer group'
      )}
    >
      <div className={cn('p-2 rounded-lg', config.iconBg)}>
        <Icon className={cn('w-4 h-4', config.iconColor)} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-gray-900">{value}</span>
          {badge && typeof value === 'number' && value > 0 && (
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          )}
          {trend && (
            <span className={cn(
              'text-xs font-semibold flex items-center',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              <TrendingUp className={cn('w-3 h-3', !trend.isPositive && 'rotate-180')} />
              {trend.value}%
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
    </motion.button>
  );
}

export function CompactStatsBar({ className }: CompactStatsBarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { data: metrics, error, isLoading } = useAthleteMetrics(user?.id);

  if (isLoading) {
    return (
      <div className={cn('flex gap-3 overflow-x-auto pb-2 -mx-1 px-1', className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white min-w-[140px]">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="w-16 h-3 mb-1" />
              <Skeleton className="w-12 h-5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('bg-red-50 border border-red-200 rounded-xl p-4', className)}>
        <p className="text-red-600 text-sm">Failed to load dashboard stats</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const stats = [
    {
      icon: Target,
      label: 'Matches',
      value: metrics?.active_matches || 0,
      color: 'orange' as const,
      href: '/opportunities',
      trend: metrics?.active_matches ? { value: 12, isPositive: true } : undefined,
    },
    {
      icon: DollarSign,
      label: 'Earned',
      value: formatCurrency(metrics?.lifetime_earnings || 0),
      color: 'green' as const,
      href: '/nil-deals',
      trend: metrics?.lifetime_earnings ? { value: 8, isPositive: true } : undefined,
    },
    {
      icon: Sparkles,
      label: 'FMV',
      value: formatCurrency(metrics?.current_fmv_score || 0),
      color: 'amber' as const,
      href: '/profile?tab=fmv',
      trend: { value: 5, isPositive: true },
    },
    {
      icon: Bell,
      label: 'Updates',
      value: metrics?.unread_notifications || 0,
      color: 'purple' as const,
      badge: true,
      onClick: () => {
        // Scroll to notifications or open panel
        const notificationsSection = document.getElementById('activity-feed');
        notificationsSection?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      icon: User,
      label: 'Profile',
      value: `${metrics?.profile_completion_score || 0}%`,
      color: 'blue' as const,
      href: '/profile',
    },
  ];

  return (
    <div className={cn('relative', className)}>
      {/* Scrollable container */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <StatItem {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Fade edge indicators for scroll (mobile) */}
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-[#FAF6F1] to-transparent pointer-events-none md:hidden" />
    </div>
  );
}

export default CompactStatsBar;
