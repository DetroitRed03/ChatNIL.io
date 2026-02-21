'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { XPEarnedToast } from '@/components/hs-student-dashboard/feedback/XPEarnedToast';

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'text' | 'true_false';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  // AI coaching fields (text questions only)
  minChars?: number;
  guidingPrompts?: string[];
  coachingContext?: string;
}

// Low-effort detection (reused from DailyChallengeModal)
const LOW_EFFORT_EXACT = [
  "idk", "n/a", "none", "no", "yes", "maybe", "ok", "okay", "sure", "idc",
  "dunno", "whatever", "anything", "something", "no clue", "no idea",
  "not sure", "nothing", "dont know", "i dont know",
  "test", "testing", "asdf", "aaa", "...", "hi", "hello", "hey", "bruh", "lol", "lmao",
];

const LOW_EFFORT_CONTAINS = [
  "i don't know", "i dont know", "don't know", "dont know",
  "no idea", "not sure", "who cares", "beats me", "no clue",
  "whatever", "dunno", "aaaaaa", "asdfas", "qwerty", "zxcvbn", "abcdef",
];

function validateTextAnswer(text: string, minChars: number): { valid: boolean; error?: string } {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase().replace(/[\u2018\u2019]/g, "'");

  if (trimmed.length < minChars) {
    return { valid: false, error: `Tell us more! Try to write at least ${minChars} characters.` };
  }

  if (LOW_EFFORT_EXACT.includes(lower)) {
    return { valid: false, error: 'Put some real thought into this one! Even a small genuine thought counts.' };
  }

  if (LOW_EFFORT_CONTAINS.some(phrase => lower.includes(phrase))) {
    const withoutPhrases = LOW_EFFORT_CONTAINS.reduce((t, p) => t.replace(p, ''), lower).trim();
    if (withoutPhrases.length < 15) {
      return { valid: false, error: 'Try to share something more specific about yourself!' };
    }
  }

  return { valid: true };
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
  const [showCompletion, setShowCompletion] = useState(false);

  // AI coaching state
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [bonusXP, setBonusXP] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

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

    // Client-side validation for text questions
    if (question.type === 'text' && question.minChars) {
      const validation = validateTextAnswer(finalAnswer, question.minChars);
      if (!validation.valid) {
        setValidationError(validation.error || null);
        return;
      }
    }

    setValidationError(null);
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
          questionIndex: currentQuestionIndex,
          questionType: question.type,
          questionText: question.question,
          coachingContext: question.coachingContext || '',
        })
      });

      const data = await res.json();

      setIsCorrect(data.correct);
      setShowExplanation(true);
      setXpEarned(data.xpEarned);
      setShowXPToast(true);

      // Set AI feedback data
      if (data.aiFeedback) {
        setAiFeedback(data.aiFeedback);
        setQualityScore(data.qualityScore);
        setBonusXP(data.bonusXP || 0);
      }

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
      // Chapter complete — show celebration
      setShowCompletion(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer('');
      setSelectedOption(null);
      setShowExplanation(false);
      setIsCorrect(null);
      setAiFeedback(null);
      setQualityScore(null);
      setBonusXP(0);
      setValidationError(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setAiFeedback(null);
      setQualityScore(null);
      setBonusXP(0);
      setValidationError(null);
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

      {/* Chapter Completion Celebration */}
      <AnimatePresence>
        {showCompletion && chapter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-orange-400 to-amber-500 p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                  className="text-6xl mb-2"
                >
                  🎉
                </motion.div>
                <h2 className="text-2xl font-bold text-white">Chapter Complete!</h2>
                <p className="text-white/80 mt-1">
                  You finished the {chapter.title} chapter
                </p>
              </div>

              <div className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                  className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 px-5 py-3 rounded-xl mb-6"
                >
                  <span className="text-xl">⚡</span>
                  <span className="text-orange-600 font-bold text-lg">
                    +{chapter.totalQuestions * chapter.xpPerQuestion} XP Earned
                  </span>
                </motion.div>

                <p className="text-gray-500 text-sm mb-6">
                  Great work! Your answers have been saved and XP added to your total.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/dashboard/hs-student')}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all"
                  >
                    Back to Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/progress')}
                    className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    View My Progress
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div>
              {/* Guiding Prompts */}
              {!showExplanation && question.guidingPrompts && question.guidingPrompts.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Need a hint?</p>
                  <div className="flex flex-wrap gap-2">
                    {question.guidingPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!showExplanation) {
                            setAnswer('');
                            // Set as placeholder hint by focusing
                            const textarea = document.querySelector('textarea');
                            if (textarea) {
                              textarea.placeholder = prompt;
                              textarea.focus();
                            }
                          }
                        }}
                        className="text-xs px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full border border-orange-200 hover:bg-orange-100 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                disabled={showExplanation}
                placeholder="Type your answer..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50"
                rows={4}
              />

              {/* Character counter + validation error */}
              {!showExplanation && (
                <div className="flex items-center justify-between mt-1.5">
                  <div>
                    {validationError && (
                      <p className="text-sm text-red-500">{validationError}</p>
                    )}
                  </div>
                  {question.minChars && (
                    <p className={`text-xs ${
                      answer.trim().length >= question.minChars
                        ? 'text-green-500'
                        : 'text-gray-400'
                    }`}>
                      {answer.trim().length}/{question.minChars} characters
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Coaching Feedback (text questions) */}
          {showExplanation && question.type === 'text' && aiFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-orange-200 overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-lg flex-shrink-0">
                  🏀
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm leading-relaxed">{aiFeedback}</p>
                </div>
              </div>
              <div className="px-4 py-2.5 bg-white border-t border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    qualityScore && qualityScore >= 5
                      ? 'bg-green-100 text-green-700'
                      : qualityScore && qualityScore >= 4
                        ? 'bg-blue-100 text-blue-700'
                        : qualityScore && qualityScore >= 3
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-600'
                  }`}>
                    {qualityScore && qualityScore >= 5
                      ? 'Outstanding!'
                      : qualityScore && qualityScore >= 4
                        ? 'Thoughtful!'
                        : qualityScore && qualityScore >= 3
                          ? 'Good Start!'
                          : 'Keep Growing!'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-orange-500">⚡</span>
                  <span className="font-bold text-orange-600">{xpEarned} XP</span>
                  {bonusXP > 0 && (
                    <span className="text-green-600 font-medium text-xs">(+{bonusXP} bonus!)</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Fallback explanation for text questions without AI feedback */}
          {showExplanation && question.type === 'text' && !aiFeedback && question.explanation && (
            <div className="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <span>💡</span>
                <span className="font-semibold">Great reflection!</span>
              </div>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          )}

          {/* Explanation for MC / T-F questions */}
          {showExplanation && question.type !== 'text' && question.explanation && (
            <div className={`mt-4 p-4 rounded-xl ${
              isCorrect
                ? 'bg-green-50 border border-green-200'
                : 'bg-blue-50 border border-blue-200'
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
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {question.type === 'text' ? 'NIL Coach is reviewing...' : 'Submitting...'}
                </span>
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
                    setAiFeedback(null);
                    setQualityScore(null);
                    setBonusXP(0);
                    setValidationError(null);
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
