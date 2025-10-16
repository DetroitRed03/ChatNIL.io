'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/AuthGuard';
import QuizTaking from '@/components/quiz/QuizTaking';
import QuizResults from '@/components/quiz/QuizResults';
import BadgeUnlockModal from '@/components/badges/BadgeUnlockModal';
import { QuizQuestion, Badge } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

function QuizSessionContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = params.sessionId as string;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [badgeEarned, setBadgeEarned] = useState<Badge | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  useEffect(() => {
    // Try to get questions from sessionStorage (set when quiz was started)
    const storedQuestions = sessionStorage.getItem(`quiz_${sessionId}`);

    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
      setLoading(false);
    } else {
      // If no stored questions, redirect back to quiz list
      router.push('/quizzes');
    }
  }, [sessionId, router]);

  const handleQuizComplete = async () => {
    try {
      // Fetch quiz results
      const response = await fetch(`/api/quizzes/session/${sessionId}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        setShowResults(true);

        // Track quiz completion
        if (user) {
          const quizData = JSON.parse(sessionStorage.getItem(`quiz_metadata_${sessionId}`) || '{}');
          trackEvent('quiz_completed', {
            user_id: user.id,
            role: user.role,
            session_id: sessionId,
            category: quizData.category || 'unknown',
            difficulty: quizData.difficulty || 'unknown',
            score: data.results.score_percentage,
            correct_answers: data.results.correct_answers,
            total_questions: data.results.total_questions,
            total_points: data.results.total_points,
          });
        }

        // Check if this was the user's first quiz (award badge)
        await checkForBadgeAward();
      }
    } catch (error) {
      console.error('Error fetching quiz results:', error);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
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
