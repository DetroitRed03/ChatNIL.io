'use client';

import { ActivityFeedItem } from './ActivityFeedItem';

interface ActivityItem {
  id: string;
  type: 'deal_submitted' | 'deal_approved' | 'deal_flagged' | 'override_applied' | 'deadline_missed' | 'batch_approved';
  description: string;
  timestamp: string;
  athleteName?: string;
  dealName?: string;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  onViewAll: () => void;
}

export function RecentActivityFeed({
  activities,
  onViewAll
}: RecentActivityFeedProps) {
  const displayActivities = activities.slice(0, 5);

  return (
    <div
      data-testid="recent-activity-feed"
      className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Recent Activity
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
        >
          View full log
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Activity List */}
      {displayActivities.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">No activity yet today</p>
          <p className="text-xs text-gray-400 mt-1">Deal submissions will appear here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {displayActivities.map((activity) => (
            <ActivityFeedItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
