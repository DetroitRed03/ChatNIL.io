'use client';

interface ThisWeekCardProps {
  submitted: number;
  reviewed: number;
  pending: number;
  pastDeadline: number;
  avgReviewTime: number;
}

export function ThisWeekCard({
  submitted,
  reviewed,
  pending,
  pastDeadline,
  avgReviewTime
}: ThisWeekCardProps) {
  const hasPastDeadline = pastDeadline > 0;
  const hasPendingWarning = pending > 5;

  return (
    <div
      data-testid="this-week-card"
      className={`bg-white rounded-lg shadow-sm p-6 border ${
        hasPastDeadline ? 'border-red-300' : 'border-gray-200'
      }`}
    >
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
        This Week
      </h3>

      {/* Stats List */}
      <div className="space-y-3 mb-4">
        {/* Submitted */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Deals submitted</span>
          <span className="text-sm font-semibold text-gray-900">{submitted}</span>
        </div>

        {/* Reviewed */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Reviewed</span>
          <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
            {reviewed}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </div>

        {/* Pending */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Pending review</span>
          <span className={`text-sm font-semibold ${
            hasPendingWarning ? 'text-yellow-600' : 'text-gray-900'
          }`}>
            {pending}
            {hasPendingWarning && (
              <span className="ml-1 text-yellow-500">!</span>
            )}
          </span>
        </div>

        {/* Past Deadline */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Past deadline</span>
          <span className={`text-sm font-semibold ${
            hasPastDeadline ? 'text-red-600' : 'text-green-600'
          }`}>
            {pastDeadline}
            {!hasPastDeadline && (
              <svg className="w-4 h-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Avg review time</span>
          <span className="text-sm font-medium text-gray-700">
            {avgReviewTime.toFixed(1)} days
          </span>
        </div>
      </div>
    </div>
  );
}
