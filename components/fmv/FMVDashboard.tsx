'use client';

import { useEffect, useState } from 'react';
import { AthleteFMVData } from '@/types';
import { TierBadge } from './TierBadge';
import { ScoreBreakdownChart } from './ScoreBreakdownChart';
import { ImprovementSuggestionCard } from './ImprovementSuggestionCard';
import { DealValueEstimator } from './DealValueEstimator';
import { ScoreHistoryChart } from './ScoreHistoryChart';
import { ComparableAthletesList } from './ComparableAthletesList';
import { Eye, EyeOff, RefreshCw, TrendingUp, Award, Target, DollarSign, Users } from 'lucide-react';

interface FMVDashboardProps {
  userId?: string; // Optional - defaults to current user
}

export function FMVDashboard({ userId }: FMVDashboardProps) {
  const [fmvData, setFmvData] = useState<AthleteFMVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  // Meta data from API
  const [isStale, setIsStale] = useState(false);
  const [daysSinceCalculation, setDaysSinceCalculation] = useState(0);
  const [remainingCalculations, setRemainingCalculations] = useState(3);
  const [isOwnData, setIsOwnData] = useState(true);

  useEffect(() => {
    fetchFMVData();
  }, [userId]);

  const fetchFMVData = async () => {
    try {
      setLoading(true);
      const url = userId ? `/api/fmv?athlete_id=${userId}` : '/api/fmv';
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch FMV data');
      }

      setFmvData(data.fmv);
      setIsStale(data.meta?.is_stale || false);
      setDaysSinceCalculation(data.meta?.days_since_calculation || 0);
      setRemainingCalculations(data.meta?.remaining_calculations_today || 3);
      setIsOwnData(data.meta?.is_own_data ?? true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FMV data');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (remainingCalculations <= 0) {
      alert('You have used all 3 FMV calculations for today. Your limit will reset at midnight UTC.');
      return;
    }

    if (!confirm('Recalculate your FMV score? This will use one of your daily calculations.')) {
      return;
    }

    try {
      setRecalculating(true);
      const response = await fetch('/api/fmv/recalculate', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to recalculate FMV');
      }

      // Show notifications if any
      if (data.notifications && data.notifications.length > 0) {
        data.notifications.forEach((notification: any) => {
          alert(`${notification.title}\n${notification.message}`);
        });
      }

      // Show suggestions if any
      if (data.suggestions && data.suggestions.length > 0) {
        data.suggestions.forEach((suggestion: any) => {
          console.log(`💡 ${suggestion.title}: ${suggestion.message}`);
        });
      }

      // Refresh data
      await fetchFMVData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to recalculate FMV');
    } finally {
      setRecalculating(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!fmvData) return;

    const newVisibility = !fmvData.is_public_score;
    const confirmMessage = newVisibility
      ? 'Make your FMV score public? Other athletes and businesses will be able to see your score.'
      : 'Make your FMV score private? Your score will be hidden from other users.';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setTogglingVisibility(true);
      const response = await fetch('/api/fmv/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: newVisibility }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update visibility');
      }

      // Update local state
      setFmvData({ ...fmvData, is_public_score: newVisibility });
      alert(data.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update visibility');
    } finally {
      setTogglingVisibility(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your FMV data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button
          onClick={fetchFMVData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!fmvData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No FMV Score Yet</h3>
        <p className="text-gray-600 mb-4">
          Calculate your Fair Market Value score to understand your NIL potential.
        </p>
        <button
          onClick={handleRecalculate}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Calculate My FMV Score
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your FMV Score</h2>
            <p className="text-blue-100">Fair Market Value Assessment</p>
          </div>
          <TierBadge tier={fmvData.fmv_tier} size="large" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Main Score */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Overall Score</span>
            </div>
            <div className="text-4xl font-bold">{fmvData.fmv_score}</div>
            <div className="text-sm text-blue-100">out of 100</div>
          </div>

          {/* Percentile Rank */}
          {fmvData.percentile_rank !== null && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium">Percentile Rank</span>
              </div>
              <div className="text-4xl font-bold">{fmvData.percentile_rank}%</div>
              <div className="text-sm text-blue-100">in your sport</div>
            </div>
          )}

          {/* Last Calculated */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm font-medium">Last Updated</span>
            </div>
            <div className="text-2xl font-bold">{daysSinceCalculation} days ago</div>
            <div className="text-sm text-blue-100">
              {remainingCalculations} calculation{remainingCalculations !== 1 ? 's' : ''} left today
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isOwnData && (
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleRecalculate}
              disabled={recalculating || remainingCalculations <= 0}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
              {recalculating ? 'Recalculating...' : 'Recalculate Score'}
            </button>

            <button
              onClick={handleToggleVisibility}
              disabled={togglingVisibility}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg hover:bg-white/20 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fmvData.is_public_score ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Make Private
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Make Public
                </>
              )}
            </button>
          </div>
        )}

        {/* Stale Warning */}
        {isStale && isOwnData && (
          <div className="mt-4 bg-yellow-500/20 backdrop-blur-sm border border-yellow-300/30 rounded-lg p-3 flex items-center gap-3">
            <Target className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Your score may be outdated.</strong> Recalculate to reflect your latest achievements.
            </div>
          </div>
        )}
      </div>

      {/* Score Breakdown Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Score Breakdown
        </h3>
        <ScoreBreakdownChart
          social={fmvData.social_score}
          athletic={fmvData.athletic_score}
          market={fmvData.market_score}
          brand={fmvData.brand_score}
        />
      </div>

      {/* Improvement Suggestions */}
      {fmvData.improvement_suggestions && fmvData.improvement_suggestions.length > 0 && isOwnData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            How to Improve Your Score
          </h3>
          <div className="space-y-4">
            {fmvData.improvement_suggestions.slice(0, 5).map((suggestion, index) => (
              <ImprovementSuggestionCard key={index} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {/* Deal Value Estimates */}
      {(fmvData as any).estimated_deal_values && isOwnData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Estimated Deal Values
          </h3>
          <DealValueEstimator estimates={(fmvData as any).estimated_deal_values} />
        </div>
      )}

      {/* Score History */}
      {fmvData.score_history && fmvData.score_history.length > 1 && isOwnData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Score History
          </h3>
          <ScoreHistoryChart history={fmvData.score_history} />
        </div>
      )}

      {/* Comparable Athletes */}
      {fmvData.is_public_score && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Athletes with Similar Scores
          </h3>
          <ComparableAthletesList athleteId={userId} currentScore={fmvData.fmv_score} />
        </div>
      )}
    </div>
  );
}
