'use client';

import { motion } from 'framer-motion';
import { Check, Target, BookOpen, DollarSign, Star } from 'lucide-react';
import { PillarType, PILLARS, PILLAR_ORDER } from '@/lib/discovery/questions';

interface PillarProgressProps {
  currentPillar: PillarType;
  currentDay: number;
  unlockedChapters: PillarType[];
  pillarProgress: number;
}

const pillarIcons: Record<PillarType, React.ReactNode> = {
  identity: <Target className="h-5 w-5" />,
  business: <BookOpen className="h-5 w-5" />,
  money: <DollarSign className="h-5 w-5" />,
  legacy: <Star className="h-5 w-5" />,
};

const pillarColors: Record<PillarType, { bg: string; border: string; text: string; glow: string }> = {
  identity: {
    bg: 'bg-blue-500',
    border: 'border-blue-500',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/50',
  },
  business: {
    bg: 'bg-purple-500',
    border: 'border-purple-500',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/50',
  },
  money: {
    bg: 'bg-green-500',
    border: 'border-green-500',
    text: 'text-green-400',
    glow: 'shadow-green-500/50',
  },
  legacy: {
    bg: 'bg-orange-500',
    border: 'border-orange-500',
    text: 'text-orange-400',
    glow: 'shadow-orange-500/50',
  },
};

export function PillarProgress({
  currentPillar,
  currentDay,
  unlockedChapters,
  pillarProgress,
}: PillarProgressProps) {
  const currentPillarIndex = PILLAR_ORDER.indexOf(currentPillar);

  return (
    <div className="space-y-4">
      {/* Pillar Icons Row */}
      <div className="flex items-center justify-between">
        {PILLAR_ORDER.map((pillar, index) => {
          const isCompleted = unlockedChapters.includes(pillar);
          const isCurrent = pillar === currentPillar;
          const isPending = index > currentPillarIndex && !isCompleted;
          const colors = pillarColors[pillar];
          const pillarInfo = PILLARS[pillar];

          return (
            <div key={pillar} className="flex flex-col items-center">
              {/* Pillar Circle */}
              <motion.div
                className={`
                  relative w-12 h-12 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${isCompleted
                    ? `${colors.bg} text-white shadow-lg ${colors.glow}`
                    : isCurrent
                      ? `bg-gray-800 ${colors.border} border-2 ${colors.text} shadow-lg ${colors.glow}`
                      : 'bg-gray-800 border border-gray-700 text-gray-500'
                  }
                `}
                animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6" />
                ) : (
                  pillarIcons[pillar]
                )}
              </motion.div>

              {/* Pillar Label */}
              <span
                className={`mt-2 text-xs font-medium ${
                  isCurrent ? colors.text : isCompleted ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {pillarInfo.name}
              </span>

              {/* Day indicator for current pillar */}
              {isCurrent && (
                <span className="text-xs text-gray-500">
                  Day {currentDay}/5
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Connecting Lines */}
      <div className="relative h-1 mx-6">
        <div className="absolute inset-0 bg-gray-700 rounded-full" />
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${pillarColors[currentPillar].bg}`}
          initial={{ width: '0%' }}
          animate={{
            width: `${((currentPillarIndex + pillarProgress / 100) / PILLAR_ORDER.length) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Current Pillar Progress */}
      <div className="bg-gray-800/50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{PILLARS[currentPillar].icon}</span>
            <span className={`font-medium ${pillarColors[currentPillar].text}`}>
              {PILLARS[currentPillar].title}
            </span>
          </div>
          <span className="text-sm text-gray-400">{pillarProgress}% complete</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${pillarColors[currentPillar].bg}`}
            initial={{ width: '0%' }}
            animate={{ width: `${pillarProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {PILLARS[currentPillar].description}
        </p>
      </div>
    </div>
  );
}
