'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Award, Star, Trophy } from 'lucide-react';

export function BadgeCardExample() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="w-80 bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg"
    >
      {/* Header with Rarity */}
      <div className="relative bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 p-6 overflow-hidden">
        {/* Animated Stars Background */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{
              x: Math.random() * 300,
              y: Math.random() * 200,
              opacity: 0,
            }}
            animate={{
              y: [null, -20, null],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}

        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="warning" className="bg-white/30 text-white border-white/50 backdrop-blur-sm">
              Legendary
            </Badge>
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-white mb-1">NIL Pioneer</h3>
          <p className="text-amber-100 text-sm">Complete your first 10 NIL deals</p>
        </div>
      </div>

      {/* Badge Display */}
      <div className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center relative overflow-hidden">
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
              'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.5) 0%, transparent 70%)',
              'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Badge Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          whileHover={{ rotate: 360, scale: 1.1 }}
          className="relative"
        >
          {/* Outer Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-amber-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />

          {/* Badge Circle */}
          <div className="w-32 h-32 bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white">
            <Trophy className="w-16 h-16 text-white" />
          </div>
        </motion.div>
      </div>

      {/* Stats and Info */}
      <div className="p-6">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-gray-900">Progress</span>
            <span className="text-gray-600">7 / 10 deals</span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '70%' }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Just 3 more deals to unlock this badge!</p>
        </motion.div>

        {/* Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <Award className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600">+500 XP</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <Star className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600">Exclusive</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
            <Trophy className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600">Rare</div>
          </div>
        </motion.div>

        {/* Rarity Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600 mb-1">Badge Rarity</div>
              <div className="font-bold text-amber-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Legendary (0.8%)
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600 mb-1">Owned by</div>
              <div className="font-bold text-slate-900">247 athletes</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
