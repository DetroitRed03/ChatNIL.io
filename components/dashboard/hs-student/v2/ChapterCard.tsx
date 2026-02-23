'use client';

import { motion } from 'framer-motion';

interface ChapterCardProps {
  id: string;
  icon: string;
  title: string;
  progress: number; // 0-100
  isLocked: boolean;
  isCurrent: boolean;
  isComplete: boolean;
  levelRequired?: number;
  onClick: () => void;
}

export function ChapterCard({
  id,
  icon,
  title,
  progress,
  isLocked,
  isCurrent,
  isComplete,
  levelRequired,
  onClick,
}: ChapterCardProps) {
  return (
    <motion.button
      onClick={!isLocked ? onClick : undefined}
      disabled={isLocked}
      className={`relative w-full rounded-xl p-4 text-left transition-all
        ${isLocked
          ? 'bg-gray-50 border border-gray-200 cursor-not-allowed'
          : isCurrent
            ? 'bg-purple-50 border-2 border-purple-300 shadow-sm'
            : isComplete
              ? 'bg-green-50 border border-green-200'
              : 'bg-white border border-gray-200 hover:border-gray-300'
        }`}
      whileHover={!isLocked ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
    >
      {/* Current Badge */}
      {isCurrent && (
        <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold">
          CURRENT
        </div>
      )}

      {/* Complete Badge */}
      {isComplete && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold">
          ✓ DONE
        </div>
      )}

      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl
            ${isLocked
              ? 'bg-gray-100 grayscale opacity-50'
              : isComplete
                ? 'bg-green-100'
                : isCurrent
                  ? 'bg-purple-100'
                  : 'bg-gray-100'
            }`}
        >
          {isLocked ? '🔒' : icon}
        </div>
        <div className="flex-grow">
          <h4
            className={`font-bold text-sm
              ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}
          >
            {title}
          </h4>

          {isLocked && levelRequired ? (
            <p className="text-xs text-gray-400">
              🔒 Unlock at Level {levelRequired}
            </p>
          ) : isComplete ? (
            <p className="text-xs text-green-600 font-medium">Complete!</p>
          ) : (
            <div className="mt-1">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden w-full">
                <motion.div
                  className={`h-full rounded-full ${isCurrent ? 'bg-purple-500' : 'bg-gray-400'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{progress}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Continue indicator for current */}
      {isCurrent && !isComplete && (
        <div className="mt-3 text-center">
          <span className="text-xs text-purple-600 font-medium">Continue →</span>
        </div>
      )}
    </motion.button>
  );
}
