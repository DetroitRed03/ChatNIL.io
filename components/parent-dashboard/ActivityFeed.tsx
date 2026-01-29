'use client';

interface Activity {
  id: string;
  childId: string;
  childName: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  childName: string;
  onViewAll?: () => void;
}

export function ActivityFeed({ activities, childName, onViewAll }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'chapter_started': return '📚';
      case 'chapter_completed': return '🎉';
      case 'question_answered': return '✍️';
      case 'badge_earned': return '🏆';
      case 'streak_milestone': return '🔥';
      case 'daily_challenge': return '💬';
      case 'login': return '👋';
      case 'profile_updated': return '📝';
      case 'parent_approved': return '✅';
      default: return '📌';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Group activities by day
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const getDayLabel = (dateStr: string) => {
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          📋 Recent Activity
        </h3>
        {activities.length > 5 && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-purple-600 font-medium hover:text-purple-700"
          >
            View All →
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400">
            {childName.split(' ')[0]}&apos;s activity will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedActivities).slice(0, 3).map(([date, dayActivities]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {getDayLabel(date)}
              </p>
              <div className="space-y-3">
                {dayActivities.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <span className="text-xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{activity.title}</p>
                      {activity.description && (
                        <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;
