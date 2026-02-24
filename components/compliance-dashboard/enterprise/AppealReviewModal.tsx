'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

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

interface AppealReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appeal: Appeal;
  onResolved: () => void;
}

type Resolution = 'upheld' | 'modified' | 'reversed';

export function AppealReviewModal({ isOpen, onClose, appeal, onResolved }: AppealReviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [newDecision, setNewDecision] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when appeal changes
  useEffect(() => {
    setResolution(null);
    setResolutionNotes('');
    setInternalNotes('');
    setNewDecision('');
    setError(null);
  }, [appeal.id]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!resolution) {
      setError('Please select a resolution');
      return;
    }

    if ((resolution === 'modified' || resolution === 'reversed') && !newDecision) {
      setError('Please select a new decision for modified/reversed appeals');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/compliance/appeals', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          appealId: appeal.id,
          resolution,
          resolutionNotes: resolutionNotes || undefined,
          internalNotes: internalNotes || undefined,
          newDecision: newDecision || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resolve appeal');
      }

      onResolved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve appeal');
    } finally {
      setSubmitting(false);
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Review Appeal</h2>
            <p className="text-sm text-gray-500">{appeal.athleteName} • {appeal.sport}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Deal Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Deal Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Deal</p>
                <p className="font-medium text-gray-900">{appeal.dealTitle}</p>
              </div>
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium text-gray-900">{formatAmount(appeal.amount)}</p>
              </div>
              <div>
                <p className="text-gray-500">Original Decision</p>
                <div className="mt-1">{getDecisionBadge(appeal.originalDecision)}</div>
              </div>
              <div>
                <p className="text-gray-500">Decision Date</p>
                <p className="font-medium text-gray-900">{formatDate(appeal.originalDecisionAt)}</p>
              </div>
            </div>
          </div>

          {/* Appeal Reason */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Appeal Reason</h3>
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{appeal.appealReason}</p>
            </div>
            {appeal.additionalContext && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium">Additional Context:</p>
                <p>{appeal.additionalContext}</p>
              </div>
            )}
            {appeal.appealDocuments.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Attachments:</p>
                <div className="flex flex-wrap gap-2">
                  {appeal.appealDocuments.map((doc, i) => (
                    <a
                      key={i}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Document {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Submitted {formatDate(appeal.submittedAt)} • Open for {appeal.daysOpen} day{appeal.daysOpen !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Resolution Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Resolution</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setResolution('upheld')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  resolution === 'upheld'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">Uphold</p>
                <p className="text-xs text-gray-500 mt-1">Keep original decision</p>
              </button>
              <button
                onClick={() => setResolution('modified')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  resolution === 'modified'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">Modify</p>
                <p className="text-xs text-gray-500 mt-1">Change conditions</p>
              </button>
              <button
                onClick={() => setResolution('reversed')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  resolution === 'reversed'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">Reverse</p>
                <p className="text-xs text-gray-500 mt-1">Overturn decision</p>
              </button>
            </div>
          </div>

          {/* New Decision (if modified/reversed) */}
          {(resolution === 'modified' || resolution === 'reversed') && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">New Decision</h3>
              <select
                value={newDecision}
                onChange={(e) => setNewDecision(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select new decision...</option>
                <option value="approved">Approved</option>
                <option value="approved_with_conditions">Approved with Conditions</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}

          {/* Resolution Notes (for athlete) */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Notes for Athlete
              <span className="font-normal text-gray-500 ml-1">(shared with athlete)</span>
            </h3>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Explain the reasoning for this resolution..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Internal Notes */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Internal Notes
              <span className="font-normal text-gray-500 ml-1">(compliance team only)</span>
            </h3>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Internal notes for the compliance team..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !resolution}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            )}
            {submitting ? 'Resolving...' : 'Resolve Appeal'}
          </button>
        </div>
      </div>
    </div>
  );
}
