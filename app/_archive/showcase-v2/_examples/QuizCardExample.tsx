'use client';

import { motion } from 'framer-motion';
import { Zap, Brain, Star, Award, Flame, CheckCircle2 } from 'lucide-react';
import { SPRING_CONFIGS } from '@/lib/animations/core/animation-tokens';
import { useState } from 'react';

export function QuizCardExample() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const correctAnswer = 2;

  const answers = [
    { id: 1, text: '30 days after signing', icon: Star },
    { id: 2, text: 'Before signing the contract', icon: CheckCircle2 },
    { id: 3, text: 'Within 7 business days', icon: Flame },
    { id: 4, text: 'No legal review required', icon: Award },
  ];

  return (
    <motion.div
      className="relative w-80 bg-gradient-to-br from-secondary-900 to-secondary-950 rounded-3xl overflow-hidden border-2 border-primary-500/50 shadow-[0_0_40px_rgba(249,115,22,0.4)]"
      whileHover={{ scale: 1.02 }}
      transition={SPRING_CONFIGS.energetic.bouncy}
    >
      {/* Power-up Energy Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent-400 rounded-full"
            style={{
              left: `${20 + i * 10}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Header with Power Level */}
      <div className="relative bg-gradient-to-r from-secondary-950 via-secondary-900 to-secondary-950 border-b-2 border-primary-500/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-[0_0_20px_rgba(249,115,22,0.6)]"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Brain className="w-6 h-6 text-secondary-900" />
            </motion.div>
            <div>
              <h3 className="text-lg font-extrabold text-white drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                NIL KNOWLEDGE
              </h3>
              <p className="text-xs text-primary-300 font-bold tracking-wider">LEVEL UP QUIZ</p>
            </div>
          </div>

          {/* Power Level Badge */}
          <motion.div
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-accent-500 to-primary-500 text-secondary-900 font-extrabold text-sm shadow-[0_0_20px_rgba(251,191,36,0.6)]"
            animate={{
              boxShadow: [
                '0 0 20px rgba(251, 191, 36, 0.6)',
                '0 0 30px rgba(251, 191, 36, 0.9)',
                '0 0 20px rgba(251, 191, 36, 0.6)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 fill-current" />
              <span>+50 XP</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Question */}
      <div className="relative px-6 py-6">
        <div className="flex items-start gap-3 mb-6">
          <motion.div
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-500/20 border-2 border-primary-500/50 flex items-center justify-center text-primary-400 font-extrabold shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Q
          </motion.div>
          <p className="text-white font-bold leading-relaxed">
            When should an athlete seek legal review of a NIL contract?
          </p>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer.id;
            const isCorrect = answer.id === correctAnswer;
            const showResult = selectedAnswer !== null;
            const isWrong = showResult && isSelected && !isCorrect;
            const Icon = answer.icon;

            return (
              <motion.button
                key={answer.id}
                onClick={() => setSelectedAnswer(answer.id)}
                className={`
                  w-full p-4 rounded-2xl text-left flex items-center gap-3
                  border-2 transition-all relative overflow-hidden
                  ${!showResult && 'hover:scale-102 cursor-pointer'}
                  ${!showResult && !isSelected && 'bg-secondary-800/40 border-primary-500/30 hover:border-primary-500/50'}
                  ${!showResult && isSelected && 'bg-primary-500/20 border-primary-500/70 shadow-[0_0_20px_rgba(249,115,22,0.4)]'}
                  ${showResult && isCorrect && 'bg-success-500/20 border-success-500/70 shadow-[0_0_25px_rgba(16,185,129,0.6)]'}
                  ${showResult && isWrong && 'bg-error-500/20 border-error-500/70'}
                  ${showResult && !isSelected && !isCorrect && 'opacity-50'}
                `}
                disabled={showResult}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.1,
                  ...SPRING_CONFIGS.energetic.bouncy,
                }}
                whileHover={!showResult ? { scale: 1.02, x: 4 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
              >
                {/* Power-up glow on correct answer */}
                {showResult && isCorrect && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-success-500/30 via-accent-500/30 to-success-500/30"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ backgroundSize: '200% 100%' }}
                  />
                )}

                {/* Option letter badge */}
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-extrabold
                  ${!showResult && 'bg-primary-500/20 text-primary-400 border-2 border-primary-500/50'}
                  ${showResult && isCorrect && 'bg-success-500 text-white'}
                  ${showResult && isWrong && 'bg-error-500 text-white'}
                  ${showResult && !isSelected && !isCorrect && 'bg-secondary-800 text-gray-500'}
                `}>
                  {String.fromCharCode(65 + index)}
                </div>

                {/* Answer text */}
                <span className={`
                  flex-1 font-bold text-sm
                  ${!showResult && 'text-white'}
                  ${showResult && isCorrect && 'text-success-400'}
                  ${showResult && isWrong && 'text-error-400'}
                  ${showResult && !isSelected && !isCorrect && 'text-gray-500'}
                `}>
                  {answer.text}
                </span>

                {/* Result icon */}
                {showResult && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={SPRING_CONFIGS.energetic.bouncy}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-success-500 fill-success-500/20" />
                    ) : isSelected ? (
                      <div className="w-6 h-6 rounded-full border-2 border-error-500 flex items-center justify-center">
                        <div className="w-3 h-0.5 bg-error-500 rotate-45" />
                        <div className="w-3 h-0.5 bg-error-500 -rotate-45 absolute" />
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      {selectedAnswer === null ? (
        <div className="relative px-6 pb-6">
          <div className="p-4 rounded-2xl bg-primary-500/10 border border-primary-500/30 text-center">
            <p className="text-primary-300 font-bold text-sm">
              Select an answer to continue
            </p>
          </div>
        </div>
      ) : (
        <div className="relative px-6 pb-6">
          <motion.button
            className={`
              w-full py-4 rounded-2xl font-extrabold text-lg relative overflow-hidden
              ${selectedAnswer === correctAnswer
                ? 'bg-gradient-to-r from-success-500 to-accent-500 text-secondary-900 shadow-[0_0_30px_rgba(16,185,129,0.6)]'
                : 'bg-gradient-to-r from-error-500 to-primary-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)]'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={SPRING_CONFIGS.energetic.bouncy}
            onClick={() => setSelectedAnswer(null)}
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {selectedAnswer === correctAnswer ? (
                <>
                  <Star className="w-5 h-5 fill-current" />
                  CORRECT! +50 XP
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5" />
                  TRY AGAIN
                </>
              )}
            </span>
          </motion.button>
        </div>
      )}

      {/* Corner power indicators */}
      <motion.div
        className="absolute top-3 right-3 w-3 h-3 bg-accent-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)]"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.div>
  );
}
