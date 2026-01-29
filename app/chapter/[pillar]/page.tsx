'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { XPEarnedToast } from '@/components/hs-student-dashboard/feedback/XPEarnedToast';

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'text' | 'true_false';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

interface ChapterData {
  pillar: string;
  title: string;
  description: string;
  icon: string;
  questions: Question[];
  currentProgress: number;
  totalQuestions: number;
  xpPerQuestion: number;
  // Persistence data
  savedAnswers?: Record<number, { questionId: string; answer: string }>;
  answeredIndices?: number[];
}

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const pillar = params.pillar as string;

  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showXPToast, setShowXPToast] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Track answered questions for navigation
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});

  const fetchChapter = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const res = await fetch(`/api/chapters/${pillar}`, {
        credentials: 'include',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });

      if (!res.ok) {
        if (res.status === 403) {
          // Chapter locked
          router.push('/dashboard/hs-student?locked=true');
          return;
        }
        if (res.status === 401) {
          // Not authenticated
          router.push('/login');
          return;
        }
        throw new Error('Failed to load chapter');
      }
      const data = await res.json();
      setChapter(data);

      // Restore saved progress from database
      if (data.savedAnswers && data.answeredIndices) {
        // Restore answered questions set
        const answeredSet = new Set<number>(data.answeredIndices);
        setAnsweredQuestions(answeredSet);

        // Restore all saved answers
        const answers: Record<number, string> = {};
        for (const [indexStr, answerData] of Object.entries(data.savedAnswers)) {
          const idx = parseInt(indexStr);
          answers[idx] = (answerData as { answer: string }).answer;
        }
        setQuestionAnswers(answers);

        // Set current question to the next unanswered one
        // If all questions answered, stay on the last one
        if (data.currentProgress >= data.totalQuestions) {
          setCurrentQuestionIndex(data.totalQuestions - 1);
          // Show the last question's explanation since it's been answered
          const lastAnswer = answers[data.totalQuestions - 1];
          if (lastAnswer) {
            setSelectedOption(lastAnswer);
            setAnswer(lastAnswer);
            setShowExplanation(true);
            setIsCorrect(true);
          }
        } else {
          setCurrentQuestionIndex(data.currentProgress);
        }
      } else {
        setCurrentQuestionIndex(data.currentProgress || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pillar, router]);

  useEffect(() => {
    fetchChapter();
  }, [fetchChapter]);

  const handleSubmitAnswer = async () => {
    if (!chapter) return;

    const question = chapter.questions[currentQuestionIndex];
    const finalAnswer = question.type === 'text' ? answer : selectedOption;

    if (!finalAnswer || finalAnswer.trim().length < 1) return;

    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const res = await fetch(`/api/chapters/${pillar}/progress`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          questionId: question.id,
          answer: finalAnswer,
          questionIndex: currentQuestionIndex
        })
      });

      const data = await res.json();

      setIsCorrect(data.correct);
      setShowExplanation(true);
      setXpEarned(data.xpEarned);
      setShowXPToast(true);

      // Mark question as answered and save the answer
      setAnsweredQuestions(prev => new Set(Array.from(prev).concat(currentQuestionIndex)));
      setQuestionAnswers(prev => ({ ...prev, [currentQuestionIndex]: finalAnswer }));

    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!chapter) return;

    if (currentQuestionIndex + 1 >= chapter.questions.length) {
      // Chapter complete!
      router.push(`/dashboard/hs-student?completed=${pillar}`);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer('');
      setSelectedOption(null);
      setShowExplanation(false);
      setIsCorrect(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      // Restore previous answer if it exists
      const prevAnswer = questionAnswers[prevIndex];
      if (prevAnswer) {
        setAnswer(prevAnswer);
        setSelectedOption(prevAnswer);
        setShowExplanation(true);
        setIsCorrect(true); // Show as reviewed
      } else {
        setAnswer('');
        setSelectedOption(null);
        setShowExplanation(false);
        setIsCorrect(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <p className="text-gray-500">Chapter not found</p>
          <button
            onClick={() => router.push('/dashboard/hs-student')}
            className="mt-4 text-orange-500 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question = chapter.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / chapter.totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* XP Toast */}
      {showXPToast && (
        <XPEarnedToast
          amount={xpEarned}
          onComplete={() => setShowXPToast(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push('/dashboard/hs-student')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Exit
            </button>
            <span className="text-sm text-gray-500">
              {currentQuestionIndex + 1} of {chapter.totalQuestions}
            </span>
            <span className="text-sm font-medium text-orange-500">
              +{chapter.xpPerQuestion} XP each
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Chapter Title */}
        <div className="text-center mb-8">
          <span className="text-4xl">{chapter.icon}</span>
          <h1 className="text-2xl font-bold mt-2 capitalize">{chapter.pillar}</h1>
          <p className="text-gray-500">{chapter.description}</p>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <p className="text-xl font-medium text-gray-800 mb-6">{question.question}</p>

          {/* Answer Input */}
          {question.type === 'multiple_choice' && question.options && (
            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => !showExplanation && setSelectedOption(option)}
                  disabled={showExplanation}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    showExplanation
                      ? option === question.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : selectedOption === option
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                      : selectedOption === option
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {question.type === 'true_false' && (
            <div className="flex gap-4">
              {['True', 'False'].map((option) => (
                <button
                  key={option}
                  onClick={() => !showExplanation && setSelectedOption(option)}
                  disabled={showExplanation}
                  className={`flex-1 p-4 rounded-xl border-2 font-medium transition-all ${
                    showExplanation
                      ? option === question.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : selectedOption === option
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                      : selectedOption === option
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {question.type === 'text' && (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={showExplanation}
              placeholder="Type your answer..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50"
              rows={3}
            />
          )}

          {/* Explanation */}
          {showExplanation && question.explanation && (
            <div className={`mt-4 p-4 rounded-xl ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{isCorrect ? '✅' : '💡'}</span>
                <span className="font-semibold">
                  {isCorrect ? 'Correct!' : 'Good try!'}
                </span>
              </div>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="space-y-4">
          {/* Submit Button - only show if not yet answered */}
          {!showExplanation && !answeredQuestions.has(currentQuestionIndex) && (
            <button
              onClick={handleSubmitAnswer}
              disabled={submitting || (!answer.trim() && !selectedOption)}
              className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  Submit Answer
                  <span className="text-orange-200">+{chapter.xpPerQuestion} XP</span>
                </>
              )}
            </button>
          )}

          {/* Navigation Buttons */}
          {(showExplanation || answeredQuestions.has(currentQuestionIndex)) && (
            <div className="flex gap-3">
              {/* Previous Button */}
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                ← Previous
              </button>

              {/* Next Button */}
              <button
                onClick={handleNextQuestion}
                className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                {currentQuestionIndex + 1 >= chapter.questions.length ? (
                  <>
                    Finish Chapter 🎉
                  </>
                ) : (
                  <>
                    Next Question →
                  </>
                )}
              </button>
            </div>
          )}

          {/* Progress indicator */}
          <div className="flex justify-center gap-2 pt-4">
            {chapter.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (answeredQuestions.has(idx) || idx <= currentQuestionIndex) {
                    setCurrentQuestionIndex(idx);
                    const savedAnswer = questionAnswers[idx];
                    if (savedAnswer) {
                      setAnswer(savedAnswer);
                      setSelectedOption(savedAnswer);
                      setShowExplanation(true);
                      setIsCorrect(true);
                    } else {
                      setAnswer('');
                      setSelectedOption(null);
                      setShowExplanation(false);
                      setIsCorrect(null);
                    }
                  }
                }}
                disabled={!answeredQuestions.has(idx) && idx > currentQuestionIndex}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentQuestionIndex
                    ? 'bg-orange-500 w-6'
                    : answeredQuestions.has(idx)
                      ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
                      : 'bg-gray-300'
                } ${!answeredQuestions.has(idx) && idx > currentQuestionIndex ? 'cursor-not-allowed' : ''}`}
                title={answeredQuestions.has(idx) ? `Question ${idx + 1} (completed)` : `Question ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
