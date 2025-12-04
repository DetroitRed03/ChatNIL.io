'use client';

import { motion } from 'framer-motion';
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
    <motion.div
      onClick={hasQuestions ? onClick : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hasQuestions ? { y: -4, scale: 1.02 } : undefined}
      className={`
        relative bg-gradient-to-br from-white to-orange-50/30 rounded-2xl border-2 p-6 transition-all duration-300 overflow-hidden
        ${hasQuestions
          ? 'hover:shadow-xl hover:shadow-orange-200/50 cursor-pointer border-orange-100 hover:border-orange-300'
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

      {/* Icon with Power-Up Effects */}
      <div className="mb-4 relative">
        {/* Power-up rising particles - BOLDER & SLOWER */}
        {hasQuestions && [...Array(4)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-3 h-3 rounded-full bg-orange-500"
            style={{ left: `${10 + i * 12}px`, bottom: 0 }}
            animate={{
              y: [0, -60],
              opacity: [0, 0.9, 0],
              scale: [0, 1.3, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Orbiting sparkle particles - BOLDER & SLOWER */}
        {hasQuestions && [...Array(6)].map((_, i) => {
          const angle = (i * 60) * (Math.PI / 180);
          return (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute w-2.5 h-2.5 bg-amber-500 rounded-full"
              style={{
                top: `${28 + Math.sin(angle) * 32}px`,
                left: `${28 + Math.cos(angle) * 32}px`,
              }}
              animate={{
                scale: [0, 1.4, 0],
                opacity: [0, 0.95, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          );
        })}

        <motion.div
          className="relative w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
          animate={{
            boxShadow: [
              '0 0 25px rgba(249, 115, 22, 0.6)',
              '0 0 50px rgba(249, 115, 22, 0.9)',
              '0 0 25px rgba(249, 115, 22, 0.6)',
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          {/* Shimmer effect - BOLDER & SLOWER */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 1.5 }}
          />
          <IconComponent className="w-7 h-7 text-white relative z-10" />
        </motion.div>
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
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span className="font-medium">Progress</span>
            <span className="font-bold text-orange-600">{Math.round((category.completedCount / category.questionCount) * 100)}%</span>
          </div>
          <div className="w-full bg-orange-100 rounded-full h-2.5 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-orange-400 to-amber-500 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(category.completedCount / category.questionCount) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      {hasQuestions ? (
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{
            scale: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
          }}
          className={`
            w-full inline-flex items-center justify-center px-4 py-3 rounded-xl font-bold transition-all duration-300 shadow-md
            ${isCompleted
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-200/50'
              : 'bg-gradient-to-r from-orange-400 to-amber-500 text-white hover:from-orange-500 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-200/50'
            }
          `}
        >
          <PlayCircle className="w-5 h-5 mr-2" />
          {isCompleted ? 'Practice Again' : 'Start Quiz'}
        </motion.button>
      ) : (
        <div className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl font-bold bg-gray-100 text-gray-400 cursor-not-allowed">
          <Lock className="w-5 h-5 mr-2" />
          Coming Soon
        </div>
      )}
    </motion.div>
  );
}
