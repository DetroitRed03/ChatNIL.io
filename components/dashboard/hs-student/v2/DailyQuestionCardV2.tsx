'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyQuestionCardV2Props {
  question: {
    id: string;
    question: string;
    category: string;
    answered?: boolean;
  };
  onAnswer: (questionId: string, answer: string) => void;
  streakBonus?: boolean;
}

export function DailyQuestionCardV2({
  question,
  onAnswer,
  streakBonus = false,
}: DailyQuestionCardV2Props) {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(question.answered || false);

  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await onAnswer(question.id, answer);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const xpReward = streakBonus ? 15 : 10;

  return (
    <div
      id="daily-question"
      data-testid="daily-question-v2"
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💭</span>
            <div>
              <h3 className="font-semibold text-white">Daily Reflection</h3>
              <p className="text-white/80 text-sm">{question.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-white text-sm">
            <span>⚡</span>
            <span className="font-medium">+{xpReward} XP</span>
            {streakBonus && (
              <span className="text-yellow-300 text-xs">(streak bonus!)</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-3xl">✨</span>
              </motion.div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Great reflection!
              </h4>
              <p className="text-gray-500">
                You earned {xpReward} XP. Come back tomorrow for another question!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-lg text-gray-900 mb-4 font-medium">
                {question.question}
              </p>

              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-4 border border-gray-200 rounded-xl text-gray-700
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500
                  focus:border-transparent resize-none"
                rows={4}
              />

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-400">
                  {answer.length > 0 ? `${answer.length} characters` : 'Min 10 characters'}
                </p>
                <motion.button
                  onClick={handleSubmit}
                  disabled={answer.length < 10 || isSubmitting}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all
                    ${answer.length >= 10
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  whileHover={answer.length >= 10 ? { scale: 1.02 } : {}}
                  whileTap={answer.length >= 10 ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        ⚡
                      </motion.span>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Reflection'
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
