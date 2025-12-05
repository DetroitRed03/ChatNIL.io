'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { DESIGN_TOKENS } from '@/lib/design-system/constants';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'purple' | 'blue' | 'green';
  className?: string;
}

// Modern, clean icon styling
const iconStyles = {
  primary: {
    icon: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-100'
  },
  accent: {
    icon: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-100'
  },
  success: {
    icon: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-100'
  },
  warning: {
    icon: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-100'
  },
  purple: {
    icon: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-100'
  },
  blue: {
    icon: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-100'
  },
  green: {
    icon: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-100'
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  className = '',
}: StatCardProps) {
  const iconStyle = iconStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      {...DESIGN_TOKENS.animations.hover.card}
      className={className}
    >
      <Card
        className="relative h-full bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 group"
        style={{ boxShadow: DESIGN_TOKENS.elevation.card }}
      >
        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <p className={`${DESIGN_TOKENS.typography.label}`}>
              {label}
            </p>
            {Icon && (
              <div className={`p-2.5 rounded-lg ${iconStyle.bg} border`}>
                <Icon className={`h-5 w-5 ${iconStyle.icon}`} />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className={`${DESIGN_TOKENS.typography.value} text-slate-900 mb-2`}>
              {value}
            </p>

            {/* Fixed height trend area */}
            <div className="h-5">
              {trend ? (
                <div className="flex items-center gap-1">
                  <span
                    className={`text-sm font-semibold ${
                      trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    vs last month
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
