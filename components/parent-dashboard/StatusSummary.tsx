'use client';

interface ActionItem {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
}

interface Child {
  id: string;
  name: string;
  status: string;
  lastActive: string;
  isOnline: boolean;
}

interface StatusSummaryProps {
  actionItems: ActionItem[];
  children: Child[];
}

export function StatusSummary({ actionItems, children }: StatusSummaryProps) {
  const urgentItems = actionItems.filter(a => a.priority === 'urgent');
  const highItems = actionItems.filter(a => a.priority === 'high');
  const pendingCount = urgentItems.length + highItems.length;

  // Check for inactive children (no activity in 7+ days)
  const inactiveChildren = children.filter(child => {
    const lastActive = new Date(child.lastActive);
    const daysSince = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= 7;
  });

  // Determine status
  const hasUrgent = urgentItems.length > 0;
  const hasHigh = highItems.length > 0;
  const hasInactive = inactiveChildren.length > 0;

  const getStatusConfig = () => {
    if (hasUrgent) {
      return {
        icon: '⚠️',
        title: 'Needs Your Attention',
        description: `You have ${urgentItems.length} urgent item${urgentItems.length > 1 ? 's' : ''} to review.`,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800'
      };
    }
    if (hasHigh) {
      return {
        icon: '📋',
        title: 'Items to Review',
        description: `You have ${highItems.length} item${highItems.length > 1 ? 's' : ''} waiting for your review.`,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800'
      };
    }
    if (hasInactive) {
      return {
        icon: '💤',
        title: 'Check In',
        description: `${inactiveChildren[0].name.split(' ')[0]} hasn't been active in a while. Maybe send some encouragement?`,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800'
      };
    }
    return {
      icon: '✅',
      title: 'All Good!',
      description: 'Everything is on track. No items need your attention right now.',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800'
    };
  };

  const status = getStatusConfig();

  return (
    <div className={`${status.bgColor} ${status.borderColor} border rounded-xl p-5`}>
      <div className="flex items-start gap-4">
        <div className="text-3xl">{status.icon}</div>
        <div className="flex-1">
          <h2 className={`text-lg font-bold ${status.textColor}`}>{status.title}</h2>
          <p className={`${status.textColor} opacity-80`}>{status.description}</p>

          {/* Action Items List (if any) */}
          {pendingCount > 0 && (
            <div className="mt-3 space-y-2">
              {[...urgentItems, ...highItems].slice(0, 3).map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className={item.priority === 'urgent' ? 'text-red-500' : 'text-yellow-500'}>
                      {item.priority === 'urgent' ? '🔴' : '🟡'}
                    </span>
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  <button className="text-sm text-purple-600 font-medium hover:text-purple-700">
                    Review →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action */}
        {pendingCount === 0 && children.some(c => c.isOnline) && (
          <div className="text-right">
            <div className="flex items-center gap-2 text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">
                {children.find(c => c.isOnline)?.name.split(' ')[0]} is online
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusSummary;
