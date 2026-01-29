'use client';

import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward?: number;
}

interface AchievementUnlockedModalProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementUnlockedModal({
  achievement,
  onClose,
}: AchievementUnlockedModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 10 }}
        transition={{ type: 'spring', damping: 12 }}
        className="bg-white rounded-2xl max-w-sm w-full text-center p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-100 opacity-50" />

        <div className="relative z-10">
          {/* Trophy Animation */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-xl text-amber-500 mb-2"
          >
            🏆 ACHIEVEMENT UNLOCKED 🏆
          </motion.div>

          {/* Badge Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', damping: 10 }}
            className="my-6"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-200">
              <span className="text-5xl">{achievement.icon}</span>
            </div>
          </motion.div>

          {/* Achievement Name */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            {achievement.name}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 mb-4"
          >
            {achievement.description}
          </motion.p>

          {/* XP Reward */}
          {achievement.xpReward && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-bold mb-6"
            >
              <span>⚡</span>
              +{achievement.xpReward} XP Bonus!
            </motion.div>
          )}

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3.5 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Awesome! 🎉
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
