'use client';

import { motion } from 'framer-motion';
import { DollarSign, Calendar, TrendingUp, Award, Flame } from 'lucide-react';
import { SPRING_CONFIGS } from '@/lib/animations/core/animation-tokens';

export function DealCardExample() {
  return (
    <motion.div
      className="relative w-80 bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-3xl overflow-hidden border-2 border-primary-500/50 shadow-[0_0_40px_rgba(249,115,22,0.4)]"
      whileHover={{ scale: 1.02, y: -8 }}
      transition={SPRING_CONFIGS.energetic.bouncy}
    >
      {/* Scoreboard LED strips */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Deal Status Banner */}
      <div className="relative mt-4 mx-4 px-4 py-2 bg-gradient-to-r from-success-500/20 to-success-600/20 border-2 border-success-500/50 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-3 h-3 bg-success-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-success-400 font-extrabold text-sm tracking-wider">ACTIVE DEAL</span>
          </div>
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Flame className="w-5 h-5 text-accent-400" />
          </motion.div>
        </div>
      </div>

      {/* Brand Logo Section */}
      <div className="relative px-6 pt-6">
        <div className="flex items-center gap-4">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={SPRING_CONFIGS.energetic.bouncy}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl blur-lg opacity-60" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 p-1 shadow-[0_0_25px_rgba(249,115,22,0.6)]">
              <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                <Award className="w-10 h-10 text-primary-600" />
              </div>
            </div>
          </motion.div>

          <div className="flex-1">
            <motion.h3
              className="text-2xl font-extrabold text-white drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              whileHover={{ scale: 1.05 }}
            >
              Nike Elite
            </motion.h3>
            <p className="text-primary-300 font-bold text-sm">Athletic Partnership</p>
          </div>
        </div>
      </div>

      {/* Scoreboard Stats */}
      <div className="relative px-6 py-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Deal Value */}
          <motion.div
            className="relative p-4 bg-gradient-to-br from-primary-500/30 to-primary-600/20 border-2 border-primary-500/50 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249, 115, 22, 0.5)' }}
            transition={SPRING_CONFIGS.energetic.bouncy}
          >
            <div className="flex items-start justify-between mb-2">
              <DollarSign className="w-5 h-5 text-primary-400" />
              <div className="px-2 py-0.5 rounded-full bg-primary-500/30 text-primary-300 text-[10px] font-extrabold">
                HIGH
              </div>
            </div>
            <div className="text-3xl font-extrabold text-primary-400 tabular-nums drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]">
              $25K
            </div>
            <div className="text-xs text-gray-400 font-bold tracking-wider uppercase mt-1">
              Deal Value
            </div>
          </motion.div>

          {/* Duration */}
          <motion.div
            className="relative p-4 bg-gradient-to-br from-accent-500/30 to-accent-600/20 border-2 border-accent-500/50 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }}
            transition={SPRING_CONFIGS.energetic.bouncy}
          >
            <div className="flex items-start justify-between mb-2">
              <Calendar className="w-5 h-5 text-accent-400" />
              <div className="px-2 py-0.5 rounded-full bg-accent-500/30 text-accent-300 text-[10px] font-extrabold">
                YEAR
              </div>
            </div>
            <div className="text-3xl font-extrabold text-accent-400 tabular-nums drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
              12
            </div>
            <div className="text-xs text-gray-400 font-bold tracking-wider uppercase mt-1">
              Months
            </div>
          </motion.div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="relative px-6 pb-6">
        <div className="space-y-3">
          {/* Engagement Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-gray-400 tracking-wider uppercase">
                Engagement
              </span>
              <span className="text-sm font-extrabold text-success-400">94%</span>
            </div>
            <div className="h-3 bg-secondary-800 rounded-full overflow-hidden border border-primary-500/30 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-success-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]"
                initial={{ width: 0 }}
                animate={{ width: '94%' }}
                transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Performance Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-gray-400 tracking-wider uppercase">
                Performance
              </span>
              <span className="text-sm font-extrabold text-accent-400">88%</span>
            </div>
            <div className="h-3 bg-secondary-800 rounded-full overflow-hidden border border-accent-500/30 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-500 to-primary-500 shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                initial={{ width: 0 }}
                animate={{ width: '88%' }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="relative px-6 pb-6">
        <motion.button
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-secondary-900 font-extrabold text-lg shadow-[0_0_30px_rgba(249,115,22,0.6)] relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={SPRING_CONFIGS.energetic.bouncy}
        >
          <motion.div
            className="absolute inset-0 bg-white/20"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <TrendingUp className="w-5 h-5" />
            VIEW ANALYTICS
          </span>
        </motion.button>
      </div>

      {/* Corner LED indicators */}
      <motion.div
        className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-2 left-2 w-2 h-2 bg-accent-500 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.div>
  );
}
