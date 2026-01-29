'use client';

import { motion } from 'framer-motion';

interface PillarTimelineProps {
  current: 'identity' | 'business' | 'money' | 'legacy';
  completed: number; // 0-4
}

const pillars = [
  { id: 'identity', icon: '🎭', label: 'Identity' },
  { id: 'business', icon: '📋', label: 'Business' },
  { id: 'money', icon: '💰', label: 'Money' },
  { id: 'legacy', icon: '⭐', label: 'Legacy' },
];

export function PillarTimeline({ current, completed }: PillarTimelineProps) {
  const currentIndex = pillars.findIndex(p => p.id === current);

  return (
    <div className="flex items-center justify-between relative px-2">
      {/* Connection Line */}
      <div className="absolute top-4 left-8 right-8 h-0.5 bg-white/20">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${(completed / (pillars.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {pillars.map((pillar, index) => {
        const isCompleted = index < completed;
        const isCurrent = index === currentIndex;
        const isLocked = index > currentIndex;

        return (
          <motion.div
            key={pillar.id}
            className="flex flex-col items-center relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-base
                ${isCompleted
                  ? 'bg-white text-purple-600'
                  : isCurrent
                    ? 'bg-yellow-400 text-purple-900 ring-2 ring-yellow-300'
                    : 'bg-white/20 text-white/60'
                }`}
            >
              {isCompleted ? '✓' : pillar.icon}
            </div>
            <span
              className={`text-[10px] sm:text-xs mt-1 font-medium
                ${isCurrent ? 'text-white' : 'text-white/60'}`}
            >
              {pillar.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
