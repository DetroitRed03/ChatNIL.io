'use client';

import { motion } from 'framer-motion';
import { WeekStreak } from './WeekStreak';

interface StreakCardProps {
  currentStreak: number;
  daysThisWeek: boolean[];
  todayComplete: boolean;
}

export function StreakCard({
  currentStreak,
  daysThisWeek,
  todayComplete,
}: StreakCardProps) {
  const streakEmoji = currentStreak >= 30 ? '👑' : currentStreak >= 7 ? '⚡' : '🔥';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
    >
      <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-900">
        <span>🔥</span>
        Daily Streak
      </h3>

      {/* Streak Number */}
      <div className="text-center mb-5">
        <motion.div
          key={currentStreak}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-bold"
        >
          {currentStreak > 0 ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
              {streakEmoji} {currentStreak}
            </span>
          ) : (
            <span className="text-gray-300">0</span>
          )}
        </motion.div>
        <p className="text-gray-500 text-sm mt-1">
          {currentStreak === 1 ? 'day streak!' : currentStreak > 0 ? 'days streak!' : 'days'}
        </p>
      </div>

      {/* Week View */}
      <WeekStreak days={daysThisWeek} />

      {/* Status */}
      <div className={`mt-5 text-center py-3 rounded-xl font-medium ${
        todayComplete
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-orange-50 border border-orange-200 text-orange-700'
      }`}>
        {todayComplete
          ? '✅ Today complete! See you tomorrow.'
          : 'Complete a challenge or chapter to keep your streak!'}
      </div>
    </motion.div>
  );
}
