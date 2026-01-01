'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompactKnowledgeCardProps {
  quizzesCompleted: number;
  totalQuizzes: number;
  badgesEarned: number;
  currentStreak?: number;
}

export function CompactKnowledgeCard({
  quizzesCompleted,
  totalQuizzes,
  badgesEarned,
  currentStreak = 0,
}: CompactKnowledgeCardProps) {
  const progress = totalQuizzes > 0 ? Math.round((quizzesCompleted / totalQuizzes) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Knowledge Center</h3>
          <p className="text-xs text-gray-500">NIL Education</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-4 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center p-2 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
            <Target className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-gray-900">{quizzesCompleted}</p>
          <p className="text-xs text-gray-500">Quizzes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center p-2 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
            <Trophy className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-gray-900">{badgesEarned}</p>
          <p className="text-xs text-gray-500">Badges</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center p-2 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
            <span className="text-sm">🔥</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{currentStreak}</p>
          <p className="text-xs text-gray-500">Streak</p>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-full bg-orange-500 rounded-full"
          />
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/quizzes"
        className="flex items-center justify-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
      >
        Continue Learning
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default CompactKnowledgeCard;
