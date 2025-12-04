'use client';

import { motion } from 'framer-motion';
import { Zap, Target, DollarSign, Clock, Star, ArrowRight } from 'lucide-react';
import { SPRING_CONFIGS } from '@/lib/animations/core/animation-tokens';

export function OpportunityCardExample() {
  return (
    <motion.div
      className="relative w-80 bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-3xl overflow-hidden border-2 border-primary-500/50 shadow-[0_0_40px_rgba(249,115,22,0.4)]"
      whileHover={{ scale: 1.02, y: -8 }}
      transition={SPRING_CONFIGS.energetic.bouncy}
    >
      {/* Pulsing Glow Ring */}
      <motion.div
        className="absolute inset-0 rounded-3xl border-4 border-primary-500/30"
        animate={{
          borderColor: ['rgba(249, 115, 22, 0.3)', 'rgba(249, 115, 22, 0.8)', 'rgba(249, 115, 22, 0.3)'],
          boxShadow: [
            '0 0 20px rgba(249, 115, 22, 0.3)',
            '0 0 40px rgba(249, 115, 22, 0.6)',
            '0 0 20px rgba(249, 115, 22, 0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Match Score Badge */}
      <div className="relative pt-6 px-6">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent-500 to-primary-500 text-secondary-900 font-extrabold text-sm shadow-[0_0_25px_rgba(251,191,36,0.6)]"
          animate={{
            y: [0, -4, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Zap className="w-4 h-4" />
          </motion.div>
          <span>98% MATCH</span>
          <Star className="w-4 h-4 fill-current" />
        </motion.div>
      </div>

      {/* Opportunity Header */}
      <div className="relative px-6 pt-4">
        <motion.h3
          className="text-2xl font-extrabold text-white drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]"
          whileHover={{ scale: 1.05 }}
        >
          Content Creator Partnership
        </motion.h3>
        <p className="text-primary-300 font-bold text-sm mt-1">TechGear Athletics</p>
      </div>

      {/* Key Details Grid */}
      <div className="relative px-6 py-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Compensation */}
          <motion.div
            className="relative p-4 bg-gradient-to-br from-primary-500/30 to-primary-600/20 border-2 border-primary-500/50 rounded-2xl"
            whileHover={{ scale: 1.05 }}
            transition={SPRING_CONFIGS.energetic.bouncy}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent rounded-2xl">
              <motion.div
                className="h-full w-full"
                animate={{
                  background: [
                    'radial-gradient(circle at 0% 0%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 100% 100%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 0% 0%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <div className="relative">
              <DollarSign className="w-5 h-5 text-primary-400 mb-2" />
              <div className="text-2xl font-extrabold text-primary-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]">
                $15K
              </div>
              <div className="text-xs text-gray-400 font-bold tracking-wider uppercase mt-1">
                Compensation
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            className="relative p-4 bg-gradient-to-br from-accent-500/30 to-accent-600/20 border-2 border-accent-500/50 rounded-2xl"
            whileHover={{ scale: 1.05 }}
            transition={SPRING_CONFIGS.energetic.bouncy}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent rounded-2xl">
              <motion.div
                className="h-full w-full"
                animate={{
                  background: [
                    'radial-gradient(circle at 100% 0%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 0% 100%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 100% 0%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <div className="relative">
              <Clock className="w-5 h-5 text-accent-400 mb-2" />
              <div className="text-2xl font-extrabold text-accent-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                6mo
              </div>
              <div className="text-xs text-gray-400 font-bold tracking-wider uppercase mt-1">
                Duration
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Match Criteria */}
      <div className="relative px-6 pb-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 font-bold tracking-wider uppercase text-xs">Match Criteria</span>
          </div>

          {/* Criteria bars */}
          {[
            { label: 'Sport Alignment', value: 100, color: 'success' },
            { label: 'Audience Match', value: 95, color: 'primary' },
            { label: 'Content Style', value: 98, color: 'accent' },
          ].map((criteria, index) => (
            <div key={criteria.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-400 tracking-wide">
                  {criteria.label}
                </span>
                <span className={`text-sm font-extrabold text-${criteria.color}-400`}>
                  {criteria.value}%
                </span>
              </div>
              <div className="h-2 bg-secondary-800 rounded-full overflow-hidden border border-primary-500/30 shadow-inner">
                <motion.div
                  className={`h-full bg-gradient-to-r from-${criteria.color}-500 to-${criteria.color}-400 shadow-[0_0_10px_rgba(249,115,22,0.6)]`}
                  initial={{ width: 0 }}
                  animate={{ width: `${criteria.value}%` }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.2 + 0.5,
                    ease: 'easeOut',
                  }}
                >
                  <motion.div
                    className="h-full bg-white/30"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: index * 0.3,
                    }}
                  />
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="relative px-6 pb-6">
        <motion.button
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 text-secondary-900 font-extrabold text-lg shadow-[0_0_30px_rgba(249,115,22,0.6)] relative overflow-hidden group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={SPRING_CONFIGS.energetic.bouncy}
          style={{ backgroundSize: '200% 100%' }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
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
            <Target className="w-5 h-5" />
            APPLY NOW
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </span>
        </motion.button>
      </div>

      {/* Pulsing corner indicators */}
      <motion.div
        className="absolute top-3 right-3 w-4 h-4 bg-primary-500 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.3, 1],
          boxShadow: [
            '0 0 10px rgba(249, 115, 22, 0.6)',
            '0 0 20px rgba(249, 115, 22, 0.9)',
            '0 0 10px rgba(249, 115, 22, 0.6)',
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.div>
  );
}
