'use client';

import { motion } from 'framer-motion';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  weekActivity?: boolean[]; // Last 7 days, true = active
}

export function StreakTracker({
  currentStreak,
  longestStreak,
  lastActivityDate,
  weekActivity = [false, false, false, false, false, false, false],
}: StreakTrackerProps) {
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();

  // Reorder to show current week with today at the end
  const orderedActivity = [...weekActivity.slice(-7)];
  const orderedLabels = [...Array(7)].map((_, i) => {
    const dayIndex = (today - 6 + i + 7) % 7;
    return dayLabels[dayIndex];
  });

  const streakEmoji = currentStreak >= 30 ? '👑' : currentStreak >= 7 ? '⚡' : currentStreak >= 3 ? '🔥' : '✨';
  const isActiveToday = orderedActivity[6];

  return (
    <div data-testid="streak-tracker" className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{streakEmoji}</span>
          <h3 className="font-semibold text-gray-900">Learning Streak</h3>
        </div>
      </div>

      {/* Current Streak Display */}
      <div className="text-center py-4">
        <motion.div
          key={currentStreak}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          data-testid="streak-count"
          className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500"
        >
          {currentStreak}
        </motion.div>
        <p className="text-gray-500 text-sm mt-1">
          {currentStreak === 1 ? 'day streak' : 'days streak'}
        </p>
      </div>

      {/* Week Activity Grid */}
      <div data-testid="week-activity" className="flex justify-between gap-1 mb-4">
        {orderedLabels.map((label, index) => {
          const isActive = orderedActivity[index];
          const isToday = index === 6;

          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{label}</span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center
                  ${isActive
                    ? 'bg-gradient-to-br from-orange-400 to-red-500'
                    : isToday
                      ? 'bg-gray-100 border-2 border-dashed border-orange-300'
                      : 'bg-gray-100'
                  }`}
              >
                {isActive && <span className="text-white text-xs">✓</span>}
                {isToday && !isActive && <span className="text-orange-400 text-xs">?</span>}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{longestStreak}</p>
          <p className="text-xs text-gray-500">Longest streak</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {orderedActivity.filter(Boolean).length}
          </p>
          <p className="text-xs text-gray-500">Days this week</p>
        </div>
      </div>

      {/* Encouragement */}
      {!isActiveToday && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-orange-50 rounded-lg text-center"
        >
          <p className="text-sm text-orange-700">
            {currentStreak > 0
              ? `Keep your ${currentStreak}-day streak alive!`
              : 'Start a streak today!'
            }
          </p>
        </motion.div>
      )}

      {lastActivityDate && (
        <p className="text-xs text-gray-400 text-center mt-3">
          Last active: {new Date(lastActivityDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
