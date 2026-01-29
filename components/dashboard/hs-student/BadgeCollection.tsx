'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  category: 'discovery' | 'quiz' | 'streak' | 'engagement' | 'milestone';
}

interface BadgeCollectionProps {
  earnedBadges: Badge[];
  availableBadges?: Badge[];
}

const allBadges: Badge[] = [
  // Discovery badges
  { id: 'identity-complete', name: 'Identity Explorer', description: 'Completed the Identity chapter', icon: '🎯', category: 'discovery' },
  { id: 'business-complete', name: 'Business Basics', description: 'Completed the Business chapter', icon: '📋', category: 'discovery' },
  { id: 'money-complete', name: 'Money Minded', description: 'Completed the Money chapter', icon: '💰', category: 'discovery' },
  { id: 'legacy-complete', name: 'Legacy Builder', description: 'Completed the Legacy chapter', icon: '🌟', category: 'discovery' },
  { id: 'all-chapters', name: 'NIL Scholar', description: 'Completed all 4 chapters', icon: '🎓', category: 'milestone' },

  // Quiz badges
  { id: 'first-quiz', name: 'Quiz Taker', description: 'Completed your first quiz', icon: '📝', category: 'quiz' },
  { id: 'perfect-quiz', name: 'Perfect Score', description: 'Got 100% on a quiz', icon: '💯', category: 'quiz' },
  { id: 'quiz-master', name: 'Quiz Master', description: 'Passed all chapter quizzes', icon: '🏆', category: 'quiz' },

  // Streak badges
  { id: 'streak-3', name: 'Getting Started', description: '3-day learning streak', icon: '🔥', category: 'streak' },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day learning streak', icon: '⚡', category: 'streak' },
  { id: 'streak-30', name: 'Monthly Champion', description: '30-day learning streak', icon: '👑', category: 'streak' },

  // Engagement badges
  { id: 'first-reflection', name: 'Deep Thinker', description: 'Answered your first daily question', icon: '💭', category: 'engagement' },
  { id: 'profile-complete', name: 'Profile Pro', description: 'Completed your NIL profile', icon: '✨', category: 'engagement' },
];

const categoryColors = {
  discovery: 'from-purple-400 to-indigo-500',
  quiz: 'from-blue-400 to-cyan-500',
  streak: 'from-orange-400 to-red-500',
  engagement: 'from-green-400 to-emerald-500',
  milestone: 'from-yellow-400 to-amber-500',
};

export function BadgeCollection({ earnedBadges, availableBadges }: BadgeCollectionProps) {
  const [showAll, setShowAll] = useState(false);

  const earnedIds = new Set(earnedBadges.map(b => b.id));
  const unearnedBadges = (availableBadges || allBadges).filter(b => !earnedIds.has(b.id));

  const displayedEarned = showAll ? earnedBadges : earnedBadges.slice(0, 4);
  const displayedUnearned = showAll ? unearnedBadges.slice(0, 4) : [];

  return (
    <div data-testid="badge-collection" className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏅</span>
          <h3 className="font-semibold text-gray-900">Badges Earned</h3>
        </div>
        <span data-testid="badge-count" className="text-sm text-gray-500">
          {earnedBadges.length}/{allBadges.length}
        </span>
      </div>

      {earnedBadges.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-4xl">🎯</span>
          <p className="text-gray-500 text-sm mt-2">
            Complete chapters and quizzes to earn badges!
          </p>
        </div>
      ) : (
        <>
          {/* Earned Badges */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {displayedEarned.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div
                  className={`w-full aspect-square rounded-xl bg-gradient-to-br ${categoryColors[badge.category]}
                    flex items-center justify-center text-2xl shadow-md hover:shadow-lg transition-shadow`}
                >
                  {badge.icon}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2
                  bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100
                  transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-gray-300">{badge.description}</p>
                  {badge.earnedAt && (
                    <p className="text-gray-400 mt-1">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Unearned badges (grayed out) */}
          {showAll && displayedUnearned.length > 0 && (
            <>
              <p className="text-xs text-gray-400 mb-2">Available to earn:</p>
              <div className="grid grid-cols-4 gap-2">
                {displayedUnearned.map((badge) => (
                  <div
                    key={badge.id}
                    className="group relative"
                  >
                    <div className="w-full aspect-square rounded-xl bg-gray-100
                      flex items-center justify-center text-2xl opacity-40 grayscale">
                      {badge.icon}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2
                      bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100
                      transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <p className="font-semibold">{badge.name}</p>
                      <p className="text-gray-300">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {(earnedBadges.length > 4 || unearnedBadges.length > 0) && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {showAll ? 'Show less' : 'View all badges'}
        </button>
      )}
    </div>
  );
}
