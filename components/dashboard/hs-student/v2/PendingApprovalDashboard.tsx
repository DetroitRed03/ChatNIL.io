'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ParentInviteForm from './ParentInviteForm';
import ApprovalStatusCard from './ApprovalStatusCard';
import PreviewCard from './PreviewCard';
import WhatHappensNext from './WhatHappensNext';

interface InviteStatus {
  hasInvite: boolean;
  status: 'pending' | 'viewed' | 'approved' | 'declined' | 'expired' | null;
  parentEmail: string | null;
  createdAt: string | null;
  expiresAt: string | null;
}

export default function PendingApprovalDashboard() {
  const { user } = useAuth();
  const [inviteStatus, setInviteStatus] = useState<InviteStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current invite status
  useEffect(() => {
    const fetchInviteStatus = async () => {
      try {
        const response = await fetch('/api/parent-invites/status');
        if (response.ok) {
          const data = await response.json();
          setInviteStatus(data);
        }
      } catch (error) {
        console.error('Error fetching invite status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchInviteStatus();
    }
  }, [user]);

  const handleInviteSent = () => {
    // Refresh invite status after sending
    setIsLoading(true);
    fetch('/api/parent-invites/status')
      .then(res => res.json())
      .then(data => {
        setInviteStatus(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">
            Almost There, {user?.first_name || 'Future Champion'}!
          </h1>
          <p className="text-primary-100 text-sm">
            One quick step before you can start your NIL journey
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Main Status Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Lock Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Parent/Guardian Approval Required
            </h2>
            <p className="text-gray-600 text-center text-sm mb-6">
              Because you&apos;re under 18, we need a parent or guardian to approve your account.
              This keeps you safe and follows state NIL laws.
            </p>

            {/* Status or Form */}
            {inviteStatus?.hasInvite ? (
              <ApprovalStatusCard
                status={inviteStatus.status}
                parentEmail={inviteStatus.parentEmail}
                createdAt={inviteStatus.createdAt}
                expiresAt={inviteStatus.expiresAt}
                onResend={handleInviteSent}
              />
            ) : (
              <ParentInviteForm onSuccess={handleInviteSent} />
            )}
          </div>
        </div>

        {/* What You Can Preview */}
        <PreviewCard />

        {/* What Happens Next */}
        <WhatHappensNext hasInvite={inviteStatus?.hasInvite || false} />

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Common Questions</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Why do I need parent approval?</p>
              <p className="text-sm text-gray-600 mt-1">
                State laws require parental consent for minors to participate in NIL activities.
                This protects you and ensures your family is informed about your NIL journey.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">How long does approval take?</p>
              <p className="text-sm text-gray-600 mt-1">
                Most parents approve within 24 hours of receiving the email.
                You&apos;ll get notified instantly when they approve.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">What if my parent doesn&apos;t receive the email?</p>
              <p className="text-sm text-gray-600 mt-1">
                Check their spam folder first. You can also resend the invitation or
                try a different email address using the button above.
              </p>
            </div>
          </div>
        </div>

        {/* Support Footer */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Need help? Contact{' '}
            <a href="mailto:support@chatnil.com" className="text-primary-600 hover:underline">
              support@chatnil.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
