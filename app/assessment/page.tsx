'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Clock,
  Target,
  ArrowRight,
  CheckCircle,
  Pause,
  Play,
  Loader2,
} from 'lucide-react';
import { useAssessmentStore } from '@/lib/assessment/store';

interface SessionStatus {
  hasSession: boolean;
  hasResults: boolean;
  session?: {
    id: string;
    status: string;
    currentQuestionIndex: number;
    totalQuestions: number;
  };
  results?: {
    archetypeCode: string;
    archetypeName: string;
    topTraits: string[];
    calculatedAt: string;
  };
}

export default function AssessmentLandingPage() {
  const { user, isLoading: authLoading, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [starting, setStarting] = useState(false);
  const { reset: resetAssessmentStore } = useAssessmentStore();

  // Combined effect for auth check and session loading
  useEffect(() => {
    // Wait for BOTH auth session AND profile to be loaded
    if (authLoading || isLoadingProfile) {
      console.log('🔄 Assessment: Auth/profile still loading...', { authLoading, isLoadingProfile });
      return;
    }

    // Auth and profile loaded, no user - redirect to login
    if (!user) {
      console.log('🔒 Assessment: No user after full load, redirecting to home...');
      router.replace('/');
      return;
    }

    // Auth loaded, user is not an athlete - redirect to appropriate dashboard
    if (user.role !== 'athlete') {
      const redirectPath = user.role === 'agency' ? '/agencies/dashboard' : '/dashboard';
      console.log(`🔒 Assessment: User is ${user.role}, redirecting to ${redirectPath}...`);
      router.replace(redirectPath);
      return;
    }

    // User is an athlete - load session status
    console.log('✅ Assessment: User is athlete, loading session status...');
    checkSessionStatus();
  }, [user, authLoading, isLoadingProfile, router]);

  const checkSessionStatus = async () => {
    try {
      const response = await fetch(`/api/assessment/session?userId=${user?.id}`);
      const data = await response.json();

      setSessionStatus({
        hasSession: !!data.session,
        hasResults: !!data.results,
        session: data.session,
        results: data.results,
      });
    } catch (error) {
      console.error('Error checking session status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = async () => {
    try {
      setStarting(true);

      // Reset the Zustand store to clear any old session data
      resetAssessmentStore();

      const response = await fetch('/api/assessment/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });

      const data = await response.json();

      // API returns data.session.id, not data.sessionId
      if (data.session?.id) {
        router.push('/assessment/take');
      } else {
        console.error('Failed to create session:', data);
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
    } finally {
      setStarting(false);
    }
  };

  const handleContinueAssessment = () => {
    router.push('/assessment/take');
  };

  const handleStartOver = async () => {
    // Ask for confirmation before resetting
    const confirmed = window.confirm(
      'Are you sure you want to start over? Your current progress will be lost.'
    );
    if (!confirmed) return;

    try {
      setLoading(true);

      // Delete the session from the database
      await fetch(`/api/assessment/session?userId=${user?.id}`, {
        method: 'DELETE',
      });

      // Reset the Zustand store to clear any old session data
      resetAssessmentStore();

      // Reset local state to show landing page
      setSessionStatus(null);

      // Re-check session status (will show landing page since session was deleted)
      await checkSessionStatus();
    } catch (error) {
      console.error('Error starting over:', error);
      setLoading(false);
    }
  };

  const handleViewResults = () => {
    router.push('/assessment/results');
  };

  // Show loading state while auth is loading, profile is loading, or checking session
  // Note: Only show loader if we're actively loading - redirect conditions are handled in useEffect
  if (authLoading || isLoadingProfile || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {authLoading ? 'Authenticating...' : isLoadingProfile ? 'Loading profile...' : 'Loading assessment...'}
          </p>
        </div>
      </div>
    );
  }

  // If we reach here but user is not an athlete, show a brief loading while redirect happens
  if (!user || user.role !== 'athlete') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show results preview if completed
  if (sessionStatus?.hasResults && sessionStatus.results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-100 text-success-700 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Assessment Complete</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Your Brand Identity
            </h1>
            <p className="text-lg text-gray-600">
              You&apos;ve discovered your athlete archetype
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated" className="mb-6">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {sessionStatus.results.archetypeName}
                </h2>
                <p className="text-gray-600 mb-6">
                  Top traits: {sessionStatus.results.topTraits.slice(0, 3).join(', ')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleViewResults}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    View Full Results
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleStartOver}
                  >
                    Retake Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show in-progress state
  if (sessionStatus?.hasSession && sessionStatus.session) {
    const progress = Math.round(
      (sessionStatus.session.currentQuestionIndex / sessionStatus.session.totalQuestions) * 100
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning-100 text-warning-700 mb-4">
              <Pause className="w-5 h-5" />
              <span className="font-medium">Assessment In Progress</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Continue Your Journey
            </h1>
            <p className="text-lg text-gray-600">
              Pick up where you left off
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated" className="mb-6">
              <CardContent className="p-8">
                <div className="mb-6">
                  <Progress
                    value={sessionStatus.session.currentQuestionIndex}
                    max={sessionStatus.session.totalQuestions}
                    variant="primary"
                    showValue
                    label="Your Progress"
                  />
                </div>
                <p className="text-center text-gray-600 mb-6">
                  Question {sessionStatus.session.currentQuestionIndex} of{' '}
                  {sessionStatus.session.totalQuestions}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleContinueAssessment}
                    leftIcon={<Play className="w-5 h-5" />}
                  >
                    Continue Assessment
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleStartOver}
                  >
                    Start Over
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show landing page for new users
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Brand Identity Assessment</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Discover Your
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              {' '}Athlete Archetype
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Uncover your unique personality traits and find the perfect brand partnerships
            that align with who you truly are.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
        >
          <Card variant="default" className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-primary-100 mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">5-7 Minutes</h3>
              <p className="text-sm text-gray-600">
                Quick assessment with 20 thoughtful questions
              </p>
            </CardContent>
          </Card>

          <Card variant="default" className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-accent-100 mx-auto mb-4 flex items-center justify-center">
                <Target className="w-6 h-6 text-accent-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">12 Core Traits</h3>
              <p className="text-sm text-gray-600">
                Discover your strengths across key personality dimensions
              </p>
            </CardContent>
          </Card>

          <Card variant="default" className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-success-100 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-success-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">8 Archetypes</h3>
              <p className="text-sm text-gray-600">
                Find your archetype among legendary athlete brand types
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartAssessment}
            isLoading={starting}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="px-8"
          >
            Start Assessment
          </Button>
          <p className="mt-4 text-sm text-gray-500">
            You can skip questions and return to them later
          </p>
        </motion.div>
      </div>
    </div>
  );
}
