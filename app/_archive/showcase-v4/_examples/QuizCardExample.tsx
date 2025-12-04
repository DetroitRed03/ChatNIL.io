'use client';

import { motion } from 'framer-motion';
import { BookOpen, Trophy, CheckCircle2, ArrowRight } from 'lucide-react';

export function QuizCardExample() {
  return (
    <div className="w-full max-w-sm">
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 overflow-hidden"
      >
        <div className="p-6">

          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">NIL Basics</h3>
              <p className="text-sm text-gray-600 font-medium">Learn the fundamentals</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-bold text-orange-600">75%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-xs text-gray-600 font-medium mt-0.5">Questions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">9</p>
              <p className="text-xs text-gray-600 font-medium mt-0.5">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">+50</p>
              <p className="text-xs text-gray-600 font-medium mt-0.5">Points</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
              <Trophy className="w-4 h-4" />
              Top Scorer
            </div>
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Verified
            </div>
          </div>

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition-colors duration-200"
          >
            Continue Learning
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
