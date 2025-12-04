-- ============================================
-- AGENCY PLATFORM: Athlete Discovery & Talent Marketplace
-- Migration 040
-- ============================================
--
-- This migration creates the foundation for the agency platform,
-- transforming ChatNIL into a two-sided marketplace where:
-- - Athletes: Build their brand, learn NIL, get guidance
-- - Agencies: Discover talent, filter athletes, initiate deals
--
-- ============================================

-- ============================================
-- TABLE 1: ATHLETE PUBLIC PROFILES
-- ============================================
-- Public-facing athlete profiles that agencies can search and filter
-- This is what agencies see when discovering talent

CREATE TABLE IF NOT EXISTS athlete_public_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Basic Info
  display_name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  sport TEXT NOT NULL,
  position TEXT,
  school_name TEXT NOT NULL,
  school_level TEXT NOT NULL CHECK (school_level IN ('high_school', 'college')),
  graduation_year INTEGER,
  state TEXT NOT NULL,
  city TEXT,

  -- Social Media Handles
  instagram_handle TEXT,
  instagram_followers INTEGER DEFAULT 0,
  instagram_engagement_rate DECIMAL(5,2), -- e.g., 4.25%
  tiktok_handle TEXT,
  tiktok_followers INTEGER DEFAULT 0,
  tiktok_engagement_rate DECIMAL(5,2),
  twitter_handle TEXT,
  twitter_followers INTEGER DEFAULT 0,
  youtube_channel TEXT,
  youtube_subscribers INTEGER DEFAULT 0,

  -- FMV & Metrics
  estimated_fmv_min INTEGER, -- Minimum deal value in cents
  estimated_fmv_max INTEGER, -- Maximum deal value in cents
  total_followers INTEGER GENERATED ALWAYS AS (
    COALESCE(instagram_followers, 0) +
    COALESCE(tiktok_followers, 0) +
    COALESCE(twitter_followers, 0) +
    COALESCE(youtube_subscribers, 0)
  ) STORED,
  avg_engagement_rate DECIMAL(5,2),

  -- Brand Fit
  content_categories TEXT[], -- ['fitness', 'fashion', 'gaming', etc.]
  brand_values TEXT[], -- ['sustainability', 'innovation', 'community']
  audience_demographics JSONB, -- {age_range: '18-24', gender: 'mixed', location: 'US'}

  -- Availability
  is_available_for_partnerships BOOLEAN DEFAULT true,
  preferred_partnership_types TEXT[], -- ['sponsored_post', 'brand_ambassador', 'event_appearance']
  response_rate DECIMAL(5,2), -- How often they respond to messages (0-100%)
  avg_response_time_hours INTEGER,

  -- Verification
  is_verified BOOLEAN DEFAULT false, -- Platform verified
  verification_badges TEXT[], -- ['social_verified', 'ncaa_compliant', 'tax_ready']

  -- Stats
  total_partnerships_completed INTEGER DEFAULT 0,
  total_campaign_impressions BIGINT DEFAULT 0,
  avg_campaign_performance DECIMAL(5,2), -- Campaign success rate

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id),
  CONSTRAINT valid_fmv_range CHECK (estimated_fmv_min IS NULL OR estimated_fmv_max IS NULL OR estimated_fmv_min <= estimated_fmv_max),
  CONSTRAINT valid_engagement_rate CHECK (avg_engagement_rate IS NULL OR (avg_engagement_rate >= 0 AND avg_engagement_rate <= 100)),
  CONSTRAINT valid_response_rate CHECK (response_rate IS NULL OR (response_rate >= 0 AND response_rate <= 100))
);

-- ============================================
-- TABLE 2: ATHLETE PORTFOLIO ITEMS
-- ============================================
-- Showcase work, content samples, past campaigns

CREATE TABLE IF NOT EXISTS athlete_portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_profile_id UUID REFERENCES athlete_public_profiles(id) ON DELETE CASCADE NOT NULL,

  type TEXT NOT NULL CHECK (type IN ('post', 'video', 'campaign', 'testimonial')),
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT, -- Image or video URL
  external_url TEXT, -- Link to Instagram post, etc.

  -- Metrics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),

  -- Campaign info (if applicable)
  brand_name TEXT,
  campaign_name TEXT,

  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 3: AGENCY SAVED SEARCHES
-- ============================================
-- Agencies can save complex filter combinations

CREATE TABLE IF NOT EXISTS agency_saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  search_name TEXT NOT NULL,
  filters JSONB NOT NULL, -- Store all filter criteria

  -- Notifications
  notify_on_new_matches BOOLEAN DEFAULT false,
  last_notified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 4: AGENCY ATHLETE LISTS
-- ============================================
-- Like playlists - agencies can organize athletes

CREATE TABLE IF NOT EXISTS agency_athlete_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  list_name TEXT NOT NULL,
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 5: AGENCY ATHLETE LIST ITEMS
-- ============================================
-- Many-to-many: Lists contain athletes

CREATE TABLE IF NOT EXISTS agency_athlete_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES agency_athlete_lists(id) ON DELETE CASCADE NOT NULL,
  athlete_profile_id UUID REFERENCES athlete_public_profiles(id) ON DELETE CASCADE NOT NULL,

  notes TEXT, -- Agency's private notes about this athlete
  tags TEXT[], -- ['potential', 'contacted', 'negotiating', 'approved']

  added_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(list_id, athlete_profile_id)
);

-- ============================================
-- TABLE 6: AGENCY CAMPAIGNS
-- ============================================
-- Marketing campaigns created by agencies

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

-- ============================================
-- TABLE 7: CAMPAIGN ATHLETE INVITES
-- ============================================
-- Track which athletes were invited to which campaigns

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

-- ============================================
-- TABLE 8: AGENCY ATHLETE MESSAGES
-- ============================================
-- Direct messages between agencies and athletes

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

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Athlete profiles - search and filter
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_sport ON athlete_public_profiles(sport);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_state ON athlete_public_profiles(state);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_school_level ON athlete_public_profiles(school_level);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_available ON athlete_public_profiles(is_available_for_partnerships);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_followers ON athlete_public_profiles(total_followers DESC);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_engagement ON athlete_public_profiles(avg_engagement_rate DESC);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_fmv_min ON athlete_public_profiles(estimated_fmv_min);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_user_id ON athlete_public_profiles(user_id);

-- Full text search on name and school
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_search ON athlete_public_profiles
  USING gin(to_tsvector('english', display_name || ' ' || school_name));

-- Portfolio items
CREATE INDEX IF NOT EXISTS idx_portfolio_athlete ON athlete_portfolio_items(athlete_profile_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON athlete_portfolio_items(is_featured, display_order);

-- Campaign invites
CREATE INDEX IF NOT EXISTS idx_campaign_invites_campaign ON campaign_athlete_invites(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_invites_athlete ON campaign_athlete_invites(athlete_profile_id);
CREATE INDEX IF NOT EXISTS idx_campaign_invites_status ON campaign_athlete_invites(status);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_thread ON agency_athlete_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_agency ON agency_athlete_messages(agency_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_athlete ON agency_athlete_messages(athlete_user_id);

-- Lists
CREATE INDEX IF NOT EXISTS idx_lists_agency ON agency_athlete_lists(agency_user_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list ON agency_athlete_list_items(list_id);

-- Campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_agency ON agency_campaigns(agency_user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON agency_campaigns(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE athlete_public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_athlete_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_athlete_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_athlete_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_athlete_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ATHLETE PUBLIC PROFILES POLICIES
-- ============================================

-- Anyone can VIEW athlete profiles (public data for discovery)
CREATE POLICY "Anyone can view athlete profiles"
  ON athlete_public_profiles
  FOR SELECT
  USING (true);

-- Athletes can INSERT their own profile
CREATE POLICY "Athletes can create own profile"
  ON athlete_public_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Athletes can UPDATE their own profile
CREATE POLICY "Athletes can update own profile"
  ON athlete_public_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Athletes can DELETE their own profile
CREATE POLICY "Athletes can delete own profile"
  ON athlete_public_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PORTFOLIO ITEMS POLICIES
-- ============================================

-- Anyone can view portfolio items
CREATE POLICY "Anyone can view portfolio items"
  ON athlete_portfolio_items
  FOR SELECT
  USING (true);

-- Athletes can manage their own portfolio
CREATE POLICY "Athletes can manage own portfolio"
  ON athlete_portfolio_items
  FOR ALL
  USING (
    athlete_profile_id IN (
      SELECT id FROM athlete_public_profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- AGENCY SAVED SEARCHES POLICIES
-- ============================================

-- Agencies can only see and manage their own saved searches
CREATE POLICY "Agencies manage own saved searches"
  ON agency_saved_searches
  FOR ALL
  USING (auth.uid() = agency_user_id);

-- ============================================
-- AGENCY LISTS POLICIES
-- ============================================

-- Agencies can only see and manage their own lists
CREATE POLICY "Agencies manage own lists"
  ON agency_athlete_lists
  FOR ALL
  USING (auth.uid() = agency_user_id);

-- Agencies can only see and manage their own list items
CREATE POLICY "Agencies manage own list items"
  ON agency_athlete_list_items
  FOR ALL
  USING (
    list_id IN (
      SELECT id FROM agency_athlete_lists WHERE agency_user_id = auth.uid()
    )
  );

-- ============================================
-- AGENCY CAMPAIGNS POLICIES
-- ============================================

-- Agencies can only see and manage their own campaigns
CREATE POLICY "Agencies manage own campaigns"
  ON agency_campaigns
  FOR ALL
  USING (auth.uid() = agency_user_id);

-- ============================================
-- CAMPAIGN INVITES POLICIES
-- ============================================

-- Agencies can see invites for their campaigns
CREATE POLICY "Agencies see own campaign invites"
  ON campaign_athlete_invites
  FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM agency_campaigns WHERE agency_user_id = auth.uid()
    )
  );

-- Agencies can create invites for their campaigns
CREATE POLICY "Agencies create campaign invites"
  ON campaign_athlete_invites
  FOR INSERT
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM agency_campaigns WHERE agency_user_id = auth.uid()
    )
  );

-- Agencies can update invites for their campaigns
CREATE POLICY "Agencies update campaign invites"
  ON campaign_athlete_invites
  FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM agency_campaigns WHERE agency_user_id = auth.uid()
    )
  );

-- Athletes can see invites sent to them
CREATE POLICY "Athletes see own invites"
  ON campaign_athlete_invites
  FOR SELECT
  USING (
    athlete_profile_id IN (
      SELECT id FROM athlete_public_profiles WHERE user_id = auth.uid()
    )
  );

-- Athletes can update invites sent to them (accept/decline)
CREATE POLICY "Athletes respond to invites"
  ON campaign_athlete_invites
  FOR UPDATE
  USING (
    athlete_profile_id IN (
      SELECT id FROM athlete_public_profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Agencies can see messages they sent or received
CREATE POLICY "Agencies see own messages"
  ON agency_athlete_messages
  FOR SELECT
  USING (auth.uid() = agency_user_id OR auth.uid() = sender_id);

-- Athletes can see messages they sent or received
CREATE POLICY "Athletes see own messages"
  ON agency_athlete_messages
  FOR SELECT
  USING (auth.uid() = athlete_user_id OR auth.uid() = sender_id);

-- Agencies can send messages to athletes
CREATE POLICY "Agencies send messages"
  ON agency_athlete_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND auth.uid() = agency_user_id);

-- Athletes can send messages to agencies
CREATE POLICY "Athletes send messages"
  ON agency_athlete_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND auth.uid() = athlete_user_id);

-- Users can update read status on messages sent to them
CREATE POLICY "Users update message read status"
  ON agency_athlete_messages
  FOR UPDATE
  USING (
    auth.uid() = agency_user_id OR
    auth.uid() = athlete_user_id
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_athlete_profiles_updated_at
  BEFORE UPDATE ON athlete_public_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_lists_updated_at
  BEFORE UPDATE ON agency_athlete_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON agency_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_invites_updated_at
  BEFORE UPDATE ON campaign_athlete_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON agency_saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON TABLE athlete_public_profiles IS 'Public athlete profiles for agency discovery and talent matching';
COMMENT ON TABLE athlete_portfolio_items IS 'Athlete portfolio - showcase work, content samples, past campaigns';
COMMENT ON TABLE agency_saved_searches IS 'Saved search filters for agencies to track talent';
COMMENT ON TABLE agency_athlete_lists IS 'Agency-created lists to organize athletes (like playlists)';
COMMENT ON TABLE agency_athlete_list_items IS 'Athletes within agency lists with private notes';
COMMENT ON TABLE agency_campaigns IS 'Marketing campaigns created and managed by agencies';
COMMENT ON TABLE campaign_athlete_invites IS 'Invitations sent from agencies to athletes for specific campaigns';
COMMENT ON TABLE agency_athlete_messages IS 'Direct messages between agencies and athletes';
