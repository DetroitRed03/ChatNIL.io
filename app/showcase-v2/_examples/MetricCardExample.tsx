'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { TrendingUp, Eye, Heart, Share2, ChevronUp } from 'lucide-react';
import { SPRING_CONFIGS } from '@/lib/animations/core/animation-tokens';
import { useEffect } from 'react';

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 2, ease: 'easeOut' });
    return controls.stop;
  }, [value, count]);

  return (
    <motion.span className="tabular-nums">
      {rounded.get().toLocaleString()}{suffix}
    </motion.span>
  );
}

export function MetricCardExample() {
  return (
    <motion.div
      className="relative w-80 bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-3xl overflow-hidden border-2 border-primary-500/50 shadow-[0_0_40px_rgba(249,115,22,0.4)]"
      whileHover={{ scale: 1.02, y: -8 }}
      transition={SPRING_CONFIGS.energetic.bouncy}
    >
      {/* Stadium Scoreboard Header */}
      <div className="relative bg-gradient-to-r from-secondary-950 via-secondary-900 to-secondary-950 border-b-4 border-primary-500/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <motion.h3
              className="text-2xl font-extrabold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              whileHover={{ scale: 1.05 }}
            >
              PERFORMANCE
            </motion.h3>
            <p className="text-primary-300 font-bold text-sm tracking-wider">STATS DASHBOARD</p>
          </div>
          <motion.div
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-success-500/30 to-success-600/20 border-2 border-success-500/50"
            animate={{
              boxShadow: [
                '0 0 15px rgba(16, 185, 129, 0.3)',
                '0 0 25px rgba(16, 185, 129, 0.5)',
                '0 0 15px rgba(16, 185, 129, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4 text-success-400" />
              <span className="text-success-400 font-extrabold text-sm">+24.5%</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Metric Display - Stadium Style */}
      <div className="relative px-6 py-8">
        <motion.div
          className="relative p-8 bg-gradient-to-br from-primary-500/20 via-accent-500/10 to-primary-500/20 rounded-3xl border-2 border-primary-500/50 shadow-[0_0_30px_rgba(249,115,22,0.4)]"
          whileHover={{ scale: 1.05 }}
          transition={SPRING_CONFIGS.energetic.bouncy}
        >
          {/* Digital display effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/10 to-transparent">
            <motion.div
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <div className="relative text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-primary-400" />
            <div className="text-6xl font-extrabold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(249,115,22,0.8)]">
              <AnimatedCounter value={84236} />
            </div>
            <div className="text-sm font-extrabold text-primary-300 tracking-[0.3em] uppercase mt-3">
              TOTAL IMPRESSIONS
            </div>
          </div>

          {/* LED strip indicators */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500">
            <motion.div
              className="h-full bg-white/50"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="relative px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Eye, label: 'Views', value: 45230, color: 'primary', trend: '+12%' },
            { icon: Heart, label: 'Likes', value: 23456, color: 'accent', trend: '+18%' },
            { icon: Share2, label: 'Shares', value: 8921, color: 'success', trend: '+24%' },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3, ...SPRING_CONFIGS.energetic.bouncy }}
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <div className={`
                relative p-4 rounded-2xl text-center
                bg-gradient-to-br from-${metric.color}-500/20 to-${metric.color}-600/10
                border-2 border-${metric.color}-500/30
                shadow-[0_0_15px_rgba(249,115,22,0.2)]
                group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]
                transition-all
              `}>
                {/* Stat icon */}
                <metric.icon className={`w-4 h-4 mx-auto mb-2 text-${metric.color}-400`} />

                {/* Value */}
                <div className={`text-xl font-extrabold text-${metric.color}-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]`}>
                  <AnimatedCounter value={metric.value / 1000} suffix="K" />
                </div>

                {/* Label */}
                <div className="text-[9px] text-gray-400 font-bold tracking-wider uppercase mt-1">
                  {metric.label}
                </div>

                {/* Trend badge */}
                <motion.div
                  className={`
                    absolute -top-2 -right-2 px-2 py-0.5 rounded-full
                    bg-${metric.color}-500/30 border border-${metric.color}-500/50
                    text-${metric.color}-400 text-[8px] font-extrabold
                    shadow-[0_0_10px_rgba(249,115,22,0.4)]
                  `}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  {metric.trend}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="relative px-6 pb-6">
        <div className="flex gap-2">
          {['24H', '7D', '30D', 'ALL'].map((period, index) => (
            <motion.button
              key={period}
              className={`
                flex-1 py-2 rounded-xl font-extrabold text-sm
                ${index === 2
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-secondary-900 shadow-[0_0_20px_rgba(249,115,22,0.6)]'
                  : 'bg-secondary-800/50 text-gray-400 border border-primary-500/30 hover:border-primary-500/50'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={SPRING_CONFIGS.energetic.bouncy}
            >
              {period}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Corner LED indicators */}
      <motion.div
        className="absolute top-4 left-4 w-3 h-3 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)]"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-4 right-4 w-3 h-3 bg-accent-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)]"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-4 left-4 w-3 h-3 bg-success-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-4 right-4 w-3 h-3 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)]"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      />
    </motion.div>
  );
}
