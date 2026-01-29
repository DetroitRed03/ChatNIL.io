'use client';

import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  progress?: number;
  total?: number;
}

interface AchievementsCardProps {
  nextAchievement?: Achievement;
  totalEarned: number;
  totalAvailable: number;
  onViewAll: () => void;
}

export function AchievementsCard({
  nextAchievement,
  totalEarned,
  totalAvailable,
  onViewAll,
}: AchievementsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold flex items-center gap-2 text-gray-900">
          <span>🏆</span>
          Achievements
        </h3>
        <span className="text-sm text-gray-500 font-medium">
          {totalEarned}/{totalAvailable}
        </span>
      </div>

      {/* Next Up */}
      {nextAchievement ? (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-600 font-medium mb-2">NEXT UP:</p>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl">
              {nextAchievement.icon}
            </div>
            <div className="flex-grow">
              <h4 className="font-bold text-gray-900">{nextAchievement.name}</h4>
              <p className="text-sm text-gray-600">{nextAchievement.description}</p>

              {/* Progress if available */}
              {nextAchievement.progress !== undefined && nextAchievement.total && (
                <div className="mt-2">
                  <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(nextAchievement.progress / nextAchievement.total) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-amber-600 mt-1">
                    {nextAchievement.progress}/{nextAchievement.total}
                  </p>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <span>⏱️</span>
            {nextAchievement.requirement}
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <span className="text-3xl">🎉</span>
          <p className="font-medium text-green-800 mt-2">All achievements unlocked!</p>
          <p className="text-sm text-green-600">You're an NIL master!</p>
        </div>
      )}

      {/* View All Button */}
      <button
        onClick={onViewAll}
        className="w-full mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium py-2 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-1"
      >
        See All Achievements
        <span>→</span>
      </button>
    </motion.div>
  );
}
