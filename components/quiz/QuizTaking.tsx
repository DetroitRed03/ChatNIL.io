'use client';

import { useState, useEffect } from 'react';
import { QuizQuestion } from '@/lib/types';
import { formatTime } from '@/lib/quiz';
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

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;

    setSubmitting(true);

    try {
      const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
      const options = JSON.parse(currentQuestion.options as any);
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
        alert('Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer');
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  const options = JSON.parse(currentQuestion.options as any);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-600">
                {totalPoints} pts
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          {/* Question Text */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentQuestion.question}
            </h2>
            {currentQuestion.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {currentQuestion.category.replace('_', ' ').toUpperCase()}
              </span>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {options.map((option: string, index: number) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = result && index === result.correctAnswer;
              const isUserAnswer = result && selectedAnswer === index;
              const showCorrect = submitted && result?.isCorrect && isUserAnswer;
              const showIncorrect = submitted && !result?.isCorrect && isUserAnswer;

              return (
                <button
                  key={index}
                  onClick={() => !submitted && setSelectedAnswer(index)}
                  disabled={submitted}
                  className={`
                    w-full text-left p-4 rounded-xl border-2 transition-all duration-300
                    ${submitted ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-102'}
                    ${isSelected && !submitted ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    ${showCorrect ? 'border-green-500 bg-green-50' : ''}
                    ${showIncorrect ? 'border-red-500 bg-red-50' : ''}
                    ${submitted && !isUserAnswer && isCorrectAnswer ? 'border-green-300 bg-green-50' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                        ${isSelected && !submitted ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
                        ${showCorrect ? 'bg-green-500 text-white' : ''}
                        ${showIncorrect ? 'bg-red-500 text-white' : ''}
                      `}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-gray-900">{option}</span>
                    </div>

                    {/* Result Icons */}
                    {showCorrect && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    {showIncorrect && (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation (shown after submission) */}
          {submitted && result && (
            <div className={`
              p-4 rounded-xl border-2 mb-6
              ${result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}
            `}>
              <div className="flex items-start gap-3">
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
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!submitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || submitting}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
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
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
              >
                {isLastQuestion ? 'View Results' : 'Next Question'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>

        {/* Points Indicator */}
        {currentQuestion.points > 0 && !submitted && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              This question is worth <span className="font-semibold text-blue-600">{currentQuestion.points} points</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
