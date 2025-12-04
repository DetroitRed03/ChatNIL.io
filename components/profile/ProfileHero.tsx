'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Users, TrendingUp, DollarSign, Briefcase, MapPin, Calendar, Award } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

interface StatsCardData {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  variant: 'primary' | 'success' | 'accent' | 'secondary';
  trend?: { value: number; direction: 'up' | 'down' };
}

interface ProfileHeroProps {
  athlete: {
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    school: string;
    graduationYear?: number;
    primarySport: string;
    position?: string;
    division?: string;
    totalFollowers: number;
    avgEngagementRate: number;
    fmvScore?: number;
    fmvTier?: string;
    activeDealCount: number;
    location?: string;
  };
  className?: string;
}

export function ProfileHero({ athlete, className }: ProfileHeroProps) {
  const formatFollowers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatFMV = (score?: number): string => {
    if (!score) return 'N/A';
    if (score >= 1000) return `$${(score / 1000).toFixed(1)}K`;
    return `$${score}`;
  };

  const getTierColor = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return 'from-purple-500 to-purple-600';
      case 'gold': return 'from-accent-500 to-accent-600';
      case 'silver': return 'from-gray-400 to-gray-500';
      case 'bronze': return 'from-orange-600 to-orange-700';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const statsCards: StatsCardData[] = [
    {
      icon: <Users className="h-6 w-6" />,
      value: formatFollowers(athlete.totalFollowers),
      label: 'Total Followers',
      variant: 'primary',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      value: `${athlete.avgEngagementRate.toFixed(1)}%`,
      label: 'Avg Engagement',
      variant: 'success',
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      value: formatFMV(athlete.fmvScore),
      label: 'FMV Score',
      variant: 'accent',
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      value: athlete.activeDealCount,
      label: 'Active Deals',
      variant: 'secondary',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-primary-50 via-accent-50 to-background rounded-2xl',
        className
      )}
    >
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 lg:p-8">
        {/* Profile Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          {/* Avatar */}
          <Avatar
            src={athlete.profilePhoto}
            alt={`${athlete.firstName} ${athlete.lastName}`}
            fallback={`${athlete.firstName} ${athlete.lastName}`}
            size="2xl"
            className="ring-4 ring-white shadow-xl"
          />

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl lg:text-5xl font-bold text-text-primary mb-2">
              {athlete.firstName} {athlete.lastName}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge variant="primary" size="lg">
                {athlete.primarySport}
                {athlete.position && ` · ${athlete.position}`}
              </Badge>

              {athlete.fmvTier && (
                <Badge
                  variant="accent"
                  size="lg"
                  className={cn('bg-gradient-to-r text-white', getTierColor(athlete.fmvTier))}
                >
                  <Award className="h-4 w-4 mr-1" />
                  {athlete.fmvTier} Tier
                </Badge>
              )}

              {athlete.division && (
                <Badge variant="secondary" size="lg">
                  {athlete.division}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{athlete.school}</span>
              </div>

              {athlete.graduationYear && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Class of {athlete.graduationYear}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Stats Card Component
function StatsCard({ icon, value, label, variant, trend }: StatsCardData) {
  const gradientColors = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    accent: 'from-accent-500 to-accent-600',
    secondary: 'from-secondary-500 to-secondary-600',
  };

  return (
    <div className="bg-background-card rounded-xl p-4 lg:p-6 shadow-md hover:shadow-xl transition-all duration-200 border border-border">
      {/* Icon */}
      <div className={cn(
        'inline-flex p-3 rounded-lg bg-gradient-to-br mb-3',
        gradientColors[variant]
      )}>
        <div className="text-white">{icon}</div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <p className="text-3xl lg:text-4xl font-bold text-text-primary">
          {value}
        </p>
        {trend && (
          <span
            className={cn(
              'text-xs font-semibold',
              trend.direction === 'up' ? 'text-success-600' : 'text-error-600'
            )}
          >
            {trend.direction === 'up' ? '+' : '-'}
            {trend.value}%
          </span>
        )}
      </div>

      {/* Label */}
      <p className="text-sm text-text-tertiary mt-1">{label}</p>
    </div>
  );
}
