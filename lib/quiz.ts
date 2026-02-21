/**
 * Quiz Service Layer
 * Handles all quiz-related operations including fetching questions,
 * managing quiz sessions, and calculating results
 */

import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';
import {
  QuizQuestion,
  UserQuizProgress,
  QuizCategory,
  QuizDifficulty,
  QuizSessionResults,
  UserQuizStats
} from './types';

/**
 * Service role client for server-side queries that bypass RLS.
 * Created inline to avoid importing next/headers from lib/supabase/server.ts.
 */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    return createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabase; // fallback to anon client
}

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

  // Use service client for question counts to bypass RLS
  const serviceClient = getServiceClient();
  const { data: questions } = await serviceClient
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
    const { data: progress } = await serviceClient
      .from('user_quiz_progress')
      .select(`
        question_id,
        is_correct,
        quiz_questions!inner(category)
      `)
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (progress) {
      // Track unique questions per category to avoid counting retakes
      const categoryProgress = progress.reduce((acc: Record<string, { uniqueQuestions: Set<string>; correct: number }>, p: any) => {
        const category = (p as any).quiz_questions.category;
        if (!acc[category]) {
          acc[category] = { uniqueQuestions: new Set(), correct: 0 };
        }
        acc[category].uniqueQuestions.add(p.question_id);
        if (p.is_correct) acc[category].correct++;
        return acc;
      }, {} as Record<string, { uniqueQuestions: Set<string>; correct: number }>);

      categories.forEach(cat => {
        const prog = categoryProgress[cat.category];
        if (prog) {
          // Use unique question count, capped at total available
          cat.completedCount = Math.min(prog.uniqueQuestions.size, cat.questionCount);
          cat.averageScore = prog.uniqueQuestions.size > 0
            ? Math.round((prog.correct / prog.uniqueQuestions.size) * 100)
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

  // Persist answer to database via record_quiz_answer RPC (migration 009)
  // Note: quiz_session_id was changed from uuid to text in migration 029
  let persisted = false;
  try {
    const { error: rpcError } = await supabase.rpc('record_quiz_answer', {
      p_user_id: userId,
      p_question_id: questionId,
      p_user_answer: JSON.stringify(userAnswer),
      p_user_answer_index: userAnswerIndex,
      p_time_taken_seconds: timeTaken,
      p_quiz_session_id: sessionId || null,
    });
    if (rpcError) throw rpcError;
    persisted = true;
  } catch (rpcErr) {
    console.warn('RPC record_quiz_answer failed, falling back to direct INSERT:', rpcErr);
  }

  // Fallback: direct INSERT if RPC failed (e.g., quiz_session_id type mismatch)
  if (!persisted) {
    try {
      const { error: insertError } = await supabase
        .from('user_quiz_progress')
        .insert({
          user_id: userId,
          question_id: questionId,
          status: 'completed',
          user_answer: JSON.stringify(userAnswer),
          user_answer_index: userAnswerIndex,
          is_correct: isCorrect,
          time_taken_seconds: timeTaken,
          points_earned: pointsEarned,
          quiz_session_id: sessionId || null,
          completed_at: new Date().toISOString(),
        });
      if (insertError) {
        console.error('Direct INSERT fallback also failed:', insertError);
      } else {
        persisted = true;
      }
    } catch (insertErr) {
      console.error('Failed to persist quiz answer via fallback:', insertErr);
    }
  }

  return {
    isCorrect,
    pointsEarned,
    explanation: question.explanation || '',
    correctAnswer: question.correct_answer
  };
}

/**
 * Get quiz session results
 */
export async function getQuizSessionResults(sessionId: string): Promise<QuizSessionResults> {
  // Use service role client to bypass RLS (this runs server-side in API routes)
  const serviceClient = getServiceClient();

  const { data: progress, error: progressError } = await serviceClient
    .from('user_quiz_progress')
    .select('*')
    .eq('quiz_session_id', sessionId);

  if (progressError) {
    console.error('Error fetching quiz session progress:', progressError);
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
  // Try RPC first using service client to bypass RLS
  const serviceClient = getServiceClient();
  const { data, error } = await serviceClient.rpc('get_user_quiz_stats', {
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

  const { data: progress, error: progressError } = await serviceClient
    .from('user_quiz_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed');

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

  // Calculate per-session average score for a fairer metric
  const sessionMap = new Map<string, { correct: number; total: number }>();
  records.forEach((r: any) => {
    const sid = r.quiz_session_id || 'unknown';
    if (!sessionMap.has(sid)) sessionMap.set(sid, { correct: 0, total: 0 });
    const s = sessionMap.get(sid)!;
    s.total++;
    if (r.is_correct) s.correct++;
  });
  const sessionScores = Array.from(sessionMap.values()).map(s => s.total > 0 ? (s.correct / s.total) * 100 : 0);
  const average_score_percentage = sessionScores.length > 0
    ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
    : 0;

  const quizzes_completed = sessionMap.size;

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
  // Use service role client to bypass RLS (this runs server-side in API routes)
  const serviceClient = getServiceClient();

  const { data, error } = await serviceClient
    .from('user_quiz_progress')
    .select(`
      *,
      question:quiz_questions(*)
    `)
    .eq('quiz_session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Could not fetch quiz session progress:', error.message);
    return [];
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
