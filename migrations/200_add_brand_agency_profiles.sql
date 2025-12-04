-- Migration: Add agency profiles for Nike, Gatorade, and Local Business test accounts
-- This creates business_profiles entries for the brand accounts

-- Insert Nike agency profile
INSERT INTO business_profiles (
  user_id,
  agency_name,
  agency_type,
  description,
  website,
  contact_email,
  phone,
  address,
  city,
  state,
  zip_code,
  specializations,
  profile_completion
) VALUES (
  (SELECT id FROM users WHERE email = 'nike.agency@test.com'),
  'Nike',
  'brand',
  'Just Do It. Nike is the world''s leading athletic footwear and apparel brand, empowering athletes at every level.',
  'https://www.nike.com',
  'partnerships@nike.com',
  '1-800-NIKE',
  'One Bowerman Drive',
  'Beaverton',
  'OR',
  '97005',
  ARRAY['Athletic Footwear', 'Apparel', 'Performance Gear', 'Brand Partnerships']::text[],
  100
)
ON CONFLICT (user_id) DO UPDATE SET
  agency_name = EXCLUDED.agency_name,
  agency_type = EXCLUDED.agency_type,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  profile_completion = EXCLUDED.profile_completion;

-- Insert Gatorade agency profile
INSERT INTO business_profiles (
  user_id,
  agency_name,
  agency_type,
  description,
  website,
  contact_email,
  phone,
  address,
  city,
  state,
  zip_code,
  specializations,
  profile_completion
) VALUES (
  (SELECT id FROM users WHERE email = 'gatorade.agency@test.com'),
  'Gatorade',
  'brand',
  'Fuel your performance. Gatorade is the #1 sports drink scientifically formulated to refuel, rehydrate, and replenish.',
  'https://www.gatorade.com',
  'partnerships@gatorade.com',
  '1-800-GATORADE',
  '321 N Clark St',
  'Chicago',
  'IL',
  '60654',
  ARRAY['Sports Nutrition', 'Hydration', 'Athlete Partnerships', 'Performance Marketing']::text[],
  100
)
ON CONFLICT (user_id) DO UPDATE SET
  agency_name = EXCLUDED.agency_name,
  agency_type = EXCLUDED.agency_type,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  profile_completion = EXCLUDED.profile_completion;

-- Insert Local Business agency profile
INSERT INTO business_profiles (
  user_id,
  agency_name,
  agency_type,
  description,
  website,
  contact_email,
  phone,
  address,
  city,
  state,
  zip_code,
  specializations,
  profile_completion
) VALUES (
  (SELECT id FROM users WHERE email = 'local.agency@test.com'),
  'Campus Connections Marketing',
  'local_business',
  'Your local partner for authentic athlete marketing. We connect college athletes with local businesses for genuine community partnerships.',
  'https://campusconnections.local',
  'hello@campusconnections.local',
  '(555) 123-4567',
  '123 Main Street',
  'College Station',
  'TX',
  '77840',
  ARRAY['Local Marketing', 'Community Partnerships', 'Social Media', 'Event Promotion']::text[],
  100
)
ON CONFLICT (user_id) DO UPDATE SET
  agency_name = EXCLUDED.agency_name,
  agency_type = EXCLUDED.agency_type,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  profile_completion = EXCLUDED.profile_completion;
