'use client';

import { motion } from 'framer-motion';
import { Trophy, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface QuizCategory {
  category: string;
  name: string;
  questionCount: number;
  completedCount: number;
  averageScore: number;
}

interface QuizPerformanceProps {
  averageScore: number;
  quizzesCompleted: number;
  totalAttempted: number;
  categories: QuizCategory[];
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
}

export default function QuizPerformance({
  averageScore,
  quizzesCompleted,
  totalAttempted,
  categories,
}: QuizPerformanceProps) {
  const completedCategories = categories.filter(c => c.completedCount > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
          <Trophy className="w-5 h-5 text-orange-500" />
          Quiz Performance
        </h2>
        <Link
          href="/quizzes"
          className="text-sm text-orange-500 hover:text-orange-600 flex items-center font-medium"
        >
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="text-center py-4 mb-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
        <motion.p
          className="text-4xl font-bold text-orange-500"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        >
          {averageScore}%
        </motion.p>
        <p className="text-sm text-gray-500 mt-1">Average Score</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {totalAttempted} questions answered
        </p>
      </div>

      <div className="space-y-2">
        {completedCategories.length > 0 ? (
          completedCategories.slice(0, 6).map((cat, i) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-800 truncate block">
                  {cat.name}
                </span>
                <span className="text-xs text-gray-400">
                  {cat.completedCount}/{cat.questionCount} questions
                </span>
              </div>
              <span className={`text-sm font-bold ${getScoreColor(cat.averageScore)}`}>
                {cat.averageScore > 0 ? `${Math.round(cat.averageScore)}%` : '--'}
              </span>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No quizzes completed yet</p>
            <Link
              href="/quizzes"
              className="text-orange-500 hover:text-orange-600 text-sm font-medium mt-2 inline-block"
            >
              Take your first quiz →
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
