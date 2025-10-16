'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface MessageFeedbackProps {
  messageId: string;
  userId?: string;
  userRole?: string;
  sessionId?: string;
}

export default function MessageFeedback({
  messageId,
  userId,
  userRole,
  sessionId
}: MessageFeedbackProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (type: 'positive' | 'negative') => {
    if (isSubmitting || feedback) return;

    setIsSubmitting(true);
    setFeedback(type);

    try {
      // Track feedback event
      if (userId && userRole) {
        trackEvent('ai_feedback', {
          user_id: userId,
          role: userRole as any,
          feedback: type,
          message_id: messageId,
          session_id: sessionId || 'unknown',
        });
      }

      // Optional: Send to API for storage
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          messageId,
          feedback: type,
          sessionId,
          timestamp: new Date().toISOString(),
        }),
      }).catch(err => {
        // Don't fail if API call fails - analytics tracking is more important
        console.warn('Failed to save feedback to API:', err);
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFeedback(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      <button
        onClick={() => handleFeedback('positive')}
        disabled={isSubmitting || feedback !== null}
        className={`p-1.5 rounded-lg transition-all ${
          feedback === 'positive'
            ? 'bg-green-100 text-green-600'
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Good response"
        aria-label="Good response"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleFeedback('negative')}
        disabled={isSubmitting || feedback !== null}
        className={`p-1.5 rounded-lg transition-all ${
          feedback === 'negative'
            ? 'bg-red-100 text-red-600'
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Bad response"
        aria-label="Bad response"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>

      {feedback && (
        <span className="text-xs text-gray-500 ml-1">
          Thanks for your feedback!
        </span>
      )}
    </div>
  );
}
