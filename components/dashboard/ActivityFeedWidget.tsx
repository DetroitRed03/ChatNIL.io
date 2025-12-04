/**
 * Activity Feed Widget Component - HIGH ENERGY
 *
 * Bold, vibrant activity feed with enhanced visuals.
 * Matches the FMVScoreCard aesthetic with gradient header and colored backgrounds.
 *
 * Features:
 * - Gradient header with shimmer effect
 * - Larger icons (h-12 w-12)
 * - Gradient backgrounds for activity types
 * - Prominent filter tabs
 * - Larger text (text-base for titles)
 * - Dramatic hover effects
 */

'use client';

import React, { useState } from 'react';
import { useActivityFeed } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Activity, Users, FileText, MessageCircle, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedWidgetProps {
  limit?: number;
  className?: string;
}

const activityIcons = {
  match: <Users className="h-6 w-6" />,
  deal: <FileText className="h-6 w-6" />,
  message: <MessageCircle className="h-6 w-6" />,
};

const activityColors = {
  match: {
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-gradient-to-br from-orange-50/30 to-amber-50/20',
    border: 'border-orange-200',
    shadow: 'shadow-orange-500/30',
  },
  deal: {
    gradient: 'from-amber-500 to-yellow-500',
    bg: 'bg-gradient-to-br from-amber-50/30 to-yellow-50/20',
    border: 'border-amber-200',
    shadow: 'shadow-amber-500/30',
  },
  message: {
    gradient: 'from-yellow-500 to-orange-500',
    bg: 'bg-gradient-to-br from-yellow-50/30 to-orange-50/20',
    border: 'border-yellow-200',
    shadow: 'shadow-yellow-500/30',
  },
};

export function ActivityFeedWidget({
  limit = 10,
  className = '',
}: ActivityFeedWidgetProps) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'match' | 'deal' | 'message'>('all');
  const { data, error, isLoading } = useActivityFeed(
    user?.id,
    limit,
    0,
    filter === 'all' ? undefined : filter
  );

  if (isLoading) {
    return (
      <div className={`bg-gradient-to-br from-orange-50/20 via-white to-amber-50/15 rounded-xl shadow-sm border border-orange-100/40 ${className}`}>
        <div className="px-6 py-4 border-b border-orange-100/30">
          <div className="h-6 bg-orange-200/50 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-red-200 p-6 ${className}`}>
        <p className="text-red-600 text-sm">Failed to load activity feed</p>
      </div>
    );
  }

  const activities = data?.activities || [];
  const hasActivities = activities.length > 0;

  return (
    <div className={`bg-gradient-to-br from-orange-50/20 via-white to-amber-50/15 rounded-xl shadow-sm shadow-orange-100/30 border border-orange-100/40 overflow-hidden ${className}`}>
      {/* Warm Gradient Header with Shimmer */}
      <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-6 py-6 overflow-hidden">
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
        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="font-bold text-2xl text-white">Recent Activity 📈</h3>
            <p className="text-white/90 text-sm font-medium mt-1">What's happening</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-lg p-1">
            {(['all', 'match', 'deal', 'message'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  filter === type
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="p-6">
        {!hasActivities ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No recent activity</p>
            <p className="text-gray-500 text-sm mt-1">
              Check back soon for updates on matches and deals
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const colorConfig = activityColors[activity.activity_type as keyof typeof activityColors];

              return (
                <motion.div
                  key={activity.activity_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                  className={`flex items-start gap-4 p-4 rounded-xl ${colorConfig.bg} border ${colorConfig.border} transition-all cursor-pointer group hover:shadow-lg ${colorConfig.shadow}`}
                >
                  {/* Icon with Gradient */}
                  <div
                    className={`flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${colorConfig.gradient} shadow-md flex-shrink-0`}
                  >
                    <div className="text-white">
                      {activityIcons[activity.activity_type as keyof typeof activityIcons]}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-gray-900 mb-1">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-gray-700 font-medium mb-2">{activity.description}</p>
                    <p className="text-sm text-gray-500 font-medium">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 mt-2" />
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
