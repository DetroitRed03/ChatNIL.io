'use client';

import { motion } from 'framer-motion';

interface DimensionScoreProps {
  name: string;
  dimensionKey: string;
  score: number;
  weight: number;
  description?: string;
  delay?: number;
}

function getScoreColor(score: number) {
  if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-100' };
  if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-100' };
  return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-100' };
}

export function DimensionScore({ name, dimensionKey, score, weight, description, delay = 0 }: DimensionScoreProps) {
  const colors = getScoreColor(score);
  const weightPercent = Math.round(weight * 100);

  return (
    <motion.div
      data-testid={`dimension-${dimensionKey}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-200 p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{name}</h4>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{weightPercent}%</span>
          <span className={`text-xl font-bold ${colors.text}`}>{score}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: delay + 0.2, duration: 0.5, ease: 'easeOut' }}
          className={`h-full ${colors.bg} rounded-full`}
        />
      </div>
    </motion.div>
  );
}
