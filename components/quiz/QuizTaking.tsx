'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizQuestion } from '@/lib/types';
import { formatTime } from '@/lib/quiz';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
  Award,
  Lightbulb,
  Loader2
} from 'lucide-react';

interface QuizTakingProps {
  sessionId: string;
  questions: QuizQuestion[];
  userId: string;
  onComplete: () => void;
}

export default function QuizTaking({
  sessionId,
  questions,
  userId,
  onComplete
}: QuizTakingProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
      const options = currentQuestion.options;
      const userAnswer = options[selectedAnswer];

      const response = await fetch('/api/quizzes/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          questionId: currentQuestion.id,
          answer: userAnswer,
          answerIndex: selectedAnswer,
          timeTaken
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setSubmitted(true);
        setTotalPoints(prev => prev + data.pointsEarned);
      } else {
        setSubmitError('Failed to submit your answer. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setSubmitError('Connection error. Please check your internet and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      onComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
      setResult(null);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  const options = currentQuestion.options;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Header with Orange Theme */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-white to-orange-50/50 rounded-2xl shadow-lg border border-orange-100 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <Award className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-600">
                {totalPoints} pts
              </span>
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full text-sm font-medium text-orange-700">
              {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
            </div>
          </div>

          {/* Progress Bar with Orange Gradient */}
          <div className="w-full bg-orange-100 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-orange-400 to-amber-500 h-3 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.5 }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Question Card with Orange Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl shadow-lg border border-orange-100 p-8 mb-6 relative overflow-visible"
        >
          {/* Question Text */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentQuestion.question}
            </h2>
            {currentQuestion.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200">
                {currentQuestion.category.replace('_', ' ').toUpperCase()}
              </span>
            )}
          </div>

          {/* Answer Options with Orange Selection */}
          <div className="space-y-3 mb-6">
            {options.map((option: string, index: number) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = result && index === result.correctAnswer;
              const isUserAnswer = result && selectedAnswer === index;
              const showCorrect = submitted && result?.isCorrect && isUserAnswer;
              const showIncorrect = submitted && !result?.isCorrect && isUserAnswer;

              return (
                <motion.button
                  key={index}
                  onClick={() => !submitted && setSelectedAnswer(index)}
                  disabled={submitted}
                  whileHover={!submitted ? { scale: 1.02, y: -4 } : {}}
                  whileTap={!submitted ? { scale: 0.98 } : {}}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className={`
                    w-full text-left p-4 rounded-xl border-2 transition-all duration-300
                    ${submitted ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:shadow-orange-100/50'}
                    ${isSelected && !submitted ? 'border-orange-400 bg-orange-50 shadow-md shadow-orange-100/50' : 'border-gray-200 bg-white'}
                    ${showCorrect ? 'border-green-500 bg-green-50' : ''}
                    ${showIncorrect ? 'border-red-500 bg-red-50' : ''}
                    ${submitted && !isUserAnswer && isCorrectAnswer ? 'border-green-300 bg-green-50' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors
                        ${isSelected && !submitted ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white' : 'bg-gray-100 text-gray-600'}
                        ${showCorrect ? 'bg-green-500 text-white' : ''}
                        ${showIncorrect ? 'bg-red-500 text-white' : ''}
                      `}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-gray-900">{option}</span>
                    </div>

                    {/* Result Icons with celebration effects */}
                    {showCorrect && (
                      <div className="relative">
                        <CheckCircle className="w-6 h-6 text-green-500 relative z-10" />
                        {/* Celebration sparkles - BOLDER & SLOWER */}
                        {[...Array(6)].map((_, sparkleIndex) => (
                          <motion.div
                            key={`sparkle-${sparkleIndex}`}
                            className="absolute w-3 h-3 bg-green-500 rounded-full"
                            style={{ top: '50%', left: '50%' }}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                            animate={{
                              x: Math.cos(sparkleIndex * 60 * Math.PI / 180) * 35,
                              y: Math.sin(sparkleIndex * 60 * Math.PI / 180) * 35,
                              opacity: [1, 0.8, 0],
                              scale: [0, 1.8, 0],
                            }}
                            transition={{ duration: 1.5, delay: sparkleIndex * 0.08 }}
                          />
                        ))}
                      </div>
                    )}
                    {showIncorrect && (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Points Earned Floating Animation - BOLDER & SLOWER */}
          {submitted && result?.pointsEarned > 0 && (
            <motion.div
              className="absolute top-4 right-8 text-3xl font-bold text-orange-500 pointer-events-none"
              initial={{ y: 0, opacity: 1, scale: 0 }}
              animate={{ y: -50, opacity: 0, scale: 1.8 }}
              transition={{ duration: 2, ease: 'easeOut' }}
            >
              +{result.pointsEarned}
            </motion.div>
          )}

          {/* Explanation (shown after submission) */}
          {submitted && result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className={`
                p-4 rounded-xl border-2 mb-6 relative overflow-hidden
                ${result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}
              `}
            >
              {/* Radial burst for correct answers - BOLDER & SLOWER */}
              {result.isCorrect && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-400/50 to-emerald-400/50 rounded-xl"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: [0, 0.75, 0] }}
                  transition={{ duration: 1.2 }}
                />
              )}
              <div className="flex items-start gap-3 relative z-10">
                <Lightbulb className={`w-5 h-5 mt-1 ${result.isCorrect ? 'text-green-600' : 'text-orange-600'}`} />
                <div className="flex-1">
                  <h4 className={`font-semibold mb-2 ${result.isCorrect ? 'text-green-900' : 'text-orange-900'}`}>
                    {result.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    {result.pointsEarned > 0 && (
                      <span className="ml-2 text-sm">+{result.pointsEarned} points</span>
                    )}
                  </h4>
                  <p className={`text-sm ${result.isCorrect ? 'text-green-800' : 'text-orange-800'}`}>
                    {result.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ErrorMessage
                  message={submitError}
                  onRetry={() => {
                    setSubmitError(null);
                    handleSubmitAnswer();
                  }}
                  variant="inline"
                  type="network"
                  className="mb-4"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons with Orange Theme */}
          <div className="flex gap-3">
            {!submitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || submitting}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Answer
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-500 hover:via-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50"
              >
                {isLastQuestion ? 'View Results' : 'Next Question'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Points Indicator with Orange Theme */}
        {currentQuestion.points > 0 && !submitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-sm text-gray-600">
              This question is worth <span className="font-semibold text-orange-600">{currentQuestion.points} points</span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
