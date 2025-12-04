'use client';

import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Clock } from 'lucide-react';
import { useState } from 'react';

export function QuizCardExample() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const answers = [
    'Name, Image, and Likeness',
    'National Investment League',
    'New Income License',
    'None of the above'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="w-full max-w-md"
    >
      <div
        className="relative bg-gradient-to-br from-[#FFFBF7] via-white to-[#FFF8F0] rounded-2xl border-2 border-[#E8E4DF] overflow-hidden"
        style={{
          boxShadow: `
            0 10px 30px -5px rgba(234, 88, 12, 0.08),
            0 4px 12px -2px rgba(234, 88, 12, 0.05),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
          `,
          // Paper texture
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(234, 88, 12, 0.01) 0px,
              transparent 1px,
              transparent 2px,
              rgba(234, 88, 12, 0.01) 3px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(234, 88, 12, 0.01) 0px,
              transparent 1px,
              transparent 2px,
              rgba(234, 88, 12, 0.01) 3px
            )
          `
        }}
      >
        {/* Header with book icon */}
        <div className="relative border-b-2 border-[#E8E4DF] bg-gradient-to-br from-white via-[#FFFBF7] to-white px-6 py-5">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#92400e] flex items-center justify-center"
              style={{
                boxShadow: `
                  0 4px 12px -2px rgba(234, 88, 12, 0.3),
                  inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2),
                  inset 0 1px 2px 0 rgba(255, 255, 255, 0.2)
                `
              }}
            >
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#1a1d20] tracking-tight">NIL Basics Quiz</h3>
              <p className="text-xs text-[#6c757d]">Question 1 of 10</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#adb5bd]">
              <Clock className="w-4 h-4" />
              <span>2:30</span>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="h-2 bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] rounded-full overflow-hidden border border-[#E8E4DF]"
            style={{
              boxShadow: `
                inset 2px 2px 4px rgba(0, 0, 0, 0.05),
                inset -1px -1px 3px rgba(255, 255, 255, 0.8)
              `
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '10%' }}
              transition={{
                duration: 1,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.3
              }}
              className="h-full bg-gradient-to-r from-[#fcd34d] via-[#ea580c] to-[#92400e]"
              style={{
                boxShadow: `
                  0 0 8px rgba(234, 88, 12, 0.4),
                  inset 0 -1px 2px rgba(0, 0, 0, 0.2)
                `
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-bold text-[#1a1d20] mb-2 leading-relaxed tracking-tight">
              What does "NIL" stand for in collegiate athletics?
            </h4>
            <p className="text-sm text-[#6c757d]">
              Select the most accurate answer below.
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {answers.map((answer, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === 0;

              return (
                <motion.button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.4 + index * 0.1,
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all relative ${
                    isSelected
                      ? isCorrect
                        ? 'border-[#10b981] bg-gradient-to-r from-[#10b981]/10 to-[#059669]/10'
                        : 'border-[#ef4444] bg-gradient-to-r from-[#ef4444]/10 to-[#dc2626]/10'
                      : 'border-[#E8E4DF] bg-gradient-to-br from-white to-[#FFFBF7] hover:border-[#ea580c]/30'
                  }`}
                  style={!isSelected ? {
                    boxShadow: `
                      0 2px 8px -2px rgba(0, 0, 0, 0.05),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.8)
                    `
                  } : isCorrect ? {
                    boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.2)'
                  } : {
                    boxShadow: '0 4px 12px -2px rgba(239, 68, 68, 0.2)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Radio/Check indicator */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? isCorrect
                            ? 'border-[#10b981] bg-[#10b981]'
                            : 'border-[#ef4444] bg-[#ef4444]'
                          : 'border-[#D6D1CC] bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0]'
                      }`}
                      style={!isSelected ? {
                        boxShadow: `
                          inset 2px 2px 4px rgba(0, 0, 0, 0.05),
                          inset -1px -1px 3px rgba(255, 255, 255, 0.8)
                        `
                      } : {}}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Answer text */}
                    <span className={`font-medium ${
                      isSelected
                        ? isCorrect ? 'text-[#10b981]' : 'text-[#ef4444]'
                        : 'text-[#495057]'
                    }`}>
                      {answer}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={selectedAnswer === null}
            className={`w-full font-bold py-3.5 rounded-xl relative overflow-hidden group transition-opacity ${
              selectedAnswer === null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              background: 'linear-gradient(to right, #ea580c, #c2410c, #92400e)',
              boxShadow: `
                0 4px 12px -2px rgba(234, 88, 12, 0.4),
                inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2)
              `
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative tracking-wide text-white">
              {selectedAnswer !== null ? 'Next Question' : 'Select an Answer'}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
