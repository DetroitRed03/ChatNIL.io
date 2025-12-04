'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Zap, Heart, Share2, ArrowRight, Download, Sparkles, Flame, Trophy } from 'lucide-react';
import { SPRING_CONFIGS } from '@/lib/animations/core/animation-tokens';
import { useState, useRef } from 'react';

function MagneticButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={SPRING_CONFIGS.energetic.bouncy}
    >
      {children}
    </motion.button>
  );
}

export function ButtonExamples() {
  const [liked, setLiked] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">

      {/* Primary Action Buttons */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
          Primary Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 3D Button with Depth */}
          <MagneticButton className="group relative px-8 py-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white font-extrabold text-lg overflow-hidden shadow-[0_8px_0_rgba(234,88,12,1),0_0_30px_rgba(249,115,22,0.6)] hover:shadow-[0_4px_0_rgba(234,88,12,1),0_0_40px_rgba(249,115,22,0.8)] active:shadow-[0_0_0_rgba(234,88,12,1),0_0_20px_rgba(249,115,22,0.4)] active:translate-y-2 transition-all">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-accent-500/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              Apply Now
            </span>
          </MagneticButton>

          {/* Neon Glow Button */}
          <motion.button
            className="relative px-8 py-4 rounded-2xl bg-secondary-900 border-2 border-primary-500 text-primary-400 font-extrabold text-lg shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:shadow-[0_0_50px_rgba(249,115,22,0.9)] hover:text-white transition-all overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-primary-500/20"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Flame className="w-5 h-5" />
              Explore
            </span>
          </motion.button>

          {/* Gradient Shift Button */}
          <motion.button
            className="relative px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 text-secondary-900 font-extrabold text-lg shadow-[0_0_30px_rgba(251,191,36,0.6)] overflow-hidden"
            style={{ backgroundSize: '200% 100%' }}
            whileHover={{
              backgroundPosition: '100% 0',
              scale: 1.05,
            }}
            whileTap={{ scale: 0.95 }}
            transition={SPRING_CONFIGS.energetic.bouncy}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5" />
              Get Started
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </span>
          </motion.button>

        </div>
      </div>

      {/* Icon Buttons */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-accent-500 to-primary-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
          Icon Buttons
        </h3>
        <div className="flex flex-wrap gap-4">

          {/* Like Button with Animation */}
          <motion.button
            onClick={() => setLiked(!liked)}
            className={`
              relative p-4 rounded-2xl font-extrabold transition-all overflow-hidden
              ${liked
                ? 'bg-gradient-to-br from-error-500 to-primary-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                : 'bg-secondary-800 border-2 border-primary-500/50 text-primary-400 hover:border-primary-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
              }
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={SPRING_CONFIGS.energetic.bouncy}
          >
            <motion.div
              animate={liked ? { scale: [1, 1.5, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
            </motion.div>
            {liked && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-error-400 rounded-full"
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{
                      x: Math.cos((i * Math.PI * 2) / 6) * 30,
                      y: Math.sin((i * Math.PI * 2) / 6) * 30,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.6 }}
                  />
                ))}
              </>
            )}
          </motion.button>

          {/* Share Button */}
          <MagneticButton className="relative p-4 rounded-2xl bg-gradient-to-br from-accent-500/30 to-accent-600/20 border-2 border-accent-500/50 text-accent-400 font-extrabold shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] hover:bg-accent-500/40 transition-all">
            <Share2 className="w-6 h-6" />
          </MagneticButton>

          {/* Download Button */}
          <motion.button
            className="relative p-4 rounded-2xl bg-gradient-to-br from-success-500/30 to-success-600/20 border-2 border-success-500/50 text-success-400 font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, y: 2 }}
          >
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Download className="w-6 h-6" />
            </motion.div>
          </motion.button>

          {/* Sparkle Button */}
          <motion.button
            className="relative p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white font-extrabold shadow-[0_0_25px_rgba(249,115,22,0.6)] overflow-hidden"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9, rotate: -5 }}
            transition={SPRING_CONFIGS.energetic.bouncy}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
          </motion.button>

        </div>
      </div>

      {/* Button Sizes */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-success-500 to-primary-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
          Button Sizes
        </h3>
        <div className="flex flex-wrap items-center gap-4">

          {/* Small */}
          <motion.button
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-secondary-900 font-extrabold text-sm shadow-[0_0_20px_rgba(249,115,22,0.5)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Small
          </motion.button>

          {/* Medium */}
          <motion.button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-secondary-900 font-extrabold text-base shadow-[0_0_25px_rgba(249,115,22,0.5)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Medium
          </motion.button>

          {/* Large */}
          <motion.button
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-secondary-900 font-extrabold text-lg shadow-[0_0_30px_rgba(249,115,22,0.6)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Large
          </motion.button>

        </div>
      </div>

      {/* Button States */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-primary-500 to-error-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
          Button States
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Normal */}
          <motion.button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-secondary-900 font-extrabold shadow-[0_0_25px_rgba(249,115,22,0.5)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Normal
          </motion.button>

          {/* Loading */}
          <motion.button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-secondary-900 font-extrabold shadow-[0_0_25px_rgba(249,115,22,0.5)] flex items-center justify-center gap-2"
            disabled
          >
            <motion.div
              className="w-5 h-5 border-3 border-secondary-900 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            Loading...
          </motion.button>

          {/* Disabled */}
          <button
            className="px-6 py-3 rounded-xl bg-secondary-800 text-gray-500 font-extrabold opacity-50 cursor-not-allowed"
            disabled
          >
            Disabled
          </button>

          {/* Success */}
          <motion.button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-success-500 to-success-600 text-white font-extrabold shadow-[0_0_25px_rgba(16,185,129,0.6)] flex items-center justify-center gap-2"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Success
          </motion.button>

        </div>
      </div>

      {/* Specialty Buttons */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-accent-500 to-error-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
          Specialty Effects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Pulsing Button */}
          <motion.button
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-error-500 to-primary-500 text-white font-extrabold text-lg shadow-[0_0_30px_rgba(239,68,68,0.6)]"
            animate={{
              boxShadow: [
                '0 0 30px rgba(239, 68, 68, 0.6)',
                '0 0 50px rgba(239, 68, 68, 0.9)',
                '0 0 30px rgba(239, 68, 68, 0.6)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Limited Offer - Act Now!
          </motion.button>

          {/* Particle Trail Button */}
          <motion.button
            className="relative px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 text-secondary-900 font-extrabold text-lg shadow-[0_0_30px_rgba(249,115,22,0.6)] overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    left: `${i * 20}%`,
                    top: '50%',
                  }}
                  animate={{
                    x: [0, 20, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            <span className="relative z-10">Premium Action</span>
          </motion.button>

        </div>
      </div>

    </div>
  );
}
