-- ChatNIL - Create Relationship Tables for Parent-Athlete and Coach-Athlete Connections
-- This migration creates the relationship tables to link parents and coaches with athletes

-- Create parent-athlete relationships table
CREATE TABLE IF NOT EXISTS parent_athlete_relationships (
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- 'mother', 'father', 'guardian', 'step_parent', etc.
  permissions JSONB DEFAULT '{}', -- JSON object for specific permissions
  verified BOOLEAN DEFAULT false, -- Whether the relationship has been verified
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (parent_id, athlete_id),

  -- Constraints to ensure role validity
  CONSTRAINT parent_athlete_rel_parent_role_check
    CHECK (EXISTS (SELECT 1 FROM users WHERE id = parent_id AND role = 'parent')),
  CONSTRAINT parent_athlete_rel_athlete_role_check
    CHECK (EXISTS (SELECT 1 FROM users WHERE id = athlete_id AND role = 'athlete'))
);

-- Create coach-athlete relationships table
CREATE TABLE IF NOT EXISTS coach_athlete_relationships (
  coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_role TEXT, -- 'starter', 'bench', 'redshirt', 'walk_on', etc.
  sport TEXT, -- The specific sport for this relationship (coaches may coach multiple sports)
  season TEXT, -- '2024-25', 'spring-2024', etc.
  permissions JSONB DEFAULT '{}', -- JSON object for specific permissions
  active BOOLEAN DEFAULT true, -- Whether the relationship is currently active
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (coach_id, athlete_id),

  -- Constraints to ensure role validity
  CONSTRAINT coach_athlete_rel_coach_role_check
    CHECK (EXISTS (SELECT 1 FROM users WHERE id = coach_id AND role = 'coach')),
  CONSTRAINT coach_athlete_rel_athlete_role_check
    CHECK (EXISTS (SELECT 1 FROM users WHERE id = athlete_id AND role = 'athlete'))
);

-- Enable Row Level Security
ALTER TABLE parent_athlete_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_athlete_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parent_athlete_relationships
-- Parents can see their own relationships
DROP POLICY IF EXISTS "Parents can read own relationships" ON parent_athlete_relationships;
CREATE POLICY "Parents can read own relationships" ON parent_athlete_relationships
  FOR SELECT USING (auth.uid() = parent_id);

-- Athletes can see their parent relationships
DROP POLICY IF EXISTS "Athletes can read parent relationships" ON parent_athlete_relationships;
CREATE POLICY "Athletes can read parent relationships" ON parent_athlete_relationships
  FOR SELECT USING (auth.uid() = athlete_id);

-- Parents can create relationships with athletes (pending verification)
DROP POLICY IF EXISTS "Parents can create athlete relationships" ON parent_athlete_relationships;
CREATE POLICY "Parents can create athlete relationships" ON parent_athlete_relationships
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Parents can update their own relationships
DROP POLICY IF EXISTS "Parents can update own relationships" ON parent_athlete_relationships;
CREATE POLICY "Parents can update own relationships" ON parent_athlete_relationships
  FOR UPDATE USING (auth.uid() = parent_id);

-- RLS Policies for coach_athlete_relationships
-- Coaches can see their own relationships
DROP POLICY IF EXISTS "Coaches can read own relationships" ON coach_athlete_relationships;
CREATE POLICY "Coaches can read own relationships" ON coach_athlete_relationships
  FOR SELECT USING (auth.uid() = coach_id);

-- Athletes can see their coach relationships
DROP POLICY IF EXISTS "Athletes can read coach relationships" ON coach_athlete_relationships;
CREATE POLICY "Athletes can read coach relationships" ON coach_athlete_relationships
  FOR SELECT USING (auth.uid() = athlete_id);

-- Coaches can create relationships with athletes
DROP POLICY IF EXISTS "Coaches can create athlete relationships" ON coach_athlete_relationships;
CREATE POLICY "Coaches can create athlete relationships" ON coach_athlete_relationships
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

-- Coaches can update their own relationships
DROP POLICY IF EXISTS "Coaches can update own relationships" ON coach_athlete_relationships;
CREATE POLICY "Coaches can update own relationships" ON coach_athlete_relationships
  FOR UPDATE USING (auth.uid() = coach_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_parent_athlete_rel_parent ON parent_athlete_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_athlete_rel_athlete ON parent_athlete_relationships(athlete_id);
CREATE INDEX IF NOT EXISTS idx_parent_athlete_rel_verified ON parent_athlete_relationships(verified);
CREATE INDEX IF NOT EXISTS idx_parent_athlete_rel_created ON parent_athlete_relationships(created_at);

CREATE INDEX IF NOT EXISTS idx_coach_athlete_rel_coach ON coach_athlete_relationships(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_athlete_rel_athlete ON coach_athlete_relationships(athlete_id);
CREATE INDEX IF NOT EXISTS idx_coach_athlete_rel_active ON coach_athlete_relationships(active);
CREATE INDEX IF NOT EXISTS idx_coach_athlete_rel_sport ON coach_athlete_relationships(sport);
CREATE INDEX IF NOT EXISTS idx_coach_athlete_rel_season ON coach_athlete_relationships(season);

-- Create trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_relationship_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_parent_athlete_rel_updated_at ON parent_athlete_relationships;
CREATE TRIGGER update_parent_athlete_rel_updated_at
    BEFORE UPDATE ON parent_athlete_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_relationship_updated_at();

DROP TRIGGER IF EXISTS update_coach_athlete_rel_updated_at ON coach_athlete_relationships;
CREATE TRIGGER update_coach_athlete_rel_updated_at
    BEFORE UPDATE ON coach_athlete_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_relationship_updated_at();

-- Add helpful comments
COMMENT ON TABLE parent_athlete_relationships IS 'Links parent users with their athlete children';
COMMENT ON TABLE coach_athlete_relationships IS 'Links coach users with the athletes they manage';

COMMENT ON COLUMN parent_athlete_relationships.relationship_type IS 'Type of relationship: mother, father, guardian, step_parent, etc.';
COMMENT ON COLUMN parent_athlete_relationships.permissions IS 'JSON object defining what the parent can access/do';
COMMENT ON COLUMN parent_athlete_relationships.verified IS 'Whether the relationship has been verified by the athlete or admin';

COMMENT ON COLUMN coach_athlete_relationships.team_role IS 'Athletes role on the team: starter, bench, redshirt, etc.';
COMMENT ON COLUMN coach_athlete_relationships.sport IS 'Specific sport for this coaching relationship';
COMMENT ON COLUMN coach_athlete_relationships.season IS 'Season identifier for this relationship';
COMMENT ON COLUMN coach_athlete_relationships.permissions IS 'JSON object defining what the coach can access/do';
COMMENT ON COLUMN coach_athlete_relationships.active IS 'Whether the coaching relationship is currently active';