/**
 * Quick Stats Card Component - Design System V4
 *
 * Displays key dashboard metrics with stunning visuals:
 * - Active matches (Blue gradient)
 * - Total earnings (Green gradient)
 * - Unread notifications (Purple gradient)
 * - Profile completion (Orange gradient)
 *
 * Features:
 * - StatCard components with gradients
 * - Stagger animations on load
 * - Hover lift effects with colored shadows
 * - Color-coded icons in gradient backgrounds
 */

'use client';

import React from 'react';
import { Users, DollarSign, Bell, User } from 'lucide-react';
import { useAthleteMetrics } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';

interface QuickStatsCardProps {
  className?: string;
}

export function QuickStatsCard({ className = '' }: QuickStatsCardProps) {
  const { user } = useAuth();
  const { data: metrics, error, isLoading } = useAthleteMetrics(user?.id);

  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border p-6">
            <Skeleton className="h-12 w-12 rounded-xl mb-4" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-600 text-sm">Failed to load dashboard stats</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      icon: Users,
      label: 'Brand Matches',
      value: metrics?.active_matches || 0,
      trend: metrics?.active_matches ? { value: 12, isPositive: true } : undefined,
      color: 'blue' as const,
    },
    {
      icon: DollarSign,
      label: 'Total Earned',
      value: formatCurrency(metrics?.lifetime_earnings || 0),
      trend: metrics?.lifetime_earnings ? { value: 8, isPositive: true } : undefined,
      color: 'success' as const,
    },
    {
      icon: Bell,
      label: 'New Updates',
      value: metrics?.unread_notifications || 0,
      color: 'purple' as const,
    },
    {
      icon: User,
      label: 'Profile Strength',
      value: `${metrics?.profile_completion_score || 0}%`,
      trend: metrics?.profile_completion_score && metrics.profile_completion_score < 100
        ? { value: 100 - metrics.profile_completion_score, isPositive: true }
        : undefined,
      color: 'primary' as const,
    },
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="group"
        >
          <div className={`transition-shadow duration-300 hover:shadow-lg hover:shadow-${stat.color === 'success' ? 'green' : stat.color}-500/30`}>
            <StatCard
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              color={stat.color}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
