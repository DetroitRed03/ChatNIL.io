'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PILLARS, PillarType, PILLAR_ORDER } from '@/lib/discovery/questions';

interface JourneyProgressProps {
  currentPillar: PillarType;
  currentDay: number;
  unlockedChapters: PillarType[];
  completionPercentage: number;
}

const pillarIcons: Record<PillarType, string> = {
  identity: '🎯',
  business: '📋',
  money: '💰',
  legacy: '🌟',
};

export function JourneyProgress({
  currentPillar,
  currentDay,
  unlockedChapters,
  completionPercentage,
}: JourneyProgressProps) {
  const router = useRouter();
  const isComplete = completionPercentage === 100;

  return (
    <div data-testid="journey-progress" className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-purple-200 text-sm font-medium">Your NIL Journey</p>
          <h2 data-testid="current-pillar" className="text-2xl font-bold">
            {isComplete ? 'Journey Complete!' : `${PILLARS[currentPillar].name} - Day ${currentDay}`}
          </h2>
        </div>
        <div className="text-4xl">
          {isComplete ? '🏆' : pillarIcons[currentPillar]}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-purple-200 mb-2">
          <span>Discovery Progress</span>
          <span data-testid="progress-percentage">{completionPercentage}%</span>
        </div>
        <div className="h-3 bg-purple-900/50 rounded-full overflow-hidden">
          <motion.div
            data-testid="progress-bar"
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Pillar Progress Dots */}
      <div className="flex justify-between mb-6">
        {PILLAR_ORDER.map((pillar, index) => {
          const isUnlocked = unlockedChapters.includes(pillar);
          const isCurrent = pillar === currentPillar;

          return (
            <div key={pillar} className="flex flex-col items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                  ${isUnlocked
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-yellow-400 text-purple-900 ring-2 ring-white'
                      : 'bg-purple-900/50 text-purple-400'
                  }`}
                whileHover={{ scale: 1.1 }}
              >
                {isUnlocked ? '✓' : pillarIcons[pillar]}
              </motion.div>
              <span className={`text-xs mt-1 ${isCurrent ? 'text-white font-semibold' : 'text-purple-300'}`}>
                {PILLARS[pillar].name.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Primary CTA */}
      <motion.button
        data-testid="continue-conversation-btn"
        onClick={() => router.push('/discovery')}
        className="w-full py-4 bg-white text-purple-700 font-bold rounded-xl
          hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isComplete ? (
          <>
            <span>Review Your Profile</span>
            <span>📊</span>
          </>
        ) : (
          <>
            <span>Continue Conversation</span>
            <span>💬</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
