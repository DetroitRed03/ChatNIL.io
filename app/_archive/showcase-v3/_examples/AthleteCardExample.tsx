'use client';

import { motion } from 'framer-motion';
import { MapPin, Award, TrendingUp, Instagram, Twitter } from 'lucide-react';

export function AthleteCardExample() {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 35
      }}
      className="w-full max-w-md"
    >
      <div
        className="relative bg-gradient-to-br from-white via-[#FFFBF7] to-[#FFF8F0] rounded-2xl overflow-hidden border-2 border-[#E8E4DF]"
        style={{
          boxShadow: `
            0 10px 30px -5px rgba(234, 88, 12, 0.08),
            0 4px 12px -2px rgba(234, 88, 12, 0.05),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.9),
            inset 0 -1px 0 0 rgba(0, 0, 0, 0.03)
          `
        }}
      >
        {/* Embossed Banner */}
        <div className="h-32 bg-gradient-to-br from-[#ea580c] via-[#c2410c] to-[#92400e] relative overflow-hidden">
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          />
          {/* Inner shadow for depth */}
          <div className="absolute inset-0 shadow-inner opacity-30" />
        </div>

        {/* Profile Section */}
        <div className="relative px-6 pb-6">
          {/* Avatar with embossed effect */}
          <div className="relative -mt-16 mb-4">
            <div
              className="w-28 h-28 rounded-2xl bg-gradient-to-br from-white to-[#FFF8F0] border-4 border-white overflow-hidden"
              style={{
                boxShadow: `
                  0 10px 25px -5px rgba(0, 0, 0, 0.15),
                  0 4px 10px -2px rgba(0, 0, 0, 0.1),
                  inset 0 -2px 4px 0 rgba(0, 0, 0, 0.05)
                `
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop"
                alt="Athlete"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Verified badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 180,
                damping: 38,
                delay: 0.2
              }}
              className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-[#fcd34d] to-[#f59e0b] flex items-center justify-center border-3 border-white"
              style={{
                boxShadow: `
                  0 4px 12px -2px rgba(252, 211, 77, 0.5),
                  inset 0 -2px 4px 0 rgba(0, 0, 0, 0.1)
                `
              }}
            >
              <Award className="w-6 h-6 text-white" />
            </motion.div>
          </div>

          {/* Name & Title */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#1a1d20] to-[#495057] bg-clip-text text-transparent mb-1">
              Marcus Johnson
            </h3>
            <p className="text-[#6c757d] font-medium tracking-wide flex items-center gap-2">
              <span className="text-[#ea580c]">⚡</span>
              Wide Receiver • Football
            </p>
            <p className="text-sm text-[#adb5bd] flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              University of Miami
            </p>
          </div>

          {/* Stats Grid with neumorphic cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'FMV', value: '$45.2K', trend: '+12%' },
              { label: 'Followers', value: '128K', trend: '+8%' },
              { label: 'Engagement', value: '6.8%', trend: '+2%' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + index * 0.1,
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="relative bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] rounded-xl p-3 border border-[#E8E4DF]"
                style={{
                  boxShadow: `
                    inset 2px 2px 4px rgba(0, 0, 0, 0.03),
                    inset -2px -2px 4px rgba(255, 255, 255, 0.8)
                  `
                }}
              >
                <div className="text-xs text-[#adb5bd] mb-1 tracking-wide uppercase font-medium">
                  {stat.label}
                </div>
                <div className="text-lg font-bold text-[#1a1d20] tracking-tight">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1 text-xs text-[#10b981] font-medium mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 mb-5">
            {[
              { icon: Instagram, color: 'from-purple-500 to-pink-500', value: '85K' },
              { icon: Twitter, color: 'from-blue-400 to-blue-600', value: '43K' }
            ].map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 bg-gradient-to-r ${social.color} rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{social.value}</span>
                </motion.button>
              );
            })}
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-[#ea580c] via-[#c2410c] to-[#92400e] text-white font-bold py-3.5 rounded-xl relative overflow-hidden group"
            style={{
              boxShadow: `
                0 4px 12px -2px rgba(234, 88, 12, 0.4),
                inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2)
              `
            }}
          >
            {/* Shimmer on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative tracking-wide">View Full Profile</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
