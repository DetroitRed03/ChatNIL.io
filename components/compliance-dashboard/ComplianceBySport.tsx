'use client';

import { SportComplianceRow } from './SportComplianceRow';

interface SportCompliance {
  sport: string;
  totalAthletes: number;
  compliancePercentage: number;
  redCount: number;
  yellowCount: number;
}

interface ComplianceBySportProps {
  sports: SportCompliance[];
  onViewAll: () => void;
  onSportClick: (sport: string) => void;
}

export function ComplianceBySport({
  sports,
  onViewAll,
  onSportClick
}: ComplianceBySportProps) {
  const displaySports = sports.slice(0, 5);
  const hasMore = sports.length > 5;

  return (
    <div
      data-testid="compliance-by-sport"
      className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Compliance by Sport
        </h3>
        {hasMore && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View all {sports.length} sports
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Sports List */}
      {displaySports.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">No sports data available</p>
      ) : (
        <div className="space-y-3">
          {displaySports.map((sport) => (
            <SportComplianceRow
              key={sport.sport}
              sport={sport.sport}
              percentage={sport.compliancePercentage}
              hasAlert={sport.compliancePercentage < 80}
              onClick={() => onSportClick(sport.sport)}
            />
          ))}
        </div>
      )}

      {/* Footer note */}
      {displaySports.length > 0 && (
        <p className="text-xs text-gray-400 mt-4">
          Sorted by lowest compliance %
        </p>
      )}
    </div>
  );
}
