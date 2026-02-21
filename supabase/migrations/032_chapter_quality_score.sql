-- Add quality score and AI feedback columns to chapter_progress
-- These support the AI-powered coaching experience for text questions

ALTER TABLE chapter_progress
  ADD COLUMN IF NOT EXISTS quality_score integer,
  ADD COLUMN IF NOT EXISTS ai_feedback text;
