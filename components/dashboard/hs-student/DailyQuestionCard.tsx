'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Send, CheckCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface DailyQuestionCardProps {
  question: {
    id: string;
    question: string;
    category: string;
  };
}

export function DailyQuestionCard({ question }: DailyQuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/daily-question/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          answer: answer.trim(),
        }),
      });

      const data = await response.json();
      setFeedback(data.feedback || 'Great thinking! 🌟');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      identity: 'text-blue-400 bg-blue-500/10',
      business: 'text-purple-400 bg-purple-500/10',
      money: 'text-green-400 bg-green-500/10',
      legacy: 'text-orange-400 bg-orange-500/10',
      general: 'text-gray-400 bg-gray-500/10',
    };
    return colors[category.toLowerCase()] || colors.general;
  };

  return (
    <Card data-testid="daily-question-card" className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            Daily Question
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(question.category)}`}>
            {question.category}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p data-testid="daily-question-text" className="text-lg text-white">{question.question}</p>

              <div className="flex gap-2">
                <Input
                  data-testid="daily-question-input"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="flex-1 bg-gray-700 border-gray-600 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <Button
                  data-testid="daily-question-submit"
                  onClick={handleSubmit}
                  disabled={!answer.trim() || isLoading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <Send className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                Answer the daily question to maintain your streak! 🔥
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Question Answered!</span>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Your answer:</p>
                <p className="text-white">{answer}</p>
              </div>

              {feedback && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-400">{feedback}</p>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center">
                Come back tomorrow for a new question! 📚
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
