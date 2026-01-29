'use client';

import { motion } from 'framer-motion';

interface HeaderBarProps {
  firstName: string;
  sport: string;
  school: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  avatarUrl?: string;
}

export function HeaderBar({
  firstName,
  sport,
  school,
  level,
  currentXP,
  xpToNextLevel,
  avatarUrl,
}: HeaderBarProps) {
  const progressPercent = Math.min((currentXP / xpToNextLevel) * 100, 100);
  const xpRemaining = Math.max(xpToNextLevel - currentXP, 0);

  const levelTitles: Record<number, string> = {
    1: 'Rookie',
    2: 'Rising Star',
    3: 'Deal Maker',
    4: 'NIL Pro',
    5: 'NIL Legend',
  };

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Left: Greeting */}
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={firstName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center text-white font-bold">
              {firstName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Hey {firstName}! 👋
            </h1>
            <p className="text-sm text-gray-500">
              {sport} • {school}
            </p>
          </div>
        </div>

        {/* Right: Level & XP */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-orange-500 text-lg">⚡</span>
              <span className="font-bold text-gray-900">Level {level}</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600 font-medium">{currentXP} XP</span>
            </div>

            {/* Progress Bar */}
            <div className="w-28 sm:w-36 h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            <p className="text-[11px] text-gray-400 mt-0.5">
              {xpRemaining} XP to Level {level + 1}
            </p>
          </div>

          {/* Level Badge */}
          <div className="hidden sm:flex w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 items-center justify-center">
            <span className="text-white font-bold text-lg">{level}</span>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
