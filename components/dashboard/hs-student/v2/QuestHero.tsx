'use client';

import { motion } from 'framer-motion';
import { PillarTimeline } from './PillarTimeline';

interface QuestHeroProps {
  currentChapter: 'identity' | 'business' | 'money' | 'legacy';
  chapterNumber: number;
  totalChapters: number;
  progress: number;
  total: number;
  xpReward: number;
  onContinue: () => void;
}

const chapterInfo = {
  identity: { icon: '🎭', title: 'IDENTITY', subtitle: 'Define who you are' },
  business: { icon: '📋', title: 'BUSINESS', subtitle: 'Learn how deals work' },
  money: { icon: '💰', title: 'MONEY', subtitle: 'Master your finances' },
  legacy: { icon: '⭐', title: 'LEGACY', subtitle: 'Build your future' },
};

export function QuestHero({
  currentChapter,
  chapterNumber,
  totalChapters,
  progress,
  total,
  xpReward,
  onContinue,
}: QuestHeroProps) {
  const progressPercent = Math.min((progress / total) * 100, 100);
  const info = chapterInfo[currentChapter];
  const isComplete = chapterNumber > totalChapters;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-600 via-purple-500 to-orange-400 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
            🎮 Your NIL Quest
          </span>
          <span className="text-white/80 text-sm font-medium">
            Chapter {Math.min(chapterNumber, totalChapters)} of {totalChapters}
          </span>
        </div>

        {/* Chapter Info */}
        <div className="text-center mb-5">
          <motion.div
            className="text-5xl mb-2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isComplete ? '🏆' : info.icon}
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {isComplete ? 'QUEST COMPLETE!' : info.title}
          </h2>
          <p className="text-white/80 text-sm">
            {isComplete ? 'You mastered all chapters!' : info.subtitle}
          </p>
        </div>

        {/* Pillar Timeline */}
        <PillarTimeline
          current={currentChapter}
          completed={chapterNumber - 1}
        />

        {/* Progress Bar */}
        {!isComplete && (
          <div className="mt-5 mb-4">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-white/90">Progress</span>
              <span className="font-medium">{progress}/{total} questions</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* CTA Button */}
        <motion.button
          onClick={onContinue}
          className="w-full bg-white text-purple-600 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mt-4"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isComplete ? (
            <>
              View Your Profile
              <span>📊</span>
            </>
          ) : (
            <>
              Continue Quest
              <span className="text-orange-500 font-bold">+{xpReward} XP</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
