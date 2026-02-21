-- Migration 031: Create deal_analyses table for Deal Analysis Hub
-- Stores AI-analyzed screenshots of NIL deal offers with compliance scores

CREATE TABLE IF NOT EXISTS deal_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Source image
  image_url TEXT NOT NULL,
  image_filename TEXT NOT NULL,
  image_mime_type TEXT,
  image_size_bytes INTEGER,

  -- GPT-4o extraction results
  extraction_result JSONB,
  extracted_brand TEXT,
  extracted_compensation DECIMAL(12,2),
  extracted_deal_type TEXT,
  extracted_deliverables TEXT,
  extracted_red_flags TEXT[],
  extraction_confidence DECIMAL(3,2),

  -- Compliance scoring
  compliance_result JSONB,
  compliance_score INTEGER,
  compliance_status TEXT CHECK (compliance_status IN ('green','yellow','red')),

  -- Deal conversion
  converted_to_deal_id UUID,
  converted_at TIMESTAMPTZ,

  -- Processing status
  analysis_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (analysis_status IN ('pending','uploading','extracting','scoring','completed','failed')),
  error_message TEXT,
  processing_time_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deal_analyses_user_id ON deal_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_analyses_status ON deal_analyses(analysis_status);
CREATE INDEX IF NOT EXISTS idx_deal_analyses_created ON deal_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deal_analyses_compliance ON deal_analyses(compliance_status);

-- RLS
ALTER TABLE deal_analyses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own analyses" ON deal_analyses
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own analyses" ON deal_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own analyses" ON deal_analyses
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access to deal_analyses" ON deal_analyses
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Updated_at trigger
DO $$ BEGIN
  CREATE TRIGGER deal_analyses_updated_at
    BEFORE UPDATE ON deal_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;
