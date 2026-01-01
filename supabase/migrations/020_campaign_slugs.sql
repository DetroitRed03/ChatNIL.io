-- ============================================
-- CAMPAIGN SLUGS: URL-friendly campaign identifiers
-- Migration 020
-- ============================================

-- Add slug column to agency_campaigns
ALTER TABLE agency_campaigns
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create function to generate slug from campaign name
CREATE OR REPLACE FUNCTION generate_campaign_slug(campaign_name TEXT, campaign_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(campaign_name, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  -- Truncate to reasonable length
  base_slug := left(base_slug, 50);

  -- Start with base slug
  final_slug := base_slug;

  -- Check for uniqueness and add suffix if needed
  WHILE EXISTS (SELECT 1 FROM agency_campaigns WHERE slug = final_slug AND id != campaign_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION set_campaign_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if slug is null or campaign_name changed
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.campaign_name != NEW.campaign_name AND NEW.slug = OLD.slug) THEN
    NEW.slug := generate_campaign_slug(NEW.campaign_name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_campaign_slug ON agency_campaigns;
CREATE TRIGGER trigger_set_campaign_slug
  BEFORE INSERT OR UPDATE ON agency_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION set_campaign_slug();

-- Backfill existing campaigns with slugs
UPDATE agency_campaigns
SET slug = generate_campaign_slug(campaign_name, id)
WHERE slug IS NULL;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_agency_campaigns_slug ON agency_campaigns(slug);

-- Comment
COMMENT ON COLUMN agency_campaigns.slug IS 'URL-friendly unique identifier for the campaign';
