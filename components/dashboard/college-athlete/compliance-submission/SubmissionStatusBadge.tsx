'use client';

type SubmissionStatus =
  | 'not_submitted'
  | 'pending_review'
  | 'approved'
  | 'needs_revision'
  | 'rejected'
  | 'response_submitted'
  | 'conditions_completed';

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function SubmissionStatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className = ''
}: SubmissionStatusBadgeProps) {
  const statusConfig: Record<SubmissionStatus, {
    label: string;
    friendlyLabel: string;
    bg: string;
    text: string;
    icon: React.ReactNode;
    description: string;
  }> = {
    not_submitted: {
      label: 'Not Submitted',
      friendlyLabel: 'Needs to be reported',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      description: 'This deal hasn\'t been reported to your school yet'
    },
    pending_review: {
      label: 'Pending Review',
      friendlyLabel: 'Waiting on school',
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Your school is reviewing this deal'
    },
    approved: {
      label: 'Approved',
      friendlyLabel: 'All good!',
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      description: 'Your school has approved this deal'
    },
    needs_revision: {
      label: 'Needs Revision',
      friendlyLabel: 'School needs more info',
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      description: 'Your school needs you to update something'
    },
    rejected: {
      label: 'Rejected',
      friendlyLabel: 'Not approved',
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      description: 'This deal was not approved by your school'
    },
    response_submitted: {
      label: 'Response Submitted',
      friendlyLabel: 'Awaiting re-review',
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'You responded to the info request. Your school will re-review this deal.'
    },
    conditions_completed: {
      label: 'Conditions Submitted',
      friendlyLabel: 'Awaiting final approval',
      bg: 'bg-teal-100',
      text: 'text-teal-700',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'You completed the conditions. Your school will grant final approval.'
    }
  };

  const config = statusConfig[status];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${config.bg} ${config.text} ${sizeClasses[size]}
        ${className}
      `}
      title={config.description}
    >
      {showIcon && (
        <span className={iconSizes[size]}>
          {config.icon}
        </span>
      )}
      {config.friendlyLabel}
    </span>
  );
}

// Export for use in other components
export type { SubmissionStatus };
