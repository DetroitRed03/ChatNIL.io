'use client';

import { useState, useCallback } from 'react';

interface AthletePreview {
  id: string;
  name: string;
  status: 'green' | 'yellow' | 'red';
  pendingDeals: number;
}

interface SportData {
  sport: string;
  totalAthletes: number;
  compliancePercentage: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  pendingReviews: number;
  athletes?: AthletePreview[];
}

interface ComplianceBySportV2Props {
  sports: SportData[];
  onSportClick: (sport: string) => void;
  onAthleteClick: (athleteId: string) => void;
  onViewAll: () => void;
}

export function ComplianceBySportV2({
  sports,
  onSportClick,
  onAthleteClick,
  onViewAll
}: ComplianceBySportV2Props) {
  const [expandedSport, setExpandedSport] = useState<string | null>(null);

  const handleSportToggle = useCallback((sport: string) => {
    setExpandedSport(prev => prev === sport ? null : sport);
  }, []);

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
    }
  };

  const getSportIcon = (sport: string) => {
    const sportLower = sport.toLowerCase();
    if (sportLower.includes('football')) return '🏈';
    if (sportLower.includes('basketball')) return '🏀';
    if (sportLower.includes('baseball')) return '⚾';
    if (sportLower.includes('soccer')) return '⚽';
    if (sportLower.includes('volleyball')) return '🏐';
    if (sportLower.includes('tennis')) return '🎾';
    if (sportLower.includes('golf')) return '⛳';
    if (sportLower.includes('swimming')) return '🏊';
    if (sportLower.includes('track') || sportLower.includes('field')) return '🏃';
    if (sportLower.includes('softball')) return '🥎';
    if (sportLower.includes('lacrosse')) return '🥍';
    if (sportLower.includes('hockey')) return '🏒';
    return '🏆';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" data-testid="compliance-by-sport-v2">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Compliance by Sport</h3>
            <p className="text-xs text-gray-500">{sports.length} sports</p>
          </div>
        </div>
        <button
          onClick={onViewAll}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          View All
        </button>
      </div>

      {/* Sports List */}
      <div className="divide-y divide-gray-100">
        {sports.map(sport => (
          <div key={sport.sport}>
            {/* Sport Row */}
            <button
              onClick={() => handleSportToggle(sport.sport)}
              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {/* Sport Icon */}
                <span className="text-2xl">{getSportIcon(sport.sport)}</span>

                {/* Sport Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-900">{sport.sport}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getComplianceColor(sport.compliancePercentage)}`}>
                      {sport.compliancePercentage}%
                    </span>
                  </div>

                  {/* Status Bar */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      {sport.greenCount > 0 && (
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${(sport.greenCount / sport.totalAthletes) * 100}%` }}
                        />
                      )}
                      {sport.yellowCount > 0 && (
                        <div
                          className="h-full bg-yellow-500"
                          style={{ width: `${(sport.yellowCount / sport.totalAthletes) * 100}%` }}
                        />
                      )}
                      {sport.redCount > 0 && (
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${(sport.redCount / sport.totalAthletes) * 100}%` }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums">{sport.totalAthletes}</span>
                  </div>
                </div>

                {/* Expand Arrow */}
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedSport === sport.sport ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Status Counts */}
              <div className="flex items-center gap-4 mt-2 ml-11 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-600">{sport.greenCount} clear</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-gray-600">{sport.yellowCount} warning</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-gray-600">{sport.redCount} critical</span>
                </span>
                {sport.pendingReviews > 0 && (
                  <span className="text-orange-600 font-medium">
                    {sport.pendingReviews} pending
                  </span>
                )}
              </div>
            </button>

            {/* Expanded Athlete List */}
            {expandedSport === sport.sport && sport.athletes && (
              <div className="bg-gray-50 border-t border-gray-100">
                <div className="px-4 py-2 max-h-64 overflow-y-auto">
                  {sport.athletes.map(athlete => (
                    <button
                      key={athlete.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAthleteClick(athlete.id);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white transition-colors text-left"
                    >
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(athlete.status)}`} />
                      <span className="flex-grow text-sm text-gray-700">{athlete.name}</span>
                      {athlete.pendingDeals > 0 && (
                        <span className="text-xs text-orange-600 font-medium">
                          {athlete.pendingDeals} pending
                        </span>
                      )}
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSportClick(sport.sport);
                  }}
                  className="w-full px-4 py-2 text-sm text-orange-600 hover:text-orange-700 font-medium border-t border-gray-200 hover:bg-white transition-colors"
                >
                  View all {sport.sport} athletes →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
