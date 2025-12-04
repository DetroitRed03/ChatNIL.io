'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Building, Star, TrendingUp, FileText, Eye, ThumbsUp, ThumbsDown, RotateCcw, Clock } from 'lucide-react';
import { canReconsider, getReconsiderTimeRemaining } from '@/lib/reconsider-utils';

interface OpportunityCardProps {
  opportunity: {
    id: string;
    agency_id: string;
    athlete_id: string;
    match_score: number;
    match_tier?: string;
    match_reasons?: string[];
    score_breakdown?: Record<string, number>;
    status: string;
    contacted_at?: string;
    created_at: string;
    deal_id?: string;
    athlete_response_status?: string;
    responded_at?: string;
    response_history?: any[];
    agency_name?: string;
    agency_email?: string;
    agency_first_name?: string;
    agency_last_name?: string;
  };
  onViewDetails: () => void;
  onRespond?: (response: 'interested' | 'declined') => void;
  onReconsider?: () => void;
}

export function OpportunityCard({ opportunity, onViewDetails, onRespond, onReconsider }: OpportunityCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Check if reconsider is available for declined opportunities
  const isDeclined = opportunity.status === 'rejected';
  const canReconsiderMatch = isDeclined && canReconsider(opportunity.responded_at);
  const timeRemaining = isDeclined ? getReconsiderTimeRemaining(opportunity.responded_at) : null;
  const hasAlreadyReconsidered = opportunity.response_history?.some(h => h.status === 'reconsidered');

  // Get agency display name
  const agencyName = opportunity.agency_name ||
    (opportunity.agency_first_name && opportunity.agency_last_name
      ? `${opportunity.agency_first_name} ${opportunity.agency_last_name}`.trim()
      : 'Agency');

  // Get match tier configuration
  const tierConfig = {
    excellent: {
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-800',
      badgeBg: 'bg-purple-100',
      emoji: '🌟'
    },
    strong: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-800',
      badgeBg: 'bg-blue-100',
      emoji: '⭐'
    },
    good: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-800',
      badgeBg: 'bg-green-100',
      emoji: '✅'
    },
    potential: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-800',
      badgeBg: 'bg-yellow-100',
      emoji: '💡'
    }
  };

  const tier = (opportunity.match_tier || 'potential') as keyof typeof tierConfig;
  const config = tierConfig[tier] || tierConfig.potential;

  // Get match score color
  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'text-purple-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 65) return 'text-green-600';
    return 'text-yellow-600';
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interested':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partnered':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canRespond = ['pending', 'contacted'].includes(opportunity.status) && !opportunity.athlete_response_status;

  return (
    <div className={`flex flex-col h-full rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-5 hover:shadow-lg transition-all`}>
      {/* Header: Agency & Match Score */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate">{agencyName}</h3>
            <p className="text-xs text-gray-600 truncate">{opportunity.agency_email}</p>
          </div>
        </div>

        {/* Match Score */}
        <div className="text-right flex-shrink-0">
          <div className={`text-2xl font-bold ${getMatchScoreColor(opportunity.match_score)}`}>
            {opportunity.match_score}
          </div>
          <div className="text-[10px] text-gray-500">Match Score</div>
        </div>
      </div>

      {/* Tier & Status Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${config.badgeBg} ${config.textColor}`}>
          <span>{config.emoji}</span>
          <span className="capitalize">{tier} Match</span>
        </span>
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusBadgeColor(opportunity.status)}`}>
          {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
        </span>
        {opportunity.deal_id && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-teal-100 text-teal-800 border border-teal-200">
            <FileText className="h-3 w-3" />
            Deal
          </span>
        )}
      </div>

      {/* Match Reasons - grow to fill space */}
      <div className="flex-1 mb-3">
        {opportunity.match_reasons && opportunity.match_reasons.length > 0 && (
          <>
            <p className="text-[10px] font-medium text-gray-600 mb-1.5">Why you're a great fit:</p>
            <div className="space-y-1">
              {opportunity.match_reasons.slice(0, 3).map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 text-xs text-gray-700"
                >
                  <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                  <span className="line-clamp-1">{reason}</span>
                </div>
              ))}
              {opportunity.match_reasons.length > 3 && (
                <span className="text-[10px] text-gray-500">
                  +{opportunity.match_reasons.length - 3} more
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Action Buttons - at bottom */}
      <div className="space-y-2 mt-auto">
        {canRespond && onRespond && (
          <div className="flex gap-2">
            <button
              onClick={() => onRespond('declined')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              Pass
            </button>
            <button
              onClick={() => onRespond('interested')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Interested
            </button>
          </div>
        )}

        {opportunity.status === 'interested' && !opportunity.deal_id && (
          <div className="text-center text-xs text-green-700 py-2 bg-green-100 border border-green-200 rounded-lg font-medium">
            You expressed interest - agency will reach out!
          </div>
        )}

        {/* Declined Status with Reconsider Option */}
        {isDeclined && (
          <div className="space-y-1.5">
            {/* Declined message */}
            <div className="text-center text-xs text-red-700 py-1.5 bg-red-100 border border-red-200 rounded-lg font-medium">
              You declined this opportunity
            </div>

            {/* Reconsider section */}
            {canReconsiderMatch && !hasAlreadyReconsidered && onReconsider && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Clock className="h-3.5 w-3.5 text-orange-600 flex-shrink-0" />
                    <span className="text-xs text-orange-800 truncate">
                      {timeRemaining?.formatted || 'Time limited'}
                    </span>
                  </div>
                  <button
                    onClick={onReconsider}
                    className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded hover:bg-orange-600 transition-colors flex-shrink-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Undo
                  </button>
                </div>
              </div>
            )}

            {/* Window expired or already reconsidered message */}
            {isDeclined && !canReconsiderMatch && !hasAlreadyReconsidered && timeRemaining?.expired && (
              <div className="text-center text-[10px] text-gray-500">
                Reconsider window expired
              </div>
            )}

            {hasAlreadyReconsidered && (
              <div className="text-center text-[10px] text-gray-500">
                Already reconsidered once
              </div>
            )}
          </div>
        )}

        {/* View Details Button */}
        <button
          onClick={onViewDetails}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </button>
      </div>

      {/* Score Breakdown Toggle */}
      {opportunity.score_breakdown && Object.keys(opportunity.score_breakdown).length > 0 && (
        <>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full mt-2 text-[10px] text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 py-1 hover:bg-white hover:bg-opacity-40 rounded transition-colors"
          >
            <TrendingUp className="h-2.5 w-2.5" />
            <span>{showBreakdown ? 'Hide' : 'Show'} breakdown</span>
            {showBreakdown ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
          </button>

          {/* Score Breakdown Panel */}
          {showBreakdown && (
            <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
              {Object.entries(opportunity.score_breakdown).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          value >= 8 ? 'bg-green-500' : value >= 5 ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${(value / 10) * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold w-6 text-right">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
