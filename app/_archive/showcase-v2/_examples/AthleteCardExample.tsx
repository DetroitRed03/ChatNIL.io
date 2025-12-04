'use client';

import { motion } from 'framer-motion';
import { Star, TrendingUp, Users, Zap } from 'lucide-react';
import { SPRING_CONFIGS } from '@/lib/animations/core/animation-tokens';

export function AthleteCardExample() {
  return (
    <motion.div
      className="relative w-80 bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-3xl overflow-hidden border-2 border-primary-500/50 shadow-[0_0_40px_rgba(249,115,22,0.4)]"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={SPRING_CONFIGS.energetic.bouncy}
    >
      {/* LED Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20 pointer-events-none" />

      {/* Jersey Number Background */}
      <div className="absolute top-4 right-4 text-[120px] font-extrabold text-primary-500/10 leading-none select-none">
        23
      </div>

      {/* Profile Image with Glow */}
      <div className="relative pt-6 px-6">
        <motion.div
          className="relative w-28 h-28 mx-auto"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={SPRING_CONFIGS.energetic.bouncy}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full blur-xl opacity-60" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary-600 to-accent-600 p-1 shadow-[0_0_30px_rgba(249,115,22,0.6)]">
            <div className="w-full h-full rounded-full bg-secondary-800 flex items-center justify-center text-4xl font-extrabold text-primary-400">
              MJ
            </div>
          </div>
          {/* Status indicator */}
          <motion.div
            className="absolute bottom-1 right-1 w-6 h-6 bg-success-500 rounded-full border-4 border-secondary-900 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* Athlete Info */}
      <div className="relative px-6 pt-4 text-center">
        <motion.h3
          className="text-2xl font-extrabold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]"
          whileHover={{ scale: 1.05 }}
        >
          Marcus Johnson
        </motion.h3>
        <p className="text-primary-300 font-bold tracking-wide mt-1">Basketball • Guard</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="px-3 py-1 rounded-full bg-accent-500/20 border border-accent-500/50 text-accent-400 text-xs font-extrabold shadow-[0_0_10px_rgba(251,191,36,0.3)]">
            ELITE
          </div>
          <div className="px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/50 text-primary-400 text-xs font-extrabold">
            #23
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative grid grid-cols-3 gap-3 px-6 py-5">
        {[
          { icon: Star, label: 'Rating', value: '98', color: 'primary' },
          { icon: Users, label: 'Followers', value: '124K', color: 'accent' },
          { icon: TrendingUp, label: 'Growth', value: '+24%', color: 'success' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, ...SPRING_CONFIGS.energetic.bouncy }}
            whileHover={{ scale: 1.1, y: -4 }}
          >
            <div className={`
              relative p-3 rounded-2xl text-center
              bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/10
              border border-${stat.color}-500/30
              shadow-[0_0_20px_rgba(249,115,22,0.2)]
              group-hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]
              transition-all
            `}>
              <stat.icon className={`w-4 h-4 mx-auto mb-1 text-${stat.color}-400`} />
              <div className={`text-xl font-extrabold text-${stat.color}-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]`}>
                {stat.value}
              </div>
              <div className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Button */}
      <div className="relative px-6 pb-6">
        <motion.button
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-secondary-900 font-extrabold text-lg shadow-[0_0_30px_rgba(249,115,22,0.6)] relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={SPRING_CONFIGS.energetic.bouncy}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-accent-400/30 to-primary-400/30"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            VIEW PROFILE
          </span>
        </motion.button>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary-500/50 rounded-tl-3xl" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-accent-500/50 rounded-br-3xl" />
    </motion.div>
  );
}
