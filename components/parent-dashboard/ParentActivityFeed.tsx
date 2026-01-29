'use client';

import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';

export interface ActivityItem {
  id: string;
  childId: string;
  childName: string;
  type: 'quiz_completed' | 'badge_earned' | 'chapter_started' | 'chapter_completed' | 'consent_given' | 'login';
  message: string;
  timestamp: string;
  icon: string;
}

interface ParentActivityFeedProps {
  activities: ActivityItem[];
  onViewAll?: () => void;
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
  }
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }
  if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  return date.toLocaleDateString();
};

export function ParentActivityFeed({ activities, onViewAll }: ParentActivityFeedProps) {
  return (
    <motion.div
      data-testid="parent-activity-feed"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex-shrink-0 text-xl">{activity.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{formatTimestamp(activity.timestamp)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activities.length > 0 && onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full mt-4 flex items-center justify-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium py-2"
        >
          View All Activity
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
