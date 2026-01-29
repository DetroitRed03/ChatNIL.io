'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AppealReviewModal } from './AppealReviewModal';

interface Appeal {
  id: string;
  dealId: string;
  dealTitle: string;
  amount: number;
  athleteId: string;
  athleteName: string;
  sport: string;
  originalDecision: string;
  originalDecisionAt: string;
  appealReason: string;
  appealDocuments: string[];
  additionalContext?: string;
  submittedAt: string;
  status: string;
  daysOpen: number;
}

interface AppealsSummary {
  total: number;
  submitted: number;
  underReview: number;
}

interface AppealsQueueTabProps {
  onRefreshDashboard: () => void;
}

export function AppealsQueueTab({ onRefreshDashboard }: AppealsQueueTabProps) {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [summary, setSummary] = useState<AppealsSummary>({ total: 0, submitted: 0, underReview: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const fetchAppeals = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      const response = await fetch('/api/compliance/appeals', {
        credentials: 'include',
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appeals');
      }

      const data = await response.json();
      setAppeals(data.appeals);
      setSummary(data.summary);
    } catch (err) {
      console.error('Error fetching appeals:', err);
      setError('Failed to load appeals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppeals();
  }, [fetchAppeals]);

  const handleReviewAppeal = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setShowReviewModal(true);
  };

  const handleAppealResolved = () => {
    setShowReviewModal(false);
    setSelectedAppeal(null);
    fetchAppeals();
    onRefreshDashboard();
  };

  const getDecisionBadge = (decision: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
      approved_with_conditions: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Conditional' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
    };
    const badge = badges[decision] || { bg: 'bg-gray-100', text: 'text-gray-700', label: decision };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getUrgencyBadge = (daysOpen: number) => {
    if (daysOpen >= 7) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          {daysOpen} days - Urgent
        </span>
      );
    }
    if (daysOpen >= 3) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          {daysOpen} days
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        {daysOpen} day{daysOpen !== 1 ? 's' : ''}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && appeals.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => fetchAppeals()}
          className="mt-4 px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Pending</p>
          <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">New Submissions</p>
          <p className="text-2xl font-bold text-orange-600">{summary.submitted}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Under Review</p>
          <p className="text-2xl font-bold text-blue-600">{summary.underReview}</p>
        </div>
      </div>

      {/* Appeals List */}
      {appeals.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Pending Appeals</h3>
          <p className="text-sm text-gray-500">
            All athlete appeals have been reviewed. Check back later for new submissions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appeals.map((appeal) => (
            <div
              key={appeal.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-orange-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">{appeal.athleteName}</h3>
                    <span className="text-sm text-gray-500">{appeal.sport}</span>
                    {getUrgencyBadge(appeal.daysOpen)}
                  </div>

                  {/* Deal info */}
                  <div className="flex items-center gap-4 mb-3">
                    <p className="text-sm text-gray-600 truncate max-w-[300px]" title={appeal.dealTitle}>
                      {appeal.dealTitle}
                    </p>
                    <span className="text-sm font-medium text-gray-900">
                      {formatAmount(appeal.amount)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Original:</span>
                      {getDecisionBadge(appeal.originalDecision)}
                    </div>
                  </div>

                  {/* Appeal reason preview */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Appeal Reason:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {appeal.appealReason}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Submitted {formatDate(appeal.submittedAt)}</span>
                    {appeal.appealDocuments.length > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {appeal.appealDocuments.length} attachment{appeal.appealDocuments.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full ${
                      appeal.status === 'under_review'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {appeal.status === 'under_review' ? 'Under Review' : 'New'}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => handleReviewAppeal(appeal)}
                  className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors shrink-0"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedAppeal && (
        <AppealReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedAppeal(null);
          }}
          appeal={selectedAppeal}
          onResolved={handleAppealResolved}
        />
      )}
    </div>
  );
}
