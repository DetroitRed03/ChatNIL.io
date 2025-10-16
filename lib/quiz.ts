/**
 * Quiz Service Layer
 * Handles all quiz-related operations including fetching questions,
 * managing quiz sessions, and calculating results
 */

import { supabase } from './supabase';
import {
  QuizQuestion,
  UserQuizProgress,
  QuizCategory,
  QuizDifficulty,
  QuizSessionResults,
  UserQuizStats
} from './types';

export interface QuizSession {
  id: string;
  user_id: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  question_ids: string[];
  started_at: string;
  completed_at?: string;
}

export interface QuizAnswer {
  question_id: string;
  user_answer: any;
  user_answer_index?: number;
  is_correct: boolean;
  points_earned: number;
  time_taken: number;
}

export interface QuizCategoryInfo {
  category: QuizCategory;
  name: string;
  description: string;
  icon: string;
  questionCount: number;
  completedCount: number;
  averageScore?: number;
}

/**
 * Get all available quiz categories with metadata
 */
export async function getQuizCategories(userId?: string): Promise<QuizCategoryInfo[]> {
  const categories: QuizCategoryInfo[] = [
    {
      category: 'nil_basics',
      name: 'NIL Basics',
      description: 'Learn the fundamentals of Name, Image, and Likeness rights',
      icon: 'book-open',
      questionCount: 0,
      completedCount: 0
    },
    {
      category: 'contracts',
      name: 'Contracts',
      description: 'Understanding NIL contract terms and negotiations',
      icon: 'file-text',
      questionCount: 0,
      completedCount: 0
    },
    {
      category: 'branding',
      name: 'Personal Branding',
      description: 'Build your authentic athlete brand',
      icon: 'sparkles',
      questionCount: 0,
      completedCount: 0
    },
    {
      category: 'social_media',
      name: 'Social Media',
      description: 'Maximize your social media for NIL opportunities',
      icon: 'share-2',
      questionCount: 0,
      completedCount: 0
    },
    {
      category: 'compliance',
      name: 'Compliance',
      description: 'Stay compliant with NCAA and state regulations',
      icon: 'shield-check',
      questionCount: 0,
      completedCount: 0
    },
    {
      category: 'tax_finance',
      name: 'Tax & Finance',
      description: 'Manage your NIL earnings and tax obligations',
      icon: 'dollar-sign',
      questionCount: 0,
      completedCount: 0
    },
    {
      category: 'negotiation',
      name: 'Negotiation',
      description: 'Negotiate better NIL deals and partnerships',
      icon: 'handshake',
      questionCount: 0,
      completedCount: 0
    },
    {
      category: 'legal',
      name: 'Legal Rights',
      description: 'Understand your legal rights and protections',
      icon: 'scale',
      questionCount: 0,
      completedCount: 0
    },
    {
      category: 'marketing',
      name: 'Marketing',
      description: 'Market yourself effectively to brands',
      icon: 'trending-up',
      questionCount: 0,
      completedCount: 0
    },
    {
      category: 'athlete_rights',
      name: 'Athlete Rights',
      description: 'Know your rights as a student-athlete',
      icon: 'award',
      questionCount: 0,
      completedCount: 0
    }
  ];

  // Get question counts for each category
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('category, id')
    .eq('is_active', true);

  if (questions) {
    const categoryCounts = questions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    categories.forEach(cat => {
      cat.questionCount = categoryCounts[cat.category] || 0;
    });
  }

  // If userId provided, get completion stats
  if (userId) {
    const { data: progress } = await supabase
      .from('user_quiz_progress')
      .select(`
        question_id,
        is_correct,
        quiz_questions!inner(category)
      `)
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (progress) {
      const categoryProgress = progress.reduce((acc, p) => {
        const category = (p as any).quiz_questions.category;
        if (!acc[category]) {
          acc[category] = { completed: 0, correct: 0 };
        }
        acc[category].completed++;
        if (p.is_correct) acc[category].correct++;
        return acc;
      }, {} as Record<string, { completed: number; correct: number }>);

      categories.forEach(cat => {
        const prog = categoryProgress[cat.category];
        if (prog) {
          cat.completedCount = prog.completed;
          cat.averageScore = prog.completed > 0
            ? Math.round((prog.correct / prog.completed) * 100)
            : undefined;
        }
      });
    }
  }

  return categories;
}

/**
 * Get questions by category and difficulty
 */
export async function getQuestionsByCategory(
  category: QuizCategory,
  difficulty?: QuizDifficulty,
  limit: number = 10
): Promise<QuizQuestion[]> {
  let query = supabase
    .from('quiz_questions')
    .select('*')
    .eq('is_active', true)
    .eq('category', category)
    .order('display_order', { ascending: true });

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }

  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching questions:', error);
    throw new Error('Failed to fetch quiz questions');
  }

  // Shuffle questions for variety
  return shuffleArray(data || []);
}

/**
 * Start a new quiz session
 */
export async function startQuizSession(
  userId: string,
  category: QuizCategory,
  difficulty?: QuizDifficulty,
  questionCount: number = 10
): Promise<{ sessionId: string; questions: QuizQuestion[] }> {
  // Generate session ID
  const sessionId = crypto.randomUUID();

  // Fetch questions
  const questions = await getQuestionsByCategory(category, difficulty, questionCount);

  if (questions.length === 0) {
    throw new Error('No questions available for this category/difficulty');
  }

  // Note: We're not storing the session in the database yet
  // The session is managed client-side and progress is tracked per question
  // The sessionId is used to group quiz_progress records together

  console.log(`🎯 Started quiz session ${sessionId} for user ${userId}:`, {
    category,
    difficulty,
    questionCount: questions.length
  });

  return {
    sessionId,
    questions
  };
}

/**
 * Submit an answer to a quiz question
 */
export async function submitQuizAnswer(
  userId: string,
  questionId: string,
  userAnswer: any,
  userAnswerIndex: number | null,
  timeTaken: number,
  sessionId: string
): Promise<{ isCorrect: boolean; pointsEarned: number; explanation: string; correctAnswer: any }> {
  // Call the database function to record the answer
  const { data, error } = await supabase.rpc('record_quiz_answer', {
    p_user_id: userId,
    p_question_id: questionId,
    p_user_answer: userAnswer,
    p_user_answer_index: userAnswerIndex,
    p_time_taken_seconds: timeTaken,
    p_quiz_session_id: sessionId,
    p_confidence_level: null
  });

  if (error) {
    console.error('Error recording quiz answer:', error);
    throw new Error('Failed to submit answer');
  }

  const result = Array.isArray(data) ? data[0] : data;

  // Fetch the correct answer for display
  const { data: question } = await supabase
    .from('quiz_questions')
    .select('correct_answer, correct_answer_index')
    .eq('id', questionId)
    .single();

  return {
    isCorrect: result.is_correct,
    pointsEarned: result.points_earned,
    explanation: result.explanation || '',
    correctAnswer: question?.correct_answer
  };
}

/**
 * Get quiz session results
 */
export async function getQuizSessionResults(sessionId: string): Promise<QuizSessionResults> {
  const { data, error } = await supabase.rpc('get_quiz_session_results', {
    p_session_id: sessionId
  });

  if (error) {
    console.error('Error fetching quiz results:', error);
    throw new Error('Failed to fetch quiz results');
  }

  const result = Array.isArray(data) ? data[0] : data;

  return {
    total_questions: result.total_questions || 0,
    correct_answers: result.correct_answers || 0,
    total_points: result.total_points || 0,
    total_time_seconds: result.total_time_seconds || 0,
    score_percentage: result.score_percentage || 0,
    completed_at: result.completed_at || new Date().toISOString()
  };
}

/**
 * Get user's overall quiz statistics
 */
export async function getUserQuizStats(userId: string): Promise<UserQuizStats> {
  const { data, error } = await supabase.rpc('get_user_quiz_stats', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error fetching user quiz stats:', error);
    throw new Error('Failed to fetch user quiz stats');
  }

  const result = Array.isArray(data) ? data[0] : data;

  return {
    total_questions_attempted: result.total_questions_attempted || 0,
    total_questions_correct: result.total_questions_correct || 0,
    total_points_earned: result.total_points_earned || 0,
    average_score_percentage: result.average_score_percentage || 0,
    total_time_spent_seconds: result.total_time_spent_seconds || 0,
    quizzes_completed: result.quizzes_completed || 0
  };
}

/**
 * Get recommended quizzes for a user
 */
export async function getRecommendedQuizzes(
  userId: string,
  limit: number = 4
): Promise<QuizQuestion[]> {
  const { data, error } = await supabase.rpc('get_recommended_questions', {
    p_user_id: userId,
    p_category: null,
    p_difficulty: null,
    p_limit: limit
  });

  if (error) {
    console.error('Error fetching recommended quizzes:', error);
    return [];
  }

  return data || [];
}

/**
 * Get detailed quiz progress for a session
 */
export async function getQuizSessionProgress(
  sessionId: string
): Promise<UserQuizProgress[]> {
  const { data, error } = await supabase
    .from('user_quiz_progress')
    .select(`
      *,
      question:quiz_questions(*)
    `)
    .eq('quiz_session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching quiz session progress:', error);
    throw new Error('Failed to fetch session progress');
  }

  return data || [];
}

/**
 * Get difficulty color for styling
 */
export function getDifficultyColor(difficulty: QuizDifficulty): {
  bg: string;
  border: string;
  text: string;
} {
  switch (difficulty) {
    case 'beginner':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600'
      };
    case 'intermediate':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600'
      };
    case 'advanced':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-600'
      };
    case 'expert':
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-600'
      };
  }
}

/**
 * Shuffle array helper
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get pass/fail status based on score
 */
export function getPassStatus(scorePercentage: number): {
  status: 'pass' | 'fail';
  message: string;
  color: string;
} {
  const passingScore = 70;

  if (scorePercentage >= passingScore) {
    return {
      status: 'pass',
      message: 'Passed!',
      color: 'text-green-600'
    };
  }

  return {
    status: 'fail',
    message: 'Keep Learning',
    color: 'text-orange-600'
  };
}
