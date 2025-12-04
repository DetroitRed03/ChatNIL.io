'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from './Card';

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

const colorClasses = {
  primary: 'from-primary-500 to-primary-600',
  accent: 'from-accent-500 to-accent-600',
  success: 'from-green-500 to-green-600',
  warning: 'from-yellow-500 to-yellow-600',
  purple: 'from-purple-500 to-purple-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-emerald-600',
};

const shadowClasses = {
  primary: 'shadow-primary-500/30',
  accent: 'shadow-accent-500/30',
  success: 'shadow-green-500/30',
  warning: 'shadow-yellow-500/30',
  purple: 'shadow-purple-500/30',
  blue: 'shadow-blue-500/30',
  green: 'shadow-emerald-500/30',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  className = '',
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      <Card className={`relative overflow-hidden h-full bg-gradient-to-br from-white to-orange-50/20 border border-orange-100/30 hover:shadow-2xl ${shadowClasses[color]} hover:shadow-orange-200/30 transition-all duration-300`}>
        {/* Enhanced background gradient with warm overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5 group-hover:opacity-10 transition-opacity`} />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/10 via-transparent to-amber-50/5 pointer-events-none" />

        {/* Content */}
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            {Icon && (
              <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-base font-bold text-gray-600 mb-3">{label}</p>
            <p className={`text-6xl font-extrabold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
              {value}
            </p>

            {/* Fixed height trend area to ensure consistent card heights */}
            <div className="h-8 mt-3">
              {trend ? (
                <div className="flex items-center">
                  <span
                    className={`text-lg font-bold ${
                      trend.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                  </span>
                  <span className="ml-2 text-base font-medium text-gray-500">
                    {trend.isPositive ? 'up' : 'down'}
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
