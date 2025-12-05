/**
 * Activity Feed Widget Component - V3 Premium
 *
 * Professional activity feed with clean design.
 * Matches V3 Premium aesthetic with refined styling and subtle interactions.
 *
 * Features:
 * - Clean header with professional typography
 * - Monochrome icons in subtle backgrounds
 * - Filter tabs with refined styling
 * - Professional text hierarchy
 * - Subtle hover effects
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

// V3 Premium - Monochrome icons with professional styling
const activityIcons = {
  match: <Users className="h-5 w-5" />,
  deal: <FileText className="h-5 w-5" />,
  message: <MessageCircle className="h-5 w-5" />,
};

// Warm professional color scheme
const activityColors = {
  match: {
    iconBg: 'bg-blue-50/80',
    iconColor: 'text-blue-600',
    border: 'border-blue-100/60',
  },
  deal: {
    iconBg: 'bg-emerald-50/80',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-100/60',
  },
  message: {
    iconBg: 'bg-orange-50/80',
    iconColor: 'text-orange-600',
    border: 'border-orange-100/60',
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
      <div className={`bg-[#FFFBF7] rounded-xl border border-gray-200/60 ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
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
    <div className={`bg-[#FFFBF7] rounded-2xl border border-orange-100/50 overflow-hidden group ${className}`}
      style={{ boxShadow: '0 4px 16px -4px rgba(234, 88, 12, 0.08), 0 2px 8px -2px rgba(234, 88, 12, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)' }}
    >
      {/* Warm Professional Header */}
      <div className="px-7 py-5 border-b border-orange-100/40 bg-gradient-to-r from-white to-orange-50/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">Track your latest updates</p>
          </div>

          {/* Filter Tabs - Warm Style */}
          <div className="flex items-center gap-1 bg-orange-50/50 rounded-lg p-1 border border-orange-100/60">
            {(['all', 'match', 'deal', 'message'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  filter === type
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  whileHover={{ y: -1 }}
                  className={`flex items-start gap-4 p-4 rounded-lg ${colorConfig.iconBg} border ${colorConfig.border} transition-all cursor-pointer group hover:border-gray-200`}
                >
                  {/* Icon - Professional Monochrome */}
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-lg ${colorConfig.iconBg} border ${colorConfig.border} flex-shrink-0`}
                  >
                    <div className={colorConfig.iconColor}>
                      {activityIcons[activity.activity_type as keyof typeof activityIcons]}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 mt-2" />
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
