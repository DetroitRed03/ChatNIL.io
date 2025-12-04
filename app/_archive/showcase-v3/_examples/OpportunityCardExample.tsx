'use client';

import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Clock, Star } from 'lucide-react';

export function OpportunityCardExample() {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 35
      }}
      className="w-full max-w-md"
    >
      <div
        className="relative bg-gradient-to-br from-white via-[#FFFBF7] to-[#FFF8F0] rounded-2xl border-2 border-[#E8E4DF] overflow-hidden"
        style={{
          boxShadow: `
            0 10px 30px -5px rgba(234, 88, 12, 0.1),
            0 4px 12px -2px rgba(234, 88, 12, 0.05),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
          `
        }}
      >
        {/* Wax seal ribbon */}
        <div className="absolute top-4 right-4 z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 150,
              damping: 40,
              delay: 0.2
            }}
            className="relative"
          >
            {/* Seal */}
            <div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#fcd34d] via-[#f59e0b] to-[#ea580c] flex items-center justify-center relative"
              style={{
                boxShadow: `
                  0 6px 16px -4px rgba(252, 211, 77, 0.5),
                  inset 0 -3px 8px 0 rgba(0, 0, 0, 0.25),
                  inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)
                `
              }}
            >
              <div className="text-white text-center">
                <div className="text-xs font-bold">95%</div>
                <div className="text-[9px] opacity-90">MATCH</div>
              </div>
              {/* Wax texture pattern */}
              <div
                className="absolute inset-0 rounded-full opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle, transparent 20%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.1) 80%, transparent 80%, transparent)`
                }}
              />
            </div>
            {/* Ribbon ends */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-6">
              <div
                className="w-6 h-10 bg-gradient-to-b from-[#f59e0b] to-[#ea580c]"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  boxShadow: '0 4px 8px -2px rgba(234, 88, 12, 0.3)'
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6 pt-7">
          {/* Company Logo */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#92400e] flex items-center justify-center flex-shrink-0"
              style={{
                boxShadow: `
                  0 4px 12px -2px rgba(234, 88, 12, 0.3),
                  inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2),
                  inset 0 1px 2px 0 rgba(255, 255, 255, 0.2)
                `
              }}
            >
              <Briefcase className="w-8 h-8 text-white" />
            </div>

            <div className="flex-1 pr-14">
              <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#1a1d20] to-[#495057] bg-clip-text text-transparent mb-1">
                Brand Ambassador
              </h3>
              <p className="text-[#6c757d] font-medium">Adidas Sports</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div
              className="bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] rounded-xl p-3 border border-[#E8E4DF]"
              style={{
                boxShadow: `
                  inset 2px 2px 4px rgba(0, 0, 0, 0.03),
                  inset -2px -2px 4px rgba(255, 255, 255, 0.8)
                `
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-[#ea580c]" />
                <span className="text-xs text-[#adb5bd] font-medium tracking-wide uppercase">
                  Compensation
                </span>
              </div>
              <div className="text-lg font-bold text-[#1a1d20]">$15K-$25K</div>
            </div>

            <div
              className="bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] rounded-xl p-3 border border-[#E8E4DF]"
              style={{
                boxShadow: `
                  inset 2px 2px 4px rgba(0, 0, 0, 0.03),
                  inset -2px -2px 4px rgba(255, 255, 255, 0.8)
                `
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-[#ea580c]" />
                <span className="text-xs text-[#adb5bd] font-medium tracking-wide uppercase">
                  Duration
                </span>
              </div>
              <div className="text-lg font-bold text-[#1a1d20]">6 Months</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 mb-5 text-[#6c757d]">
            <MapPin className="w-4 h-4 text-[#ea580c]" />
            <span className="text-sm">Remote + In-person events</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {['Social Media', 'Events', 'Content Creation'].map((tag, index) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.3 + index * 0.1,
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-[#ea580c]/10 to-[#92400e]/10 text-[#ea580c] text-xs font-semibold rounded-full border border-[#ea580c]/20"
              >
                {tag}
              </motion.span>
            ))}
          </div>

          {/* Requirements */}
          <div className="mb-5">
            <h4 className="text-xs font-bold text-[#6c757d] mb-2 tracking-wide uppercase">
              Requirements
            </h4>
            <ul className="space-y-1.5">
              {[
                '50K+ social media followers',
                'Active on Instagram & TikTok',
                'Sports/fitness focused content'
              ].map((req, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.5 + index * 0.1,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="flex items-start gap-2 text-sm text-[#495057]"
                >
                  <Star className="w-3.5 h-3.5 text-[#fcd34d] mt-0.5 flex-shrink-0" fill="#fcd34d" />
                  {req}
                </motion.li>
              ))}
            </ul>
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
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative tracking-wide">Apply Now</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
