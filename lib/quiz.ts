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

/**
 * Generate a short alphanumeric code for quiz sessions
 * Uses Base62 encoding (a-z, A-Z, 0-9) for URL-friendly codes
 */
export function generateShortCode(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

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
    .select('category, id');

  if (questions) {
    const categoryCounts = questions.reduce((acc: Record<string, number>, q: any) => {
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
      const categoryProgress = progress.reduce((acc: Record<string, { completed: number; correct: number }>, p: any) => {
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
    .eq('category', category);

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
  // Generate short session ID (8 chars like "Xk9mQ2nP")
  const sessionId = generateShortCode(8);

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
  // Fetch the question to check the answer
  const { data: question, error: questionError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (questionError || !question) {
    console.error('Error fetching question:', questionError);
    throw new Error('Failed to fetch question');
  }

  // Check if answer is correct
  const isCorrect = userAnswerIndex === question.correct_answer;
  const pointsEarned = isCorrect ? question.points : 0;

  // Note: Since we don't have a quiz_answers table or record_quiz_answer function,
  // we're just returning the result without storing it.
  // This is a simplified version that allows the quiz to work.

  return {
    isCorrect,
    pointsEarned,
    explanation: '', // No explanation field in current schema
    correctAnswer: question.correct_answer
  };
}

/**
 * Get quiz session results
 */
export async function getQuizSessionResults(sessionId: string): Promise<QuizSessionResults> {
  // Note: quiz_sessions table doesn't exist - session data is tracked in user_quiz_progress
  // Query user_quiz_progress to aggregate session results
  const { data: progress, error: progressError } = await supabase
    .from('user_quiz_progress')
    .select('*')
    .eq('quiz_session_id', sessionId);

  if (progressError) {
    console.error('Error fetching quiz session progress:', progressError);
    // Return empty results if table doesn't exist yet
    return {
      total_questions: 0,
      correct_answers: 0,
      total_points: 0,
      total_time_seconds: 0,
      score_percentage: 0,
      completed_at: new Date().toISOString()
    };
  }

  // Calculate results from progress records
  const total_questions = progress?.length || 0;
  const correct_answers = progress?.filter((p: any) => p.is_correct).length || 0;
  const total_points = progress?.reduce((sum: number, p: any) => sum + (p.points_earned || 0), 0) || 0;
  const total_time_seconds = progress?.reduce((sum: number, p: any) => sum + (p.time_taken_seconds || 0), 0) || 0;
  const score_percentage = total_questions > 0 ? Math.round((correct_answers / total_questions) * 100) : 0;
  const completed_at = progress?.[0]?.completed_at || new Date().toISOString();

  return {
    total_questions,
    correct_answers,
    total_points,
    total_time_seconds,
    score_percentage,
    completed_at
  };
}

/**
 * Get user's overall quiz statistics
 */
export async function getUserQuizStats(userId: string): Promise<UserQuizStats> {
  // Try RPC first, fall back to direct query if function doesn't exist
  const { data, error } = await supabase.rpc('get_user_quiz_stats', {
    p_user_id: userId
  });

  if (!error && data) {
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

  // Fallback: Calculate stats from user_quiz_progress table directly
  console.log('RPC get_user_quiz_stats not available, using fallback query');

  const { data: progress, error: progressError } = await supabase
    .from('user_quiz_progress')
    .select('*')
    .eq('user_id', userId);

  if (progressError) {
    console.warn('Could not fetch quiz progress:', progressError.message);
    // Return empty stats instead of throwing
    return {
      total_questions_attempted: 0,
      total_questions_correct: 0,
      total_points_earned: 0,
      average_score_percentage: 0,
      total_time_spent_seconds: 0,
      quizzes_completed: 0
    };
  }

  const records: any[] = progress || [];
  const total_questions_attempted = records.length;
  const total_questions_correct = records.filter((r: any) => r.is_correct).length;
  const total_points_earned = records.reduce((sum: number, r: any) => sum + (r.points_earned || 0), 0);
  const total_time_spent_seconds = records.reduce((sum: number, r: any) => sum + (r.time_taken_seconds || 0), 0);
  const average_score_percentage = total_questions_attempted > 0
    ? Math.round((total_questions_correct / total_questions_attempted) * 100)
    : 0;

  // Count unique quiz sessions
  const uniqueSessions = new Set(records.map((r: any) => r.quiz_session_id).filter(Boolean));
  const quizzes_completed = uniqueSessions.size;

  return {
    total_questions_attempted,
    total_questions_correct,
    total_points_earned,
    average_score_percentage,
    total_time_spent_seconds,
    quizzes_completed
  };
}

/**
 * Get recommended quizzes for a user
 * Returns questions the user hasn't answered yet, prioritizing easier difficulties
 */
export async function getRecommendedQuizzes(
  userId: string,
  limit: number = 4
): Promise<QuizQuestion[]> {
  // Try RPC first
  const { data, error } = await supabase.rpc('get_recommended_questions', {
    p_user_id: userId,
    p_category: null,
    p_difficulty: null,
    p_limit: limit
  });

  if (!error && data && data.length > 0) {
    return data;
  }

  // Fallback: Get questions user hasn't answered yet
  console.log('RPC get_recommended_questions not available, using fallback query');

  // First, get IDs of questions the user has already answered
  const { data: answered } = await supabase
    .from('user_quiz_progress')
    .select('question_id')
    .eq('user_id', userId);

  const answeredIds = (answered || []).map((a: any) => a.question_id).filter(Boolean);

  // Get unanswered questions, prioritizing by difficulty
  let query = supabase
    .from('quiz_questions')
    .select('*')
    .order('difficulty', { ascending: true }) // Easier first
    .limit(limit);

  // Exclude already answered questions if any
  if (answeredIds.length > 0) {
    query = query.not('id', 'in', `(${answeredIds.join(',')})`);
  }

  const { data: questions, error: questionsError } = await query;

  if (questionsError) {
    console.warn('Could not fetch recommended questions:', questionsError.message);
    // Last resort: just get any random questions
    const { data: fallbackQuestions } = await supabase
      .from('quiz_questions')
      .select('*')
      .limit(limit);
    return shuffleArray(fallbackQuestions || []);
  }

  return shuffleArray(questions || []);
}

/**
 * Get detailed quiz progress for a session
 */
export async function getQuizSessionProgress(
  sessionId: string
): Promise<UserQuizProgress[]> {
  // Try to fetch progress, but return empty array if table doesn't exist
  const { data, error } = await supabase
    .from('user_quiz_progress')
    .select(`
      *,
      question:quiz_questions(*)
    `)
    .eq('quiz_session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Could not fetch quiz session progress (table may not exist):', error.message);
    return []; // Return empty array instead of throwing
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
