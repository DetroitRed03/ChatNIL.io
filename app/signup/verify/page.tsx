'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '@/components/brand/Logo';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResent(true);
    } catch (error) {
      console.error('Failed to resend:', error);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="p-6">
        <Logo size="md" variant="full" href="/" />
      </header>

      <div className="flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-orange-500" />
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Check your email
        </h1>
        <p className="text-gray-600 mb-6">
          We&apos;ve sent a verification link to:
          <br />
          <span className="font-medium text-gray-900">{email}</span>
        </p>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-gray-600">
            Click the link in the email to verify your account. If you don&apos;t see it, check your spam folder.
          </p>
        </div>

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={resending || resent}
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
        >
          {resending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : resent ? (
            <>
              <Mail className="w-4 h-4" />
              Email sent!
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Resend verification email
            </>
          )}
        </button>

        {/* Back to Login */}
        <p className="mt-8 text-gray-500">
          <Link href="/onboarding" className="text-orange-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
