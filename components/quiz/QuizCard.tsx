'use client';

import { QuizCategoryInfo } from '@/lib/quiz';
import { getDifficultyColor } from '@/lib/quiz';
import {
  BookOpen,
  FileText,
  Sparkles,
  Share2,
  ShieldCheck,
  DollarSign,
  Users,
  Scale,
  TrendingUp,
  Award,
  CheckCircle,
  PlayCircle,
  Lock
} from 'lucide-react';

interface QuizCardProps {
  category: QuizCategoryInfo;
  onClick?: () => void;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

const categoryIcons: Record<string, any> = {
  'book-open': BookOpen,
  'file-text': FileText,
  'sparkles': Sparkles,
  'share-2': Share2,
  'shield-check': ShieldCheck,
  'dollar-sign': DollarSign,
  'handshake': Users,
  'scale': Scale,
  'trending-up': TrendingUp,
  'award': Award
};

export default function QuizCard({ category, onClick, difficulty }: QuizCardProps) {
  const IconComponent = categoryIcons[category.icon] || BookOpen;
  const isCompleted = category.completedCount > 0;
  const hasQuestions = category.questionCount > 0;

  const difficultyColors = difficulty ? getDifficultyColor(difficulty) : null;

  return (
    <div
      onClick={hasQuestions ? onClick : undefined}
      className={`
        relative bg-white rounded-xl border-2 p-6 transition-all duration-300
        ${hasQuestions
          ? 'hover:shadow-lg hover:scale-105 cursor-pointer border-gray-200 hover:border-blue-300'
          : 'border-gray-100 opacity-60 cursor-not-allowed'
        }
      `}
    >
      {/* Completion Badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* Locked Badge */}
      {!hasQuestions && (
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* Icon */}
      <div className="mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
          <IconComponent className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Category Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {category.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {category.description}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm mb-4">
        <span className="text-gray-500">
          {category.questionCount} question{category.questionCount !== 1 ? 's' : ''}
        </span>

        {isCompleted && category.averageScore !== undefined && (
          <span className="font-medium text-green-600">
            {category.averageScore}% avg
          </span>
        )}
      </div>

      {/* Difficulty Badge (if specified) */}
      {difficulty && difficultyColors && (
        <div className="mb-4">
          <span className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
            ${difficultyColors.bg} ${difficultyColors.border} ${difficultyColors.text} border
          `}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        </div>
      )}

      {/* Progress Bar (if partially completed) */}
      {isCompleted && category.completedCount < category.questionCount && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round((category.completedCount / category.questionCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(category.completedCount / category.questionCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      {hasQuestions ? (
        <button
          onClick={onClick}
          className={`
            w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors
            ${isCompleted
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-blue-500 text-white hover:bg-blue-600'
            }
          `}
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          {isCompleted ? 'Practice Again' : 'Start Quiz'}
        </button>
      ) : (
        <div className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
          <Lock className="w-4 h-4 mr-2" />
          Coming Soon
        </div>
      )}
    </div>
  );
}
