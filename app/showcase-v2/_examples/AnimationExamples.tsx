'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Zap, Flame, Star, Trophy, Rocket, Sparkles } from 'lucide-react';
import { EASING_CURVES, SPRING_CONFIGS, DURATION_SCALE } from '@/lib/animations/core/animation-tokens';
import { useState, useRef } from 'react';

export function AnimationExamples() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">

      {/* Bounce Effects */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
          Bounce & Spring Effects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Bouncy Spring */}
          <div className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl p-8 border-2 border-primary-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)] text-center">
            <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Bouncy</p>
            <motion.div
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-[0_0_25px_rgba(249,115,22,0.6)] cursor-pointer"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              transition={SPRING_CONFIGS.energetic.bouncy}
            >
              <Zap className="w-10 h-10 text-secondary-900" />
            </motion.div>
            <p className="text-xs text-gray-500 mt-4 font-mono">stiffness: 500, damping: 15</p>
          </div>

          {/* Hyper Spring */}
          <div className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl p-8 border-2 border-accent-500/30 shadow-[0_0_20px_rgba(251,191,36,0.2)] text-center">
            <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Hyper</p>
            <motion.div
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.6)] cursor-pointer"
              whileHover={{ scale: 1.2, rotate: 10 }}
              whileTap={{ scale: 0.9, rotate: -10 }}
              transition={SPRING_CONFIGS.energetic.hyper}
            >
              <Rocket className="w-10 h-10 text-secondary-900" />
            </motion.div>
            <p className="text-xs text-gray-500 mt-4 font-mono">stiffness: 700, damping: 12</p>
          </div>

          {/* Wobbly Spring */}
          <div className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl p-8 border-2 border-success-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-center">
            <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Wobbly</p>
            <motion.div
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-success-500 to-accent-500 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.6)] cursor-pointer"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              transition={SPRING_CONFIGS.energetic.wobbly}
            >
              <Flame className="w-10 h-10 text-secondary-900" />
            </motion.div>
            <p className="text-xs text-gray-500 mt-4 font-mono">stiffness: 300, damping: 8</p>
          </div>

        </div>
      </div>

      {/* Glow Pulses */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-accent-500 to-primary-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
          Glow & Pulse Effects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Pulsing Glow */}
          <div className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl p-8 border-2 border-primary-500/30 text-center">
            <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Pulse Glow</p>
            <motion.div
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(249, 115, 22, 0.4)',
                  '0 0 40px rgba(249, 115, 22, 0.8)',
                  '0 0 20px rgba(249, 115, 22, 0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Star className="w-10 h-10 text-secondary-900 fill-current" />
            </motion.div>
          </div>

          {/* Rotating Glow */}
          <div className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl p-8 border-2 border-accent-500/30 text-center">
            <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Rotating Glow</p>
            <motion.div
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.6)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Trophy className="w-10 h-10 text-secondary-900" />
            </motion.div>
          </div>

          {/* Scale Pulse */}
          <div className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl p-8 border-2 border-success-500/30 text-center">
            <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Scale Pulse</p>
            <motion.div
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-success-500 to-accent-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.6)]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-10 h-10 text-secondary-900" />
            </motion.div>
          </div>

        </div>
      </div>

      {/* Particle Effects */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-success-500 to-accent-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
          Particle Trails
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Rising Particles */}
          <ParticleRiser />

          {/* Explosion Particles */}
          <ParticleExploder />

        </div>
      </div>

      {/* Magnetic Hover */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-primary-500 to-error-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
          Magnetic Hover Effect
        </h3>
        <MagneticDemo />
      </div>

      {/* Loading Animations */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-accent-500 to-primary-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
          Loading Animations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Spinner */}
          <div className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl p-8 border-2 border-primary-500/30 text-center">
            <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Spinner</p>
            <motion.div
              className="w-16 h-16 mx-auto rounded-full border-4 border-primary-500/30 border-t-primary-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Dots */}
          <div className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl p-8 border-2 border-accent-500/30 text-center">
            <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Dots</p>
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-4 h-4 rounded-full bg-accent-500"
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl p-8 border-2 border-success-500/30 text-center">
            <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Progress</p>
            <div className="h-3 bg-secondary-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-success-500 to-accent-500"
                animate={{ width: ['0%', '100%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Shimmer Effects */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
          Shimmer & Shine Effects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Metallic Shimmer */}
          <div className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl p-8 border-2 border-accent-500/50 overflow-hidden">
            <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Metallic Shimmer</p>
            <div className="relative w-full h-24 bg-gradient-to-r from-accent-600 via-accent-400 to-accent-600 rounded-xl overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>

          {/* LED Strip */}
          <div className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl p-8 border-2 border-primary-500/50 overflow-hidden">
            <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">LED Strip</p>
            <div className="relative w-full h-4 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 rounded-full overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.6)]">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

// Particle Riser Component
function ParticleRiser() {
  return (
    <div className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl p-8 border-2 border-primary-500/30 h-48 overflow-hidden">
      <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Rising Particles</p>
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary-500 rounded-full"
          style={{
            left: `${10 + i * 8}%`,
            bottom: 0,
          }}
          animate={{
            y: [0, -150],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// Particle Exploder Component
function ParticleExploder() {
  const [explode, setExplode] = useState(false);

  return (
    <div className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl p-8 border-2 border-accent-500/30 h-48 overflow-hidden">
      <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Click to Explode</p>
      <motion.button
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.6)]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setExplode(true);
          setTimeout(() => setExplode(false), 1000);
        }}
      >
        <Zap className="w-8 h-8 text-secondary-900" />
      </motion.button>

      {explode && [...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-accent-400 rounded-full"
          style={{
            top: '50%',
            left: '50%',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((i * Math.PI * 2) / 12) * 80,
            y: Math.sin((i * Math.PI * 2) / 12) * 80,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// Magnetic Demo Component
function MagneticDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      className="relative bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-2xl p-16 border-2 border-primary-500/30 cursor-pointer overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <p className="text-sm font-bold text-gray-400 mb-8 tracking-wider uppercase text-center">
        Hover to Attract
      </p>
      <motion.div
        className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.6)]"
        style={{ x, y }}
        transition={SPRING_CONFIGS.energetic.bouncy}
      >
        <Zap className="w-16 h-16 text-secondary-900" />
      </motion.div>
    </div>
  );
}
