'use client';

import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';

interface ProgressHeaderProps {
  level: number;
  lifetimeXP: number;
  xpInLevel: number;
  xpToNextLevel: number;
  levelThreshold: number;
  userName: string;
}

export default function ProgressHeader({
  level,
  lifetimeXP,
  xpInLevel,
  xpToNextLevel,
  levelThreshold,
  userName,
}: ProgressHeaderProps) {
  const progressPercent = levelThreshold > 0 ? Math.min((xpInLevel / levelThreshold) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 rounded-2xl px-6 py-7 overflow-hidden shadow-xl shadow-orange-200/50"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 5, repeat: Infinity, repeatDelay: 3 }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(255,255,255,0.4)',
                  '0 0 40px rgba(255,255,255,0.7)',
                  '0 0 20px rgba(255,255,255,0.4)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="text-2xl font-bold text-white">{level}</span>
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Your NIL Journey</h1>
              <p className="text-white/80 text-sm mt-0.5">
                Level {level} &middot; {lifetimeXP.toLocaleString()} XP earned
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
            <Zap className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-lg">{lifetimeXP.toLocaleString()}</span>
            <span className="text-white/70 text-sm">XP</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/90 font-medium">Progress to Level {level + 1}</span>
            <span className="text-white font-medium">{xpToNextLevel} XP to go</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
