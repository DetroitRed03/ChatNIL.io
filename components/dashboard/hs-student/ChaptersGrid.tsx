'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PILLARS, PillarType, PILLAR_ORDER } from '@/lib/discovery/questions';

interface ChapterData {
  unlocked: boolean;
  quizAvailable?: boolean;
  quizScore?: number;
  insights?: string[];
}

interface ChaptersGridProps {
  chapters: Record<PillarType, ChapterData>;
  currentPillar: PillarType;
}

const pillarStyles: Record<PillarType, { gradient: string; icon: string; lockedIcon: string }> = {
  identity: {
    gradient: 'from-purple-500 to-indigo-600',
    icon: '🎯',
    lockedIcon: '🔒',
  },
  business: {
    gradient: 'from-blue-500 to-cyan-600',
    icon: '📋',
    lockedIcon: '🔒',
  },
  money: {
    gradient: 'from-green-500 to-emerald-600',
    icon: '💰',
    lockedIcon: '🔒',
  },
  legacy: {
    gradient: 'from-orange-500 to-amber-600',
    icon: '🌟',
    lockedIcon: '🔒',
  },
};

export function ChaptersGrid({ chapters, currentPillar }: ChaptersGridProps) {
  const router = useRouter();

  return (
    <div data-testid="chapters-grid" className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Your Chapters</h3>
        <span data-testid="chapters-unlocked-count" className="text-sm text-gray-500">
          {Object.values(chapters).filter(c => c.unlocked).length}/4 Unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PILLAR_ORDER.map((pillar, index) => {
          const chapter = chapters[pillar];
          const style = pillarStyles[pillar];
          const isCurrent = pillar === currentPillar;
          const isUnlocked = chapter.unlocked;

          return (
            <motion.div
              key={pillar}
              data-testid={`chapter-${pillar}`}
              data-unlocked={isUnlocked}
              data-current={isCurrent}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => isUnlocked && router.push(`/chapters/${pillar}`)}
              className={`relative rounded-xl p-4 cursor-pointer transition-all
                ${isUnlocked
                  ? `bg-gradient-to-br ${style.gradient} text-white hover:shadow-lg hover:scale-[1.02]`
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
                ${isCurrent && !isUnlocked ? 'ring-2 ring-purple-400 ring-offset-2' : ''}
              `}
            >
              {/* Current indicator */}
              {isCurrent && !isUnlocked && (
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Current
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">
                  {isUnlocked ? style.icon : style.lockedIcon}
                </span>
                {isUnlocked && chapter.quizAvailable && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    Quiz Ready
                  </span>
                )}
              </div>

              <h4 className={`font-semibold text-sm ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                {PILLARS[pillar].name}
              </h4>

              <p className={`text-xs mt-1 ${isUnlocked ? 'text-white/80' : 'text-gray-400'}`}>
                {isUnlocked
                  ? chapter.quizScore !== undefined
                    ? `Quiz: ${chapter.quizScore}%`
                    : 'Tap to explore'
                  : isCurrent
                    ? 'In progress...'
                    : 'Complete previous'
                }
              </p>

              {/* Insights preview */}
              {isUnlocked && chapter.insights && chapter.insights.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <p className="text-xs text-white/70 truncate">
                    {chapter.insights[0]}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" />
          <span>Unlocked</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-gray-200" />
          <span>Locked</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-purple-200 ring-2 ring-purple-400" />
          <span>Current</span>
        </div>
      </div>
    </div>
  );
}
