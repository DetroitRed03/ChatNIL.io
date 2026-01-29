'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  MessageSquare,
  Clock,
  Loader2,
  ExternalLink,
  Shield,
  RefreshCw
} from 'lucide-react';
import { ScoreExplanation } from '@/components/compliance/ScoreExplanation';

type Decision = 'approved' | 'approved_with_conditions' | 'rejected' | 'info_requested' | null;

interface DealData {
  id: string;
  third_party_name: string;
  compensation_amount: number;
  deal_type: string;
  status: string;
  created_at: string;
  contract_url?: string;
  description?: string;
  athlete: {
    id: string;
    name: string;
    sport: string;
    username?: string;
    school?: string;
  };
  compliance_scores?: Array<{
    id: string;
    total_score: number;
    status: 'green' | 'yellow' | 'red';
    reason_codes: string[];
    critical_issues?: string[];
    warnings?: string[];
    fix_recommendations?: string[];
    policy_fit_score: number;
    policy_fit_notes?: string;
    document_score: number;
    document_notes?: string;
    fmv_score: number;
    fmv_notes?: string;
    tax_score: number;
    tax_notes?: string;
    brand_safety_score: number;
    brand_safety_notes?: string;
    guardian_consent_score: number;
    guardian_consent_notes?: string;
  }>;
  audit_log?: Array<{
    id: string;
    action: string;
    created_at: string;
    performed_by_name?: string;
  }>;
  resubmitted_from_deal_id?: string | null;
  original_deal?: {
    id: string;
    third_party_name: string;
    compensation_amount: number;
    deal_type: string;
    athlete_notes?: string;
    compliance_decision?: string;
    compliance_decision_at?: string;
  } | null;
  info_requests?: Array<{
    id: string;
    request_type: string;
    description: string;
    response_text?: string;
    status: 'pending' | 'responded' | 'resolved';
    responded_at?: string;
    created_at: string;
  }>;
  conditions_completed_at?: string;
  conditions_completion_notes?: string;
  has_active_appeal?: boolean;
  appeal_count?: number;
  appeals?: Array<{
    id: string;
    appeal_reason: string;
    additional_context?: string;
    status: 'submitted' | 'under_review' | 'resolved';
    resolution?: 'upheld' | 'modified' | 'reversed';
    resolution_notes?: string;
    submitted_at: string;
    resolved_at?: string;
    original_decision: string;
  }>;
}

export default function DealReviewPage() {
  const router = useRouter();
  const params = useParams<{ dealId: string }>();
  const [deal, setDeal] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Decision form state
  const [decision, setDecision] = useState<Decision>(null);
  const [athleteNotes, setAthleteNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [overrideScore, setOverrideScore] = useState(false);
  const [newScore, setNewScore] = useState<number | ''>('');
  const [overrideJustification, setOverrideJustification] = useState('');
  const [recalculating, setRecalculating] = useState(false);

  // Appeal resolution state
  const [appealResolutionNotes, setAppealResolutionNotes] = useState('');
  const [resolvingAppeal, setResolvingAppeal] = useState(false);

  const handleResolveAppeal = async (resolution: 'upheld' | 'modified' | 'reversed') => {
    const activeAppeal = deal?.appeals?.find(a => a.status === 'submitted' || a.status === 'under_review');
    if (!activeAppeal) return;

    const confirmMsg = resolution === 'upheld'
      ? 'Uphold the original rejection? The athlete will be notified.'
      : resolution === 'reversed'
        ? 'Overturn the rejection and approve this deal? The athlete will be notified.'
        : 'Modify the decision? The athlete will be notified.';

    if (!confirm(confirmMsg)) return;

    setResolvingAppeal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/compliance/appeals', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          appealId: activeAppeal.id,
          resolution,
          resolutionNotes: appealResolutionNotes || undefined,
          newDecision: resolution === 'reversed' ? 'approved' : resolution === 'modified' ? 'approved_with_conditions' : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to resolve appeal');
      }

      const resolutionLabel = resolution === 'upheld' ? 'upheld' : resolution === 'reversed' ? 'overturned and approved' : 'modified';
      setSuccessMessage(`Appeal ${resolutionLabel} successfully.`);
      setTimeout(() => router.push('/compliance/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to resolve appeal');
    } finally {
      setResolvingAppeal(false);
    }
  };

  const fetchDeal = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(`/api/compliance/deals/${params.dealId}`, {
        credentials: 'include',
        headers: session?.access_token ? {
          'Authorization': `Bearer ${session.access_token}`
        } : {}
      });

      if (!res.ok) {
        if (res.status === 404) {
          setError('Deal not found');
          return;
        }
        if (res.status === 403) {
          setError('You do not have permission to review this deal');
          return;
        }
        throw new Error('Failed to load deal');
      }

      const data = await res.json();
      setDeal(data);
    } catch (err) {
      console.error('Fetch deal error:', err);
      setError('Failed to load deal details');
    } finally {
      setLoading(false);
    }
  }, [params.dealId]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  async function handleSubmitDecision() {
    if (!decision) return;

    // Validation
    if (decision === 'rejected' && athleteNotes.length < 50) {
      alert('Please provide a reason for rejection (at least 50 characters) in "Notes to Athlete"');
      return;
    }
    if (overrideScore && (!newScore || newScore < 0 || newScore > 100)) {
      alert('Please enter a valid score between 0 and 100');
      return;
    }
    if (overrideScore && overrideJustification.length < 50) {
      alert('Override justification must be at least 50 characters');
      return;
    }

    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(`/api/compliance/deals/${params.dealId}/review`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          decision,
          athleteNotes,
          internalNotes,
          overrideScore: overrideScore ? {
            newScore,
            justification: overrideJustification
          } : null
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit decision');
      }

      // Show success message
      const decisionLabels: Record<string, string> = {
        'approved': 'approved',
        'approved_with_conditions': 'approved with conditions',
        'rejected': 'rejected',
        'info_requested': 'sent back for more information'
      };
      setSuccessMessage(`Deal has been ${decisionLabels[decision] || decision}!`);

      // Redirect after brief delay so user sees the success
      setTimeout(() => {
        router.push('/compliance/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading deal details...</p>
        </div>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Decision Submitted</h2>
          <p className="text-gray-600 mt-2">{successMessage}</p>
          <p className="text-gray-400 text-sm mt-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-lg">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-xl font-bold text-gray-900 mt-4">Error</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => router.push('/compliance/dashboard')}
            className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!deal) return null;

  // Supabase returns object for 1:1 joins (UNIQUE on deal_id), array for 1:many
  const rawScores = deal?.compliance_scores;
  const score = Array.isArray(rawScores) ? rawScores[0] : rawScores;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Deal Review</h1>
              <p className="text-gray-500">
                {deal.third_party_name} • {deal.athlete?.name} • {formatCurrency(deal.compensation_amount)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Active Appeal Banner */}
        {deal.has_active_appeal && (() => {
          const activeAppeal = deal.appeals?.find(a => a.status === 'submitted' || a.status === 'under_review');
          if (!activeAppeal) return null;
          return (
            <div className="mb-6 rounded-xl border-2 border-purple-300 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-5 py-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <div>
                    <h3 className="font-semibold text-lg">Appeal Submitted</h3>
                    <p className="text-purple-100 text-sm">
                      Appealed on {new Date(activeAppeal.submitted_at).toLocaleDateString()} &bull; Original decision: {activeAppeal.original_decision}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-purple-50">
                <p className="text-sm font-semibold text-purple-800 mb-2">
                  Athlete&apos;s Appeal Reason:
                </p>
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{activeAppeal.appeal_reason}</p>
                </div>
                {activeAppeal.additional_context && (
                  <div className="mt-3 p-4 bg-white rounded-lg border border-purple-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">Additional Context:</p>
                    <p className="text-gray-700">{activeAppeal.additional_context}</p>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-purple-200 bg-purple-50/50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes (optional)
                </label>
                <textarea
                  value={appealResolutionNotes}
                  onChange={(e) => setAppealResolutionNotes(e.target.value)}
                  placeholder="Explain your decision on this appeal..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleResolveAppeal('upheld')}
                    disabled={resolvingAppeal}
                    className="flex-1 py-2.5 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    Uphold Rejection
                  </button>
                  <button
                    onClick={() => handleResolveAppeal('modified')}
                    disabled={resolvingAppeal}
                    className="flex-1 py-2.5 bg-yellow-100 text-yellow-700 font-medium rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
                  >
                    Modify → Conditions
                  </button>
                  <button
                    onClick={() => handleResolveAppeal('reversed')}
                    disabled={resolvingAppeal}
                    className="flex-1 py-2.5 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    Overturn → Approve
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Conditions Completed — Final Approval Banner */}
        {deal.compliance_decision === 'conditions_completed' && (
          <div className="mb-6 bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-teal-100 rounded-full flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-teal-800 text-base">
                  Conditions Completed — Final Approval Needed
                </h3>
                <p className="text-sm text-teal-700 mt-1">
                  The athlete has confirmed completion of all conditions. Review their submission and grant final approval or request further action.
                </p>
                {deal.conditions_completion_notes && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-teal-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">Athlete&apos;s Notes:</p>
                    <p className="text-sm text-gray-800">{deal.conditions_completion_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Response Submitted — Re-review Banner */}
        {deal.compliance_decision === 'response_submitted' && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-full flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-purple-800 text-base">
                  Athlete Responded — Ready for Re-Review
                </h3>
                <p className="text-sm text-purple-700 mt-1">
                  The athlete has responded to your information request. Please review their response below and make a new decision.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resubmission Context Banner */}
        {deal.resubmitted_from_deal_id && deal.original_deal && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-blue-800 text-base">
                  This is a Resubmission
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  This deal was previously reviewed and{' '}
                  <span className="font-semibold text-red-600">
                    {deal.original_deal.compliance_decision === 'rejected' ? 'rejected' : 'returned'}
                  </span>.
                  The athlete has modified and resubmitted it.
                </p>

                {deal.original_deal.athlete_notes && (
                  <div className="mt-3">
                    <p className="text-sm text-blue-700 font-medium">Previous Rejection Reason:</p>
                    <p className="text-sm text-blue-600 mt-1 p-2 bg-white/60 rounded-lg border border-blue-200">
                      &ldquo;{deal.original_deal.athlete_notes}&rdquo;
                    </p>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-blue-600">
                  {deal.original_deal.compliance_decision_at && (
                    <span>
                      Rejected on {new Date(deal.original_deal.compliance_decision_at).toLocaleDateString()}
                    </span>
                  )}
                  {deal.original_deal.compensation_amount !== deal.compensation_amount && (
                    <span className="font-medium text-indigo-600">
                      Compensation changed: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(deal.original_deal.compensation_amount)} → {formatCurrency(deal.compensation_amount)}
                    </span>
                  )}
                  <a
                    href={`/compliance/deals/${deal.original_deal.id}`}
                    className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 font-medium underline"
                  >
                    View Original Deal
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="mt-3 p-2 bg-blue-100/50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>Review Tip:</strong> Compare this resubmission against the original rejection reason above. Verify the athlete addressed the feedback before approving.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Athlete Responses to Info Requests */}
        {deal.info_requests && deal.info_requests.filter(r => r.status === 'responded').length > 0 && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-green-800 text-base mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Athlete Response Received
            </h3>
            <div className="space-y-3">
              {deal.info_requests.filter(r => r.status === 'responded').map((req) => (
                <div key={req.id} className="bg-white rounded-lg border border-green-200 p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                    {req.request_type} — Original Request
                  </p>
                  <p className="text-sm text-gray-600 mb-3">{req.description}</p>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <p className="text-xs font-medium text-green-700 mb-1">Athlete&apos;s Response:</p>
                    <p className="text-sm text-gray-800">{req.response_text}</p>
                  </div>
                  {req.responded_at && (
                    <p className="text-xs text-green-600 mt-2">
                      Responded on {new Date(req.responded_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Score Explanation */}
        <div className="mb-6">
          <div className="flex items-center justify-end mb-2">
            <button
              onClick={async () => {
                setRecalculating(true);
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  const res = await fetch('/api/compliance/score', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
                    },
                    body: JSON.stringify({ dealId: params.dealId }),
                  });
                  if (res.ok) {
                    await fetchDeal();
                  }
                } catch (err) {
                  console.error('Recalculate failed:', err);
                } finally {
                  setRecalculating(false);
                }
              }}
              disabled={recalculating}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
            >
              {recalculating ? 'Recalculating...' : 'Recalculate Score'}
            </button>
          </div>
          {score ? (
            <ScoreExplanation score={score} showImprovement={true} />
          ) : (
            <div className="bg-white border rounded-lg p-8 text-center">
              <span className="text-4xl font-bold text-gray-400">N/A</span>
              <p className="text-gray-500 mt-2">Score not calculated</p>
              <button
                onClick={async () => {
                  setRecalculating(true);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    const res = await fetch('/api/compliance/score', {
                      method: 'POST',
                      credentials: 'include',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
                      },
                      body: JSON.stringify({ dealId: params.dealId }),
                    });
                    if (res.ok) {
                      await fetchDeal();
                    }
                  } catch (err) {
                    console.error('Score calculation failed:', err);
                  } finally {
                    setRecalculating(false);
                  }
                }}
                disabled={recalculating}
                className="mt-4 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {recalculating ? 'Calculating...' : 'Calculate Score'}
              </button>
            </div>
          )}
        </div>

        {/* Deal Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-4">
            Deal Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block mb-1">Company</span>
              <span className="font-medium text-gray-900">{deal.third_party_name}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Amount</span>
              <span className="font-medium text-gray-900">{formatCurrency(deal.compensation_amount)}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Type</span>
              <span className="font-medium text-gray-900">{deal.deal_type || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Athlete</span>
              <span className="font-medium text-gray-900">{deal.athlete?.name}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Sport</span>
              <span className="font-medium text-gray-900">{deal.athlete?.sport}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Submitted</span>
              <span className="font-medium text-gray-900">
                {new Date(deal.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Current Status</span>
              <span className="font-medium text-gray-900 capitalize">{deal.status}</span>
            </div>
            {deal.contract_url && (
              <div>
                <span className="text-gray-500 block mb-1">Contract</span>
                <a
                  href={deal.contract_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  View Document
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
          {deal.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-gray-500 block mb-1 text-sm">Description</span>
              <p className="text-gray-700 text-sm">{deal.description}</p>
            </div>
          )}
        </div>

        {/* Decision Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-4">
            Compliance Decision
          </h2>

          {/* Decision Options */}
          <div className="space-y-3 mb-6">
            <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
              decision === 'approved'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="decision"
                value="approved"
                checked={decision === 'approved'}
                onChange={() => setDecision('approved')}
                className="w-5 h-5 text-green-500 focus:ring-green-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-700">Approve</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Deal meets all compliance requirements</p>
              </div>
            </label>

            <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
              decision === 'approved_with_conditions'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="decision"
                value="approved_with_conditions"
                checked={decision === 'approved_with_conditions'}
                onChange={() => setDecision('approved_with_conditions')}
                className="w-5 h-5 text-yellow-500 focus:ring-yellow-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-700">Approve with Conditions</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Approved but athlete must meet certain conditions</p>
              </div>
            </label>

            <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
              decision === 'rejected'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="decision"
                value="rejected"
                checked={decision === 'rejected'}
                onChange={() => setDecision('rejected')}
                className="w-5 h-5 text-red-500 focus:ring-red-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-700">Reject</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Deal violates compliance rules and cannot proceed</p>
              </div>
            </label>

            <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
              decision === 'info_requested'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="decision"
                value="info_requested"
                checked={decision === 'info_requested'}
                onChange={() => setDecision('info_requested')}
                className="w-5 h-5 text-blue-500 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-700">Request More Information</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Need additional documentation or clarification</p>
              </div>
            </label>
          </div>

          {/* Notes to Athlete */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes to Athlete
              <span className="text-gray-400 font-normal ml-2">(they will see this)</span>
            </label>
            <textarea
              value={athleteNotes}
              onChange={(e) => setAthleteNotes(e.target.value)}
              placeholder="Explain your decision or what information is needed..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Internal Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal Notes
              <span className="text-gray-400 font-normal ml-2">(compliance team only)</span>
            </label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Notes for the compliance team..."
              rows={2}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Score Override */}
          <div className="border-t border-gray-100 pt-4">
            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={overrideScore}
                onChange={(e) => setOverrideScore(e.target.checked)}
                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">Override compliance score</span>
            </label>

            {overrideScore && (
              <div className="ml-8 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
                <div className="flex items-start gap-2 text-amber-800 text-sm">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>All score overrides are logged and audited. Only override when you have verified compliance through additional review.</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1 font-medium">New Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1 font-medium">
                    Justification <span className="text-gray-400 font-normal">(min 50 characters)</span>
                  </label>
                  <textarea
                    value={overrideJustification}
                    onChange={(e) => setOverrideJustification(e.target.value)}
                    placeholder="Explain why you're overriding the automated score..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className={`text-xs mt-1 ${overrideJustification.length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                    {overrideJustification.length}/50 characters
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitDecision}
            disabled={!decision || submitting || (overrideScore && (!newScore || overrideJustification.length < 50))}
            className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Decision'
            )}
          </button>
        </div>

        {/* Audit Trail */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Audit Trail
          </h2>
          {deal.audit_log && deal.audit_log.length > 0 ? (
            <div className="space-y-3">
              {deal.audit_log.map((entry, i) => (
                <div key={entry.id || i} className="flex items-start gap-3 text-sm">
                  <span className="text-gray-400 whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                  <span className="text-gray-700">{entry.action}</span>
                  {entry.performed_by_name && (
                    <span className="text-gray-500">by {entry.performed_by_name}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No audit entries yet</p>
          )}
        </div>
      </main>
    </div>
  );
}
