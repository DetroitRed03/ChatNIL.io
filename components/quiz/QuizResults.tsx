'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QuizSessionResults } from '@/types';
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Main Results Card with Orange Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl shadow-2xl border border-orange-100 p-8 mb-6 text-center"
        >
          {/* Trophy Animation with Levitation, Radial Rays & Glow */}
          <div className="mb-6 relative">
            {/* Radial light rays behind trophy - BOLDER & SLOWER */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`ray-${i}`}
                  className="absolute w-1.5 h-20 bg-gradient-to-t from-amber-400/80 to-transparent origin-bottom"
                  style={{ transform: `rotate(${i * 30}deg)` }}
                  animate={{ opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>

            {/* Glow aura ring - BOLDER & SLOWER */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 0.95, 0.6],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="w-32 h-32 rounded-full bg-amber-400/60 blur-2xl" />
            </motion.div>

            {/* Trophy with 3D levitation - BOLDER & SLOWER */}
            <div className="relative" style={{ perspective: 1000 }}>
              <motion.div
                className={`
                  w-24 h-24 rounded-full mx-auto flex items-center justify-center relative z-10
                  ${passStatus.status === 'pass'
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-200/50'
                    : 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-orange-200/50'}
                  shadow-2xl
                `}
                initial={{ scale: 0, y: -50 }}
                animate={{
                  scale: 1,
                  y: [0, -10, 0],
                  rotateY: [0, 360],
                  boxShadow: [
                    '0 0 30px rgba(249, 115, 22, 0.65)',
                    '0 0 60px rgba(249, 115, 22, 0.95)',
                    '0 0 30px rgba(249, 115, 22, 0.65)',
                  ]
                }}
                transition={{
                  scale: { type: 'spring', stiffness: 300, damping: 15, delay: 0.2 },
                  y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
                  rotateY: { duration: 12, repeat: Infinity, ease: 'linear' },
                  boxShadow: { duration: 4, repeat: Infinity }
                }}
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>
            </div>

            {/* Orbiting sparkle particles - BOLDER & SLOWER */}
            {[...Array(6)].map((_, i) => {
              const angle = (i * 60) * (Math.PI / 180);
              return (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute w-3 h-3 bg-amber-400 rounded-full"
                  style={{
                    top: `calc(50% + ${Math.sin(angle) * 60}px)`,
                    left: `calc(50% + ${Math.cos(angle) * 60}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    scale: [0, 1.4, 0],
                    opacity: [0, 0.95, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                />
              );
            })}
          </div>

          {/* Score Circle with Orange Gradient */}
          <div className="mb-6">
            <div className="inline-block relative">
              <svg className="w-48 h-48 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#FED7AA"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress circle - orange gradient */}
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FB923C" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="url(#scoreGradient)"
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
                  <div className={`text-sm font-semibold ${passStatus.status === 'pass' ? 'text-green-600' : 'text-orange-600'}`}>
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

          {/* Stats Grid with Orange Theme & Spring Bounce */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.3,
                type: 'spring',
                stiffness: 500,
                damping: 15,
              }}
              whileHover={{ scale: 1.1, y: -4 }}
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 hover:shadow-lg hover:shadow-orange-200/50 transition-shadow cursor-pointer"
            >
              <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {results.correct_answers}/{results.total_questions}
              </div>
              <div className="text-xs text-orange-700/70 font-medium">Correct</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.4,
                type: 'spring',
                stiffness: 500,
                damping: 15,
              }}
              whileHover={{ scale: 1.1, y: -4 }}
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 hover:shadow-lg hover:shadow-orange-200/50 transition-shadow cursor-pointer"
            >
              <Award className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {results.total_points}
              </div>
              <div className="text-xs text-orange-700/70 font-medium">Points</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.5,
                type: 'spring',
                stiffness: 500,
                damping: 15,
              }}
              whileHover={{ scale: 1.1, y: -4 }}
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 hover:shadow-lg hover:shadow-orange-200/50 transition-shadow cursor-pointer"
            >
              <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(results.total_time_seconds)}
              </div>
              <div className="text-xs text-orange-700/70 font-medium">Time</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.6,
                type: 'spring',
                stiffness: 500,
                damping: 15,
              }}
              whileHover={{ scale: 1.1, y: -4 }}
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 hover:shadow-lg hover:shadow-orange-200/50 transition-shadow cursor-pointer"
            >
              <CheckCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(results.score_percentage)}%
              </div>
              <div className="text-xs text-orange-700/70 font-medium">Score</div>
            </motion.div>
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

          {/* Action Buttons with Orange Theme */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-orange-300 text-orange-700 rounded-xl font-semibold hover:bg-orange-50 hover:border-orange-400 transition-all shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </button>
            )}

            {onBrowseQuizzes && (
              <button
                onClick={onBrowseQuizzes}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-500 hover:via-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50"
              >
                Browse More Quizzes
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Performance Feedback with Orange Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white to-orange-50/30 rounded-xl border border-orange-100 p-6 shadow-md"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Performance Feedback
          </h3>

          {passStatus.status === 'pass' ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm bg-green-50 rounded-lg p-3 border border-green-100">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <p className="text-gray-700">
                  <span className="font-medium text-green-700">Excellent work!</span> You demonstrated strong knowledge of NIL concepts.
                </p>
              </div>
              {results.score_percentage === 100 && (
                <div className="flex items-start gap-3 text-sm bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <Sparkles className="w-5 h-5 text-amber-500 mt-0.5" />
                  <p className="text-gray-700">
                    <span className="font-medium text-amber-700">Perfect score!</span> You got every question correct. Outstanding!
                  </p>
                </div>
              )}
              <div className="flex items-start gap-3 text-sm bg-orange-50 rounded-lg p-3 border border-orange-100">
                <Award className="w-5 h-5 text-orange-500 mt-0.5" />
                <p className="text-gray-700">
                  Keep practicing with more quizzes to earn additional badges and points.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm bg-orange-50 rounded-lg p-3 border border-orange-100">
                <XCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                <p className="text-gray-700">
                  <span className="font-medium text-orange-700">Keep learning!</span> Review the explanations to strengthen your understanding.
                </p>
              </div>
              <div className="flex items-start gap-3 text-sm bg-amber-50 rounded-lg p-3 border border-amber-100">
                <RefreshCw className="w-5 h-5 text-amber-500 mt-0.5" />
                <p className="text-gray-700">
                  Try taking the quiz again after reviewing the material. Practice makes perfect!
                </p>
              </div>
              <div className="flex items-start gap-3 text-sm bg-orange-50 rounded-lg p-3 border border-orange-100">
                <Award className="w-5 h-5 text-orange-600 mt-0.5" />
                <p className="text-gray-700">
                  Explore other quiz categories to continue building your NIL knowledge.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
