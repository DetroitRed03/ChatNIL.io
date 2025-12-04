-- Migration: Fix campaign_athletes foreign key to reference agency_campaigns
-- Problem: campaign_athletes.campaign_id references 'campaigns' table
--          but UI uses 'agency_campaigns' table
-- Solution: Drop old FK, add new FK to agency_campaigns

-- Step 1: Drop the old foreign key constraint
ALTER TABLE campaign_athletes
DROP CONSTRAINT IF EXISTS campaign_athletes_campaign_id_fkey;

-- Step 2: Add new foreign key referencing agency_campaigns
ALTER TABLE campaign_athletes
ADD CONSTRAINT campaign_athletes_campaign_id_fkey
FOREIGN KEY (campaign_id) REFERENCES agency_campaigns(id) ON DELETE CASCADE;

-- Grant permissions
GRANT ALL ON campaign_athletes TO authenticated;
GRANT ALL ON campaign_athletes TO service_role;
GRANT ALL ON campaign_athletes TO anon;
