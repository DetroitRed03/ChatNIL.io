'use client';

import { motion } from 'framer-motion';
import { Award, Crown, Star, Zap } from 'lucide-react';

export function BadgeCardExample() {
  const badges = [
    {
      name: 'First Deal',
      rarity: 'Common',
      icon: Award,
      gradient: 'from-slate-400 to-slate-600',
      glow: 'rgba(148, 163, 184, 0.4)',
      shimmer: false
    },
    {
      name: 'Top Performer',
      rarity: 'Epic',
      icon: Star,
      gradient: 'from-purple-500 to-indigo-600',
      glow: 'rgba(168, 85, 247, 0.5)',
      shimmer: true
    },
    {
      name: 'Elite Ambassador',
      rarity: 'Legendary',
      icon: Crown,
      gradient: 'from-[#fcd34d] via-[#f59e0b] to-[#ea580c]',
      glow: 'rgba(252, 211, 77, 0.6)',
      shimmer: true
    }
  ];

  return (
    <div className="w-full max-w-md space-y-4">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        const isLegendary = badge.rarity === 'Legendary';

        return (
          <motion.div
            key={badge.name}
            initial={{ opacity: 0, y: 20, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              delay: index * 0.2,
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{
              y: -4,
              scale: 1.02,
              rotateY: isLegendary ? 5 : 0,
              transition: { type: 'spring', stiffness: 200, damping: 35 }
            }}
            className="relative"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative bg-gradient-to-br from-white via-[#FFFBF7] to-white rounded-2xl border-2 border-[#E8E4DF] p-6 overflow-hidden"
              style={{
                boxShadow: `
                  0 10px 30px -5px ${badge.glow},
                  0 4px 12px -2px rgba(0, 0, 0, 0.05),
                  inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
                `
              }}
            >
              {/* Top embossed line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

              <div className="flex items-center gap-5">
                {/* Badge Icon with foil effect */}
                <div className="relative">
                  <motion.div
                    animate={isLegendary ? {
                      rotate: [0, 5, -5, 0],
                    } : {}}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${badge.gradient} flex items-center justify-center relative`}
                    style={{
                      boxShadow: `
                        0 8px 24px -4px ${badge.glow},
                        inset 0 -3px 8px 0 rgba(0, 0, 0, 0.3),
                        inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)
                      `
                    }}
                  >
                    <Icon className="w-10 h-10 text-white relative z-10" />

                    {/* Gold foil shimmer effect */}
                    {badge.shimmer && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear',
                            repeatDelay: 1
                          }}
                        />
                        {/* Holographic effect */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl opacity-30"
                          animate={{
                            background: [
                              'linear-gradient(45deg, rgba(255,0,0,0.3) 0%, transparent 50%)',
                              'linear-gradient(90deg, rgba(0,255,0,0.3) 0%, transparent 50%)',
                              'linear-gradient(135deg, rgba(0,0,255,0.3) 0%, transparent 50%)',
                              'linear-gradient(180deg, rgba(255,0,255,0.3) 0%, transparent 50%)',
                            ]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'linear'
                          }}
                        />
                      </>
                    )}

                    {/* Embossed border */}
                    <div className="absolute inset-0 rounded-2xl shadow-inner opacity-40" />
                  </motion.div>

                  {/* Legendary sparkles */}
                  {isLegendary && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 bg-[#fcd34d] rounded-full"
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                            x: [0, Math.cos(i * 120 * Math.PI / 180) * 30],
                            y: [0, Math.sin(i * 120 * Math.PI / 180) * 30],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: 'easeOut'
                          }}
                          style={{
                            left: '50%',
                            top: '50%',
                            boxShadow: '0 0 8px rgba(252, 211, 77, 0.8)'
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>

                {/* Badge Info */}
                <div className="flex-1">
                  <div className="mb-2">
                    <h4 className="text-lg font-bold text-[#1a1d20] tracking-tight mb-1">
                      {badge.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          badge.rarity === 'Common'
                            ? 'bg-slate-100 text-slate-700'
                            : badge.rarity === 'Epic'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gradient-to-r from-[#fcd34d] to-[#f59e0b] text-[#92400e]'
                        }`}
                        style={isLegendary ? {
                          boxShadow: '0 2px 8px rgba(252, 211, 77, 0.3)'
                        } : {}}
                      >
                        {badge.rarity}
                      </span>
                      {isLegendary && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        >
                          <Zap className="w-4 h-4 text-[#f59e0b]" fill="#f59e0b" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-[#6c757d] mb-3">
                    {badge.rarity === 'Common' && 'Awarded for completing your first NIL deal'}
                    {badge.rarity === 'Epic' && 'Earned by exceeding performance targets'}
                    {badge.rarity === 'Legendary' && 'Reserved for the most elite athletes'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs">
                    <div
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] border border-[#E8E4DF]"
                      style={{
                        boxShadow: `
                          inset 1px 1px 3px rgba(0, 0, 0, 0.03),
                          inset -1px -1px 3px rgba(255, 255, 255, 0.8)
                        `
                      }}
                    >
                      <Star className="w-3 h-3 text-[#fcd34d]" fill="#fcd34d" />
                      <span className="font-bold text-[#495057]">
                        {badge.rarity === 'Common' ? '250' : badge.rarity === 'Epic' ? '1,500' : '5,000'} XP
                      </span>
                    </div>
                    <span className="text-[#adb5bd]">•</span>
                    <span className="text-[#6c757d] font-medium">
                      Earned {badge.rarity === 'Common' ? '3 days' : badge.rarity === 'Epic' ? '2 weeks' : '1 month'} ago
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative corner accent for legendary */}
              {isLegendary && (
                <motion.div
                  className="absolute bottom-0 right-0 w-32 h-32 opacity-10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  style={{
                    background: `radial-gradient(circle at bottom right, #fcd34d, transparent 70%)`
                  }}
                />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
