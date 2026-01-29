'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface CelebrationData {
  type: 'badge' | 'streak' | 'pillar' | 'level';
  title: string;
  description: string;
  icon: string;
}

interface CelebrationModalProps {
  celebration: CelebrationData;
  onClose: () => void;
}

const typeConfig: Record<CelebrationData['type'], { gradient: string; confettiColors: string[] }> = {
  badge: {
    gradient: 'from-yellow-400 to-amber-500',
    confettiColors: ['#fbbf24', '#f59e0b', '#d97706'],
  },
  streak: {
    gradient: 'from-orange-400 to-red-500',
    confettiColors: ['#fb923c', '#f97316', '#ea580c'],
  },
  pillar: {
    gradient: 'from-purple-400 to-indigo-500',
    confettiColors: ['#a78bfa', '#8b5cf6', '#7c3aed'],
  },
  level: {
    gradient: 'from-emerald-400 to-teal-500',
    confettiColors: ['#34d399', '#10b981', '#059669'],
  },
};

// Simple confetti piece component
function ConfettiPiece({ delay, color }: { delay: number; color: string }) {
  const randomX = Math.random() * 100;
  const randomRotation = Math.random() * 360;
  const randomDuration = 2 + Math.random() * 2;

  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{
        left: `${randomX}%`,
        backgroundColor: color,
        rotate: randomRotation,
      }}
      initial={{ y: -20, opacity: 1 }}
      animate={{
        y: '100vh',
        opacity: 0,
        rotate: randomRotation + 360,
        x: [0, 20, -20, 10, -10, 0],
      }}
      transition={{
        duration: randomDuration,
        delay,
        ease: 'easeIn',
      }}
    />
  );
}

export function CelebrationModal({ celebration, onClose }: CelebrationModalProps) {
  const config = typeConfig[celebration.type];

  // Auto-close after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Generate confetti pieces
  const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: i * 0.05,
    color: config.confettiColors[i % config.confettiColors.length],
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPieces.map((piece) => (
          <ConfettiPiece key={piece.id} delay={piece.delay} color={piece.color} />
        ))}
      </div>

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 10 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative z-10 bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon with animated ring */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient} opacity-20`}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className={`absolute inset-2 rounded-full bg-gradient-to-br ${config.gradient} shadow-lg flex items-center justify-center`}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="text-4xl">{celebration.icon}</span>
          </motion.div>
        </div>

        {/* Title with typing effect */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          {celebration.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 mb-6"
        >
          {celebration.description}
        </motion.p>

        {/* Dismiss Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onClose}
          className={`w-full py-3 rounded-xl font-semibold text-white
            bg-gradient-to-r ${config.gradient} hover:opacity-90 transition-opacity`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Awesome!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
