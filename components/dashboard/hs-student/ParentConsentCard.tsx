'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

type ConsentStatus = 'pending' | 'approved' | 'expired' | 'not_required';

interface ParentConsentCardProps {
  status: ConsentStatus;
  parentEmail?: string;
  requestedAt?: string;
  expiresAt?: string;
  onResendRequest?: () => Promise<void>;
}

const statusConfig = {
  pending: {
    icon: '⏳',
    title: 'Parent Consent Pending',
    description: 'Waiting for your parent/guardian to approve',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    showResend: true,
  },
  approved: {
    icon: '✅',
    title: 'Parent Consent Approved',
    description: 'You\'re all set to explore NIL opportunities',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    showResend: false,
  },
  expired: {
    icon: '⚠️',
    title: 'Consent Expired',
    description: 'Please request new consent from your parent',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    showResend: true,
  },
  not_required: {
    icon: '🎉',
    title: 'No Consent Required',
    description: 'You\'re 18+ and can manage your own NIL',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    showResend: false,
  },
};

export function ParentConsentCard({
  status,
  parentEmail,
  requestedAt,
  expiresAt,
  onResendRequest,
}: ParentConsentCardProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const config = statusConfig[status];

  const handleResend = async () => {
    if (!onResendRequest) return;
    setIsResending(true);
    try {
      await onResendRequest();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to resend consent request:', error);
    } finally {
      setIsResending(false);
    }
  };

  // Don't show card if approved
  if (status === 'approved' || status === 'not_required') {
    return null;
  }

  return (
    <motion.div
      data-testid="parent-consent-card"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 p-4 ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{config.icon}</span>
        <div className="flex-1">
          <h3 data-testid="consent-status" className={`font-semibold ${config.textColor}`}>{config.title}</h3>
          <p className={`text-sm ${config.textColor} opacity-80 mt-1`}>
            {config.description}
          </p>

          {parentEmail && (
            <p className="text-sm text-gray-600 mt-2">
              Request sent to: <span className="font-medium">{parentEmail}</span>
            </p>
          )}

          {requestedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Sent on {new Date(requestedAt).toLocaleDateString()}
            </p>
          )}

          {expiresAt && status === 'pending' && (
            <p className="text-xs text-amber-600 mt-1">
              Expires: {new Date(expiresAt).toLocaleDateString()}
            </p>
          )}

          {config.showResend && onResendRequest && (
            <motion.button
              data-testid="resend-consent-email"
              onClick={handleResend}
              disabled={isResending || resendSuccess}
              className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${resendSuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }
                disabled:opacity-50 disabled:cursor-not-allowed`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isResending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Sending...
                </span>
              ) : resendSuccess ? (
                <span className="flex items-center gap-2">
                  ✓ Email Sent!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  📧 Resend Request
                </span>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
