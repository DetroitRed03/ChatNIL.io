'use client';

interface SubmissionDeadlineCountdownProps {
  dueDate: string;
  state: string; // For showing state-specific rules (e.g., "California 7-day rule")
  className?: string;
}

export function SubmissionDeadlineCountdown({
  dueDate,
  state,
  className = ''
}: SubmissionDeadlineCountdownProps) {
  const deadline = new Date(dueDate);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  const isOverdue = diffMs < 0;
  const isUrgent = diffDays <= 2 && !isOverdue;
  const isDueSoon = diffDays <= 5 && diffDays > 2;

  // State-specific rules
  const stateRules: Record<string, { days: number; rule: string }> = {
    'California': { days: 7, rule: 'California 7-Day Rule' },
    'Texas': { days: 7, rule: 'Texas 7-Day Rule' },
    'Florida': { days: 10, rule: 'Florida 10-Day Rule' },
    // Add more states as needed
  };

  const stateRule = stateRules[state];

  const getStatusConfig = () => {
    if (isOverdue) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: 'text-red-500',
        label: 'OVERDUE',
        labelBg: 'bg-red-100',
        pulse: true
      };
    }
    if (isUrgent) {
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        icon: 'text-orange-500',
        label: 'URGENT',
        labelBg: 'bg-orange-100',
        pulse: true
      };
    }
    if (isDueSoon) {
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: 'text-amber-500',
        label: 'DUE SOON',
        labelBg: 'bg-amber-100',
        pulse: false
      };
    }
    return {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-600',
      icon: 'text-gray-400',
      label: 'UPCOMING',
      labelBg: 'bg-gray-100',
      pulse: false
    };
  };

  const config = getStatusConfig();

  const formatTimeRemaining = () => {
    if (isOverdue) {
      const overdueDays = Math.abs(diffDays);
      return overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`;
    }
    if (diffDays === 0) {
      return diffHours <= 1 ? 'Due in 1 hour!' : `Due in ${diffHours} hours`;
    }
    if (diffDays === 1) {
      return 'Due tomorrow';
    }
    return `${diffDays} days left`;
  };

  return (
    <div className={`rounded-xl border-2 ${config.bg} ${config.border} p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Clock Icon */}
          <div className={`relative ${config.pulse ? 'animate-pulse' : ''}`}>
            <svg className={`w-8 h-8 ${config.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${config.text}`}>
                {formatTimeRemaining()}
              </span>
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${config.labelBg} ${config.text}`}>
                {config.label}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-0.5">
              Deadline: {deadline.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* State Rule Badge */}
        {stateRule && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg">
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium text-blue-700">{stateRule.rule}</span>
          </div>
        )}
      </div>

      {/* Explanation */}
      {stateRule && (
        <p className="text-xs text-gray-500 mt-3 pl-11">
          {state} requires all NIL deals to be reported to your school within {stateRule.days} days of signing.
        </p>
      )}

      {/* Progress Bar */}
      {!isOverdue && (
        <div className="mt-3 pl-11">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isUrgent ? 'bg-orange-500' : isDueSoon ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.max(0, Math.min(100, 100 - (diffDays / 7) * 100))}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
