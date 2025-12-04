'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Eye, DollarSign } from 'lucide-react';

export function MetricCardExample() {
  const metrics = [
    {
      label: 'Total Earnings',
      value: '$156,420',
      change: '+23.5%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-[#ea580c] to-[#92400e]',
    },
    {
      label: 'Profile Views',
      value: '2.4M',
      change: '+18.2%',
      trend: 'up',
      icon: Eye,
      gradient: 'from-[#fcd34d] to-[#f59e0b]',
    },
  ];

  return (
    <div className="w-full max-w-md space-y-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;

        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.15,
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="relative"
          >
            <div
              className="bg-gradient-to-br from-white via-[#FFFBF7] to-white rounded-2xl border-2 border-[#E8E4DF] p-6 relative overflow-hidden"
              style={{
                boxShadow: `
                  0 8px 24px -4px rgba(234, 88, 12, 0.08),
                  0 4px 12px -2px rgba(234, 88, 12, 0.05),
                  inset 0 1px 0 0 rgba(255, 255, 255, 0.9),
                  inset 0 -1px 0 0 rgba(0, 0, 0, 0.02)
                `
              }}
            >
              {/* Embossed top highlight */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

              <div className="flex items-start justify-between mb-4">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center relative`}
                  style={{
                    boxShadow: `
                      0 6px 16px -4px rgba(234, 88, 12, 0.3),
                      inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2),
                      inset 0 1px 2px 0 rgba(255, 255, 255, 0.2)
                    `
                  }}
                >
                  <Icon className="w-7 h-7 text-white relative z-10" />
                  {/* Rotating shine */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  />
                </div>

                {/* Trend Badge */}
                <div
                  className={`px-3 py-1.5 rounded-full ${
                    metric.trend === 'up'
                      ? 'bg-gradient-to-r from-[#10b981] to-[#059669]'
                      : 'bg-gradient-to-r from-[#ef4444] to-[#dc2626]'
                  } flex items-center gap-1.5`}
                  style={{
                    boxShadow: `
                      0 3px 8px -2px ${metric.trend === 'up' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'},
                      inset 0 -1px 2px 0 rgba(0, 0, 0, 0.2)
                    `
                  }}
                >
                  <TrendIcon className="w-3.5 h-3.5 text-white" />
                  <span className="text-sm font-bold text-white">
                    {metric.change}
                  </span>
                </div>
              </div>

              {/* Label */}
              <div className="mb-2">
                <p className="text-sm text-[#6c757d] font-medium tracking-wide uppercase">
                  {metric.label}
                </p>
              </div>

              {/* Value with embossed effect */}
              <div className="relative">
                <h3
                  className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#1a1d20] to-[#495057] bg-clip-text text-transparent"
                  style={{
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  {metric.value}
                </h3>
              </div>

              {/* Progress visualization */}
              <div className="mt-4">
                <div
                  className="h-2 bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] rounded-full overflow-hidden border border-[#E8E4DF]"
                  style={{
                    boxShadow: `
                      inset 2px 2px 4px rgba(0, 0, 0, 0.05),
                      inset -1px -1px 3px rgba(255, 255, 255, 0.8)
                    `
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${65 + index * 10}%` }}
                    transition={{
                      duration: 1.5,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      delay: 0.3 + index * 0.15
                    }}
                    className={`h-full bg-gradient-to-r ${metric.gradient} relative`}
                    style={{
                      boxShadow: `
                        0 0 6px rgba(234, 88, 12, 0.3),
                        inset 0 -1px 1px rgba(0, 0, 0, 0.2)
                      `
                    }}
                  >
                    {/* Animated shimmer */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div
                className="absolute bottom-0 right-0 w-24 h-24 opacity-5"
                style={{
                  background: `radial-gradient(circle at bottom right, ${metric.gradient}, transparent 70%)`
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
