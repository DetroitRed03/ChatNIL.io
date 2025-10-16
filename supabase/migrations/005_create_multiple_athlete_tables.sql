-- Migration: Create tables for multiple athlete relationships
-- This migration creates tables to support parents with multiple athletes and coaches with team rosters

-- Table for parent-athletes relationship (supports multiple children per parent)
CREATE TABLE IF NOT EXISTS parent_athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    athlete_name TEXT NOT NULL,
    athlete_email TEXT,
    school TEXT,
    sport TEXT,
    grade_level TEXT CHECK (grade_level IN ('freshman', 'sophomore', 'junior', 'senior', 'graduate')),
    has_nil_deals BOOLEAN DEFAULT false,
    nil_status TEXT CHECK (nil_status IN ('yes', 'no', 'exploring')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT parent_athletes_unique_parent_email UNIQUE (parent_id, athlete_email)
);

-- Table for coach-roster management (supports multiple athletes per coach)
CREATE TABLE IF NOT EXISTS coach_roster (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES users(id) ON DELETE CASCADE, -- For when athlete has account
    athlete_name TEXT NOT NULL,
    athlete_email TEXT,
    sport TEXT,
    position TEXT,
    jersey_number TEXT,
    eligibility_status TEXT,
    nil_eligible BOOLEAN DEFAULT true,
    team_level TEXT CHECK (team_level IN ('varsity', 'jv', 'club', 'travel')),
    season_start DATE,
    season_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT coach_roster_unique_coach_athlete UNIQUE (coach_id, athlete_email),
    CONSTRAINT coach_roster_unique_jersey UNIQUE (coach_id, jersey_number) -- Unique jersey per coach
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parent_athletes_parent_id ON parent_athletes(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_athletes_athlete_email ON parent_athletes(athlete_email);
CREATE INDEX IF NOT EXISTS idx_coach_roster_coach_id ON coach_roster(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_roster_athlete_id ON coach_roster(athlete_id);
CREATE INDEX IF NOT EXISTS idx_coach_roster_athlete_email ON coach_roster(athlete_email);

-- Row Level Security (RLS) policies
ALTER TABLE parent_athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_roster ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parent_athletes table
CREATE POLICY "Parents can view their own athlete records" ON parent_athletes
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert their own athlete records" ON parent_athletes
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their own athlete records" ON parent_athletes
    FOR UPDATE USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their own athlete records" ON parent_athletes
    FOR DELETE USING (auth.uid() = parent_id);

-- RLS Policies for coach_roster table
CREATE POLICY "Coaches can view their own roster" ON coach_roster
    FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert to their own roster" ON coach_roster
    FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own roster" ON coach_roster
    FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete from their own roster" ON coach_roster
    FOR DELETE USING (auth.uid() = coach_id);

-- Athletes can view records where they are referenced
CREATE POLICY "Athletes can view their parent relationships" ON parent_athletes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.email = parent_athletes.athlete_email
        )
    );

CREATE POLICY "Athletes can view their coach relationships" ON coach_roster
    FOR SELECT USING (
        auth.uid() = athlete_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.email = coach_roster.athlete_email
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_parent_athletes_updated_at
    BEFORE UPDATE ON parent_athletes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coach_roster_updated_at
    BEFORE UPDATE ON coach_roster
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE parent_athletes IS 'Stores information about athletes connected to parent accounts, supporting multiple children per parent';
COMMENT ON TABLE coach_roster IS 'Stores coach roster information, supporting multiple athletes per coach with team management details';
COMMENT ON COLUMN parent_athletes.nil_status IS 'Current NIL deal status: yes, no, or exploring';
COMMENT ON COLUMN coach_roster.nil_eligible IS 'Whether the athlete is eligible for NIL deals based on their status';
COMMENT ON COLUMN coach_roster.team_level IS 'Team level: varsity, jv, club, or travel';