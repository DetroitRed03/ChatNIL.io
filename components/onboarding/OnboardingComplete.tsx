'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Trophy, Users, UserCheck, ArrowRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { UserRole, Badge } from '@/types';
import OnboardingHeader from './OnboardingHeader';
import BadgeUnlockModal from '@/components/badges/BadgeUnlockModal';
import { supabase } from '@/lib/supabase';

interface OnboardingCompleteProps {
  role: UserRole;
  formData: Record<string, any>;
  onComplete: () => void;
  isLoading: boolean;
}

const roleConfig = {
  athlete: {
    icon: Trophy,
    title: 'Welcome to your NIL journey!',
    subtitle: 'Your athlete profile is complete',
    benefits: [
      'Personalized NIL opportunity matching',
      'Brand partnership recommendations',
      'Contract review assistance',
      'Social media strategy guidance'
    ],
    ctaText: 'Start exploring NIL opportunities',
    color: 'orange'
  },
  parent: {
    icon: Users,
    title: 'You\'re all set to support your athlete!',
    subtitle: 'Your parent profile is complete',
    benefits: [
      'NIL education and guidance resources',
      'Financial planning assistance',
      'Contract oversight tools',
      'Regular updates on NIL developments'
    ],
    ctaText: 'Access parent resources',
    color: 'blue'
  },
  coach: {
    icon: UserCheck,
    title: 'Ready to guide your athletes!',
    subtitle: 'Your coach profile is complete',
    benefits: [
      'NIL compliance training materials',
      'Athlete guidance frameworks',
      'Risk management resources',
      'Program administration tools'
    ],
    ctaText: 'Access coaching resources',
    color: 'green'
  }
};

export default function OnboardingComplete({
  role,
  formData,
  onComplete,
  isLoading
}: OnboardingCompleteProps) {
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const roleKey = role as keyof typeof roleConfig;
  const config = roleConfig[roleKey] || roleConfig.athlete;
  const IconComponent = config.icon;

  // Fetch the onboarding completion badge when component mounts
  useEffect(() => {
    const fetchOnboardingBadge = async () => {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch the "onboarding_complete" badge from user_badges
        const { data: userBadges, error } = await supabase
          .from('user_badges')
          .select(`
            badge:badges (
              id,
              name,
              description,
              icon,
              category,
              rarity,
              points
            )
          `)
          .eq('user_id', user.id)
          .eq('trigger', 'onboarding_complete')
          .order('earned_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && userBadges && userBadges.badge) {
          console.log('🎖️ Found onboarding badge:', userBadges.badge);
          setEarnedBadge(userBadges.badge as unknown as Badge);
          setShowBadgeModal(true);
        }
      } catch (error) {
        console.error('Failed to fetch onboarding badge:', error);
        // Don't show error to user - badge is optional
      }
    };

    fetchOnboardingBadge();
  }, []);

  const handleCompleteWithErrorHandling = async () => {
    console.log('🎉 === ONBOARDING COMPLETION BUTTON CLICKED ===');
    console.log('📊 Current state:', {
      role,
      isLoading,
      hasFormData: !!formData,
      formDataKeys: Object.keys(formData || {}),
      completionError
    });
    console.log('📋 Form data summary:', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role
    });

    setCompletionError(null);
    setIsRetrying(false);

    try {
      console.log('🎯 OnboardingComplete: Calling onComplete handler...');
      const startTime = Date.now();

      await onComplete();

      const endTime = Date.now();
      console.log(`✅ OnboardingComplete: Completion successful in ${endTime - startTime}ms`);
      console.log('✅ === ONBOARDING COMPLETION SUCCEEDED ===');
    } catch (error: any) {
      console.error('💥 === ONBOARDING COMPLETION FAILED ===');
      console.error('❌ Error type:', error.constructor.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Full error object:', error);

      const errorMessage = error.message || 'An unexpected error occurred during completion.';
      setCompletionError(errorMessage);
      console.error('💥 === ERROR DISPLAYED TO USER ===');
    }
  };

  const handleRetry = async () => {
    console.log('🔄 === RETRY BUTTON CLICKED ===');
    setIsRetrying(true);
    setCompletionError(null);

    try {
      console.log('🔄 Retrying onboarding completion...');
      await onComplete();
      console.log('✅ Retry successful');
    } catch (error: any) {
      console.error('❌ Retry failed:', error);
      console.error('❌ Error type:', error.constructor.name);
      console.error('❌ Error message:', error.message);
      setCompletionError(error.message || 'Retry failed. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  const getPersonalizedMessage = () => {
    switch (role) {
      case 'athlete':
        const athleteName = formData.firstName || 'Athlete';
        const sport = formData.primarySport || 'your sport';
        return `${athleteName}, you're ready to maximize your NIL potential in ${sport}!`;

      case 'parent':
        const parentName = formData.firstName || 'Parent';
        const athleteChild = formData.athleteFirstName || 'your athlete';
        return `${parentName}, you're equipped to support ${athleteChild}'s NIL journey!`;

      default:
        return 'You\'re all set!';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Badge Unlock Modal */}
      {earnedBadge && (
        <BadgeUnlockModal
          badge={earnedBadge}
          isOpen={showBadgeModal}
          onClose={() => setShowBadgeModal(false)}
          autoCloseAfter={0}
        />
      )}

      {/* User Navigation Header */}
      <OnboardingHeader />

      <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 100px)' }}>
        <div className="w-full max-w-2xl">
        {/* Success Animation Container */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            {/* Success Check */}
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>

            {/* Sparkle Effects */}
            <div className="absolute -top-2 -right-2 animate-bounce delay-100">
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="absolute -bottom-2 -left-2 animate-bounce delay-300">
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {config.title}
          </h1>

          <p className="text-lg text-gray-600 mb-2">
            {config.subtitle}
          </p>

          <p className="text-base text-green-600 font-medium">
            {getPersonalizedMessage()}
          </p>
        </div>

        {/* Role Icon and Benefits */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className={`p-4 rounded-xl bg-${config.color}-100 mr-4`}>
              <IconComponent className={`h-8 w-8 text-${config.color}-600`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">What's Next?</h2>
              <p className="text-gray-600">Here's what you can do now:</p>
            </div>
          </div>

          <div className="grid gap-4">
            {config.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className={`w-2 h-2 rounded-full bg-${config.color}-500 mr-3 flex-shrink-0`}></div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Profile Summary</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {role === 'athlete' && (
              <>
                <div>
                  <span className="text-gray-500">Name:</span>
                  <div className="font-medium">{formData.firstName} {formData.lastName}</div>
                </div>
                <div>
                  <span className="text-gray-500">Sport:</span>
                  <div className="font-medium">{formData.primarySport || 'Not specified'}</div>
                </div>
                <div>
                  <span className="text-gray-500">School:</span>
                  <div className="font-medium">{formData.schoolName || 'Not specified'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Graduation:</span>
                  <div className="font-medium">{formData.graduationYear || 'Not specified'}</div>
                </div>
              </>
            )}
            {role === 'parent' && (
              <>
                <div>
                  <span className="text-gray-500">Your Name:</span>
                  <div className="font-medium">{formData.firstName} {formData.lastName}</div>
                </div>
                <div>
                  <span className="text-gray-500">Athlete:</span>
                  <div className="font-medium">{formData.athleteFirstName} {formData.athleteLastName}</div>
                </div>
                <div>
                  <span className="text-gray-500">Relationship:</span>
                  <div className="font-medium capitalize">{formData.relationToAthlete}</div>
                </div>
                <div>
                  <span className="text-gray-500">Sport:</span>
                  <div className="font-medium">{formData.primarySport}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {completionError && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="flex items-start">
              <div className="p-1 bg-red-100 rounded-lg mr-3">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-900 mb-1">Completion Failed</h4>
                <p className="text-xs text-red-700 mb-3">{completionError}</p>
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="animate-spin h-3 w-3 mr-1" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Try Again
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleCompleteWithErrorHandling}
            disabled={isLoading || isRetrying}
            className={`inline-flex items-center px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-300 ${
              isLoading || isRetrying
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : `bg-${config.color}-500 text-white hover:bg-${config.color}-600 hover:shadow-xl transform hover:scale-105`
            }`}
          >
            {isLoading || isRetrying ? (
              <>
                <RefreshCw className="animate-spin h-5 w-5 mr-3" />
                {isRetrying ? 'Retrying...' : 'Finishing setup...'}
              </>
            ) : (
              <>
                {config.ctaText}
                <ArrowRight className="ml-3 h-5 w-5" />
              </>
            )}
          </button>

          <p className="mt-4 text-sm text-gray-600">
            You can always update your profile later in settings
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}