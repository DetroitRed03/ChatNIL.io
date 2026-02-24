'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, ChevronDown, Loader2 } from 'lucide-react';

function safe(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && 'name' in val) return String((val as Record<string, unknown>).name);
  return String(val);
}

interface AthleteDeal {
  id: string;
  thirdPartyName: string;
  compensation: number;
  score: number | null;
  status: 'green' | 'yellow' | 'red' | 'pending';
  dealStatus: string;
  topIssue: string | null;
  submittedAt: string;
  hasOverride: boolean;
}

interface OverridePanelProps {
  deals: AthleteDeal[];
  onOverride: (data: { dealId: string; newStatus: 'green' | 'yellow'; reason: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function OverridePanel({ deals, onOverride, isSubmitting }: OverridePanelProps) {
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [newStatus, setNewStatus] = useState<'green' | 'yellow'>('yellow');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Only show deals that can be overridden (red or yellow, not already green)
  const overridableDeals = deals.filter(d =>
    d.status === 'red' || d.status === 'yellow'
  );

  const selectedDeal = overridableDeals.find(d => d.id === selectedDealId);

  const handleSubmit = async () => {
    if (!selectedDealId) {
      setError('Please select a deal');
      return;
    }
    if (reason.length < 50) {
      setError('Reason must be at least 50 characters');
      return;
    }

    setError(null);
    await onOverride({
      dealId: selectedDealId,
      newStatus,
      reason
    });

    // Reset form
    setSelectedDealId('');
    setNewStatus('yellow');
    setReason('');
  };

  if (overridableDeals.length === 0) {
    return (
      <motion.div
        data-testid="override-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Override Panel</h2>
            <p className="text-sm text-gray-500">Manual compliance adjustments</p>
          </div>
        </div>
        <div className="text-center py-4">
          <p className="text-gray-500">No deals require override</p>
          <p className="text-sm text-gray-400 mt-1">All deals are compliant or have no score</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      data-testid="override-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Override Panel</h2>
          <p className="text-sm text-gray-500">Manual compliance adjustments</p>
        </div>
      </div>

      {/* Warning */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            All overrides are logged and audited. Only override scores when you have verified
            compliance through additional documentation or review.
          </p>
        </div>
      </div>

      {/* Deal Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Deal to Override
          </label>
          <div className="relative">
            <select
              value={selectedDealId}
              onChange={(e) => setSelectedDealId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Choose a deal...</option>
              {overridableDeals.map(deal => (
                <option key={deal.id} value={deal.id}>
                  {safe(deal.thirdPartyName)} ({deal.status.toUpperCase()}) - Score: {deal.score || 'N/A'}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Selected Deal Info */}
        {selectedDeal && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{safe(selectedDeal.thirdPartyName)}</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                selectedDeal.status === 'red'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {selectedDeal.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600">Current Score: {selectedDeal.score || 'N/A'}</p>
            {selectedDeal.topIssue && (
              <p className="text-sm text-gray-500 mt-1">{safe(selectedDeal.topIssue)}</p>
            )}
          </div>
        )}

        {/* New Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Status
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setNewStatus('yellow')}
              disabled={selectedDeal?.status === 'yellow'}
              className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                newStatus === 'yellow'
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              } ${selectedDeal?.status === 'yellow' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Yellow (Review)
            </button>
            <button
              onClick={() => setNewStatus('green')}
              className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                newStatus === 'green'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Green (Compliant)
            </button>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Justification <span className="text-gray-400">(min 50 characters)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this override is justified..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
          <p className={`text-xs mt-1 ${reason.length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
            {reason.length}/50 characters
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedDealId || reason.length < 50}
          className="w-full py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Submit Override'
          )}
        </button>
      </div>
    </motion.div>
  );
}
