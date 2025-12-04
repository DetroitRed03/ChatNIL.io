'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, Eye } from 'lucide-react';

export function MetricCardExample() {
  const metrics = [
    {
      label: 'Total Revenue',
      value: '$142,580',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'from-emerald-50 to-teal-50',
    },
    {
      label: 'Active Deals',
      value: '24',
      change: '+3',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
    },
    {
      label: 'Total Impressions',
      value: '2.4M',
      change: '-8.2%',
      trend: 'down',
      icon: Eye,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;

        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`bg-gradient-to-br ${metric.bgColor} border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden`}
          >
            {/* Animated Background */}
            <motion.div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${metric.color} opacity-10 rounded-full blur-2xl`}
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 10, 0],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <div className="relative">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>

              {/* Label */}
              <h3 className="text-sm font-semibold text-gray-600 mb-2">{metric.label}</h3>

              {/* Value */}
              <div className="flex items-end justify-between">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="text-3xl font-bold text-slate-900"
                >
                  {metric.value}
                </motion.div>

                {/* Trend Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.4, type: 'spring' }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                    metric.trend === 'up'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-sm font-semibold">{metric.change}</span>
                </motion.div>
              </div>

              {/* Sparkline placeholder */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
                className="mt-4 h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full origin-left"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
