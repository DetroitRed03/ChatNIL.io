'use client';

import { motion } from 'framer-motion';
import { Trophy, Award, Star, Flame, Zap, Crown } from 'lucide-react';
import { SPRING_CONFIGS } from '@/lib/animations/core/animation-tokens';

export function BadgeCardExample() {
  return (
    <motion.div
      className="relative w-80 bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-3xl overflow-hidden border-2 border-accent-500/50 shadow-[0_0_40px_rgba(251,191,36,0.5)]"
      whileHover={{ scale: 1.02, y: -8 }}
      transition={SPRING_CONFIGS.energetic.bouncy}
    >
      {/* Metallic shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-accent-500/20 via-primary-500/10 to-accent-500/20"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ backgroundSize: '200% 200%' }}
      />

      {/* Radial light rays */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 bg-gradient-to-t from-accent-500/50 to-transparent"
            style={{
              height: '60%',
              transformOrigin: 'top center',
              transform: `rotate(${i * 30}deg)`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Header with Tier */}
      <div className="relative px-6 pt-6 text-center">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500 text-secondary-900 font-extrabold text-sm shadow-[0_0_25px_rgba(251,191,36,0.8)] border-2 border-accent-300"
          animate={{
            boxShadow: [
              '0 0 25px rgba(251, 191, 36, 0.8)',
              '0 0 40px rgba(251, 191, 36, 1)',
              '0 0 25px rgba(251, 191, 36, 0.8)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Crown className="w-4 h-4 fill-current" />
          <span>LEGENDARY TIER</span>
          <Star className="w-4 h-4 fill-current" />
        </motion.div>
      </div>

      {/* Trophy Display */}
      <div className="relative px-6 py-8">
        <motion.div
          className="relative mx-auto w-40 h-40"
          animate={{
            y: [0, -10, 0],
            rotateY: [0, 360],
          }}
          transition={{
            y: {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            rotateY: {
              duration: 10,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          {/* Glow rings */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 blur-2xl opacity-60"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.8, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />

          {/* Trophy Icon */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 p-1 shadow-[0_0_40px_rgba(251,191,36,0.8)] border-4 border-accent-300">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-600 to-secondary-900 flex items-center justify-center">
              <Trophy className="w-20 h-20 text-accent-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
            </div>
          </div>

          {/* Sparkle particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-accent-400 rounded-full"
              style={{
                top: `${50 + Math.sin((i * Math.PI * 2) / 6) * 60}%`,
                left: `${50 + Math.cos((i * Math.PI * 2) / 6) * 60}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Badge Info */}
      <div className="relative px-6 text-center">
        <motion.h3
          className="text-3xl font-extrabold bg-gradient-to-r from-accent-400 via-accent-300 to-accent-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]"
          whileHover={{ scale: 1.05 }}
        >
          Elite Achiever
        </motion.h3>
        <p className="text-accent-300 font-bold text-sm mt-2 tracking-wider">
          Complete 50 NIL Deals
        </p>
      </div>

      {/* Stats Grid */}
      <div className="relative px-6 py-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Star, value: '5,234', label: 'Earned', color: 'accent' },
            { icon: Flame, value: 'Top 1%', label: 'Rank', color: 'primary' },
            { icon: Zap, value: '98/100', label: 'Rarity', color: 'success' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative group"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.1 + 0.5,
                ...SPRING_CONFIGS.energetic.bouncy,
              }}
              whileHover={{ scale: 1.1, y: -4 }}
            >
              <div className={`
                relative p-3 rounded-2xl text-center
                bg-gradient-to-br from-${stat.color}-500/30 to-${stat.color}-600/20
                border-2 border-${stat.color}-500/50
                shadow-[0_0_20px_rgba(251,191,36,0.3)]
                group-hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]
                transition-all
              `}>
                <stat.icon className={`w-4 h-4 mx-auto mb-1 text-${stat.color}-400`} />
                <div className={`text-lg font-extrabold text-${stat.color}-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]`}>
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

      {/* Progress to Next Tier */}
      <div className="relative px-6 pb-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-400 tracking-wider uppercase">
              Progress to Mythic
            </span>
            <span className="text-sm font-extrabold text-accent-400">75/100</span>
          </div>
          <div className="h-3 bg-secondary-800 rounded-full overflow-hidden border-2 border-accent-500/30 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500 shadow-[0_0_15px_rgba(251,191,36,0.8)] relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ duration: 2, delay: 0.8, ease: 'easeOut' }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="relative px-6 pb-6">
        <motion.button
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500 text-secondary-900 font-extrabold text-lg shadow-[0_0_30px_rgba(251,191,36,0.8)] relative overflow-hidden border-2 border-accent-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={SPRING_CONFIGS.energetic.bouncy}
        >
          <motion.div
            className="absolute inset-0 bg-white/30"
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
            <Award className="w-5 h-5" />
            VIEW ALL BADGES
          </span>
        </motion.button>
      </div>

      {/* Corner medallion effects */}
      <motion.div
        className="absolute top-0 left-0 w-20 h-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute top-2 left-2 w-3 h-3 bg-accent-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
      </motion.div>
      <motion.div
        className="absolute bottom-0 right-0 w-20 h-20"
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-accent-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
      </motion.div>
    </motion.div>
  );
}
