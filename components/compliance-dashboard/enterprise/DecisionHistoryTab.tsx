'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DecisionHistoryCard } from '@/components/compliance/DecisionHistoryCard';
import type { DecisionRecord } from '@/components/compliance/DecisionHistoryCard';

export type { DecisionRecord };

interface DecisionHistoryTabProps {
  onViewDeal: (dealId: string) => void;
}

export function DecisionHistoryTab({ onViewDeal }: DecisionHistoryTabProps) {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [decisionFilter, setDecisionFilter] = useState<string>('all');
  const [athleteStatusFilter, setAthleteStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDecisions, setTotalDecisions] = useState(0);

  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const fetchDecisionHistory = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (decisionFilter !== 'all') {
        params.set('decision', decisionFilter);
      }
      if (athleteStatusFilter !== 'all') {
        params.set('athleteStatus', athleteStatusFilter);
      }

      const response = await fetch(`/api/compliance/decision-history?${params}`, {
        credentials: 'include',
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch decision history');
      }

      const data = await response.json();
      setDecisions(data.decisions);
      setTotalPages(data.pagination.totalPages);
      setTotalDecisions(data.pagination.total);
    } catch (err) {
      console.error('Error fetching decision history:', err);
      setError('Failed to load decision history');
    } finally {
      setLoading(false);
    }
  }, [page, decisionFilter, athleteStatusFilter]);

  useEffect(() => {
    fetchDecisionHistory();
  }, [fetchDecisionHistory]);

  const getDecisionBadge = (decision: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
      approved_with_conditions: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Conditional' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
      info_requested: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Info Requested' },
    };
    const badge = badges[decision] || { bg: 'bg-gray-100', text: 'text-gray-700', label: decision };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getAthleteStatus = (record: DecisionRecord) => {
    if (record.hasActiveAppeal) {
      return <span className="text-orange-600 text-sm font-medium">Appeal Pending</span>;
    }
    if (record.athleteViewedAt) {
      return <span className="text-green-600 text-sm">Viewed</span>;
    }
    if (record.athleteNotifiedAt) {
      return <span className="text-blue-600 text-sm">Notified</span>;
    }
    return <span className="text-gray-500 text-sm">Not notified</span>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && decisions.length === 0) {
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
          onClick={() => fetchDecisionHistory()}
          className="mt-4 px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-sm text-gray-600 shrink-0">Decision:</label>
          <select
            value={decisionFilter}
            onChange={(e) => {
              setDecisionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 min-h-[44px] text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
          >
            <option value="all">All Decisions</option>
            <option value="approved">Approved</option>
            <option value="approved_with_conditions">Conditional</option>
            <option value="rejected">Rejected</option>
            <option value="info_requested">Info Requested</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-sm text-gray-600 shrink-0">Status:</label>
          <select
            value={athleteStatusFilter}
            onChange={(e) => {
              setAthleteStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 min-h-[44px] text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
          >
            <option value="all">All</option>
            <option value="viewed">Viewed</option>
            <option value="notified">Notified Only</option>
            <option value="appealed">Has Appeal</option>
          </select>
        </div>

        <span className="text-sm text-gray-500 sm:ml-auto">
          {totalDecisions} decision{totalDecisions !== 1 ? 's' : ''} total
        </span>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {decisions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No decisions found matching your filters.
          </div>
        ) : (
          decisions.map((record) => (
            <DecisionHistoryCard
              key={record.id}
              record={record}
              onViewDeal={onViewDeal}
            />
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Athlete
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Decision
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Athlete Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {decisions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No decisions found matching your filters.
                </td>
              </tr>
            ) : (
              decisions.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(record.decisionAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{record.athleteName}</p>
                      <p className="text-xs text-gray-500">{record.sport}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900 max-w-[200px] truncate" title={record.dealTitle}>
                      {record.dealTitle}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {formatAmount(record.amount)}
                  </td>
                  <td className="px-4 py-3">
                    {getDecisionBadge(record.decision)}
                  </td>
                  <td className="px-4 py-3">
                    {getAthleteStatus(record)}
                    {record.appealCount > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {record.appealCount} appeal{record.appealCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onViewDeal(record.dealId)}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2.5 min-h-[44px] text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2.5 min-h-[44px] text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
