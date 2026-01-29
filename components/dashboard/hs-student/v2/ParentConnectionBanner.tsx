'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ParentConnectionBannerProps {
  status: 'pending' | 'expired' | 'not_required';
  parentEmail?: string;
  onResendRequest: () => Promise<void>;
}

export function ParentConnectionBanner({
  status,
  parentEmail,
  onResendRequest,
}: ParentConnectionBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    await onResendRequest();
    setIsResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: '👪',
          title: 'Waiting for parent approval',
          description: parentEmail
            ? `We sent a consent request to ${parentEmail}`
            : 'Ask a parent to verify your account',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconBg: 'bg-amber-100',
        };
      case 'expired':
        return {
          icon: '⏰',
          title: 'Consent request expired',
          description: 'The previous request expired. Send a new one to continue.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-100',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <motion.div
      data-testid="parent-connection-banner"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-4`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`${config.iconBg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
          <span className="text-2xl">{config.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-grow">
          <h3 className="font-semibold text-gray-900">{config.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{config.description}</p>

          {/* Progress indicator for pending */}
          {status === 'pending' && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
              <motion.div
                className="w-2 h-2 bg-amber-500 rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span>Waiting for response...</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <motion.button
          onClick={handleResend}
          disabled={isResending || resent}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0
            ${resent
              ? 'bg-green-100 text-green-700'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isResending ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              ⏳
            </motion.span>
          ) : resent ? (
            '✓ Sent!'
          ) : (
            'Resend Request'
          )}
        </motion.button>
      </div>

      {/* Helpful tips */}
      <div className="mt-4 pt-4 border-t border-amber-200/50">
        <p className="text-xs text-gray-500">
          💡 <strong>Tip:</strong> Ask your parent to check their spam folder if they haven't received the email.
        </p>
      </div>
    </motion.div>
  );
}
