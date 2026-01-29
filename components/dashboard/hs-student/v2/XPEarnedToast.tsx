'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface XPEarnedToastProps {
  amount: number;
  onComplete?: () => void;
}

export function XPEarnedToast({ amount, onComplete }: XPEarnedToastProps) {
  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.8 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.div
        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2"
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -5, 0],
        }}
        transition={{
          duration: 0.5,
          times: [0, 0.5, 1],
        }}
      >
        <motion.span
          className="text-xl"
          animate={{ rotate: [0, 20, -20, 0] }}
          transition={{ duration: 0.5 }}
        >
          ⚡
        </motion.span>
        +{amount} XP
      </motion.div>
    </motion.div>
  );
}
