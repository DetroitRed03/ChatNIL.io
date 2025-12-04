'use client';

import { motion } from 'framer-motion';
import { User, Star, TrendingUp, Award, MapPin, Calendar, Zap, Target, Flame } from 'lucide-react';
import { SPRING_CONFIGS } from '@/lib/animations/core/animation-tokens';

export function ProfileExamples() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">

      {/* Compact Profile Card */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
          Compact Profile
        </h3>
        <motion.div
          className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-3xl p-6 border-2 border-primary-500/50 shadow-[0_0_40px_rgba(249,115,22,0.3)] overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={SPRING_CONFIGS.energetic.bouncy}
        >
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />

          <div className="relative flex items-center gap-6">
            {/* Avatar */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={SPRING_CONFIGS.energetic.bouncy}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full blur-lg opacity-60" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 p-1 shadow-[0_0_25px_rgba(249,115,22,0.6)]">
                <div className="w-full h-full rounded-full bg-secondary-800 flex items-center justify-center text-3xl font-extrabold text-primary-400">
                  TW
                </div>
              </div>
              <motion.div
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-success-500 rounded-full border-4 border-secondary-900 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-4 h-4 text-white" />
              </motion.div>
            </motion.div>

            {/* Info */}
            <div className="flex-1">
              <h4 className="text-2xl font-extrabold text-white drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                Tyler Williams
              </h4>
              <p className="text-primary-300 font-bold mt-1">Football • Wide Receiver</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4 text-accent-400" />
                  <span className="text-gray-400 font-bold">Austin, TX</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-4 h-4 text-accent-400" />
                  <span className="text-gray-400 font-bold">Joined 2024</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              {[
                { label: 'Rating', value: '95', icon: Star },
                { label: 'Deals', value: '12', icon: Award },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  whileHover={{ scale: 1.1, y: -4 }}
                >
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-500/30 to-primary-600/20 border-2 border-primary-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                    <stat.icon className="w-5 h-5 text-primary-400 mx-auto mb-1" />
                    <div className="text-2xl font-extrabold text-primary-400">
                      {stat.value}
                    </div>
                    <div className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Full Profile with Energy Bars */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-accent-500 to-primary-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
          Full Profile with Stats
        </h3>
        <motion.div
          className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-3xl overflow-hidden border-2 border-primary-500/50 shadow-[0_0_40px_rgba(249,115,22,0.4)]"
          whileHover={{ scale: 1.01 }}
          transition={SPRING_CONFIGS.energetic.bouncy}
        >
          {/* Header Section */}
          <div className="relative p-8 bg-gradient-to-r from-secondary-950 via-secondary-900 to-secondary-950 border-b-2 border-primary-500/50">
            <div className="flex items-start gap-6">
              {/* Large Avatar */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05, rotate: -3 }}
                transition={SPRING_CONFIGS.energetic.bouncy}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl blur-xl opacity-60" />
                <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-primary-600 to-accent-600 p-1 shadow-[0_0_30px_rgba(249,115,22,0.6)]">
                  <div className="w-full h-full rounded-2xl bg-secondary-800 flex items-center justify-center text-4xl font-extrabold text-primary-400">
                    SJ
                  </div>
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-accent-500 to-primary-500 text-secondary-900 font-extrabold text-xs shadow-[0_0_15px_rgba(251,191,36,0.8)]"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  PRO
                </motion.div>
              </motion.div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-3xl font-extrabold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                      Sarah Johnson
                    </h4>
                    <p className="text-primary-300 font-bold text-lg mt-2">Basketball • Guard</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-accent-400" />
                        <span className="text-gray-400 font-bold text-sm">Los Angeles, CA</span>
                      </div>
                      <div className="h-1 w-1 bg-gray-600 rounded-full" />
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-success-400" />
                        <span className="text-success-400 font-bold text-sm">+15% this month</span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-secondary-900 font-extrabold shadow-[0_0_25px_rgba(249,115,22,0.6)]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Follow
                  </motion.button>
                </div>

                <p className="text-gray-300 font-medium mt-4 leading-relaxed">
                  Elite basketball player with 3 years of NIL experience. Passionate about sports marketing and building authentic brand partnerships.
                </p>
              </div>
            </div>
          </div>

          {/* Energy Bars / Skills Section */}
          <div className="p-8">
            <h5 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-400" />
              Performance Metrics
            </h5>

            <div className="space-y-5">
              {[
                { label: 'Social Reach', value: 92, icon: TrendingUp, color: 'primary', max: 100 },
                { label: 'Engagement Rate', value: 88, icon: Flame, color: 'accent', max: 100 },
                { label: 'Brand Alignment', value: 95, icon: Award, color: 'success', max: 100 },
                { label: 'Content Quality', value: 90, icon: Star, color: 'primary', max: 100 },
              ].map((metric, index) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <metric.icon className={`w-4 h-4 text-${metric.color}-400`} />
                      <span className="text-sm font-extrabold text-gray-400 tracking-wider uppercase">
                        {metric.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-extrabold text-${metric.color}-400`}>
                        {metric.value}
                      </span>
                      <span className="text-sm text-gray-500 font-bold">/ {metric.max}</span>
                    </div>
                  </div>

                  {/* Energy Bar */}
                  <div className="h-4 bg-secondary-800 rounded-full overflow-hidden border-2 border-primary-500/30 shadow-inner relative">
                    <motion.div
                      className={`h-full bg-gradient-to-r from-${metric.color}-500 via-${metric.color}-400 to-${metric.color}-500 shadow-[0_0_15px_rgba(249,115,22,0.6)] relative overflow-hidden`}
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{
                        duration: 1.5,
                        delay: index * 0.2,
                        ease: 'easeOut',
                      }}
                    >
                      {/* Animated shine */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                          delay: index * 0.3,
                        }}
                      />

                      {/* Segmented effect */}
                      <div className="absolute inset-0 flex">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 border-r border-secondary-900/30"
                          />
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Footer */}
          <div className="p-8 pt-0">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Followers', value: '124K', icon: User },
                { label: 'Active Deals', value: '8', icon: Award },
                { label: 'Total Earnings', value: '$125K', icon: TrendingUp },
                { label: 'Rating', value: '4.9', icon: Star },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="relative p-4 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border-2 border-primary-500/30 text-center shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.8, ...SPRING_CONFIGS.energetic.bouncy }}
                  whileHover={{ scale: 1.05, y: -4, boxShadow: '0 0 25px rgba(249, 115, 22, 0.4)' }}
                >
                  <stat.icon className="w-5 h-5 text-primary-400 mx-auto mb-2" />
                  <div className="text-2xl font-extrabold text-primary-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
