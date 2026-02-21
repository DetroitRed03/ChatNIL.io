'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/AuthGuard';
import QuizTaking from '@/components/quiz/QuizTaking';
import QuizResults from '@/components/quiz/QuizResults';
import BadgeUnlockModal from '@/components/badges/BadgeUnlockModal';
import { QuizQuestion, Badge } from '@/types';
import { Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

function QuizSessionContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = params.code as string; // Short code like "Xk9mQ2nP"

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [badgeEarned, setBadgeEarned] = useState<Badge | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [resultsError, setResultsError] = useState(false);

  useEffect(() => {
    // Try to get questions from sessionStorage (set when quiz was started)
    try {
      // Check if sessionStorage is available (may not be in some browsers/contexts)
      if (typeof window === 'undefined' || !window.sessionStorage) {
        console.error('sessionStorage is not available');
        router.push('/quizzes');
        return;
      }

      const storedQuestions = sessionStorage.getItem(`quiz_${sessionId}`);

      if (storedQuestions) {
        try {
          const parsedQuestions = JSON.parse(storedQuestions);

          // Validate that we got an array of questions
          if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
            console.error('Invalid quiz data format: expected non-empty array');
            sessionStorage.removeItem(`quiz_${sessionId}`);
            router.push('/quizzes');
            return;
          }

          setQuestions(parsedQuestions);
          setLoading(false);
        } catch (parseError) {
          console.error('Failed to parse quiz questions:', parseError);
          // Clean up corrupted data
          sessionStorage.removeItem(`quiz_${sessionId}`);
          router.push('/quizzes');
        }
      } else {
        // If no stored questions, redirect back to quiz list
        console.log('No quiz questions found in sessionStorage for session:', sessionId);
        router.push('/quizzes');
      }
    } catch (storageError) {
      console.error('sessionStorage access error:', storageError);
      router.push('/quizzes');
    }
  }, [sessionId, router]);

  const handleQuizComplete = async () => {
    try {
      // Fetch quiz results
      const response = await fetch(`/api/quizzes/session/${sessionId}`);

      if (!response.ok) {
        console.error('Quiz results API error:', response.status, response.statusText);
        return;
      }

      const data = await response.json();

      if (data.success && data.results?.total_questions > 0) {
        setResults(data.results);
        setShowResults(true);

        // Track quiz completion with safe sessionStorage access
        if (user) {
          let quizData = { category: 'unknown', difficulty: 'unknown' };

          try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
              const storedMetadata = sessionStorage.getItem(`quiz_metadata_${sessionId}`);
              if (storedMetadata) {
                quizData = JSON.parse(storedMetadata);
              }
            }
          } catch (metadataError) {
            console.warn('Could not read quiz metadata:', metadataError);
          }

          trackEvent('quiz_completed', {
            user_id: user.id,
            role: user.role,
            session_id: sessionId,
            category: quizData.category || 'unknown',
            difficulty: quizData.difficulty || 'unknown',
            score_percentage: data.results?.score_percentage ?? 0,
            time_taken_seconds: data.results?.time_taken_seconds ?? 0,
            questions_total: data.results?.total_questions ?? 0,
            questions_correct: data.results?.correct_answers ?? 0,
          });
        }

        // Check if this was the user's first quiz (award badge)
        await checkForBadgeAward();
      } else if (data.results?.total_questions === 0) {
        // Answers weren't persisted — show error state instead of 0% results
        console.error('Quiz results returned 0 questions — answers may not have been saved');
        setResultsError(true);
      } else {
        console.error('Quiz results fetch failed:', data.error);
        setResultsError(true);
      }
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      setResultsError(true);
    }
  };

  const checkForBadgeAward = async () => {
    try {
      // Check for all quiz-related badges
      const response = await fetch('/api/badges/check-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          quizScore: results?.score_percentage || 0
        })
      });

      const data = await response.json();

      if (data.success && data.awardedBadges && data.awardedBadges.length > 0) {
        // Show the first badge earned (could be enhanced to show multiple)
        const firstBadge = data.awardedBadges[0];
        setBadgeEarned(firstBadge.badge);
        setShowBadgeModal(true);
      }
    } catch (error) {
      console.error('Error checking for badge:', error);
    }
  };

  const handleRetry = () => {
    router.push('/quizzes');
  };

  const handleBrowseQuizzes = () => {
    router.push('/quizzes');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (resultsError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😕</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">
            Your quiz answers may not have been saved. Please try taking the quiz again.
          </p>
          <button
            onClick={() => router.push('/quizzes')}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-500 hover:to-amber-600 transition-all"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showResults && results ? (
        <QuizResults
          sessionId={sessionId}
          results={results}
          badgeEarned={badgeEarned}
          onRetry={handleRetry}
          onBrowseQuizzes={handleBrowseQuizzes}
        />
      ) : (
        <QuizTaking
          sessionId={sessionId}
          questions={questions}
          userId={user.id}
          onComplete={handleQuizComplete}
        />
      )}

      {/* Badge Unlock Modal */}
      {badgeEarned && (
        <BadgeUnlockModal
          badge={badgeEarned}
          isOpen={showBadgeModal}
          onClose={() => setShowBadgeModal(false)}
          autoCloseAfter={5000}
        />
      )}
    </>
  );
}

export default function QuizSessionPage() {
  return (
    <ProtectedRoute>
      <QuizSessionContent />
    </ProtectedRoute>
  );
}
