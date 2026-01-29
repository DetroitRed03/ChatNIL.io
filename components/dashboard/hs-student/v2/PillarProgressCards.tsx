'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PILLARS, PillarType, PILLAR_ORDER } from '@/lib/discovery/questions';

interface PillarData {
  unlocked: boolean;
  progress: number;
  questionsAnswered: number;
  totalQuestions: number;
  insights?: string[];
}

interface PillarProgressCardsProps {
  pillars: Record<PillarType, PillarData>;
  currentPillar: PillarType;
}

const pillarConfig: Record<PillarType, {
  icon: string;
  gradient: string;
  bgColor: string;
  textColor: string;
  description: string;
}> = {
  identity: {
    icon: '🎯',
    gradient: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    description: 'Define your personal brand',
  },
  business: {
    icon: '📋',
    gradient: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    description: 'Learn NIL rules & compliance',
  },
  money: {
    icon: '💰',
    gradient: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    description: 'Master financial basics',
  },
  legacy: {
    icon: '🌟',
    gradient: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    description: 'Build your lasting impact',
  },
};

export function PillarProgressCards({
  pillars,
  currentPillar,
}: PillarProgressCardsProps) {
  const router = useRouter();

  return (
    <div data-testid="pillar-progress-cards" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Your NIL Chapters</h3>
        <span className="text-sm text-gray-500">
          {Object.values(pillars).filter(p => p.unlocked).length}/4 completed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PILLAR_ORDER.map((pillar, index) => {
          const data = pillars[pillar];
          const config = pillarConfig[pillar];
          const isCurrent = pillar === currentPillar;
          const isLocked = !data.unlocked && pillar !== currentPillar && index > PILLAR_ORDER.indexOf(currentPillar);

          return (
            <motion.div
              key={pillar}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-xl border-2 overflow-hidden transition-all
                ${isCurrent
                  ? 'border-purple-300 shadow-lg shadow-purple-100'
                  : data.unlocked
                    ? 'border-green-200 bg-green-50/30'
                    : isLocked
                      ? 'border-gray-200 opacity-60'
                      : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              {/* Current indicator */}
              {isCurrent && (
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
              )}

              {/* Completed badge */}
              {data.unlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs"
                >
                  ✓
                </motion.div>
              )}

              {/* Locked overlay */}
              {isLocked && (
                <div className="absolute inset-0 bg-gray-100/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-2xl">🔒</span>
                    <p className="text-xs text-gray-500 mt-1">Complete previous chapter</p>
                  </div>
                </div>
              )}

              <div className="p-4">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center text-2xl`}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-900">
                      {PILLARS[pillar].name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {config.description}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className={`font-medium ${config.textColor}`}>
                      {data.questionsAnswered}/{data.totalQuestions} questions
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${config.gradient} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${data.progress}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Insights Preview */}
                {data.insights && data.insights.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-2">Your insights:</p>
                    <div className="space-y-1">
                      {data.insights.slice(0, 2).map((insight, i) => (
                        <p key={i} className="text-sm text-gray-600 truncate">
                          • {typeof insight === 'object' ? JSON.stringify(insight) : insight}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {(isCurrent || data.unlocked) && !isLocked && (
                  <motion.button
                    onClick={() => router.push('/discovery')}
                    className={`mt-4 w-full py-2.5 rounded-lg font-medium text-sm transition-colors
                      ${isCurrent
                        ? `bg-gradient-to-r ${config.gradient} text-white hover:opacity-90`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {data.unlocked ? 'Review Chapter' : 'Continue'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
