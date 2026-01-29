'use client';

interface ActivityItem {
  id: string;
  type: 'deal_submitted' | 'deal_approved' | 'deal_flagged' | 'override_applied' | 'deadline_missed' | 'batch_approved';
  description: string;
  timestamp: string;
  athleteName?: string;
  dealName?: string;
}

interface ActivityFeedItemProps {
  activity: ActivityItem;
}

export function ActivityFeedItem({ activity }: ActivityFeedItemProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'deal_submitted':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'deal_approved':
      case 'batch_approved':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'deal_flagged':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'override_applied':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'deadline_missed':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getTextColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'deal_approved':
      case 'batch_approved':
        return 'text-green-700';
      case 'deal_flagged':
        return 'text-yellow-700';
      case 'deadline_missed':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div
      data-testid={`activity-${activity.id}`}
      className="flex items-start gap-3 py-2"
    >
      {/* Time */}
      <span className="text-xs text-gray-400 w-16 flex-shrink-0 pt-0.5">
        {formatTime(activity.timestamp)}
      </span>

      {/* Icon */}
      <span className="flex-shrink-0 pt-0.5">
        {getIcon(activity.type)}
      </span>

      {/* Description */}
      <p className={`text-sm ${getTextColor(activity.type)} flex-1`}>
        {activity.description}
      </p>
    </div>
  );
}
