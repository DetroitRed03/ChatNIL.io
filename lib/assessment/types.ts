/**
 * Core Traits Assessment Types
 *
 * TypeScript interfaces for the personality/values assessment feature
 * that helps athletes discover their personal brand identity.
 */

// ============================================================
// Trait Types
// ============================================================

export type TraitCode =
  | 'leadership'
  | 'creativity'
  | 'community_focus'
  | 'competition'
  | 'authenticity'
  | 'resilience'
  | 'teamwork'
  | 'ambition'
  | 'charisma'
  | 'discipline'
  | 'innovation'
  | 'loyalty';

export type TraitCategory = 'personality' | 'values' | 'style' | 'motivation';

export interface CoreTrait {
  id: string;
  traitCode: TraitCode;
  traitName: string;
  traitDescription: string;
  category: TraitCategory;
  iconName: string;
  colorHex: string;
  displayOrder: number;
}

// ============================================================
// Question Types
// ============================================================

export type QuestionType = 'scale' | 'choice' | 'ranking';

export interface ChoiceOption {
  value: string;
  label: string;
  weights: Partial<Record<TraitCode, number>>;
}

export interface RankingOption {
  value: string;
  label: string;
}

export interface AssessmentQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  options?: ChoiceOption[] | RankingOption[];
  traitWeights: Partial<Record<TraitCode, number>>;
  questionOrder: number;
  section?: string;
  isRequired: boolean;
  helpText?: string;
  isActive: boolean;
}

// ============================================================
// Session Types
// ============================================================

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface AssessmentSession {
  id: string;
  userId: string;
  status: SessionStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  skippedQuestionIds: string[];
  startedAt: string;
  completedAt?: string;
  lastActivityAt: string;
  version: number;
}

export interface AssessmentProgress {
  sessionId: string;
  status: SessionStatus;
  currentIndex: number;
  totalQuestions: number;
  skippedCount: number;
  answeredCount: number;
  progressPercent: number;
}

// ============================================================
// Response Types
// ============================================================

export type ResponseValue =
  | { value: number } // scale
  | { value: string } // choice
  | { value: string[] }; // ranking

export interface AssessmentResponse {
  id: string;
  sessionId: string;
  questionId: string;
  userId: string;
  responseValue: ResponseValue;
  wasSkipped: boolean;
  skippedAt?: string;
  answeredAt: string;
  timeSpentMs?: number;
}

// ============================================================
// Results Types
// ============================================================

export type TraitScores = Partial<Record<TraitCode, number>>;

export interface UserTraitResults {
  id: string;
  userId: string;
  sessionId: string;
  traitScores: TraitScores;
  topTraits: TraitCode[];
  archetypeCode: string;
  archetypeName: string;
  archetypeDescription: string;
  calculatedAt: string;
}

export interface TraitResult {
  code: TraitCode;
  name: string;
  score: number;
  description: string;
  iconName: string;
  colorHex: string;
}

// ============================================================
// Archetype Types
// ============================================================

export interface ArchetypeRequirement {
  min: number;
}

export interface TraitArchetype {
  id: string;
  code: string;
  name: string;
  description: string;
  definingTraits: Partial<Record<TraitCode, ArchetypeRequirement>>;
  exampleAthletes: string[];
  aiPersonalityHint: string;
  iconName: string;
  colorHex: string;
}

// ============================================================
// Store Types
// ============================================================

export interface AssessmentState {
  // Data
  session: AssessmentSession | null;
  questions: AssessmentQuestion[];
  responses: Map<string, AssessmentResponse>;
  results: UserTraitResults | null;
  traits: CoreTrait[];
  archetypes: TraitArchetype[];

  // UI State
  currentQuestionIndex: number;
  isLoading: boolean;
  error: string | null;
  questionStartTime: number | null;

  // Actions
  startSession: () => Promise<void>;
  loadSession: () => Promise<void>;
  loadQuestions: () => Promise<void>;
  answerQuestion: (questionId: string, value: ResponseValue) => Promise<void>;
  skipQuestion: (questionId: string) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitAssessment: () => Promise<void>;
  reset: () => void;

  // Computed
  getCurrentQuestion: () => AssessmentQuestion | null;
  getProgress: () => AssessmentProgress | null;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  isComplete: () => boolean;
  getSkippedQuestions: () => AssessmentQuestion[];
}

// ============================================================
// API Types
// ============================================================

export interface CreateSessionResponse {
  sessionId: string;
  totalQuestions: number;
}

export interface SubmitResponseRequest {
  sessionId: string;
  questionId: string;
  responseValue: ResponseValue;
  timeSpentMs?: number;
}

export interface SkipQuestionRequest {
  sessionId: string;
  questionId: string;
}

export interface CalculateResultsRequest {
  sessionId: string;
}

export interface CalculateResultsResponse {
  traitScores: TraitScores;
  topTraits: TraitCode[];
  archetype: TraitArchetype;
}

// ============================================================
// Database Row Types (for Supabase)
// ============================================================

export interface CoreTraitRow {
  id: string;
  trait_code: string;
  trait_name: string;
  trait_description: string;
  category: string;
  icon_name: string | null;
  color_hex: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AssessmentQuestionRow {
  id: string;
  question_text: string;
  question_type: string;
  options: any | null;
  trait_weights: Record<string, number>;
  question_order: number;
  section: string | null;
  is_required: boolean;
  help_text: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssessmentSessionRow {
  id: string;
  user_id: string;
  status: string;
  current_question_index: number;
  total_questions: number;
  skipped_question_ids: string[];
  started_at: string;
  completed_at: string | null;
  last_activity_at: string;
  version: number;
}

export interface AssessmentResponseRow {
  id: string;
  session_id: string;
  question_id: string;
  user_id: string;
  response_value: any;
  was_skipped: boolean;
  skipped_at: string | null;
  answered_at: string;
  time_spent_ms: number | null;
}

export interface UserTraitResultsRow {
  id: string;
  user_id: string;
  session_id: string;
  trait_scores: Record<string, number>;
  top_traits: string[];
  archetype_code: string | null;
  archetype_name: string | null;
  archetype_description: string | null;
  calculated_at: string;
}

export interface TraitArchetypeRow {
  id: string;
  archetype_code: string;
  archetype_name: string;
  archetype_description: string;
  defining_traits: Record<string, { min: number }>;
  example_athletes: string[] | null;
  ai_personality_hint: string | null;
  icon_name: string | null;
  color_hex: string | null;
  created_at: string;
}

// ============================================================
// Type Guards
// ============================================================

export function isChoiceOption(option: unknown): option is ChoiceOption {
  return (
    typeof option === 'object' &&
    option !== null &&
    'value' in option &&
    'label' in option &&
    'weights' in option
  );
}

export function isRankingOption(option: unknown): option is RankingOption {
  return (
    typeof option === 'object' &&
    option !== null &&
    'value' in option &&
    'label' in option &&
    !('weights' in option)
  );
}

export function isScaleResponse(value: ResponseValue): value is { value: number } {
  return typeof value.value === 'number';
}

export function isChoiceResponse(value: ResponseValue): value is { value: string } {
  return typeof value.value === 'string';
}

export function isRankingResponse(value: ResponseValue): value is { value: string[] } {
  return Array.isArray(value.value);
}

// ============================================================
// Mappers
// ============================================================

export function mapCoreTraitRow(row: CoreTraitRow): CoreTrait {
  return {
    id: row.id,
    traitCode: row.trait_code as TraitCode,
    traitName: row.trait_name,
    traitDescription: row.trait_description,
    category: row.category as TraitCategory,
    iconName: row.icon_name || 'Circle',
    colorHex: row.color_hex || '#6B7280',
    displayOrder: row.display_order,
  };
}

export function mapAssessmentQuestionRow(row: AssessmentQuestionRow): AssessmentQuestion {
  return {
    id: row.id,
    questionText: row.question_text,
    questionType: row.question_type as QuestionType,
    options: row.options,
    traitWeights: row.trait_weights as Partial<Record<TraitCode, number>>,
    questionOrder: row.question_order,
    section: row.section || undefined,
    isRequired: row.is_required,
    helpText: row.help_text || undefined,
    isActive: row.is_active,
  };
}

export function mapAssessmentSessionRow(row: AssessmentSessionRow): AssessmentSession {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status as SessionStatus,
    currentQuestionIndex: row.current_question_index,
    totalQuestions: row.total_questions,
    skippedQuestionIds: row.skipped_question_ids || [],
    startedAt: row.started_at,
    completedAt: row.completed_at || undefined,
    lastActivityAt: row.last_activity_at,
    version: row.version,
  };
}

export function mapTraitArchetypeRow(row: TraitArchetypeRow): TraitArchetype {
  return {
    id: row.id,
    code: row.archetype_code,
    name: row.archetype_name,
    description: row.archetype_description,
    definingTraits: row.defining_traits as Partial<Record<TraitCode, ArchetypeRequirement>>,
    exampleAthletes: row.example_athletes || [],
    aiPersonalityHint: row.ai_personality_hint || '',
    iconName: row.icon_name || 'Circle',
    colorHex: row.color_hex || '#6B7280',
  };
}
