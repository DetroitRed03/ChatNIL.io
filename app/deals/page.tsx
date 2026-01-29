'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  Plus,
  ChevronRight,
  Loader2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { getDealDisplayStatus } from '@/lib/deal-status';
import { calculateDealStats } from '@/lib/deal-stats';

type ComplianceDecision = 'approved' | 'approved_with_conditions' | 'rejected' | 'info_requested' | 'response_submitted' | 'conditions_completed' | null;

interface DealSummary {
  id: string;
  third_party_name: string;
  deal_type: string;
  compensation_amount: number;
  status: string;
  compliance_decision: ComplianceDecision;
  compliance_decision_at: string | null;
  created_at: string;
  start_date: string | null;
  end_date: string | null;
  compliance_score?: number;
  compliance_status?: string;
}

function getDisplayStatus(deal: DealSummary): { label: string; color: string } {
  const ds = getDealDisplayStatus(deal);
  return { label: ds.friendlyLabel, color: `${ds.bgClass} ${ds.textClass}` };
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DealsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/');
      return;
    }

    // Redirect compliance officers
    if (user.role === 'compliance_officer') {
      router.push('/compliance/dashboard');
      return;
    }

    fetchDeals();
  }, [user, authLoading]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const res = await fetch('/api/dashboard/college-athlete', {
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to load deals');
      }

      const data = await res.json();

      // Map dashboard deals to our format
      const mappedDeals: DealSummary[] = (data.deals || []).map((d: any) => ({
        id: d.id,
        third_party_name: d.brandName || d.third_party_name || 'Unknown Brand',
        deal_type: d.dealType || d.deal_type || 'NIL Deal',
        compensation_amount: d.compensation || d.compensation_amount || 0,
        status: d.status || 'pending',
        compliance_decision: d.complianceDecision || d.compliance_decision || null,
        compliance_decision_at: d.compliance_decision_at || null,
        created_at: d.created_at || new Date().toISOString(),
        start_date: d.start_date || null,
        end_date: d.end_date || null,
        compliance_score: d.complianceScore ?? d.compliance_score ?? undefined,
        compliance_status: d.complianceStatus || d.compliance_status || undefined,
      }));

      setDeals(mappedDeals);
    } catch (err: any) {
      console.error('Failed to fetch deals:', err);
      setError(err.message || 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  // Stats — unified calculation
  const dealStats = calculateDealStats(deals);
  const stats = {
    total: dealStats.total,
    pending: dealStats.pendingReview + dealStats.notSubmitted,
    approved: dealStats.approved,
    needsAction: dealStats.needsAction + dealStats.appealed,
    totalEarnings: dealStats.approvedValue,
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading deals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Failed to load deals</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchDeals}
            className="mt-3 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Deals</h1>
          <p className="text-gray-500 mt-1">Manage your NIL partnerships</p>
        </div>
        <Link
          href="/deals/validate"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Deal
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Deals</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Needs Your Action</p>
          <p className="text-2xl font-bold text-orange-600">{stats.needsAction}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Approved Earnings</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalEarnings)}
          </p>
        </div>
      </div>

      {/* Needs Action Alert */}
      {stats.needsAction > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <div className="flex items-center gap-2 text-orange-700">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">
              {stats.needsAction} deal{stats.needsAction > 1 ? 's' : ''} need your attention
            </span>
          </div>
          <p className="text-sm text-orange-600 mt-1 ml-7">
            The compliance office has requested additional information or set conditions.
          </p>
        </div>
      )}

      {/* Deals List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">
            {stats.total} deal{stats.total !== 1 ? 's' : ''}
          </span>
        </div>

        {deals.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {deals.map((deal) => {
              const statusDisplay = getDisplayStatus(deal);
              return (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900 truncate">
                        {deal.third_party_name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                        {statusDisplay.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="capitalize">{deal.deal_type.replace(/_/g, ' ')}</span>
                      <span className="text-gray-300">|</span>
                      <span>{formatCurrency(deal.compensation_amount)}</span>
                      <span className="text-gray-300">|</span>
                      <span>{new Date(deal.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-4">
                    {deal.compliance_score != null ? (
                      <span className={`text-sm font-semibold ${getScoreColor(deal.compliance_score)}`}>
                        {deal.compliance_score}/100
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">--</span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No deals yet</h3>
            <p className="text-gray-500 mb-6">
              Start by validating your first NIL partnership
            </p>
            <Link
              href="/deals/validate"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Your First Deal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
