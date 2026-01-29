'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LevelUpModalProps {
  newLevel: number;
  unlockedContent: string[];
  onClose: () => void;
}

// Confetti piece component
function ConfettiPiece({ delay }: { delay: number }) {
  const colors = ['#f97316', '#8b5cf6', '#22c55e', '#eab308', '#3b82f6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const randomX = Math.random() * 100;
  const randomRotation = Math.random() * 360;

  return (
    <motion.div
      className="absolute w-3 h-3"
      style={{
        left: `${randomX}%`,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: '100vh',
        opacity: 0,
        rotate: randomRotation + 360,
        x: [0, 30, -30, 20, -20, 0],
      }}
      transition={{
        duration: 3,
        delay,
        ease: 'easeIn',
      }}
    />
  );
}

export function LevelUpModal({ newLevel, unlockedContent, onClose }: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const levelNames: Record<number, string> = {
    1: 'Rookie',
    2: 'Rising Star',
    3: 'Deal Maker',
    4: 'NIL Pro',
    5: 'NIL Legend',
  };

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: i * 0.03,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    >
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiPieces.map((piece) => (
            <ConfettiPiece key={piece.id} delay={piece.delay} />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', damping: 12 }}
        className="bg-white rounded-2xl max-w-sm w-full text-center p-8 relative"
      >
        {/* Celebration Emoji */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          LEVEL UP!
        </motion.h2>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.4 }}
          className="my-6"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg">
            <span className="text-4xl font-bold">{newLevel}</span>
          </div>
          <p className="text-gray-600 mt-2 font-medium">
            {levelNames[newLevel] || `Level ${newLevel}`}
          </p>
        </motion.div>

        {/* Unlocked Content */}
        {unlockedContent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 text-left"
          >
            <p className="font-medium text-purple-800 mb-2 flex items-center gap-2">
              <span>🔓</span> Unlocked:
            </p>
            <ul className="space-y-1.5">
              {unlockedContent.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="text-purple-700 flex items-center gap-2 text-sm"
                >
                  <span className="text-green-500">✓</span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          onClick={onClose}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Keep Going! 🚀
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
