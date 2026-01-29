'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { ChildSummary } from './ChildCard';

interface ConsentManagerProps {
  child: ChildSummary;
  onApprove: () => Promise<void>;
  onDeny: () => Promise<void>;
  onRevoke: () => Promise<void>;
  onClose: () => void;
}

export function ConsentManager({ child, onApprove, onDeny, onRevoke, onClose }: ConsentManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: 'approve' | 'deny' | 'revoke') => {
    setIsLoading(true);
    setError(null);
    try {
      if (action === 'approve') await onApprove();
      else if (action === 'deny') await onDeny();
      else await onRevoke();
      onClose();
    } catch (err) {
      setError('Failed to update consent. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AnimatePresence>
      {/* Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          data-testid="consent-manager"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
        >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {child.consentStatus === 'pending' ? 'Consent Required' : 'Consent Status'}
              </h2>
              <p className="text-sm text-gray-500">{child.fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {child.consentStatus === 'pending' ? (
            /* Pending State */
            <>
              <p className="text-gray-700 mb-4">
                <strong>{child.fullName}</strong> wants to use ChatNIL to learn about NIL.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-gray-900 mb-3">By approving, you confirm that:</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    You are {child.fullName}'s parent or legal guardian
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    You allow {child.fullName} to use ChatNIL for educational purposes
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ChatNIL does NOT facilitate deals for minors
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  data-testid="approve-consent-btn"
                  onClick={() => handleAction('approve')}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve
                </button>
                <button
                  data-testid="deny-consent-btn"
                  onClick={() => handleAction('deny')}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  Deny
                </button>
              </div>
            </>
          ) : child.consentStatus === 'approved' ? (
            /* Approved State */
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-700">Consent Approved</p>
                  <p className="text-sm text-gray-500">
                    Approved on {formatDate(child.consentGivenAt)}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-800">
                  If you wish to revoke access, {child.fullName} will no longer be able to use ChatNIL until you re-approve.
                </p>
              </div>

              <button
                data-testid="revoke-consent-btn"
                onClick={() => handleAction('revoke')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Revoke Consent
              </button>
            </>
          ) : (
            /* Denied/Revoked State */
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-700">
                    Consent {child.consentStatus === 'denied' ? 'Denied' : 'Revoked'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {child.fullName} cannot access ChatNIL
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                You can approve access at any time to allow {child.fullName} to use ChatNIL for educational purposes.
              </p>

              <button
                data-testid="approve-consent-btn"
                onClick={() => handleAction('approve')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve Consent
              </button>
            </>
          )}
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
