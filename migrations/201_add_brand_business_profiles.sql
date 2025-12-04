-- Migration: Add business profiles for Nike, Gatorade, and Local Business test accounts

-- Insert Nike business profile
INSERT INTO business_profiles (
  id,
  business_name,
  business_type,
  industry,
  description,
  email,
  phone,
  website_url,
  address,
  city,
  state,
  zip_code
) VALUES (
  (SELECT id FROM users WHERE email = 'nike.agency@test.com'),
  'Nike',
  'national_brand',
  'Athletic Footwear & Apparel',
  'Just Do It. Nike is the world''s leading athletic footwear and apparel brand, empowering athletes at every level.',
  'partnerships@nike.com',
  '1-800-NIKE',
  'https://www.nike.com',
  'One Bowerman Drive',
  'Beaverton',
  'OR',
  '97005'
)
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  website_url = EXCLUDED.website_url;

-- Insert Gatorade business profile
INSERT INTO business_profiles (
  id,
  business_name,
  business_type,
  industry,
  description,
  email,
  phone,
  website_url,
  address,
  city,
  state,
  zip_code
) VALUES (
  (SELECT id FROM users WHERE email = 'gatorade.agency@test.com'),
  'Gatorade',
  'national_brand',
  'Sports Nutrition',
  'Fuel your performance. Gatorade is the #1 sports drink scientifically formulated to refuel, rehydrate, and replenish.',
  'partnerships@gatorade.com',
  '1-800-GATORADE',
  'https://www.gatorade.com',
  '321 N Clark St',
  'Chicago',
  'IL',
  '60654'
)
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  website_url = EXCLUDED.website_url;

-- Insert Local Business profile
INSERT INTO business_profiles (
  id,
  business_name,
  business_type,
  industry,
  description,
  email,
  phone,
  website_url,
  address,
  city,
  state,
  zip_code
) VALUES (
  (SELECT id FROM users WHERE email = 'local.agency@test.com'),
  'Campus Connections Marketing',
  'local_business',
  'Marketing & Advertising',
  'Your local partner for authentic athlete marketing. We connect college athletes with local businesses for genuine community partnerships.',
  'hello@campusconnections.local',
  '(555) 123-4567',
  'https://campusconnections.local',
  '123 Main Street',
  'College Station',
  'TX',
  '77840'
)
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  website_url = EXCLUDED.website_url;
