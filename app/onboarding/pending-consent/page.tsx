'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useState } from 'react';

export default function PendingConsentPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const checkConsentStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/onboarding/check-consent');
      const data = await response.json();

      if (data.consentApproved) {
        router.push('/discovery');
      } else {
        // Show message that consent is still pending
        alert('Your parent/guardian hasn\'t approved yet. We\'ll let you know when they do!');
      }
    } catch (error) {
      console.error('Error checking consent:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const resendConsentEmail = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/onboarding/resend-consent', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        alert('Consent email sent again! Check with your parent/guardian.');
      }
    } catch (error) {
      console.error('Error resending consent:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mx-auto mb-4 p-4 bg-blue-500/20 rounded-full w-fit"
            >
              <Mail className="h-12 w-12 text-blue-400" />
            </motion.div>
            <CardTitle className="text-2xl text-white">Almost There! 📬</CardTitle>
            <CardDescription className="text-gray-400">
              We've sent a consent request to your parent/guardian
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Steps */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Profile Created</p>
                  <p className="text-sm text-gray-400">Your basic info is saved</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Consent Email Sent</p>
                  <p className="text-sm text-gray-400">Your parent needs to approve</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-700 rounded-full">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Waiting for Approval</p>
                  <p className="text-sm text-gray-500">Once approved, you can start!</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                <strong>What happens next?</strong>
              </p>
              <ul className="mt-2 text-sm text-gray-400 space-y-1">
                <li>• Your parent gets an email with a link</li>
                <li>• They click to approve your account</li>
                <li>• You can then start your NIL Discovery Journey!</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={checkConsentStatus}
                disabled={isChecking}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isChecking ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Check if Approved
              </Button>

              <Button
                variant="outline"
                onClick={resendConsentEmail}
                disabled={isResending}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {isResending ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Resend Email to Parent
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500">
              Need help? Ask your parent to check their spam folder, or contact support.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
