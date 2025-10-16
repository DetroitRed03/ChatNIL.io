-- Add onboarding completion tracking fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone;

-- Add flexible fields for storing onboarding data based on role
ALTER TABLE users
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS phone varchar(20),
ADD COLUMN IF NOT EXISTS parent_email varchar(255),
ADD COLUMN IF NOT EXISTS school_name varchar(255),
ADD COLUMN IF NOT EXISTS graduation_year integer,
ADD COLUMN IF NOT EXISTS major varchar(255),
ADD COLUMN IF NOT EXISTS gpa decimal(3,2),
ADD COLUMN IF NOT EXISTS primary_sport varchar(100),
ADD COLUMN IF NOT EXISTS position varchar(100),
ADD COLUMN IF NOT EXISTS achievements text[],
ADD COLUMN IF NOT EXISTS nil_interests text[],
ADD COLUMN IF NOT EXISTS social_media_handles jsonb,
ADD COLUMN IF NOT EXISTS athlete_info jsonb,
ADD COLUMN IF NOT EXISTS institution_info jsonb,
ADD COLUMN IF NOT EXISTS nil_concerns text[];

-- Create index on onboarding status for queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add comment explaining the flexible data storage approach
COMMENT ON COLUMN users.athlete_info IS 'JSON storage for athlete-specific data';
COMMENT ON COLUMN users.institution_info IS 'JSON storage for institution/coaching data';
COMMENT ON COLUMN users.social_media_handles IS 'JSON storage for social media handles';
COMMENT ON COLUMN users.nil_interests IS 'Array of NIL interests and brand preferences';
COMMENT ON COLUMN users.nil_concerns IS 'Array of NIL concerns for parents/coaches';