'use client';

interface SportComplianceRowProps {
  sport: string;
  percentage: number;
  hasAlert: boolean;
  onClick: () => void;
}

export function SportComplianceRow({
  sport,
  percentage,
  hasAlert,
  onClick
}: SportComplianceRowProps) {
  const getBarColor = (pct: number) => {
    if (pct >= 90) return 'bg-green-500';
    if (pct >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBarBgColor = (pct: number) => {
    if (pct >= 90) return 'bg-green-100';
    if (pct >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <button
      data-testid={`sport-row-${sport.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className="w-full flex items-center gap-4 py-2 hover:bg-gray-50 rounded-lg transition-colors -mx-2 px-2 group"
    >
      {/* Sport Name with Alert */}
      <div className="flex items-center gap-2 w-28 flex-shrink-0">
        {hasAlert && (
          <span className="text-yellow-500 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
        )}
        <span className="text-sm font-medium text-gray-900 truncate">{sport}</span>
      </div>

      {/* Progress Bar */}
      <div className={`flex-1 h-2 rounded-full ${getBarBgColor(percentage)}`}>
        <div
          className={`h-full rounded-full ${getBarColor(percentage)} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Percentage */}
      <span className={`text-sm font-semibold w-12 text-right ${
        percentage >= 90 ? 'text-green-600' :
        percentage >= 70 ? 'text-yellow-600' :
        'text-red-600'
      }`}>
        {percentage}%
      </span>

      {/* Arrow on hover */}
      <svg
        className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
