'use client';

import { useEffect, useState } from 'react';
import { TierBadge } from './TierBadge';
import { ScoreBreakdownCompact } from './ScoreBreakdownChart';
import { Users, Filter, TrendingUp, TrendingDown } from 'lucide-react';

interface ComparableAthlete {
  athlete_id: string;
  athlete_name: string;
  fmv_score: number;
  fmv_tier: string;
  score_breakdown: {
    social_score: number;
    athletic_score: number;
    market_score: number;
    brand_score: number;
  };
  percentile_rank: number | null;
  sport: string;
  school: string;
  state: string;
  graduation_year: number;
  total_followers: number;
  profile_image_url: string | null;
  score_difference: number;
}

interface ComparableAthletesListProps {
  athleteId?: string;
  currentScore: number;
}

export function ComparableAthletesList({ athleteId, currentScore }: ComparableAthletesListProps) {
  const [comparables, setComparables] = useState<ComparableAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sportFilter, setSportFilter] = useState(false);
  const [levelFilter, setLevelFilter] = useState(false);

  useEffect(() => {
    fetchComparables();
  }, [athleteId, sportFilter, levelFilter]);

  const fetchComparables = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(athleteId && { athlete_id: athleteId }),
        sport_filter: sportFilter.toString(),
        level_filter: levelFilter.toString(),
        limit: '10',
      });

      const response = await fetch(`/api/fmv/comparables?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comparable athletes');
      }

      setComparables(data.comparables || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparable athletes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600">Finding similar athletes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (comparables.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 mb-2">No comparable athletes found</p>
        <p className="text-sm text-gray-500">
          Try adjusting your filters or make your score public to appear in others' searches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sportFilter}
            onChange={(e) => setSportFilter(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Same Sport</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={levelFilter}
            onChange={(e) => setLevelFilter(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Same Level</span>
        </label>
        <div className="ml-auto text-sm text-gray-600">
          {comparables.length} athlete{comparables.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Athletes List */}
      <div className="space-y-3">
        {comparables.map((athlete) => (
          <div
            key={athlete.athlete_id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-start gap-4">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {athlete.profile_image_url ? (
                  <img
                    src={athlete.profile_image_url}
                    alt={athlete.athlete_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Athlete Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{athlete.athlete_name}</h4>
                    <p className="text-sm text-gray-600 truncate">
                      {athlete.sport} • {athlete.school}
                    </p>
                    <p className="text-xs text-gray-500">
                      {athlete.state} • Class of {athlete.graduation_year}
                    </p>
                  </div>
                  <TierBadge tier={athlete.fmv_tier as any} size="small" />
                </div>

                {/* Score Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {/* FMV Score */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">FMV Score</span>
                      {athlete.score_difference !== 0 && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          athlete.score_difference > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {athlete.score_difference > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(athlete.score_difference)} pts
                        </div>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{athlete.fmv_score}</div>
                    {athlete.percentile_rank !== null && (
                      <div className="text-xs text-gray-500">{athlete.percentile_rank}th percentile</div>
                    )}
                  </div>

                  {/* Social Reach */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-2">Social Reach</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {athlete.total_followers >= 1000
                        ? `${(athlete.total_followers / 1000).toFixed(1)}K`
                        : athlete.total_followers}
                    </div>
                    <div className="text-xs text-gray-500">Total followers</div>
                  </div>
                </div>

                {/* Score Breakdown (Collapsible) */}
                <details className="mt-3">
                  <summary className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                    View Score Breakdown
                  </summary>
                  <div className="mt-3">
                    <ScoreBreakdownCompact
                      social={athlete.score_breakdown.social_score}
                      athletic={athlete.score_breakdown.athletic_score}
                      market={athlete.score_breakdown.market_score}
                      brand={athlete.score_breakdown.brand_score}
                    />
                  </div>
                </details>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
