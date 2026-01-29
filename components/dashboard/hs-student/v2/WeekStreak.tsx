'use client';

import { motion } from 'framer-motion';

interface WeekStreakProps {
  days: boolean[]; // 7 days, starting from Monday
  todayIndex?: number; // Which day is today (0-6)
}

export function WeekStreak({ days, todayIndex }: WeekStreakProps) {
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // If todayIndex not provided, calculate it (0 = Monday)
  const today = todayIndex ?? ((new Date().getDay() + 6) % 7);

  return (
    <div className="flex justify-between gap-1 sm:gap-2">
      {dayLabels.map((label, index) => {
        const isActive = days[index];
        const isToday = index === today;
        const isPast = index < today;

        return (
          <motion.div
            key={index}
            className="flex flex-col items-center gap-1 flex-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className="text-[10px] sm:text-xs text-gray-400 font-medium">
              {label}
            </span>
            <div
              className={`w-full aspect-square max-w-[36px] rounded-lg flex items-center justify-center text-sm
                ${isActive
                  ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
                  : isToday
                    ? 'bg-orange-100 border-2 border-dashed border-orange-300'
                    : isPast
                      ? 'bg-gray-100 text-gray-300'
                      : 'bg-gray-50 text-gray-200'
                }`}
            >
              {isActive ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="font-bold"
                >
                  ✓
                </motion.span>
              ) : isToday ? (
                <span className="text-orange-400 text-xs">?</span>
              ) : null}
            </div>
            {isToday && (
              <span className="text-[9px] text-orange-500 font-medium">Today</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
