'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QuestionScale } from './QuestionScale';
import { QuestionChoice } from './QuestionChoice';
import { QuestionRanking } from './QuestionRanking';
import { SkipButton } from './SkipButton';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import type { AssessmentQuestion, ResponseValue } from '@/lib/assessment/types';

interface AssessmentCardProps {
  question: AssessmentQuestion;
  questionNumber: number;
  totalQuestions: number;
  currentValue?: ResponseValue;
  onAnswer: (value: ResponseValue) => void;
  onSkip: () => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  skippedCount?: number;
  isSubmitting?: boolean;
  className?: string;
}

export function AssessmentCard({
  question,
  questionNumber,
  totalQuestions,
  currentValue,
  onAnswer,
  onSkip,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  skippedCount = 0,
  isSubmitting = false,
  className,
}: AssessmentCardProps) {
  const [showHelp, setShowHelp] = React.useState(false);
  const hasAnswer = currentValue !== undefined;

  // Auto-advance after answering (with small delay for feedback)
  const handleAnswer = (value: ResponseValue) => {
    onAnswer(value);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          if (hasAnswer && canGoNext) {
            e.preventDefault();
            onNext();
          }
          break;
        case 'ArrowLeft':
          if (canGoPrevious) {
            e.preventDefault();
            onPrevious();
          }
          break;
        case 's':
        case 'S':
          if (!hasAnswer) {
            e.preventDefault();
            onSkip();
          }
          break;
        // Handle A, B, C, D for choice questions
        case 'a':
        case 'A':
        case 'b':
        case 'B':
        case 'c':
        case 'C':
        case 'd':
        case 'D':
          if (question.questionType === 'choice' && question.options) {
            const index = e.key.toLowerCase().charCodeAt(0) - 97;
            if (index < question.options.length) {
              e.preventDefault();
              handleAnswer({ value: question.options[index].value });
            }
          }
          break;
        // Handle 1-5 for scale questions
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          if (question.questionType === 'scale') {
            e.preventDefault();
            handleAnswer({ value: parseInt(e.key) });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question, hasAnswer, canGoNext, canGoPrevious, onNext, onPrevious, onSkip]);

  return (
    <Card
      variant="elevated"
      className={cn(
        'max-w-2xl mx-auto overflow-hidden',
        'animate-in fade-in slide-in-from-right-4 duration-300',
        className
      )}
    >
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Question header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium">
              {question.section || 'General'}
            </span>

            {question.helpText && (
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Show help"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary leading-relaxed">
            {question.questionText}
          </h2>

          {/* Help text tooltip */}
          {showHelp && question.helpText && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700 animate-in fade-in duration-200">
              {question.helpText}
            </div>
          )}
        </div>

        {/* Question input based on type */}
        <div className="py-4">
          {question.questionType === 'scale' && (
            <QuestionScale
              value={currentValue?.value as number | undefined}
              onChange={(value) => handleAnswer({ value })}
              helpText={question.helpText}
              disabled={isSubmitting}
            />
          )}

          {question.questionType === 'choice' && question.options && (
            <QuestionChoice
              options={question.options.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              value={currentValue?.value as string | undefined}
              onChange={(value) => handleAnswer({ value })}
              disabled={isSubmitting}
            />
          )}

          {question.questionType === 'ranking' && question.options && (
            <QuestionRanking
              options={question.options.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              value={currentValue?.value as string[] | undefined}
              onChange={(value) => handleAnswer({ value })}
              disabled={isSubmitting}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={onPrevious}
            disabled={!canGoPrevious || isSubmitting}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          {/* Skip button - only show if no answer yet */}
          {!hasAnswer && (
            <SkipButton
              onSkip={onSkip}
              skippedCount={skippedCount}
              disabled={isSubmitting}
            />
          )}

          <Button
            variant={hasAnswer ? 'primary' : 'outline'}
            onClick={onNext}
            disabled={!canGoNext || !hasAnswer || isSubmitting}
            isLoading={isSubmitting}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            {questionNumber === totalQuestions ? 'Review' : 'Next'}
          </Button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="hidden sm:flex justify-center pt-2">
          <p className="text-xs text-text-tertiary">
            Use <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">←</kbd>{' '}
            <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">→</kbd> to navigate,{' '}
            <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">S</kbd> to skip
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
