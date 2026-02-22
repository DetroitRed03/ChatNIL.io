'use client';

import { useRef, useEffect, useState } from 'react';
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

  // Track XP changes to trigger highlight animation
  const prevXP = useRef(currentXP);
  const [xpJustChanged, setXpJustChanged] = useState(false);

  useEffect(() => {
    if (prevXP.current !== currentXP && prevXP.current !== 0) {
      setXpJustChanged(true);
      const timer = setTimeout(() => setXpJustChanged(false), 2000);
      prevXP.current = currentXP;
      return () => clearTimeout(timer);
    }
    prevXP.current = currentXP;
  }, [currentXP]);

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
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={firstName}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
              {firstName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
              Hey {firstName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {sport} • {school}
            </p>
          </div>
        </div>

        {/* Right: Level & XP */}
        <motion.div
          className="flex items-center gap-2 flex-shrink-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-right">
            <div className="flex items-center gap-1 sm:gap-1.5 justify-end">
              <span className="text-orange-500 text-sm sm:text-lg">⚡</span>
              <span className="font-bold text-gray-900 text-sm sm:text-base">Lv.{level}</span>
              <span className="hidden sm:inline text-gray-300">•</span>
              <motion.span
                key={currentXP}
                className={`font-medium text-xs sm:text-base ${xpJustChanged ? 'text-orange-600' : 'text-gray-600'}`}
                initial={xpJustChanged ? { scale: 1.3, color: '#ea580c' } : false}
                animate={{ scale: 1, color: xpJustChanged ? '#ea580c' : '#4b5563' }}
                transition={{ duration: 1.5 }}
              >
                {currentXP} XP
              </motion.span>
            </div>

            {/* Progress Bar */}
            <div className="w-20 sm:w-36 h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              {xpRemaining} to Lv.{level + 1}
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
