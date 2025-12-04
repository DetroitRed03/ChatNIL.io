/**
 * Analytics Event Types
 * Type-safe definitions for all analytics events tracked in the application
 */

import type { UserRole } from './common';

// ============================================================================
// User Events
// ============================================================================

export interface UserSignupEvent {
  event: 'user_signup';
  properties: {
    user_id: string;
    role: UserRole;
    signup_method: 'email';
    timestamp: string;
  };
}

export interface UserLoginEvent {
  event: 'user_login';
  properties: {
    user_id: string;
    role: UserRole;
    login_method: 'email';
  };
}

export interface UserLogoutEvent {
  event: 'user_logout';
  properties: {
    user_id: string;
    role: UserRole;
    session_duration_minutes: number;
  };
}

// ============================================================================
// Onboarding Events
// ============================================================================

export interface OnboardingStartedEvent {
  event: 'onboarding_started';
  properties: {
    user_id: string;
    role: UserRole;
  };
}

export interface OnboardingStepCompletedEvent {
  event: 'onboarding_step_completed';
  properties: {
    user_id: string;
    role: UserRole;
    step_index: number;
    step_name: string;
  };
}

export interface OnboardingCompletedEvent {
  event: 'onboarding_completed';
  properties: {
    user_id: string;
    role: UserRole;
    completion_time_minutes: number;
    profile_completion_percentage: number;
  };
}

// ============================================================================
// Chat/Message Events
// ============================================================================

export interface MessageSentEvent {
  event: 'message_sent';
  properties: {
    user_id: string;
    role: UserRole;
    message_length: number;
    has_attachments: boolean;
    session_id: string;
  };
}

export interface AIResponseReceivedEvent {
  event: 'ai_response_received';
  properties: {
    user_id: string;
    role: UserRole;
    response_time_ms: number;
    token_count_estimate: number;
    session_id: string;
  };
}

export interface ChatSessionStartedEvent {
  event: 'chat_session_started';
  properties: {
    user_id: string;
    role: UserRole;
    session_id: string;
  };
}

export interface ChatSessionEndedEvent {
  event: 'chat_session_ended';
  properties: {
    user_id: string;
    role: UserRole;
    session_id: string;
    duration_minutes: number;
    message_count: number;
  };
}

// ============================================================================
// Quiz Events
// ============================================================================

export interface QuizStartedEvent {
  event: 'quiz_started';
  properties: {
    user_id: string;
    role: UserRole;
    category: string;
    difficulty?: string;
    question_count?: number;
    session_id: string;
  };
}

export interface QuizQuestionAnsweredEvent {
  event: 'quiz_question_answered';
  properties: {
    user_id: string;
    role: UserRole;
    session_id: string;
    question_id: string;
    is_correct: boolean;
    time_taken_seconds: number;
  };
}

export interface QuizCompletedEvent {
  event: 'quiz_completed';
  properties: {
    user_id: string;
    role: UserRole;
    session_id: string;
    category: string;
    difficulty?: string;
    score_percentage: number;
    time_taken_seconds: number;
    questions_total: number;
    questions_correct: number;
  };
}

// ============================================================================
// Badge Events
// ============================================================================

export interface BadgeEarnedEvent {
  event: 'badge_earned';
  properties: {
    user_id: string;
    role: UserRole;
    badge_id: string;
    badge_name: string;
    rarity: string;
    points: number;
    trigger_action: string;
  };
}

// ============================================================================
// File Upload Events
// ============================================================================

export interface FileUploadedEvent {
  event: 'file_uploaded';
  properties: {
    user_id: string;
    role: UserRole;
    file_type: string;
    file_size_bytes: number;
    upload_context: 'profile' | 'chat' | 'other';
  };
}

export interface FileUploadFailedEvent {
  event: 'file_upload_failed';
  properties: {
    user_id: string;
    role: UserRole;
    file_type: string;
    file_size_bytes: number;
    error_reason: string;
    upload_context: 'profile' | 'chat' | 'other';
  };
}

// ============================================================================
// AI Metrics Events
// ============================================================================

export interface AIPromptSentEvent {
  event: 'ai_prompt_sent';
  properties: {
    user_id: string;
    role: UserRole;
    prompt_length: number;
    category: string;
    session_id: string;
  };
}

export interface AIResponseGeneratedEvent {
  event: 'ai_response_generated';
  properties: {
    user_id: string;
    role: UserRole;
    response_time_ms: number;
    token_count_estimate: number;
    cost_estimate_usd: number;
    session_id: string;
  };
}

export interface AIErrorEvent {
  event: 'ai_error';
  properties: {
    user_id: string;
    role: UserRole;
    error_type: string;
    prompt_category: string;
    session_id: string;
  };
}

export interface AIFeedbackEvent {
  event: 'ai_feedback';
  properties: {
    user_id: string;
    role: UserRole;
    rating: 'positive' | 'negative';
    message_id: string;
    feedback_text?: string;
    prompt_category: string;
  };
}

// ============================================================================
// Union type of all events
// ============================================================================

export type AnalyticsEvent =
  | UserSignupEvent
  | UserLoginEvent
  | UserLogoutEvent
  | OnboardingStartedEvent
  | OnboardingStepCompletedEvent
  | OnboardingCompletedEvent
  | MessageSentEvent
  | AIResponseReceivedEvent
  | ChatSessionStartedEvent
  | ChatSessionEndedEvent
  | QuizStartedEvent
  | QuizQuestionAnsweredEvent
  | QuizCompletedEvent
  | BadgeEarnedEvent
  | FileUploadedEvent
  | FileUploadFailedEvent
  | AIPromptSentEvent
  | AIResponseGeneratedEvent
  | AIErrorEvent
  | AIFeedbackEvent;

// ============================================================================
// Helper Types
// ============================================================================

export type EventName = AnalyticsEvent['event'];
export type EventProperties<T extends EventName> = Extract<
  AnalyticsEvent,
  { event: T }
>['properties'];
