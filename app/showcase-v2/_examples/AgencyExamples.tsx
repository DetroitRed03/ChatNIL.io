'use client';

import { motion } from 'framer-motion';
import { Users, Star, TrendingUp, Award, Building2, Target, Zap, Trophy } from 'lucide-react';
import { SPRING_CONFIGS } from '@/lib/animations/core/animation-tokens';

export function AgencyExamples() {
  const athletes = [
    { name: 'Marcus J.', sport: 'Basketball', rating: 98, image: 'MJ', status: 'active' },
    { name: 'Sarah K.', sport: 'Soccer', rating: 95, image: 'SK', status: 'active' },
    { name: 'Tyler W.', sport: 'Football', rating: 92, image: 'TW', status: 'pending' },
    { name: 'Emma R.', sport: 'Tennis', rating: 90, image: 'ER', status: 'active' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">

      {/* Agency Header Card */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
          Agency Profile
        </h3>
        <motion.div
          className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-3xl overflow-hidden border-2 border-primary-500/50 shadow-[0_0_40px_rgba(249,115,22,0.4)]"
          whileHover={{ scale: 1.01 }}
          transition={SPRING_CONFIGS.energetic.bouncy}
        >
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />

          <div className="relative p-8">
            <div className="flex items-start gap-6">
              {/* Agency Logo */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05, rotate: -3 }}
                transition={SPRING_CONFIGS.energetic.bouncy}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl blur-xl opacity-60" />
                <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-primary-600 to-accent-600 p-1 shadow-[0_0_30px_rgba(249,115,22,0.6)]">
                  <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-primary-600" />
                  </div>
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-accent-500 to-primary-500 text-secondary-900 font-extrabold text-xs shadow-[0_0_15px_rgba(251,191,36,0.8)]"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  VERIFIED
                </motion.div>
              </motion.div>

              {/* Agency Info */}
              <div className="flex-1">
                <h4 className="text-3xl font-extrabold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                  Elite Sports Group
                </h4>
                <p className="text-primary-300 font-bold text-lg mt-2">
                  Premier NIL Representation
                </p>
                <p className="text-gray-300 font-medium mt-4 leading-relaxed">
                  Leading sports marketing agency specializing in NIL deals for college athletes. 10+ years of experience with Fortune 500 brands.
                </p>

                <div className="flex items-center gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-400" />
                    <span className="text-white font-bold">50+ Athletes</span>
                  </div>
                  <div className="h-1 w-1 bg-gray-600 rounded-full" />
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent-400" />
                    <span className="text-white font-bold">200+ Deals Closed</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col gap-3">
                <motion.div
                  className="px-6 py-3 rounded-2xl bg-gradient-to-br from-primary-500/30 to-primary-600/20 border-2 border-primary-500/50 text-center shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                  whileHover={{ scale: 1.05, y: -4 }}
                >
                  <div className="text-3xl font-extrabold text-primary-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]">
                    4.9
                  </div>
                  <div className="text-xs text-gray-400 font-bold tracking-wider uppercase">
                    Rating
                  </div>
                </motion.div>

                <motion.button
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-secondary-900 font-extrabold shadow-[0_0_25px_rgba(249,115,22,0.6)]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact
                </motion.button>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Total Value', value: '$2.5M', icon: TrendingUp, color: 'primary' },
                { label: 'Active Athletes', value: '48', icon: Users, color: 'accent' },
                { label: 'Success Rate', value: '96%', icon: Target, color: 'success' },
                { label: 'Avg Deal Size', value: '$18K', icon: Award, color: 'primary' },
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  className={`relative p-4 rounded-2xl bg-gradient-to-br from-${metric.color}-500/20 to-${metric.color}-600/10 border-2 border-${metric.color}-500/30 text-center shadow-[0_0_15px_rgba(249,115,22,0.2)]`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, ...SPRING_CONFIGS.energetic.bouncy }}
                  whileHover={{ scale: 1.05, y: -4 }}
                >
                  <metric.icon className={`w-5 h-5 text-${metric.color}-400 mx-auto mb-2`} />
                  <div className={`text-2xl font-extrabold text-${metric.color}-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]`}>
                    {metric.value}
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mt-1">
                    {metric.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Team Roster */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-accent-500 to-primary-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
          Athlete Roster
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {athletes.map((athlete, index) => (
            <motion.div
              key={athlete.name}
              className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl overflow-hidden border-2 border-primary-500/30 shadow-[0_0_30px_rgba(249,115,22,0.2)]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, ...SPRING_CONFIGS.energetic.bouncy }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(249, 115, 22, 0.6)' }}
            >
              {/* Jersey Number Background */}
              <div className="absolute top-2 right-2 text-7xl font-extrabold text-primary-500/10 leading-none select-none">
                {index + 1}
              </div>

              <div className="relative p-6">
                <div className="flex items-center gap-4">
                  {/* Athlete Avatar */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={SPRING_CONFIGS.energetic.bouncy}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl blur-md opacity-60" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 p-0.5 shadow-[0_0_20px_rgba(249,115,22,0.5)]">
                      <div className="w-full h-full rounded-xl bg-secondary-800 flex items-center justify-center text-2xl font-extrabold text-primary-400">
                        {athlete.image}
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <motion.div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-secondary-900 ${
                        athlete.status === 'active'
                          ? 'bg-success-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                          : 'bg-accent-500 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                      }`}
                      animate={athlete.status === 'active' ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Athlete Info */}
                  <div className="flex-1">
                    <h5 className="text-xl font-extrabold text-white drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]">
                      {athlete.name}
                    </h5>
                    <p className="text-primary-300 font-bold text-sm mt-1">{athlete.sport}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                        athlete.status === 'active'
                          ? 'bg-success-500/20 border border-success-500/50 text-success-400'
                          : 'bg-accent-500/20 border border-accent-500/50 text-accent-400'
                      }`}>
                        {athlete.status === 'active' ? 'ACTIVE' : 'PENDING'}
                      </div>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <motion.div
                    className="relative p-3 rounded-2xl bg-gradient-to-br from-accent-500/30 to-accent-600/20 border-2 border-accent-500/50 text-center shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Star className="w-4 h-4 text-accent-400 mx-auto mb-1 fill-current" />
                    <div className="text-xl font-extrabold text-accent-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]">
                      {athlete.rating}
                    </div>
                    <div className="text-[8px] text-gray-400 font-bold tracking-wider uppercase">
                      Rating
                    </div>
                  </motion.div>
                </div>

                {/* Performance Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-400 tracking-wide">
                      Performance
                    </span>
                    <span className="text-sm font-extrabold text-primary-400">
                      {athlete.rating}%
                    </span>
                  </div>
                  <div className="h-2 bg-secondary-800 rounded-full overflow-hidden border border-primary-500/30 shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${athlete.rating}%` }}
                      transition={{ duration: 1.5, delay: index * 0.2 + 0.3, ease: 'easeOut' }}
                    >
                      <motion.div
                        className="h-full bg-white/20"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Agency Action Card */}
      <div>
        <motion.div
          className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-3xl p-8 border-2 border-primary-500/50 shadow-[0_0_40px_rgba(249,115,22,0.4)] overflow-hidden"
          whileHover={{ scale: 1.01 }}
          transition={SPRING_CONFIGS.energetic.bouncy}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-500/10"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: '200% 100%' }}
          />

          <div className="relative text-center">
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 mb-6 shadow-[0_0_30px_rgba(249,115,22,0.6)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="w-10 h-10 text-secondary-900" />
            </motion.div>

            <h4 className="text-3xl font-extrabold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-3 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
              Ready to Join Our Team?
            </h4>
            <p className="text-gray-300 font-medium text-lg mb-8 max-w-2xl mx-auto">
              We're looking for elite athletes to join our roster. Get matched with premium brands and maximize your NIL potential.
            </p>

            <div className="flex items-center justify-center gap-4">
              <motion.button
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-secondary-900 font-extrabold text-lg shadow-[0_0_30px_rgba(249,115,22,0.6)] relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <span className="relative z-10">Apply Now</span>
              </motion.button>

              <motion.button
                className="px-8 py-4 rounded-2xl bg-secondary-800 border-2 border-primary-500/50 text-primary-400 font-extrabold text-lg hover:bg-primary-500/20 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
