'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface ConsentManagementProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
  currentStatus: 'pending' | 'approved' | 'denied' | 'revoked';
  onUpdateConsent: (status: 'approved' | 'denied' | 'revoked') => Promise<void>;
}

export function ConsentManagement({
  isOpen,
  onClose,
  childName,
  currentStatus,
  onUpdateConsent,
}: ConsentManagementProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateConsent = async (newStatus: 'approved' | 'denied' | 'revoked') => {
    setIsUpdating(true);
    setError(null);
    try {
      await onUpdateConsent(newStatus);
      onClose();
    } catch (err) {
      setError('Failed to update consent. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Manage Consent</h2>
                  <p className="text-sm text-gray-500">{childName}</p>
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
              {/* Current Status */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                <div className="flex items-center gap-2">
                  {currentStatus === 'approved' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-green-700">Consent Approved</span>
                    </>
                  ) : currentStatus === 'pending' ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <span className="font-medium text-amber-700">Awaiting Your Decision</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-red-700">
                        {currentStatus === 'denied' ? 'Consent Denied' : 'Consent Revoked'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="mb-6 text-sm text-gray-600">
                <p className="mb-2">
                  By approving consent, you allow {childName} to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Access NIL educational content</li>
                  <li>Complete discovery conversations</li>
                  <li>Take quizzes and earn badges</li>
                  <li>Build their learning profile</li>
                </ul>
                <p className="mt-3 text-xs text-gray-500">
                  You can revoke consent at any time. No personal data is shared externally.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {currentStatus !== 'approved' && (
                  <button
                    onClick={() => handleUpdateConsent('approved')}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve Consent
                  </button>
                )}

                {currentStatus === 'approved' && (
                  <button
                    onClick={() => handleUpdateConsent('revoked')}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Revoke Consent
                  </button>
                )}

                {currentStatus === 'pending' && (
                  <button
                    onClick={() => handleUpdateConsent('denied')}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    Deny Consent
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
