'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyChallengeModalProps {
  question: string;
  pillar: string;
  xpReward: number;
  onSubmit: (answer: string) => Promise<void>;
  onClose: () => void;
}

export function DailyChallengeModal({
  question,
  pillar,
  xpReward,
  onSubmit,
  onClose,
}: DailyChallengeModalProps) {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (answer.trim().length < 3 || submitting) return;
    setSubmitting(true);
    await onSubmit(answer);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const pillarEmoji: Record<string, string> = {
    identity: '🎭',
    business: '📋',
    money: '💰',
    legacy: '⭐',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-4xl">✨</span>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Awesome!</h2>
              <p className="text-gray-600">You earned</p>
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-orange-500 mt-2"
              >
                +{xpReward} XP
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="form">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-4">
                <div className="flex justify-between items-center">
                  <span className="text-3xl">💬</span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-white">
                    +{xpReward} XP
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-3">Daily Challenge</h2>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <span>{pillarEmoji[pillar.toLowerCase()] || '📝'}</span>
                  {pillar} • Answer to earn XP
                </p>
              </div>

              {/* Question */}
              <div className="p-5">
                <p className="text-lg font-medium text-gray-900 mb-4">{question}</p>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700 placeholder-gray-400"
                  rows={3}
                  autoFocus
                  disabled={submitting}
                />

                {/* Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={onClose}
                    disabled={submitting}
                    className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Skip
                  </button>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={answer.trim().length < 3 || submitting}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    whileHover={{ scale: answer.trim().length >= 3 ? 1.02 : 1 }}
                    whileTap={{ scale: answer.trim().length >= 3 ? 0.98 : 1 }}
                  >
                    {submitting ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        ⚡
                      </motion.span>
                    ) : (
                      <>
                        Submit
                        <span className="text-orange-200">+{xpReward}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
