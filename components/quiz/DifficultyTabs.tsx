/**
 * Difficulty Tabs Component
 *
 * Tab-based filter for quiz difficulties with unlock status and progress
 */

'use client';

import { DifficultyLevel } from './DifficultyBadge';
import { Lock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface UnlockStatus {
  unlocked: boolean;
  locked_reason: string | null;
  progress: {
    completed: number;
    required: number;
    percentage: number;
  } | null;
}

interface DifficultyTabsProps {
  selectedDifficulty: DifficultyLevel | 'all';
  onSelectDifficulty: (difficulty: DifficultyLevel | 'all') => void;
  unlockStatus?: {
    beginner: UnlockStatus;
    intermediate: UnlockStatus;
    advanced: UnlockStatus;
    expert: UnlockStatus;
  };
  questionCounts?: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
}

// Unified orange/amber color scheme with intensity progression
const difficultyConfig = {
  beginner: {
    label: 'Beginner',
    emoji: '🌱',
    activeColors: 'bg-gradient-to-r from-orange-400 to-amber-400 text-white border-orange-500 shadow-lg shadow-orange-200/50',
    inactiveColors: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300',
    lockedColors: 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed',
  },
  intermediate: {
    label: 'Intermediate',
    emoji: '⚡',
    activeColors: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-600 shadow-lg shadow-orange-200/50',
    inactiveColors: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300',
    lockedColors: 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed',
  },
  advanced: {
    label: 'Advanced',
    emoji: '🔥',
    activeColors: 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-700 shadow-lg shadow-orange-300/50',
    inactiveColors: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300',
    lockedColors: 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed',
  },
  expert: {
    label: 'Expert',
    emoji: '👑',
    activeColors: 'bg-gradient-to-r from-orange-700 to-amber-700 text-white border-orange-800 shadow-lg shadow-orange-300/50',
    inactiveColors: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300',
    lockedColors: 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed',
  },
};

export function DifficultyTabs({
  selectedDifficulty,
  onSelectDifficulty,
  unlockStatus,
  questionCounts,
}: DifficultyTabsProps) {
  // Filter out Expert level if it has 0 questions (coming soon)
  const difficulties: DifficultyLevel[] = (['beginner', 'intermediate', 'advanced', 'expert'] as DifficultyLevel[])
    .filter(d => d !== 'expert' || (questionCounts?.expert ?? 0) > 0);

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {/* All Tab */}
        <button
          onClick={() => onSelectDifficulty('all')}
          className={`
            px-4 py-2 rounded-lg border-2 font-semibold transition-all
            ${
              selectedDifficulty === 'all'
                ? 'bg-gray-800 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }
          `}
        >
          All Levels
        </button>

        {/* Difficulty Tabs */}
        {difficulties.map((difficulty) => {
          const config = difficultyConfig[difficulty];
          const status = unlockStatus?.[difficulty];
          const isLocked = status && !status.unlocked;
          const isActive = selectedDifficulty === difficulty;
          const count = questionCounts?.[difficulty] ?? 0;

          return (
            <div key={difficulty} className="relative">
              {/* Active tab breathing - SLOWER */}
              <motion.button
                onClick={() => !isLocked && onSelectDifficulty(difficulty)}
                disabled={isLocked}
                whileHover={!isLocked ? { scale: 1.05, y: -2 } : undefined}
                whileTap={!isLocked ? { scale: 0.98 } : undefined}
                animate={isActive ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                transition={isActive ? {
                  scale: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                } : { type: 'spring', stiffness: 400, damping: 17 }}
                className={`
                  px-4 py-2 rounded-lg border-2 font-semibold transition-all
                  ${
                    isActive
                      ? config.activeColors
                      : isLocked
                      ? config.lockedColors
                      : config.inactiveColors
                  }
                `}
                title={isLocked ? status.locked_reason || 'Locked' : undefined}
              >
                <div className="flex items-center gap-2">
                  <span>{isLocked ? '🔒' : config.emoji}</span>
                  <span>{config.label}</span>
                  {count > 0 && (
                    <span className={`text-xs ${isActive ? 'opacity-90' : 'opacity-60'}`}>
                      ({count})
                    </span>
                  )}
                </div>
              </motion.button>

              {/* Progress indicator for locked tiers */}
              {isLocked && status?.progress && (
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${status.progress.percentage}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-orange-400 to-amber-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unlock Status Messages */}
      {selectedDifficulty !== 'all' && selectedDifficulty !== 'beginner' && unlockStatus && (
        <div className="mt-4">
          {(() => {
            const status = unlockStatus[selectedDifficulty];
            if (!status) return null;

            if (status.unlocked) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Unlocked!</span>
                  <span>You've earned access to this difficulty level.</span>
                </motion.div>
              );
            }

            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {status.locked_reason}
                    </p>
                    {status.progress && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span className="font-semibold">
                            {status.progress.completed}/{status.progress.required}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${status.progress.percentage}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-orange-400 to-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
