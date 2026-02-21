'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyChallengeResult {
  success: boolean;
  xpEarned: number;
  bonusXP?: number;
  qualityScore?: number | null;
  aiFeedback?: string | null;
  followUpQuestion?: string | null;
  newXP: number;
  newLevel: number;
  leveledUp: boolean;
  newStreak: number;
  streakBonus: number;
  achievementsEarned: string[];
}

interface DailyChallengeModalProps {
  question: string;
  pillar: string;
  questionType?: string;
  hints?: string[];
  xpReward: number;
  onSubmit: (answer: string) => Promise<DailyChallengeResult>;
  onClose: () => void;
}

const LOW_EFFORT_EXACT = [
  "idk", "n/a", "none", "no", "yes", "maybe", "ok", "okay", "sure", "idc",
  "dunno", "whatever", "anything", "something", "no clue", "no idea",
  "not sure", "nothing", "dont know", "i dont know",
];

const LOW_EFFORT_CONTAINS = [
  "i don't know", "i dont know", "don't know", "dont know",
  "no idea", "not sure", "who cares", "beats me", "no clue",
  "whatever", "dunno",
];

function validateAnswer(text: string): { valid: boolean; error?: string } {
  const trimmed = text.trim();

  if (trimmed.length < 20) {
    return { valid: false, error: 'Write a bit more — at least a short sentence (20+ characters)' };
  }

  const lower = trimmed.toLowerCase().replace(/[\u2018\u2019]/g, "'");

  if (LOW_EFFORT_EXACT.includes(lower)) {
    return {
      valid: false,
      error: 'Try to share something specific! Even a small thought counts.',
    };
  }

  if (LOW_EFFORT_CONTAINS.some(phrase => lower.includes(phrase))) {
    const withoutPhrases = LOW_EFFORT_CONTAINS.reduce((t, p) => t.replace(p, ''), lower).trim();
    if (withoutPhrases.length < 15) {
      return {
        valid: false,
        error: 'Try to share something specific! Even a small thought counts.',
      };
    }
  }

  return { valid: true };
}

function getQualityBadge(score: number): { label: string; color: string } {
  if (score >= 5) return { label: 'Outstanding!', color: 'bg-yellow-100 text-yellow-800' };
  if (score >= 4) return { label: 'Thoughtful!', color: 'bg-green-100 text-green-800' };
  if (score >= 3) return { label: 'Good Start!', color: 'bg-blue-100 text-blue-800' };
  return { label: 'Keep Growing!', color: 'bg-gray-100 text-gray-600' };
}

export function DailyChallengeModal({
  question,
  pillar,
  questionType,
  hints,
  xpReward,
  onSubmit,
  onClose,
}: DailyChallengeModalProps) {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);

  // AI feedback state
  const [feedbackResult, setFeedbackResult] = useState<DailyChallengeResult | null>(null);

  const isTextQuestion = !questionType || questionType === 'text';

  const handleSubmit = async () => {
    if (submitting) return;

    if (isTextQuestion) {
      const validation = validateAnswer(answer);
      if (!validation.valid) {
        setValidationError(validation.error || 'Please provide a more thoughtful answer.');
        return;
      }
    }

    setValidationError(null);
    setSubmitting(true);
    try {
      const result = await onSubmit(answer);
      setFeedbackResult(result);
      setSubmitted(true);
    } catch {
      setValidationError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const pillarEmoji: Record<string, string> = {
    identity: '🎭',
    business: '📋',
    money: '💰',
    legacy: '⭐',
  };

  const charCount = answer.trim().length;
  const minChars = 20;
  const charsMet = charCount >= minChars;

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
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {submitted && feedbackResult ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6"
            >
              {/* AI Feedback Card */}
              {feedbackResult.aiFeedback ? (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">🏆</span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">NIL Coach Feedback</h2>
                  </div>

                  {/* Quality Badge */}
                  {feedbackResult.qualityScore != null && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mb-3"
                    >
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getQualityBadge(feedbackResult.qualityScore).color}`}>
                        {getQualityBadge(feedbackResult.qualityScore).label}
                      </span>
                    </motion.div>
                  )}

                  {/* Feedback Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-orange-50 border-l-4 border-orange-400 rounded-r-xl p-4 mb-3"
                  >
                    <p className="text-gray-700 text-sm leading-relaxed">{feedbackResult.aiFeedback}</p>
                  </motion.div>

                  {/* Follow-up Question */}
                  {feedbackResult.followUpQuestion && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-blue-50 border border-blue-200 rounded-xl p-3"
                    >
                      <p className="text-xs font-semibold text-blue-600 mb-1">Think deeper:</p>
                      <p className="text-sm text-blue-800">{feedbackResult.followUpQuestion}</p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
                  >
                    <span className="text-3xl">✅</span>
                  </motion.div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Great answer!</h2>
                  <p className="text-gray-500 text-sm">Your response has been recorded</p>
                </div>
              )}

              {/* XP Earned */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                className="flex items-center justify-center gap-2 mb-4"
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-full font-bold text-base shadow-lg shadow-orange-200/50">
                  <span>⚡</span>
                  +{feedbackResult.xpEarned} XP
                  {feedbackResult.bonusXP && feedbackResult.bonusXP > 0 && (
                    <span className="text-orange-200 text-sm">(+{feedbackResult.bonusXP} bonus!)</span>
                  )}
                </div>
              </motion.div>

              {/* Streak info */}
              {feedbackResult.newStreak > 1 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-sm text-gray-500"
                >
                  🔥 {feedbackResult.newStreak} day streak!
                </motion.p>
              )}

              {/* Done Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={onClose}
                className="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
              >
                Done
              </motion.button>
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
                <p className="text-lg font-medium text-gray-900 mb-3">{question}</p>

                {/* Hints */}
                {isTextQuestion && hints && hints.length > 0 && (
                  <div className="mb-3">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="text-sm text-orange-600 font-medium flex items-center gap-1 hover:text-orange-700 transition-colors"
                    >
                      <span className="text-base">{showHints ? '💡' : '💡'}</span>
                      {showHints ? 'Hide hints' : 'Need a hint?'}
                    </button>
                    <AnimatePresence>
                      {showHints && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-2 mt-2">
                            {hints.map((hint, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  if (!answer.trim()) {
                                    setAnswer('');
                                  }
                                }}
                                className="text-xs bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-200 hover:bg-orange-100 transition-colors"
                              >
                                {hint}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {isTextQuestion ? (
                  <>
                    <textarea
                      value={answer}
                      onChange={(e) => {
                        setAnswer(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="Type your answer..."
                      className={`w-full p-4 border rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700 placeholder-gray-400 ${
                        validationError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      rows={3}
                      autoFocus
                      disabled={submitting}
                    />

                    {/* Character counter */}
                    <div className="flex justify-between items-center mt-1.5">
                      {validationError ? (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <span>*</span> {validationError}
                        </p>
                      ) : (
                        <div />
                      )}
                      <span className={`text-xs font-medium ${charsMet ? 'text-green-500' : 'text-gray-400'}`}>
                        {charCount}/{minChars}
                      </span>
                    </div>
                  </>
                ) : (
                  /* Multiple choice / true-false — no changes needed, handled by parent */
                  <div />
                )}

                {/* Loading State */}
                {submitting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 py-3 text-orange-600"
                  >
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⚡
                    </motion.span>
                    <span className="text-sm font-medium">NIL Coach is reviewing...</span>
                  </motion.div>
                )}

                {/* Buttons */}
                {!submitting && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Skip
                    </button>
                    <motion.button
                      onClick={handleSubmit}
                      disabled={isTextQuestion && !charsMet}
                      className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                      whileHover={{ scale: !isTextQuestion || charsMet ? 1.02 : 1 }}
                      whileTap={{ scale: !isTextQuestion || charsMet ? 0.98 : 1 }}
                    >
                      Submit
                      <span className="text-orange-200">+{xpReward}</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
