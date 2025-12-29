/**
 * Assessment Store (Zustand)
 *
 * State management for the Core Traits Assessment feature.
 * Handles session management, question navigation, response tracking,
 * and result calculation.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AssessmentSession,
  AssessmentQuestion,
  AssessmentResponse,
  UserTraitResults,
  CoreTrait,
  TraitArchetype,
  ResponseValue,
  AssessmentProgress,
  TraitScores,
} from './types';
import { calculateTraitScores, getTopTraits, determineArchetype } from './scoring';
import { ARCHETYPES } from './archetypes';

// ============================================================
// Store Interface
// ============================================================

interface AssessmentStore {
  // Data
  session: AssessmentSession | null;
  questions: AssessmentQuestion[];
  responses: Record<string, AssessmentResponse>;
  results: UserTraitResults | null;
  traits: CoreTrait[];
  archetypes: TraitArchetype[];

  // UI State
  currentQuestionIndex: number;
  isLoading: boolean;
  error: string | null;
  questionStartTime: number | null;

  // Actions
  setSession: (session: AssessmentSession | null) => void;
  setQuestions: (questions: AssessmentQuestion[]) => void;
  setTraits: (traits: CoreTrait[]) => void;
  setArchetypes: (archetypes: TraitArchetype[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Session Actions
  startSession: (userId: string) => Promise<void>;
  loadSession: (userId: string) => Promise<void>;
  abandonSession: () => Promise<void>;

  // Question Actions
  loadQuestions: () => Promise<void>;
  answerQuestion: (questionId: string, value: ResponseValue) => Promise<void>;
  skipQuestion: (questionId: string) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;

  // Result Actions
  submitAssessment: () => Promise<void>;
  reset: () => void;

  // Computed Getters
  getCurrentQuestion: () => AssessmentQuestion | null;
  getProgress: () => AssessmentProgress | null;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  isComplete: () => boolean;
  getSkippedQuestions: () => AssessmentQuestion[];
  hasAnsweredCurrent: () => boolean;
}

// ============================================================
// Initial State
// ============================================================

const initialState = {
  session: null,
  questions: [],
  responses: {},
  results: null,
  traits: [],
  archetypes: ARCHETYPES,
  currentQuestionIndex: 0,
  isLoading: false,
  error: null,
  questionStartTime: null,
};

// ============================================================
// Store Implementation
// ============================================================

export const useAssessmentStore = create<AssessmentStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================
      // Basic Setters
      // ========================================

      setSession: (session) => set({ session }),
      setQuestions: (questions) => set({ questions }),
      setTraits: (traits) => set({ traits }),
      setArchetypes: (archetypes) => set({ archetypes }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // ========================================
      // Session Actions
      // ========================================

      startSession: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/assessment/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });

          if (!response.ok) {
            throw new Error('Failed to start assessment session');
          }

          const data = await response.json();

          set({
            session: data.session,
            currentQuestionIndex: data.session.currentQuestionIndex || 0,
            responses: {},
            results: null,
            questionStartTime: Date.now(),
            isLoading: false,
          });

          // Load questions if not already loaded
          if (get().questions.length === 0) {
            await get().loadQuestions();
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      loadSession: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/assessment/session?userId=${userId}`);

          if (!response.ok) {
            // No existing session - that's fine
            set({ session: null, isLoading: false });
            return;
          }

          const data = await response.json();

          if (data.session) {
            set({
              session: data.session,
              currentQuestionIndex: data.session.currentQuestionIndex || 0,
              responses: data.responses || {},
              results: data.results || null,
              questionStartTime: Date.now(),
            });

            // Load questions if not already loaded
            if (get().questions.length === 0) {
              await get().loadQuestions();
            }
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      abandonSession: async () => {
        const { session } = get();
        if (!session) return;

        set({ isLoading: true });

        try {
          await fetch(`/api/assessment/session/${session.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'abandoned' }),
          });

          set({
            session: null,
            responses: {},
            currentQuestionIndex: 0,
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // ========================================
      // Question Actions
      // ========================================

      loadQuestions: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/assessment/questions');

          if (!response.ok) {
            throw new Error('Failed to load questions');
          }

          const data = await response.json();
          set({ questions: data.questions || [], isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      answerQuestion: async (questionId: string, value: ResponseValue) => {
        const { session, questionStartTime } = get();
        if (!session) return;

        const timeSpentMs = questionStartTime ? Date.now() - questionStartTime : undefined;

        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/assessment/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: session.id,
              questionId,
              responseValue: value,
              timeSpentMs,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to save response');
          }

          const data = await response.json();

          // Update local state
          set((state) => ({
            responses: {
              ...state.responses,
              [questionId]: data.response,
            },
            isLoading: false,
            questionStartTime: Date.now(),
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      skipQuestion: async (questionId: string) => {
        const { session } = get();
        if (!session) return;

        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/assessment/skip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: session.id,
              questionId,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to skip question');
          }

          const data = await response.json();

          // Update session with new skipped IDs
          set((state) => ({
            session: state.session
              ? {
                  ...state.session,
                  skippedQuestionIds: data.skippedQuestionIds,
                }
              : null,
            responses: {
              ...state.responses,
              [questionId]: {
                id: data.responseId || questionId,
                sessionId: session.id,
                questionId,
                userId: session.userId,
                responseValue: { value: 0 },
                wasSkipped: true,
                answeredAt: new Date().toISOString(),
              },
            },
            isLoading: false,
            questionStartTime: Date.now(),
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      nextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        if (currentQuestionIndex < questions.length - 1) {
          set({
            currentQuestionIndex: currentQuestionIndex + 1,
            questionStartTime: Date.now(),
          });
        }
      },

      previousQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
          set({
            currentQuestionIndex: currentQuestionIndex - 1,
            questionStartTime: Date.now(),
          });
        }
      },

      goToQuestion: (index: number) => {
        const { questions } = get();
        if (index >= 0 && index < questions.length) {
          set({
            currentQuestionIndex: index,
            questionStartTime: Date.now(),
          });
        }
      },

      // ========================================
      // Result Actions
      // ========================================

      submitAssessment: async () => {
        const { session, responses, questions, archetypes } = get();
        if (!session) return;

        set({ isLoading: true, error: null });

        try {
          // Calculate scores locally
          const responseArray = Object.values(responses);
          const traitScores = calculateTraitScores(responseArray, questions);
          const topTraits = getTopTraits(traitScores, 5);
          const archetype = determineArchetype(traitScores, archetypes);

          // Submit to server
          const response = await fetch('/api/assessment/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: session.id,
              traitScores,
              topTraits,
              archetypeCode: archetype.code,
              archetypeName: archetype.name,
              archetypeDescription: archetype.description,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to save results');
          }

          const data = await response.json();

          set({
            results: data.results,
            session: {
              ...session,
              status: 'completed',
              completedAt: new Date().toISOString(),
            },
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      reset: () => {
        set(initialState);
      },

      // ========================================
      // Computed Getters
      // ========================================

      getCurrentQuestion: () => {
        const { questions, currentQuestionIndex } = get();
        return questions[currentQuestionIndex] || null;
      },

      getProgress: () => {
        const { session, responses, questions, currentQuestionIndex } = get();
        if (!session) return null;

        const answeredCount = Object.values(responses).filter((r) => !r.wasSkipped).length;
        const skippedCount = Object.values(responses).filter((r) => r.wasSkipped).length;
        const totalQuestions = questions.length;

        return {
          sessionId: session.id,
          status: session.status,
          currentIndex: currentQuestionIndex,
          totalQuestions,
          skippedCount,
          answeredCount,
          progressPercent:
            totalQuestions > 0 ? ((answeredCount + skippedCount) / totalQuestions) * 100 : 0,
        };
      },

      canGoNext: () => {
        const { currentQuestionIndex, questions } = get();
        return currentQuestionIndex < questions.length - 1;
      },

      canGoPrevious: () => {
        const { currentQuestionIndex } = get();
        return currentQuestionIndex > 0;
      },

      isComplete: () => {
        const { questions, responses } = get();
        if (questions.length === 0) return false;

        // All questions must have a response (answered or skipped)
        return questions.every((q) => responses[q.id]);
      },

      getSkippedQuestions: () => {
        const { questions, responses } = get();
        return questions.filter((q) => responses[q.id]?.wasSkipped);
      },

      hasAnsweredCurrent: () => {
        const { questions, currentQuestionIndex, responses } = get();
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return false;
        const response = responses[currentQuestion.id];
        return response !== undefined && !response.wasSkipped;
      },
    }),
    {
      name: 'assessment-storage',
      partialize: (state) => ({
        // Only persist certain fields
        session: state.session,
        responses: state.responses,
        currentQuestionIndex: state.currentQuestionIndex,
        results: state.results,
      }),
    }
  )
);

// ============================================================
// Selectors (for performance optimization)
// ============================================================

export const selectSession = (state: AssessmentStore) => state.session;
export const selectQuestions = (state: AssessmentStore) => state.questions;
export const selectCurrentQuestion = (state: AssessmentStore) => state.getCurrentQuestion();
export const selectProgress = (state: AssessmentStore) => state.getProgress();
export const selectResults = (state: AssessmentStore) => state.results;
export const selectIsLoading = (state: AssessmentStore) => state.isLoading;
export const selectError = (state: AssessmentStore) => state.error;
export const selectIsComplete = (state: AssessmentStore) => state.isComplete();
