'use client';

import { motion } from 'framer-motion';
import { Award, Star, Target, Lock } from 'lucide-react';

export function BadgeCardExample() {
  const badges = [
    { id: 1, name: 'First Deal', icon: Award, earned: true, color: 'orange' },
    { id: 2, name: 'Top Performer', icon: Star, earned: true, color: 'yellow' },
    { id: 3, name: 'Deal Maker', icon: Target, earned: true, color: 'green' },
    { id: 4, name: 'Elite Status', icon: Lock, earned: false, color: 'gray' },
  ];

  return (
    <div className="w-full max-w-sm">
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <h3 className="text-xl font-bold mb-1">Achievements</h3>
          <p className="text-orange-100 text-sm font-medium">3 of 4 earned</p>
          <div className="mt-3">
            <div className="bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-5">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              const isEarned = badge.earned;

              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`relative p-4 rounded-xl border-2 text-center ${
                    isEarned
                      ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-white'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {/* Badge Icon */}
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    isEarned
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30'
                      : 'bg-gray-300'
                  }`}>
                    <Icon className={`w-6 h-6 ${isEarned ? 'text-white' : 'text-gray-500'}`} />
                  </div>

                  {/* Badge Name */}
                  <p className={`text-xs font-bold ${
                    isEarned ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </p>

                  {/* Locked Overlay */}
                  {!isEarned && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 rounded-xl backdrop-blur-sm">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Next Reward */}
          <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Next Reward</p>
                <p className="text-xs text-gray-600">Complete 5 deals to unlock</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
