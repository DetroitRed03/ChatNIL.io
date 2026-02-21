'use client';

import { motion } from 'framer-motion';

interface ComplianceScoreRingProps {
  score: number;
  status: 'green' | 'yellow' | 'red';
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
}

function getScoreColor(status: 'green' | 'yellow' | 'red') {
  switch (status) {
    case 'green': return { stroke: '#22c55e', bg: '#f0fdf4', text: '#166534' };
    case 'yellow': return { stroke: '#f59e0b', bg: '#fffbeb', text: '#92400e' };
    case 'red': return { stroke: '#ef4444', bg: '#fef2f2', text: '#991b1b' };
  }
}

function getStatusLabel(status: 'green' | 'yellow' | 'red') {
  switch (status) {
    case 'green': return 'Compliant';
    case 'yellow': return 'Needs Review';
    case 'red': return 'Red Flags';
  }
}

export default function ComplianceScoreRing({
  score,
  status,
  size = 120,
  strokeWidth = 8,
  animated = true,
}: ComplianceScoreRingProps) {
  const colors = getScoreColor(status);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score, 100) / 100;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-bold"
            style={{ fontSize: size * 0.25, color: colors.text }}
            initial={animated ? { opacity: 0, scale: 0.5 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {score}
          </motion.span>
          {size >= 80 && (
            <span className="text-gray-400" style={{ fontSize: size * 0.1 }}>
              / 100
            </span>
          )}
        </div>
      </div>
      {size >= 80 && (
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {getStatusLabel(status)}
        </span>
      )}
    </div>
  );
}
