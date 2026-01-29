'use client';

interface Issue {
  id: string;
  dimension: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  fixAction: {
    label: string;
    type: 'modal' | 'link' | 'upload' | 'confirm';
    url?: string;
  };
}

interface IssuesListProps {
  issues: Issue[];
  onFixClick: (issue: Issue) => void;
  className?: string;
}

export function IssuesList({
  issues,
  onFixClick,
  className = ''
}: IssuesListProps) {
  const severityConfig = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: 'bg-red-100 text-red-700',
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      badge: 'bg-amber-100 text-amber-700',
      button: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: 'bg-blue-100 text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };

  // Sort by severity (critical first)
  const sortedIssues = [...issues].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  if (issues.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-700">
        {issues.length} Issue{issues.length !== 1 ? 's' : ''} to Fix
      </h4>
      {sortedIssues.map((issue) => {
        const config = severityConfig[issue.severity];
        return (
          <div
            key={issue.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${config.bg} ${config.border}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {config.icon}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h5 className="font-medium text-gray-900 text-sm">
                    {issue.title}
                  </h5>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {issue.description}
                  </p>
                </div>
                <button
                  onClick={() => onFixClick(issue)}
                  className={`flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${config.button}`}
                >
                  {issue.fixAction.label}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
