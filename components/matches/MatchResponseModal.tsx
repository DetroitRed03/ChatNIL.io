'use client';

import { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Loader2, CheckCircle, TrendingUp, Star, Building } from 'lucide-react';

interface MatchResponseModalProps {
  opportunity: {
    id: string;
    agency_name?: string;
    agency_first_name?: string;
    agency_last_name?: string;
    match_score: number;
    match_tier?: string;
    match_reasons?: string[];
    score_breakdown?: Record<string, number>;
  };
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function MatchResponseModal({ opportunity, userId, onClose, onSuccess }: MatchResponseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [responseType, setResponseType] = useState<'interested' | 'declined' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get agency display name
  const agencyName = opportunity.agency_name ||
    (opportunity.agency_first_name && opportunity.agency_last_name
      ? `${opportunity.agency_first_name} ${opportunity.agency_last_name}`.trim()
      : 'this agency');

  // Get match tier configuration
  const tierConfig = {
    excellent: {
      textColor: 'text-purple-600',
      emoji: '🌟'
    },
    strong: {
      textColor: 'text-orange-600',
      emoji: '⭐'
    },
    good: {
      textColor: 'text-green-600',
      emoji: '✅'
    },
    potential: {
      textColor: 'text-yellow-600',
      emoji: '💡'
    }
  };

  const tier = (opportunity.match_tier || 'potential') as keyof typeof tierConfig;
  const config = tierConfig[tier] || tierConfig.potential;

  const handleRespond = async (response: 'interested' | 'declined') => {
    setIsSubmitting(true);
    setError(null);
    setResponseType(response);

    try {
      const res = await fetch(`/api/matches/${opportunity.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId,
        },
        credentials: 'include',
        body: JSON.stringify({ response }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit response');
      }

      // Show success message
      setShowSuccess(true);

      // Wait 2 seconds then close and call onSuccess
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error responding to match:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit response');
      setIsSubmitting(false);
    }
  };

  // Success State
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {responseType === 'interested' ? 'Response Submitted!' : 'Response Recorded'}
          </h3>
          <p className="text-gray-600">
            {responseType === 'interested'
              ? `${agencyName} will be notified of your interest and will reach out soon.`
              : 'Your response has been recorded. This opportunity will be moved to your declined list.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Opportunity Details</h2>
              <p className="text-sm text-gray-600">{agencyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Match Score */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 text-center">
            <div className="text-5xl font-bold text-orange-600 mb-2">
              {opportunity.match_score}
            </div>
            <div className="text-gray-600 mb-3">Match Score</div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-semibold">
              <span>{config.emoji}</span>
              <span className={`capitalize ${config.textColor}`}>{tier} Match</span>
            </div>
          </div>

          {/* Match Reasons */}
          {opportunity.match_reasons && opportunity.match_reasons.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Why you're a great fit:
              </h3>
              <div className="space-y-2">
                {opportunity.match_reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <Star className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score Breakdown */}
          {opportunity.score_breakdown && Object.keys(opportunity.score_breakdown).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Match Score Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(opportunity.score_breakdown).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 capitalize font-medium">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-gray-900 font-bold">{value}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          value >= 8
                            ? 'bg-green-500'
                            : value >= 5
                            ? 'bg-yellow-500'
                            : 'bg-gray-400'
                        }`}
                        style={{ width: `${(value / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-orange-900 mb-2">What happens next?</h4>
            <ul className="space-y-2 text-sm text-orange-800">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">•</span>
                <span>If you're interested, {agencyName} will be notified and can reach out directly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">•</span>
                <span>You can discuss potential partnership opportunities and compensation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">•</span>
                <span>If you're not interested, this opportunity will be moved to your declined list</span>
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={() => handleRespond('declined')}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && responseType === 'declined' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ThumbsDown className="h-5 w-5" />
            )}
            Not Interested
          </button>
          <button
            onClick={() => handleRespond('interested')}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && responseType === 'interested' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ThumbsUp className="h-5 w-5" />
            )}
            I'm Interested
          </button>
        </div>
      </div>
    </div>
  );
}
