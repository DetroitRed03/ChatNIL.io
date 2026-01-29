'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PILLARS, PillarType, PILLAR_ORDER } from '@/lib/discovery/questions';

interface JourneyHeroV2Props {
  currentPillar: PillarType;
  currentDay: number;
  completionPercentage: number;
  isComplete: boolean;
  xp: {
    current: number;
    level: number;
    nextLevelXP: number;
    levelName: string;
  };
  streak: number;
}

const pillarIcons: Record<PillarType, string> = {
  identity: '🎯',
  business: '📋',
  money: '💰',
  legacy: '🌟',
};

const pillarColors: Record<PillarType, { bg: string; text: string; gradient: string }> = {
  identity: { bg: 'bg-purple-500', text: 'text-purple-500', gradient: 'from-purple-500 to-indigo-600' },
  business: { bg: 'bg-blue-500', text: 'text-blue-500', gradient: 'from-blue-500 to-cyan-600' },
  money: { bg: 'bg-emerald-500', text: 'text-emerald-500', gradient: 'from-emerald-500 to-teal-600' },
  legacy: { bg: 'bg-amber-500', text: 'text-amber-500', gradient: 'from-amber-500 to-orange-600' },
};

export function JourneyHeroV2({
  currentPillar,
  currentDay,
  completionPercentage,
  isComplete,
  xp,
  streak,
}: JourneyHeroV2Props) {
  const router = useRouter();
  const colors = pillarColors[currentPillar];

  // Encouraging messages based on progress
  const getEncouragement = () => {
    if (isComplete) return "You've mastered the NIL basics! Ready for the next level.";
    if (completionPercentage >= 75) return "So close! You're almost an NIL expert.";
    if (completionPercentage >= 50) return "Halfway there! Keep up the momentum.";
    if (completionPercentage >= 25) return "Great progress! Every step counts.";
    if (streak >= 3) return `${streak}-day streak! You're building great habits.`;
    return "Your NIL journey starts here. Let's go!";
  };

  return (
    <div
      data-testid="journey-hero-v2"
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.gradient} p-6 text-white`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Top Row - Current Status */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-2"
            >
              <span className="text-3xl">{isComplete ? '🏆' : pillarIcons[currentPillar]}</span>
              <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                {xp.levelName}
              </div>
            </motion.div>
            <h2
              data-testid="current-pillar"
              className="text-2xl md:text-3xl font-bold mb-2"
            >
              {isComplete ? 'Journey Complete!' : `${PILLARS[currentPillar].name}`}
            </h2>
            <p className="text-white/80 text-sm md:text-base max-w-md">
              {getEncouragement()}
            </p>
          </div>

          {/* Streak Badge */}
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="flex flex-col items-center p-3 bg-white/20 rounded-xl backdrop-blur-sm"
            >
              <span className="text-2xl">🔥</span>
              <span className="text-xl font-bold">{streak}</span>
              <span className="text-xs opacity-80">day streak</span>
            </motion.div>
          )}
        </div>

        {/* Progress Section */}
        <div className="space-y-4">
          {/* Overall Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="opacity-90">Overall Progress</span>
              <span data-testid="progress-percentage" className="font-bold">
                {completionPercentage}%
              </span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                data-testid="progress-bar"
                className="h-full bg-white rounded-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>
          </div>

          {/* Pillar Progress Nodes */}
          <div className="flex justify-between items-center py-2">
            {PILLAR_ORDER.map((pillar, index) => {
              const isUnlocked = completionPercentage >= ((index + 1) / 4) * 100;
              const isCurrent = pillar === currentPillar && !isComplete;
              const isCompleted = completionPercentage > ((index + 1) / 4) * 100 ||
                (pillar === currentPillar && currentDay >= 5);

              return (
                <div key={pillar} className="flex flex-col items-center relative">
                  {/* Connector Line */}
                  {index < 3 && (
                    <div
                      className={`absolute top-5 left-[60%] w-[calc(100%-10px)] h-0.5
                        ${isCompleted ? 'bg-white' : 'bg-white/30'}`}
                    />
                  )}

                  {/* Node */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg
                      ${isCompleted
                        ? 'bg-white text-purple-600'
                        : isCurrent
                          ? 'bg-yellow-400 text-purple-900 ring-4 ring-yellow-400/50'
                          : 'bg-white/20 text-white/60'
                      }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {isCompleted ? '✓' : pillarIcons[pillar]}
                  </motion.div>

                  {/* Label */}
                  <span
                    className={`text-xs mt-2 font-medium
                      ${isCurrent ? 'text-white' : 'text-white/70'}`}
                  >
                    {PILLARS[pillar].name.split(' ')[0]}
                  </span>

                  {/* Current indicator */}
                  {isCurrent && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <motion.button
          data-testid="continue-conversation-btn"
          onClick={() => router.push('/discovery')}
          className="mt-6 w-full py-4 bg-white text-gray-900 font-bold rounded-xl
            hover:bg-gray-50 transition-all flex items-center justify-center gap-3 group"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {isComplete ? (
            <>
              <span>View Your NIL Profile</span>
              <span className="text-xl group-hover:rotate-12 transition-transform">📊</span>
            </>
          ) : (
            <>
              <span>Continue Journey</span>
              <motion.span
                className="text-xl"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </>
          )}
        </motion.button>

        {/* XP Reward Preview */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/80">
          <span>⚡</span>
          <span>Complete a question to earn 20 XP</span>
        </div>
      </div>
    </div>
  );
}
