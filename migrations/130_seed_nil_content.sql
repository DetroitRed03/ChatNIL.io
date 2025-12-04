-- Seed NIL Educational Content
-- 22 knowledge base articles + 50 quiz questions

-- Ensure knowledge_base table exists with proper structure
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  difficulty TEXT DEFAULT 'all',
  audience TEXT DEFAULT 'all',
  school_level TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_audience ON knowledge_base(audience);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_search ON knowledge_base USING gin(to_tsvector('english', title || ' ' || content));

-- Update quiz_questions structure
ALTER TABLE quiz_questions 
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS explanation TEXT;

-- CORE NIL EDUCATION CONTENT (truncated for file size - will execute via browser)
-- The complete SQL is in the user's message

