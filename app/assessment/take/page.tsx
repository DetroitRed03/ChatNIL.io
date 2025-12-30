'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  AssessmentProgressBar,
  AssessmentCard,
} from '@/components/assessment';
import { useAssessmentStore } from '@/lib/assessment/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  ListChecks,
  ChevronRight,
  X,
} from 'lucide-react';
import type { ResponseValue, AssessmentQuestion } from '@/lib/assessment/types';

export default function AssessmentTakePage() {
  const { user, isLoading: authLoading, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [showReview, setShowReview] = useState(false);

  const {
    session,
    questions,
    responses,
    currentQuestionIndex,
    isLoading,
    error,
    loadSession,
    loadQuestions,
    startSession,
    answerQuestion,
    skipQuestion,
    nextQuestion,
    previousQuestion,
    submitAssessment,
    getCurrentQuestion,
    getProgress,
    canGoNext,
    canGoPrevious,
    isComplete,
    getSkippedQuestions,
    reset: resetAssessmentStore,
  } = useAssessmentStore();

  // Handle auth redirects - wait for BOTH auth AND profile to load
  useEffect(() => {
    if (authLoading || isLoadingProfile) return;

    if (!user) {
      router.replace('/');
      return;
    }

    if (user.role !== 'athlete') {
      const redirectPath = user.role === 'agency' ? '/agency/dashboard' : '/dashboard';
      router.replace(redirectPath);
    }
  }, [user, authLoading, isLoadingProfile, router]);

  // Load session and questions on mount
  useEffect(() => {
    if (user && user.role === 'athlete') {
      initializeAssessment();
    }
  }, [user]);

  const initializeAssessment = async () => {
    if (!user?.id) return;

    await loadSession(user.id);
    await loadQuestions();

    // If no session, start one
    const store = useAssessmentStore.getState();
    if (!store.session && user) {
      await startSession(user.id);
    }
  };

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const skippedQuestions = getSkippedQuestions();
  const complete = isComplete();

  // Handle answer submission
  const handleAnswer = async (questionId: string, value: ResponseValue) => {
    await answerQuestion(questionId, value);
  };

  // Handle skip
  const handleSkip = async (questionId: string) => {
    await skipQuestion(questionId);
    nextQuestion();
  };

  // Handle submit
  const handleSubmit = async () => {
    await submitAssessment();
    router.push('/assessment/results');
  };

  // Handle start over
  const handleStartOver = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to start over? Your current progress will be lost.'
    );
    if (!confirmed) return;

    try {
      // Delete the session from the database
      await fetch(`/api/assessment/session?userId=${user?.id}`, {
        method: 'DELETE',
      });

      // Reset the Zustand store
      resetAssessmentStore();

      // Navigate back to landing page
      router.push('/assessment');
    } catch (error) {
      console.error('Error starting over:', error);
    }
  };

  // Show review mode when all questions answered
  useEffect(() => {
    if (complete && !showReview) {
      setShowReview(true);
    }
  }, [complete]);

  // Show loading state while auth/profile is loading
  if (authLoading || isLoadingProfile || !user || user.role !== 'athlete' || (isLoading && !currentQuestion)) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20">
        <Card variant="elevated" className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button variant="primary" onClick={() => router.push('/assessment')}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Review mode - show skipped questions or submit
  if (showReview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-100 text-success-700 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Almost Done!</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Review Your Assessment
            </h1>
            <p className="text-gray-600">
              {skippedQuestions.length > 0
                ? `You have ${skippedQuestions.length} skipped question${skippedQuestions.length !== 1 ? 's' : ''}. Would you like to answer them?`
                : 'All questions answered! Ready to see your results?'}
            </p>
          </motion.div>

          {/* Skipped questions */}
          {skippedQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ListChecks className="w-5 h-5 text-warning-600" />
                    <h3 className="font-semibold text-gray-900">
                      Skipped Questions
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {skippedQuestions.map((q, index) => {
                      const questionIndex = questions.findIndex(
                        (question) => question.id === q.id
                      );

                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            useAssessmentStore.setState({
                              currentQuestionIndex: questionIndex,
                            });
                            setShowReview(false);
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center font-medium">
                              {questionIndex + 1}
                            </span>
                            <span className="text-sm text-gray-700 line-clamp-1">
                              {q.questionText}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Submit button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              isLoading={isLoading}
              className="px-8"
            >
              {skippedQuestions.length > 0
                ? 'Submit Anyway'
                : 'See My Results'}
            </Button>
            {skippedQuestions.length > 0 && (
              <p className="mt-3 text-sm text-gray-500">
                Skipped questions won&apos;t affect your top trait calculations
              </p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Preparing questions...</p>
        </div>
      </div>
    );
  }

  // Get current response value
  const currentResponse = responses[currentQuestion.id];
  const currentValue = currentResponse?.responseValue;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with Start Over button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end mb-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartOver}
            leftIcon={<X className="w-4 h-4" />}
            className="text-gray-500 hover:text-gray-700"
          >
            Start Over
          </Button>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <AssessmentProgressBar
            current={progress?.answeredCount || 0}
            total={progress?.totalQuestions || questions.length}
            section={currentQuestion.section}
            skippedCount={progress?.skippedCount || 0}
          />
        </motion.div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <AssessmentCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              currentValue={currentValue}
              onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
              onSkip={() => handleSkip(currentQuestion.id)}
              onNext={() => {
                if (currentQuestionIndex === questions.length - 1) {
                  setShowReview(true);
                } else {
                  nextQuestion();
                }
              }}
              onPrevious={previousQuestion}
              canGoNext={canGoNext()}
              canGoPrevious={canGoPrevious()}
              skippedCount={session?.skippedQuestionIds?.length || 0}
              isSubmitting={isLoading}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
