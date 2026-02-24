'use client';

interface ReminderItemProps {
  reminder: {
    id: string;
    title: string;
    description?: string;
    reminderDate: string;
    reminderType: string;
    relatedDealId?: string;
  };
  onComplete: (id: string) => void;
  onDismiss: (id: string) => void;
}

const typeConfig: Record<string, { icon: string; color: string }> = {
  tax_payment: { icon: '💰', color: 'text-green-600' },
  deal_submission: { icon: '📄', color: 'text-blue-600' },
  deadline: { icon: '⏰', color: 'text-red-600' },
  custom: { icon: '🔔', color: 'text-orange-600' },
};

function getTimeStatus(dateStr: string): { label: string; className: string } {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`,
      className: 'text-red-600 font-medium',
    };
  }
  if (diffDays === 0) {
    return { label: 'Due today', className: 'text-amber-600 font-medium' };
  }
  if (diffDays === 1) {
    return { label: 'Tomorrow', className: 'text-amber-600' };
  }
  if (diffDays <= 7) {
    return { label: `In ${diffDays} days`, className: 'text-gray-600' };
  }
  return {
    label: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    className: 'text-gray-500',
  };
}

function getBorderStyle(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'border-red-200 bg-red-50';
  if (diffDays === 0) return 'border-amber-200 bg-amber-50';
  return 'border-gray-200 bg-white';
}

export function ReminderItem({ reminder, onComplete, onDismiss }: ReminderItemProps) {
  const config = typeConfig[reminder.reminderType] || typeConfig.custom;
  const timeStatus = getTimeStatus(reminder.reminderDate);
  const borderStyle = getBorderStyle(reminder.reminderDate);

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${borderStyle}`}>
      <span className="text-lg mt-0.5">{config.icon}</span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{reminder.title}</p>
        {reminder.description && (
          <p className="text-xs text-gray-500 mt-0.5">{reminder.description}</p>
        )}
        <p className={`text-xs mt-1 ${timeStatus.className}`}>{timeStatus.label}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onComplete(reminder.id)}
          className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
          title="Mark complete"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button
          onClick={() => onDismiss(reminder.id)}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
