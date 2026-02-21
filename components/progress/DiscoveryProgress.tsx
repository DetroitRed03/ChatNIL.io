'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Lock } from 'lucide-react';

const PILLARS = [
  { id: 'identity', name: 'Identity', emoji: '🎭', daysTotal: 5 },
  { id: 'business', name: 'Business', emoji: '📋', daysTotal: 5 },
  { id: 'money', name: 'Money', emoji: '💰', daysTotal: 5 },
  { id: 'legacy', name: 'Legacy', emoji: '⭐', daysTotal: 5 },
];

interface DiscoveryProgressProps {
  currentPillar: string;
  currentDay: number;
  completedPillars: string[];
  completionPercentage: number;
}

export default function DiscoveryProgress({
  currentPillar,
  currentDay,
  completedPillars,
  completionPercentage,
}: DiscoveryProgressProps) {
  const pillarOrder = ['identity', 'business', 'money', 'legacy'];
  const currentPillarIndex = pillarOrder.indexOf(currentPillar);

  const pillarsWithProgress = PILLARS.map((pillar, index) => {
    const isComplete = completedPillars.includes(pillar.id);
    const isCurrent = pillar.id === currentPillar;
    const isLocked = index > 0 && !completedPillars.includes(pillarOrder[index - 1]) && !isCurrent;

    let progress = 0;
    if (isComplete) {
      progress = 100;
    } else if (isCurrent) {
      progress = Math.min(((currentDay - 1) / pillar.daysTotal) * 100, 100);
    }

    return { ...pillar, isComplete, isCurrent, isLocked, progress };
  });

  const totalAnswered = completedPillars.length * 5 + (currentDay > 0 ? currentDay - 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Discovery Progress</h2>
        <span className="text-sm text-gray-500">
          {totalAnswered}/20 questions
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {pillarsWithProgress.map((pillar, index) => (
          <motion.div
            key={pillar.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className={`text-center p-4 rounded-xl transition-all ${
              pillar.isLocked
                ? 'bg-gray-50 opacity-60'
                : pillar.isComplete
                  ? 'bg-green-50 border border-green-200'
                  : pillar.isCurrent
                    ? 'bg-orange-50 border border-orange-200'
                    : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="text-3xl mb-2">
              {pillar.isLocked ? (
                <Lock className="w-7 h-7 mx-auto text-gray-400" />
              ) : (
                pillar.emoji
              )}
            </div>
            <p className="font-medium text-sm mb-2 text-gray-800">{pillar.name}</p>

            {!pillar.isLocked && (
              <>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                  <motion.div
                    className={`h-full rounded-full ${
                      pillar.isComplete ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pillar.progress}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {pillar.isComplete ? (
                    <span className="text-green-600 flex items-center justify-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Complete
                    </span>
                  ) : (
                    `${Math.round(pillar.progress)}%`
                  )}
                </p>
              </>
            )}

            {pillar.isLocked && (
              <p className="text-xs text-gray-400">Locked</p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
