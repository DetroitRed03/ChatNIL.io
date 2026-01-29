'use client';

import { motion } from 'framer-motion';
import { PillarType } from '@/lib/discovery/questions';

interface QuickWin {
  id: string;
  type: 'continue' | 'quiz' | 'reflection' | 'streak';
  title: string;
  description: string;
  xpReward: number;
  action: string;
  pillar?: PillarType;
}

interface QuickWinsSectionProps {
  quickWins: QuickWin[];
  onAction: (actionUrl: string) => void;
}

const typeConfig: Record<QuickWin['type'], { icon: string; gradient: string }> = {
  continue: {
    icon: '💬',
    gradient: 'from-purple-500 to-indigo-600',
  },
  quiz: {
    icon: '📝',
    gradient: 'from-blue-500 to-cyan-600',
  },
  reflection: {
    icon: '💭',
    gradient: 'from-emerald-500 to-teal-600',
  },
  streak: {
    icon: '🔥',
    gradient: 'from-orange-500 to-red-500',
  },
};

export function QuickWinsSection({ quickWins, onAction }: QuickWinsSectionProps) {
  if (quickWins.length === 0) return null;

  return (
    <div data-testid="quick-wins-section" className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <h3 className="font-semibold text-gray-900">Quick Wins</h3>
        <span className="text-sm text-gray-500">Earn XP now!</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {quickWins.map((win, index) => {
          const config = typeConfig[win.type];

          return (
            <motion.button
              key={win.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onAction(win.action)}
              className={`relative overflow-hidden rounded-xl p-4 text-left
                bg-gradient-to-br ${config.gradient} text-white
                hover:shadow-lg transition-shadow group`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6">
                  <span className="text-6xl">{config.icon}</span>
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{config.icon}</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                    +{win.xpReward} XP
                  </span>
                </div>
                <h4 className="font-semibold mb-1">{win.title}</h4>
                <p className="text-sm text-white/80 line-clamp-2">
                  {win.description}
                </p>

                {/* Arrow indicator */}
                <motion.div
                  className="absolute bottom-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="text-lg">→</span>
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
