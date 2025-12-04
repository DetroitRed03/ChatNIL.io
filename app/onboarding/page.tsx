'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import OnboardingRouter from '@/components/onboarding/OnboardingRouter';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Determine redirect path based on user role
  const getRedirectPath = () => {
    if (user?.role === 'agency') {
      return '/agencies/dashboard';
    }
    return '/dashboard';
  };

  const handleComplete = async () => {
    console.log('🎉 OnboardingPage: Handling completion');
    console.log('👤 User role:', user?.role);

    const redirectPath = getRedirectPath();
    console.log('🎯 Redirect path:', redirectPath);

    const MAX_COMPLETION_TIME = 15000; // 15 seconds max
    let forceRedirectTimer: NodeJS.Timeout | null = null;

    try {
      // Set a force redirect timer as ultimate fallback
      forceRedirectTimer = setTimeout(() => {
        console.log('⏰ Force redirect triggered - user was taking too long');
        window.location.href = redirectPath;
      }, MAX_COMPLETION_TIME);

      // Show success message first
      setShowSuccessMessage(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Show for 2 seconds

      // Start redirecting
      console.log('🔄 Starting redirect to profile page');
      setIsRedirecting(true);
      setShowSuccessMessage(false);

      // Small delay to show redirect state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clear force redirect timer
      if (forceRedirectTimer) {
        clearTimeout(forceRedirectTimer);
      }

      // Try router first, then fallback
      try {
        router.push(redirectPath);
        // Set a backup timer in case router.push doesn't work
        setTimeout(() => {
          if (window.location.pathname.includes('/onboarding')) {
            console.log('🔄 Router.push may have failed, using window.location');
            window.location.href = redirectPath;
          }
        }, 3000);
      } catch (routerError) {
        console.log('❌ Router.push failed, using window.location immediately');
        window.location.href = redirectPath;
      }
    } catch (error) {
      console.error('❌ Redirect failed:', error);

      // Clear force redirect timer
      if (forceRedirectTimer) {
        clearTimeout(forceRedirectTimer);
      }

      // Fallback to window.location if router fails
      console.log('🔄 Final fallback redirect to', redirectPath);
      window.location.href = redirectPath;
    }
  };

  const handleExit = () => {
    console.log('🚪 OnboardingPage: Handling exit');
    // Redirect back to main app
    router.push('/');
  };

  return (
    <div className="relative">
      <ErrorBoundary
        showErrorDetails={process.env.NODE_ENV === 'development'}
        onError={(error, errorInfo) => {
          console.error('🚨 Onboarding Error:', error, errorInfo);
          // In production, you might want to send this to an error tracking service
        }}
      >
        <OnboardingProvider>
          <OnboardingRouter
            onComplete={handleComplete}
            onExit={handleExit}
            showExitButton={true}
          />
        </OnboardingProvider>
      </ErrorBoundary>

      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Congratulations! 🎉
            </h2>
            <p className="text-gray-600 mb-4">
              Your profile has been successfully created and saved.
            </p>
            <p className="text-sm text-gray-500">
              Taking you to your profile page...
            </p>
          </div>
        </div>
      )}

      {/* Redirect Loading Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center">
            <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Redirecting...
            </h2>
            <p className="text-gray-600">
              Taking you to your profile page
            </p>
          </div>
        </div>
      )}
    </div>
  );
}