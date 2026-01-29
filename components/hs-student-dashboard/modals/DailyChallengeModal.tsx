'use client';

import { useState } from 'react';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: {
    id: string;
    question: string;
    pillar: string;
    type: 'text' | 'multiple_choice';
    options?: string[];
  };
  xpReward: number;
  onSuccess: (xpEarned: number, newStreak: number) => void;
}

export function DailyChallengeModal({
  isOpen,
  onClose,
  question,
  xpReward,
  onSuccess
}: DailyChallengeModalProps) {
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const finalAnswer = question.type === 'multiple_choice' ? selectedOption : answer;

    if (!finalAnswer || finalAnswer.trim().length < 2) {
      setError('Please provide an answer');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/daily-challenge/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          answer: finalAnswer.trim()
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit');
      }

      const data = await res.json();
      onSuccess(data.xpEarned, data.newStreak);
      onClose();
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const pillarEmoji = {
    identity: '🎭',
    business: '📋',
    money: '💰',
    legacy: '⭐'
  }[question.pillar] || '💬';

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-5 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{pillarEmoji}</span>
              <span className="text-sm font-medium opacity-80 capitalize">{question.pillar}</span>
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
              +{xpReward} XP
            </span>
          </div>
          <h2 className="text-xl font-bold mt-3">Daily Challenge</h2>
          <p className="text-white/80 text-sm">Answer to earn XP and build your streak! 🔥</p>
        </div>

        {/* Question */}
        <div className="p-5">
          <p className="text-lg font-medium text-gray-800 mb-4">{question.question}</p>

          {question.type === 'multiple_choice' && question.options ? (
            <div className="space-y-2">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(option)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    selectedOption === option
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              rows={3}
              autoFocus
            />
          )}

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || (!answer.trim() && !selectedOption)}
              className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  Submit
                  <span className="text-orange-200 text-sm">+{xpReward} XP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyChallengeModal;
