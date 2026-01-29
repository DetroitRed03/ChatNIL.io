'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  category: 'discovery' | 'quiz' | 'streak' | 'engagement' | 'milestone';
}

interface BadgeShowcaseProps {
  earnedBadges: Badge[];
  totalBadges: number;
}

const allBadges: Badge[] = [
  // Discovery badges
  { id: 'identity-complete', name: 'Identity Explorer', description: 'Completed the Identity chapter', icon: '🎯', category: 'discovery' },
  { id: 'business-complete', name: 'Business Basics', description: 'Completed the Business chapter', icon: '📋', category: 'discovery' },
  { id: 'money-complete', name: 'Money Minded', description: 'Completed the Money chapter', icon: '💰', category: 'discovery' },
  { id: 'legacy-complete', name: 'Legacy Builder', description: 'Completed the Legacy chapter', icon: '🌟', category: 'discovery' },
  { id: 'all-chapters', name: 'NIL Scholar', description: 'Completed all 4 chapters', icon: '🎓', category: 'milestone' },

  // Streak badges
  { id: 'streak-3', name: 'Getting Started', description: '3-day learning streak', icon: '🔥', category: 'streak' },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day learning streak', icon: '⚡', category: 'streak' },
  { id: 'streak-30', name: 'Monthly Champion', description: '30-day learning streak', icon: '👑', category: 'streak' },

  // Engagement badges
  { id: 'first-reflection', name: 'Deep Thinker', description: 'Answered your first daily question', icon: '💭', category: 'engagement' },
  { id: 'profile-complete', name: 'Profile Pro', description: 'Completed your NIL profile', icon: '✨', category: 'engagement' },
  { id: 'first-quiz', name: 'Quiz Taker', description: 'Completed your first quiz', icon: '📝', category: 'quiz' },
  { id: 'perfect-quiz', name: 'Perfect Score', description: 'Got 100% on a quiz', icon: '💯', category: 'quiz' },
  { id: 'quiz-master', name: 'Quiz Master', description: 'Passed all chapter quizzes', icon: '🏆', category: 'quiz' },
];

const categoryColors = {
  discovery: 'from-purple-400 to-indigo-500',
  quiz: 'from-blue-400 to-cyan-500',
  streak: 'from-orange-400 to-red-500',
  engagement: 'from-green-400 to-emerald-500',
  milestone: 'from-yellow-400 to-amber-500',
};

export function BadgeShowcase({ earnedBadges, totalBadges }: BadgeShowcaseProps) {
  const [showAll, setShowAll] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const earnedIds = new Set(earnedBadges.map(b => b.id));
  const displayBadges = showAll ? allBadges : allBadges.slice(0, 8);

  return (
    <div
      data-testid="badge-showcase"
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏅</span>
            <h3 className="font-semibold text-white">Badge Collection</h3>
          </div>
          <div className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
            {earnedBadges.length}/{totalBadges} earned
          </div>
        </div>
      </div>

      <div className="p-5">
        {earnedBadges.length === 0 ? (
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-3xl">🎯</span>
            </motion.div>
            <h4 className="font-semibold text-gray-900 mb-2">Start earning badges!</h4>
            <p className="text-sm text-gray-500">
              Complete chapters and build streaks to collect badges
            </p>
          </div>
        ) : (
          <>
            {/* Badge Grid */}
            <div className="grid grid-cols-4 gap-3">
              {displayBadges.map((badge, index) => {
                const isEarned = earnedIds.has(badge.id);
                const earnedBadge = earnedBadges.find(b => b.id === badge.id);

                return (
                  <motion.button
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedBadge(isEarned ? badge : null)}
                    className={`relative aspect-square rounded-xl flex items-center justify-center text-2xl
                      transition-all
                      ${isEarned
                        ? `bg-gradient-to-br ${categoryColors[badge.category]} shadow-md hover:shadow-lg cursor-pointer`
                        : 'bg-gray-100 cursor-default grayscale opacity-40'
                      }`}
                    whileHover={isEarned ? { scale: 1.1 } : {}}
                    whileTap={isEarned ? { scale: 0.95 } : {}}
                  >
                    {badge.icon}
                    {isEarned && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-[10px]">✓</span>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Show More Button */}
            {totalBadges > 8 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-4 w-full text-sm text-purple-600 hover:text-purple-700 font-medium py-2"
              >
                {showAll ? 'Show less' : `View all ${totalBadges} badges`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${categoryColors[selectedBadge.category]}
                  flex items-center justify-center text-4xl shadow-lg mb-4`}
              >
                {selectedBadge.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {selectedBadge.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedBadge.description}
              </p>
              {selectedBadge.earnedAt && (
                <p className="text-sm text-gray-400">
                  Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                </p>
              )}
              <button
                onClick={() => setSelectedBadge(null)}
                className="mt-6 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
