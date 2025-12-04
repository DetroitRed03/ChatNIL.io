-- ============================================================================
-- Migration 040 (Minimal): Agency Platform Tables
-- ============================================================================
-- Creates essential tables for agency matchmaking demo
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Create athlete_public_profiles table
CREATE TABLE IF NOT EXISTS athlete_public_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Personal Info
  display_name TEXT NOT NULL,
  sport TEXT NOT NULL,
  school TEXT,
  graduation_year INTEGER,
  city TEXT,
  state TEXT,
  gender TEXT,

  -- Profile
  bio TEXT,
  profile_picture_url TEXT,
  cover_photo_url TEXT,

  -- Partnership Preferences
  is_available_for_partnerships BOOLEAN DEFAULT true,
  partnership_types TEXT[], -- ['sponsored_posts', 'events', 'appearances']
  min_deal_value INTEGER, -- in cents

  -- Visibility
  is_profile_public BOOLEAN DEFAULT true,
  show_contact_info BOOLEAN DEFAULT false,

  -- Metadata
  slug TEXT UNIQUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agency_campaigns table
CREATE TABLE IF NOT EXISTS agency_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  campaign_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  description TEXT,

  -- Budget
  total_budget INTEGER, -- in cents
  budget_per_athlete INTEGER, -- in cents

  -- Targeting
  target_sports TEXT[],
  target_states TEXT[],
  target_school_levels TEXT[], -- ['high_school', 'college']
  min_followers INTEGER,
  min_engagement_rate DECIMAL(5,2),

  -- Timeline
  start_date DATE,
  end_date DATE,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),

  -- Deliverables
  required_deliverables JSONB, -- {posts: 3, stories: 5, video: 1}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create campaign_athlete_invites table
CREATE TABLE IF NOT EXISTS campaign_athlete_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES agency_campaigns(id) ON DELETE CASCADE NOT NULL,
  athlete_profile_id UUID REFERENCES athlete_public_profiles(id) ON DELETE CASCADE NOT NULL,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),

  -- Offer details
  offered_amount INTEGER NOT NULL, -- in cents
  deliverables JSONB NOT NULL,
  terms TEXT,

  -- Athlete response
  athlete_response TEXT,
  responded_at TIMESTAMPTZ,

  -- Performance tracking
  content_submitted JSONB, -- Links to posts, etc.
  total_impressions INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  performance_score DECIMAL(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(campaign_id, athlete_profile_id)
);

-- Create agency_athlete_messages table
CREATE TABLE IF NOT EXISTS agency_athlete_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants
  agency_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  athlete_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Thread
  thread_id UUID NOT NULL, -- Group messages into conversations

  -- Message
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Who sent it
  message_text TEXT NOT NULL,
  attachments JSONB, -- File URLs, contract PDFs, etc.

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_athlete_public_profiles_user_id ON athlete_public_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_athlete_public_profiles_slug ON athlete_public_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_athlete_public_profiles_sport ON athlete_public_profiles(sport);
CREATE INDEX IF NOT EXISTS idx_agency_campaigns_agency_user_id ON agency_campaigns(agency_user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_athlete_invites_campaign_id ON campaign_athlete_invites(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_athlete_invites_athlete_profile_id ON campaign_athlete_invites(athlete_profile_id);
CREATE INDEX IF NOT EXISTS idx_agency_athlete_messages_thread_id ON agency_athlete_messages(thread_id);

-- Enable RLS
ALTER TABLE athlete_public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_athlete_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_athlete_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON athlete_public_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON athlete_public_profiles;
DROP POLICY IF EXISTS "Agency users can view their campaigns" ON agency_campaigns;
DROP POLICY IF EXISTS "Agency users can create campaigns" ON agency_campaigns;
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON agency_campaigns;
DROP POLICY IF EXISTS "service_role_all_access_agency_campaigns" ON agency_campaigns;
DROP POLICY IF EXISTS "service_role_all_access_athlete_public_profiles" ON athlete_public_profiles;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone"
ON athlete_public_profiles FOR SELECT
USING (is_profile_public = true);

CREATE POLICY "Users can update own profile"
ON athlete_public_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Agency users can view their campaigns"
ON agency_campaigns FOR SELECT
USING (auth.uid() = agency_user_id);

CREATE POLICY "Agency users can create campaigns"
ON agency_campaigns FOR INSERT
WITH CHECK (auth.uid() = agency_user_id);

CREATE POLICY "Anyone can view active campaigns"
ON agency_campaigns FOR SELECT
USING (status IN ('active', 'draft'));

-- Service role bypass policies
CREATE POLICY "service_role_all_access_agency_campaigns"
ON agency_campaigns FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_access_athlete_public_profiles"
ON athlete_public_profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON athlete_public_profiles TO service_role;
GRANT ALL ON agency_campaigns TO service_role;
GRANT ALL ON campaign_athlete_invites TO service_role;
GRANT ALL ON agency_athlete_messages TO service_role;

GRANT SELECT ON athlete_public_profiles TO anon, authenticated;
GRANT SELECT ON agency_campaigns TO anon, authenticated;
