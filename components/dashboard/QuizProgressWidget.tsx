/**
 * Quiz Progress Widget - Learning Hub Component
 *
 * Displays quiz engagement metrics with light gamification:
 * - Summary stats (completed, avg score, streak, points)
 * - Recent quiz results with color-coded scores
 * - Progress indicator for next badge/milestone
 * - CTA to continue learning
 *
 * Features:
 * - Warm orange/amber gradient header (matches dashboard theme)
 * - Loading, error, and empty states
 * - Smooth animations with Framer Motion
 * - Responsive design
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, Flame, Star, TrendingUp, Award, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { useQuizProgress } from '@/hooks/useDashboardData';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface QuizProgressWidgetProps {
  userId?: string;
  className?: string;
}

// Color coding for quiz scores
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

const getScoreEmoji = (score: number) => {
  if (score >= 90) return '🔥';
  if (score >= 80) return '✨';
  if (score >= 70) return '👍';
  if (score >= 60) return '💪';
  return '📚';
};

// Loading skeleton component
function QuizProgressSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

// Error state component
function ErrorState() {
  return (
    <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
          <BookOpen className="h-6 w-6 text-red-600" />
        </div>
        <p className="text-red-600 font-medium">Failed to load quiz progress</p>
        <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 px-6 py-6">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Knowledge Center 📚
        </h3>
        <p className="text-white/90 text-sm mt-1">Track your NIL learning progress</p>
      </div>

      {/* Empty Content */}
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
          <Sparkles className="h-10 w-10 text-orange-600" />
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">Start Your NIL Learning Journey!</h4>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Test your knowledge about NIL deals, compliance, taxes, and more. Build your expertise and unlock badges!
        </p>
        <Link href="/quizzes">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 hover:from-orange-500 hover:via-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            Take Your First Quiz
            <ArrowRight className="h-5 w-5" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export function QuizProgressWidget({ userId, className = '' }: QuizProgressWidgetProps) {
  const { data, isLoading, error } = useQuizProgress(userId);

  // Loading state
  if (isLoading) return <QuizProgressSkeleton />;

  // Error state
  if (error) return <ErrorState />;

  // Empty state
  if (!data || data.totalQuizzes === 0) return <EmptyState />;

  // Calculate stats
  const totalQuizzes = data.totalQuizzes || 0;
  const averageScore = data.averageScore || 0;
  const currentStreak = data.currentStreak || 0;
  const totalPoints = data.totalPoints || 0;
  const recentQuizzes = data.recentQuizzes?.slice(0, 3) || [];
  const nextBadgeProgress = data.nextBadgeProgress || 0;
  const nextBadgeName = data.nextBadgeName || 'Silver Badge';
  const quizzesUntilBadge = data.quizzesUntilBadge || 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Gradient Header with Animation */}
      <div className="relative bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 px-6 py-6 overflow-hidden">
        {/* Animated shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />

        {/* Header Content */}
        <div className="relative">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Knowledge Center 📚
          </h3>
          <p className="text-white/90 text-sm mt-1">Master the NIL game</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Completed Quizzes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100"
          >
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-semibold text-orange-600">Completed</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalQuizzes}</div>
          </motion.div>

          {/* Average Score */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600">Avg Score</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(averageScore)}%</div>
          </motion.div>

          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100"
          >
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-semibold text-orange-600">Streak</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">
              {currentStreak}
              {currentStreak > 0 && <span className="text-lg">🔥</span>}
            </div>
          </motion.div>

          {/* Points */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-100"
          >
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-600">Points</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalPoints}</div>
          </motion.div>
        </div>

        {/* Recent Quiz Results */}
        {recentQuizzes.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              Recent Results
            </h4>
            <div className="space-y-2">
              {recentQuizzes.map((quiz: any, index: number) => (
                <motion.div
                  key={quiz.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">{getScoreEmoji(quiz.score)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{quiz.category || quiz.title}</p>
                      <p className="text-xs text-gray-500">
                        {quiz.timestamp ? formatDistanceToNow(new Date(quiz.timestamp), { addSuffix: true }) : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full border font-bold text-sm ${getScoreColor(quiz.score)}`}>
                    {quiz.score}%
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Progress to Next Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-600" />
              Next Milestone 🎯
            </span>
            <span className="font-bold text-orange-600">{Math.round(nextBadgeProgress)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${nextBadgeProgress}%` }}
              transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full relative overflow-hidden"
            >
              {/* Shimmer on progress bar */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            </motion.div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {quizzesUntilBadge} more {quizzesUntilBadge === 1 ? 'quiz' : 'quizzes'} to unlock <span className="font-semibold">{nextBadgeName}</span>
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Link href="/quizzes">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 hover:from-orange-500 hover:via-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              Continue Learning
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
