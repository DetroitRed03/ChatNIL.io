'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Clock,
  Loader2,
  ExternalLink,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  Send,
} from 'lucide-react';
import { ConditionsAcknowledgmentForm } from '@/components/deals/ConditionsAcknowledgmentForm';

type ComplianceDecision = 'approved' | 'approved_with_conditions' | 'rejected' | 'info_requested' | 'response_submitted' | 'conditions_completed' | null;

interface InfoRequest {
  id: string;
  request_type: string;
  description: string;
  status: 'pending' | 'responded' | 'resolved';
  response_text?: string;
  responded_at?: string;
  created_at: string;
}

interface Appeal {
  id: string;
  status: 'submitted' | 'under_review' | 'resolved';
  appeal_reason: string;
  resolution?: string;
  resolution_notes?: string;
  submitted_at: string;
  resolved_at?: string;
}

interface DealData {
  id: string;
  third_party_name: string;
  brand_name?: string;
  deal_title?: string;
  compensation_amount: number;
  deal_type: string;
  status: string;
  created_at: string;
  start_date?: string;
  end_date?: string;
  contract_url?: string;
  description?: string;
  compliance_decision: ComplianceDecision;
  compliance_decision_at?: string;
  athlete_notes?: string;
  has_active_appeal: boolean;
  appeal_count: number;
  superseded_by_deal_id?: string | null;
  info_requests: InfoRequest[];
  appeals: Appeal[];
  compliance_scores?: Array<{
    total_score: number;
    status: 'green' | 'yellow' | 'red';
  }>;
}

export default function DealDetailPage() {
  const router = useRouter();
  const params = useParams<{ dealId: string }>();
  const [deal, setDeal] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [showInfoResponseModal, setShowInfoResponseModal] = useState(false);
  const [selectedInfoRequest, setSelectedInfoRequest] = useState<InfoRequest | null>(null);

  // Form states
  const [appealReason, setAppealReason] = useState('');
  const [infoResponse, setInfoResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDeal = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(`/api/deals/${params.dealId}`, {
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
          setError('You do not have permission to view this deal');
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

  const handleSubmitAppeal = async () => {
    if (appealReason.length < 50) {
      alert('Please provide at least 50 characters explaining your appeal');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(`/api/deals/${params.dealId}/appeal`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ reason: appealReason })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit appeal');
      }

      setShowAppealModal(false);
      setAppealReason('');
      fetchDeal(); // Refresh data
      alert('Your appeal has been submitted successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to submit appeal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitInfoResponse = async () => {
    if (!selectedInfoRequest || !infoResponse.trim()) {
      alert('Please provide a response');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(`/api/deals/${params.dealId}/respond-info`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          requestId: selectedInfoRequest.id,
          response: infoResponse
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit response');
      }

      setShowInfoResponseModal(false);
      setSelectedInfoRequest(null);
      setInfoResponse('');
      alert(data.message);
      router.push('/deals');
    } catch (err: any) {
      alert(err.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading deal details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-lg">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Error</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!deal) return null;

  const decisionConfig = {
    approved: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      title: 'Approved',
      titleColor: 'text-green-800',
      textColor: 'text-green-700',
    },
    approved_with_conditions: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      title: 'Approved with Conditions',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700',
    },
    info_requested: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: MessageSquare,
      iconColor: 'text-blue-600',
      title: 'More Information Requested',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700',
    },
    rejected: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: XCircle,
      iconColor: 'text-red-600',
      title: 'Not Approved',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
    },
    response_submitted: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: Clock,
      iconColor: 'text-purple-600',
      title: 'Response Submitted — Awaiting Re-Review',
      titleColor: 'text-purple-800',
      textColor: 'text-purple-700',
    },
    conditions_completed: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      icon: CheckCircle,
      iconColor: 'text-teal-600',
      title: 'Conditions Submitted — Awaiting Final Approval',
      titleColor: 'text-teal-800',
      textColor: 'text-teal-700',
    },
  };

  const config = deal.compliance_decision ? decisionConfig[deal.compliance_decision] : null;
  const DecisionIcon = config?.icon || Clock;
  const pendingInfoRequests = deal.info_requests?.filter(r => r.status === 'pending') || [];

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
            Back
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {deal.third_party_name || deal.brand_name || deal.deal_title}
              </h1>
              <p className="text-gray-500">
                {deal.deal_type} • {formatCurrency(deal.compensation_amount)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Decision Banner */}
        {config && (
          <div className={`${config.bg} border ${config.border} rounded-xl p-6`}>
            <div className="flex items-start gap-4">
              <DecisionIcon className={`w-8 h-8 ${config.iconColor} flex-shrink-0`} />
              <div className="flex-1">
                <h2 className={`text-lg font-semibold ${config.titleColor}`}>
                  {config.title}
                </h2>
                {deal.athlete_notes && (
                  <p className={`mt-2 ${config.textColor}`}>
                    {deal.athlete_notes}
                  </p>
                )}
                {deal.compliance_decision_at && (
                  <p className="mt-2 text-sm text-gray-500">
                    Decision made on {formatDate(deal.compliance_decision_at)}
                  </p>
                )}

                {/* Active Appeal Badge */}
                {deal.has_active_appeal && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    <Clock className="w-4 h-4" />
                    Appeal Under Review
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons for Rejected Deals */}
            {deal.compliance_decision === 'rejected' && !deal.has_active_appeal && !deal.superseded_by_deal_id && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowAppealModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Appeal Decision
                </button>
                <button
                  onClick={() => router.push(`/deals/validate?resubmit=${deal.id}`)}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium"
                >
                  Modify & Resubmit
                </button>
              </div>
            )}

            {/* Already resubmitted notice */}
            {deal.superseded_by_deal_id && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
                This deal has been resubmitted.{' '}
                <Link href={`/deals/${deal.superseded_by_deal_id}`} className="text-orange-600 underline font-medium">
                  View resubmission
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Conditions Acknowledgment Section */}
        {deal.compliance_decision === 'approved_with_conditions' && (
          <div className="bg-white border-2 border-blue-300 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Complete Your Conditions</h3>
                  <p className="text-blue-100 text-sm">
                    Fulfill the following to finalize your deal
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 bg-blue-50">
              <p className="text-sm font-semibold text-blue-800 mb-3">
                Conditions to Complete:
              </p>
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {deal.athlete_notes || 'Please review the conditions set by your compliance office.'}
                </p>
              </div>
              {deal.compliance_decision_at && (
                <p className="text-xs text-blue-600 mt-2">
                  Set on {formatDate(deal.compliance_decision_at)}
                </p>
              )}
            </div>
            <div className="p-5 border-t border-blue-200">
              <ConditionsAcknowledgmentForm
                dealId={deal.id}
                onSuccess={() => router.push('/deals')}
              />
            </div>
          </div>
        )}

        {/* Info Requests Section */}
        {deal.compliance_decision === 'info_requested' && pendingInfoRequests.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Information Requested ({pendingInfoRequests.length})
            </h2>
            <div className="space-y-3">
              {pendingInfoRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {request.request_type}
                    </span>
                    <p className="text-gray-700 mt-1">{request.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedInfoRequest(request);
                      setShowInfoResponseModal(true);
                    }}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Respond
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback: info_requested but no pending info_request records */}
        {deal.compliance_decision === 'info_requested' && pendingInfoRequests.length === 0 && (
          <div className="bg-white border-2 border-orange-300 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-orange-500 text-white px-5 py-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold">Action Required: Provide Information</span>
            </div>
            <div className="p-5 bg-orange-50">
              <p className="text-sm font-medium text-orange-800 mb-2">
                The compliance office needs additional information:
              </p>
              <div className="p-3 bg-white rounded-lg border border-orange-200">
                <p className="text-gray-700">{deal.athlete_notes || 'Additional documentation or information is needed for this deal. Please provide any supporting details or clarification.'}</p>
              </div>
              {deal.compliance_decision_at && (
                <p className="text-xs text-orange-600 mt-2">
                  Requested on {formatDate(deal.compliance_decision_at)}
                </p>
              )}
            </div>
            <div className="p-5 border-t border-orange-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <textarea
                value={infoResponse}
                onChange={(e) => setInfoResponse(e.target.value)}
                placeholder="Provide the requested information or clarification..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={async () => {
                  if (!infoResponse.trim()) {
                    alert('Please provide a response');
                    return;
                  }
                  setSubmitting(true);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    const res = await fetch(`/api/deals/${params.dealId}/respond-info`, {
                      method: 'POST',
                      credentials: 'include',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
                      },
                      body: JSON.stringify({
                        response: infoResponse,
                        fallback: true,
                      })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed to submit response');
                    setInfoResponse('');
                    alert(data.message || 'Response submitted successfully');
                    router.push('/deals');
                  } catch (err: any) {
                    alert(err.message || 'Failed to submit response');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={!infoResponse.trim() || submitting}
                className="mt-3 w-full py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit Response</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Deal Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Deal Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block mb-1">Company</span>
              <span className="font-medium text-gray-900">
                {deal.third_party_name || deal.brand_name}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Amount</span>
              <span className="font-medium text-gray-900 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {formatCurrency(deal.compensation_amount)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Type</span>
              <span className="font-medium text-gray-900 capitalize">
                {deal.deal_type?.replace('_', ' ') || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Status</span>
              <span className="font-medium text-gray-900 capitalize">{deal.status}</span>
            </div>
            {deal.start_date && (
              <div>
                <span className="text-gray-500 block mb-1">Start Date</span>
                <span className="font-medium text-gray-900 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(deal.start_date)}
                </span>
              </div>
            )}
            {deal.end_date && (
              <div>
                <span className="text-gray-500 block mb-1">End Date</span>
                <span className="font-medium text-gray-900 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(deal.end_date)}
                </span>
              </div>
            )}
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
                  View
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

        {/* Appeal History */}
        {deal.appeals && deal.appeals.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Appeal History</h2>
            <div className="space-y-4">
              {deal.appeals.map((appeal) => (
                <div key={appeal.id} className="border-l-4 border-gray-300 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appeal.status === 'resolved'
                        ? appeal.resolution === 'reversed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {appeal.status === 'resolved'
                        ? `${appeal.resolution?.charAt(0).toUpperCase()}${appeal.resolution?.slice(1)}`
                        : 'Under Review'}
                    </span>
                    <span className="text-sm text-gray-500">
                      Submitted {formatDate(appeal.submitted_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{appeal.appeal_reason}</p>
                  {appeal.resolution_notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      Response: {appeal.resolution_notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Appeal Modal */}
      {showAppealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Appeal Decision</h2>
            <p className="text-gray-600 text-sm mb-4">
              Explain why you believe this decision should be reconsidered. Be specific about
              any circumstances or information that supports your appeal.
            </p>
            <textarea
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              placeholder="Enter your appeal reason (minimum 50 characters)..."
              rows={5}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className={`text-xs mt-1 ${appealReason.length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
              {appealReason.length}/50 characters minimum
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAppealModal(false);
                  setAppealReason('');
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAppeal}
                disabled={appealReason.length < 50 || submitting}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Appeal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Response Modal */}
      {showInfoResponseModal && selectedInfoRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Respond to Request</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase">
                {selectedInfoRequest.request_type}
              </span>
              <p className="text-gray-700 mt-1">{selectedInfoRequest.description}</p>
            </div>
            <textarea
              value={infoResponse}
              onChange={(e) => setInfoResponse(e.target.value)}
              placeholder="Enter your response..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowInfoResponseModal(false);
                  setSelectedInfoRequest(null);
                  setInfoResponse('');
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitInfoResponse}
                disabled={!infoResponse.trim() || submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
