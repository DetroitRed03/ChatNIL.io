'use client';

import { useState } from 'react';

interface ApprovalStatusCardProps {
  status: 'pending' | 'viewed' | 'approved' | 'declined' | 'expired' | null;
  parentEmail: string | null;
  createdAt: string | null;
  expiresAt: string | null;
  onResend: () => void;
}

export default function ApprovalStatusCard({
  status,
  parentEmail,
  createdAt,
  expiresAt,
  onResend,
}: ApprovalStatusCardProps) {
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/parent-invites/resend', {
        method: 'POST',
      });
      if (response.ok) {
        onResend();
      }
    } catch (error) {
      console.error('Error resending invite:', error);
    } finally {
      setIsResending(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          title: 'Waiting for Response',
          description: `We sent an email to ${parentEmail}. They just need to click the approval link.`,
        };
      case 'viewed':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          ),
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          title: 'Your Parent Opened the Email!',
          description: 'They\'ve seen the approval request. Approval should come soon!',
        };
      case 'declined':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          title: 'Request Was Declined',
          description: 'Your parent/guardian declined the request. Talk to them about why and try again if appropriate.',
        };
      case 'expired':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          title: 'Invitation Expired',
          description: 'The approval link has expired. Send a new invitation to continue.',
        };
      default:
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          title: 'Unknown Status',
          description: 'Please refresh the page or contact support.',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="space-y-4">
      {/* Status Display */}
      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
        <div className={`${config.iconBg} ${config.iconColor} p-3 rounded-full flex-shrink-0`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{config.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{config.description}</p>
          {createdAt && (
            <p className="text-xs text-gray-500 mt-2">
              Sent on {formatDate(createdAt)}
            </p>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      {(status === 'pending' || status === 'viewed') && (
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs text-gray-600">Sent</span>
          </div>
          <div className="flex-1 h-1 mx-2 bg-gray-200 rounded">
            <div
              className={`h-full bg-green-500 rounded transition-all ${
                status === 'viewed' ? 'w-full' : 'w-0'
              }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                status === 'viewed' ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              {status === 'viewed' ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-xs text-white">2</span>
              )}
            </div>
            <span className="text-xs text-gray-600">Viewed</span>
          </div>
          <div className="flex-1 h-1 mx-2 bg-gray-200 rounded" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">3</span>
            </div>
            <span className="text-xs text-gray-600">Approved</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {(status === 'pending' || status === 'expired' || status === 'declined') && (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isResending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent" />
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {status === 'expired' || status === 'declined' ? 'Send New Invitation' : 'Resend Email'}
              </>
            )}
          </button>
        )}
        {(status === 'declined' || status === 'expired') && (
          <button
            onClick={() => window.location.reload()}
            className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Try Different Email
          </button>
        )}
      </div>
    </div>
  );
}
