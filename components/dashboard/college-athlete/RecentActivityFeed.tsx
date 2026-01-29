'use client';

import { motion } from 'framer-motion';
import { Shield, Clock, FileText, Bell } from 'lucide-react';

interface Activity {
  id: string;
  type: 'validation' | 'tax_reminder' | 'deal_update';
  message: string;
  timestamp: string;
}

interface RecentActivityFeedProps {
  activities: Activity[];
}

const activityConfig = {
  validation: {
    icon: Shield,
    color: 'text-green-600 bg-green-100',
  },
  tax_reminder: {
    icon: Clock,
    color: 'text-amber-600 bg-amber-100',
  },
  deal_update: {
    icon: FileText,
    color: 'text-blue-600 bg-blue-100',
  },
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div data-testid="recent-activity-feed" className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-gray-600 font-medium">No Recent Activity</h3>
        <p className="text-gray-400 text-sm">Your activity will appear here</p>
      </div>
    );
  }

  return (
    <div data-testid="recent-activity-feed" className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">📊</span>
          Recent Activity
        </h3>
      </div>
      <div className="divide-y divide-gray-100">
        {activities.slice(0, 5).map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={activity.id}
              className="p-4 flex items-center gap-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{activity.message}</p>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatTimestamp(activity.timestamp)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
