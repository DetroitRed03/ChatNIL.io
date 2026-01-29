'use client';

interface AuditReadinessCardProps {
  documented: number;
  missedDeadlines: number;
  overridesLogged: number;
  onGeneratePackage: () => void;
}

export function AuditReadinessCard({
  documented,
  missedDeadlines,
  overridesLogged,
  onGeneratePackage
}: AuditReadinessCardProps) {
  const hasMissedDeadlines = missedDeadlines > 0;
  const allGreen = !hasMissedDeadlines;

  return (
    <div
      data-testid="audit-readiness-card"
      className={`bg-white rounded-lg shadow-sm p-6 border ${
        hasMissedDeadlines ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
      } ${allGreen ? 'bg-green-50/30' : ''}`}
    >
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Audit Readiness
      </h3>

      {/* Checklist */}
      <div className="space-y-3 mb-5">
        {/* Documented */}
        <div className="flex items-center gap-2">
          <span className="text-green-500 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-sm text-gray-700">
            <span className="font-medium">{documented.toLocaleString()}</span> deals documented
          </span>
        </div>

        {/* Missed Deadlines */}
        <div className="flex items-center gap-2">
          {hasMissedDeadlines ? (
            <span className="text-red-500 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          ) : (
            <span className="text-green-500 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
          <span className={`text-sm ${hasMissedDeadlines ? 'text-red-700' : 'text-gray-700'}`}>
            <span className="font-medium">{missedDeadlines}</span> missed deadlines
          </span>
        </div>

        {/* Overrides Logged */}
        <div className="flex items-center gap-2">
          <span className="text-green-500 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-sm text-gray-700">
            <span className="font-medium">{overridesLogged}</span> overrides logged
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onGeneratePackage}
        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
      >
        Generate Audit Package
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
