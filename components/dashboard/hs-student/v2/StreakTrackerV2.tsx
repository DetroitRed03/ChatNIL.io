'use client';

import { motion } from 'framer-motion';

interface StreakTrackerV2Props {
  currentStreak: number;
  longestStreak: number;
  weekActivity: boolean[];
  nextMilestone: number;
}

export function StreakTrackerV2({
  currentStreak,
  longestStreak,
  weekActivity,
  nextMilestone,
}: StreakTrackerV2Props) {
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
  const daysUntilMilestone = nextMilestone - currentStreak;
  const milestoneProgress = (currentStreak / nextMilestone) * 100;

  return (
    <div
      data-testid="streak-tracker-v2"
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
    >
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{streakEmoji}</span>
            <h3 className="font-semibold text-white">Learning Streak</h3>
          </div>
          {currentStreak > 0 && (
            <div className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
              {currentStreak === longestStreak && currentStreak > 0 ? '🏆 Best ever!' : `Best: ${longestStreak}`}
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        {/* Current Streak Display */}
        <div className="text-center mb-6">
          <motion.div
            key={currentStreak}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500"
          >
            {currentStreak}
          </motion.div>
          <p className="text-gray-500 mt-1">
            {currentStreak === 1 ? 'day streak' : 'days streak'}
          </p>
        </div>

        {/* Week Activity Grid */}
        <div className="flex justify-between gap-1 mb-6">
          {orderedLabels.map((label, index) => {
            const isActive = orderedActivity[index];
            const isToday = index === 6;

            return (
              <div key={index} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-xs text-gray-400 font-medium">{label}</span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`w-full aspect-square max-w-[40px] rounded-lg flex items-center justify-center
                    ${isActive
                      ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-sm shadow-orange-200'
                      : isToday
                        ? 'bg-orange-50 border-2 border-dashed border-orange-300'
                        : 'bg-gray-100'
                    }`}
                >
                  {isActive ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-white text-sm"
                    >
                      ✓
                    </motion.span>
                  ) : isToday ? (
                    <span className="text-orange-400 text-sm">?</span>
                  ) : null}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Milestone Progress */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Next milestone: {nextMilestone} days</span>
            <span className="text-sm font-medium text-orange-600">
              {daysUntilMilestone} to go!
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${milestoneProgress}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Reach {nextMilestone} days to earn the {nextMilestone === 7 ? '⚡ Week Warrior' : nextMilestone === 30 ? '👑 Monthly Champion' : '🔥 Streak Master'} badge!
          </p>
        </div>

        {/* Encouragement */}
        {!isActiveToday && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl text-center border border-orange-100"
          >
            <p className="text-sm text-orange-700 font-medium">
              {currentStreak > 0
                ? `🔥 Don't break your ${currentStreak}-day streak! Learn something today.`
                : '✨ Start a streak today! Just answer one question.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
