-- Add brand user profiles for existing auth users
-- These auth users were already created, now we need their profiles

-- Nike
INSERT INTO public.users (id, email, role, company_name, industry, created_at, updated_at)
VALUES (
  '3f270e9b-cc2b-48a0-b82e-52fdf1094879',
  'nike.agency@test.com',
  'agency',
  'Nike',
  'Sports & Athletic Wear',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  industry = EXCLUDED.industry,
  updated_at = NOW();

-- Gatorade
INSERT INTO public.users (id, email, role, company_name, industry, created_at, updated_at)
VALUES (
  '6adbdd57-e355-4a99-9911-038726067533',
  'gatorade.agency@test.com',
  'agency',
  'Gatorade',
  'Sports Nutrition',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  industry = EXCLUDED.industry,
  updated_at = NOW();

-- Local Business
INSERT INTO public.users (id, email, role, company_name, industry, created_at, updated_at)
VALUES (
  'c6c392f8-682c-45e8-8daf-fcc0b44b8cd6',
  'localbusiness.agency@test.com',
  'agency',
  'Local Business',
  'Various',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  industry = EXCLUDED.industry,
  updated_at = NOW();

-- Now create agency profiles in the agencies table (if it exists)
INSERT INTO public.agencies (id, company_name, agency_type, industry, created_at, updated_at)
VALUES (
  '3f270e9b-cc2b-48a0-b82e-52fdf1094879',
  'Nike',
  'Brand',
  'Sports & Athletic Wear',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  industry = EXCLUDED.industry,
  updated_at = NOW();

INSERT INTO public.agencies (id, company_name, agency_type, industry, created_at, updated_at)
VALUES (
  '6adbdd57-e355-4a99-9911-038726067533',
  'Gatorade',
  'Brand',
  'Sports Nutrition',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  industry = EXCLUDED.industry,
  updated_at = NOW();

INSERT INTO public.agencies (id, company_name, agency_type, industry, created_at, updated_at)
VALUES (
  'c6c392f8-682c-45e8-8daf-fcc0b44b8cd6',
  'Local Business',
  'Local Business',
  'Various',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  industry = EXCLUDED.industry,
  updated_at = NOW();

SELECT 'Brand profiles created successfully!' as message;
