'use client';

import { motion } from 'framer-motion';
import { Award, Lock } from 'lucide-react';

const ALL_ACHIEVEMENTS = [
  { id: 'first-steps', name: 'First Steps', description: 'Answer your first question', emoji: '⭐' },
  { id: 'identity-complete', name: 'Identity Explorer', description: 'Complete the Identity chapter', emoji: '🎭' },
  { id: 'streak-3', name: 'On Fire', description: '3-day learning streak', emoji: '🔥' },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day learning streak', emoji: '⚡' },
  { id: 'business-complete', name: 'Deal Ready', description: 'Complete the Business chapter', emoji: '📋' },
  { id: 'money-complete', name: 'Money Minded', description: 'Complete the Money chapter', emoji: '💰' },
  { id: 'legacy-complete', name: 'Legacy Builder', description: 'Complete the Legacy chapter', emoji: '🌟' },
  { id: 'nil-scholar', name: 'NIL Scholar', description: 'Complete all 4 chapters', emoji: '🎓' },
  { id: 'streak-30', name: 'Monthly Champion', description: '30-day learning streak', emoji: '👑' },
];

interface EarnedBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  points: number;
  earnedAt: string;
}

interface AchievementGridProps {
  earned: EarnedBadge[];
  totalAvailable: number;
  earnedCount: number;
}

export default function AchievementGrid({
  earned,
  totalAvailable,
  earnedCount,
}: AchievementGridProps) {
  const earnedIds = new Set(earned.map(e => e.id));

  // Use the greater of DB total and our hardcoded list
  const displayTotal = Math.max(totalAvailable, ALL_ACHIEVEMENTS.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
          <Award className="w-5 h-5 text-orange-500" />
          Achievements
        </h2>
        <span className="text-sm text-gray-500 font-medium">
          {earnedCount}/{displayTotal} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
        {ALL_ACHIEVEMENTS.map((achievement, index) => {
          const isEarned = earnedIds.has(achievement.id);

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.04 }}
              className={`p-3 rounded-xl text-center transition-all ${
                isEarned
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
                  : 'bg-gray-50 border border-gray-100 opacity-50'
              }`}
              title={achievement.description}
            >
              <div className="text-2xl mb-1.5">
                {isEarned ? (
                  achievement.emoji
                ) : (
                  <Lock className="w-5 h-5 mx-auto text-gray-400" />
                )}
              </div>
              <p className="text-xs font-medium text-gray-700 truncate">{achievement.name}</p>
              {!isEarned && (
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{achievement.description}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
