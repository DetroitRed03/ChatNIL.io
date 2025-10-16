'use client';

import { useState, useEffect } from 'react';
import { QuizSessionResults } from '@/lib/types';
import { getPassStatus, formatTime } from '@/lib/quiz';
import {
  Trophy,
  Target,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface QuizResultsProps {
  sessionId: string;
  results: QuizSessionResults;
  onRetry?: () => void;
  onBrowseQuizzes?: () => void;
  badgeEarned?: any;
}

export default function QuizResults({
  sessionId,
  results,
  onRetry,
  onBrowseQuizzes,
  badgeEarned
}: QuizResultsProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const passStatus = getPassStatus(results.score_percentage);

  // Animate score counting up
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = results.score_percentage / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= results.score_percentage) {
        setAnimatedScore(results.score_percentage);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [results.score_percentage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Main Results Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 mb-6 text-center">
          {/* Trophy Animation */}
          <div className="mb-6">
            <div className={`
              w-24 h-24 rounded-full mx-auto flex items-center justify-center
              ${passStatus.status === 'pass' ? 'bg-green-500' : 'bg-orange-500'}
              shadow-2xl animate-bounce
            `}>
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Score Circle */}
          <div className="mb-6">
            <div className="inline-block relative">
              <svg className="w-48 h-48 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke={passStatus.status === 'pass' ? '#10B981' : '#F97316'}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  strokeDashoffset={`${2 * Math.PI * 80 * (1 - animatedScore / 100)}`}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>

              {/* Score Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-5xl font-bold text-gray-900">
                    {Math.round(animatedScore)}%
                  </div>
                  <div className={`text-sm font-medium ${passStatus.color}`}>
                    {passStatus.message}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quiz Complete!
          </h1>
          <p className="text-gray-600 mb-8">
            Great job completing this quiz. Here's how you did:
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4">
              <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {results.correct_answers}/{results.total_questions}
              </div>
              <div className="text-xs text-gray-600">Correct</div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {results.total_points}
              </div>
              <div className="text-xs text-gray-600">Points</div>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(results.total_time_seconds)}
              </div>
              <div className="text-xs text-gray-600">Time</div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(results.score_percentage)}%
              </div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
          </div>

          {/* Badge Earned Notification */}
          {badgeEarned && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                <h3 className="text-lg font-bold text-gray-900">
                  New Badge Earned!
                </h3>
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              </div>
              <p className="text-gray-700 mb-3">
                🎉 You earned the <span className="font-semibold">{badgeEarned.name}</span> badge!
              </p>
              <p className="text-sm text-gray-600">
                +{badgeEarned.points} bonus points
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </button>
            )}

            {onBrowseQuizzes && (
              <button
                onClick={onBrowseQuizzes}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                Browse More Quizzes
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>

        {/* Performance Feedback */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Performance Feedback</h3>

          {passStatus.status === 'pass' ? (
            <div className="space-y-2">
              <div className="flex items-start gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <p className="text-gray-700">
                  <span className="font-medium">Excellent work!</span> You demonstrated strong knowledge of NIL concepts.
                </p>
              </div>
              {results.score_percentage === 100 && (
                <div className="flex items-start gap-3 text-sm">
                  <Sparkles className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <p className="text-gray-700">
                    <span className="font-medium">Perfect score!</span> You got every question correct. Outstanding!
                  </p>
                </div>
              )}
              <div className="flex items-start gap-3 text-sm">
                <Award className="w-5 h-5 text-blue-500 mt-0.5" />
                <p className="text-gray-700">
                  Keep practicing with more quizzes to earn additional badges and points.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-3 text-sm">
                <XCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                <p className="text-gray-700">
                  <span className="font-medium">Keep learning!</span> Review the explanations to strengthen your understanding.
                </p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <RefreshCw className="w-5 h-5 text-blue-500 mt-0.5" />
                <p className="text-gray-700">
                  Try taking the quiz again after reviewing the material. Practice makes perfect!
                </p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Award className="w-5 h-5 text-purple-500 mt-0.5" />
                <p className="text-gray-700">
                  Explore other quiz categories to continue building your NIL knowledge.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
