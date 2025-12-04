# Athlete Profile Backend Architecture

**ChatNIL Platform - Comprehensive Athlete Profile System**

**Author:** Forge (Backend Architect)
**Date:** 2025-10-27
**Version:** 1.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Validation Schemas](#validation-schemas)
5. [Data Transformation Layer](#data-transformation-layer)
6. [Database Queries & Performance](#database-queries--performance)
7. [Triggers & Stored Procedures](#triggers--stored-procedures)
8. [Security Architecture](#security-architecture)
9. [Error Handling Strategy](#error-handling-strategy)
10. [Testing Approach](#testing-approach)
11. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

This architecture document defines the backend implementation for ChatNIL's comprehensive athlete profile system. The system handles complex athlete data including personal information, athletic achievements, social media statistics, NIL preferences, and portfolio content samples.

**Key Design Principles:**
- **Security First:** RLS policies as primary defense, API-level validation as secondary
- **Performance:** Optimized queries, intelligent caching, indexed lookups
- **Data Integrity:** Strong validation, triggers for calculated fields, ACID compliance
- **Maintainability:** Clear separation of concerns, documented patterns, type safety
- **Scalability:** Prepared for 10,000+ athletes with sub-100ms query times

---

## Database Schema

### Current State (Migration 016 + 031)

The `users` table already contains all necessary fields. **No new tables are required.**

#### Primary Fields (users table)

```sql
-- Core Identity
id UUID PRIMARY KEY
email TEXT UNIQUE NOT NULL
role user_role NOT NULL
username TEXT UNIQUE  -- For public URLs: /athletes/[username]

-- Personal Information
first_name TEXT
last_name TEXT
bio TEXT
date_of_birth DATE
phone TEXT
parent_email TEXT

-- School Information
school_name TEXT
graduation_year INTEGER
major TEXT
gpa DECIMAL(3,2)

-- Athletic Information
primary_sport TEXT
position TEXT
team_name TEXT
division TEXT
achievements TEXT[]
secondary_sports TEXT[]  -- Already exists from migration 013

-- Social Media (JSONB array)
social_media_stats JSONB DEFAULT '[]'
-- Structure: [{ platform, handle, followers, engagement_rate, verified, last_updated }]

-- Interests (TEXT[] arrays)
hobbies TEXT[]
content_creation_interests TEXT[]
brand_affinity TEXT[]
lifestyle_interests TEXT[]
causes_care_about TEXT[]

-- NIL Preferences (JSONB object)
nil_preferences JSONB DEFAULT '{}'
nil_interests TEXT[]
nil_concerns TEXT[]

-- Portfolio (JSONB)
content_samples JSONB DEFAULT '[]'
profile_video_url TEXT

-- Calculated Fields (Auto-updated by triggers)
total_followers INTEGER DEFAULT 0
avg_engagement_rate DECIMAL(5,2) DEFAULT 0.0
profile_completion_score INTEGER DEFAULT 0

-- Metadata
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
onboarding_completed BOOLEAN DEFAULT false
onboarding_completed_at TIMESTAMPTZ
```

### Related Tables

#### athlete_fmv_data
```sql
-- Fair Market Value calculations
id UUID PRIMARY KEY
athlete_id UUID REFERENCES users(id)
fmv_score INTEGER  -- 0-100
fmv_tier TEXT  -- 'elite' | 'high' | 'medium' | 'developing' | 'emerging'
social_score INTEGER
athletic_score INTEGER
market_score INTEGER
brand_score INTEGER
estimated_deal_value_low DECIMAL
estimated_deal_value_mid DECIMAL
estimated_deal_value_high DECIMAL
improvement_suggestions JSONB
is_public_score BOOLEAN DEFAULT false
last_calculation_date TIMESTAMPTZ
next_calculation_date TIMESTAMPTZ
calculation_count_today INTEGER DEFAULT 0
```

#### nil_deals
```sql
-- Active and completed NIL partnerships
id UUID PRIMARY KEY
athlete_id UUID REFERENCES users(id)
agency_id UUID REFERENCES users(id)
deal_title TEXT
deal_type TEXT
status TEXT
compensation_amount DECIMAL
start_date DATE
end_date DATE
deliverables JSONB
is_public BOOLEAN DEFAULT false
```

### Indexes (Already Created in Migration 016)

```sql
-- Array field indexes (GIN for efficient array searches)
CREATE INDEX idx_users_hobbies ON users USING GIN (hobbies);
CREATE INDEX idx_users_content_creation_interests ON users USING GIN (content_creation_interests);
CREATE INDEX idx_users_brand_affinity ON users USING GIN (brand_affinity);
CREATE INDEX idx_users_lifestyle_interests ON users USING GIN (lifestyle_interests);
CREATE INDEX idx_users_causes_care_about ON users USING GIN (causes_care_about);

-- JSONB indexes
CREATE INDEX idx_users_social_media_stats ON users USING GIN (social_media_stats);
CREATE INDEX idx_users_nil_preferences ON users USING GIN (nil_preferences);
CREATE INDEX idx_users_content_samples ON users USING GIN (content_samples);

-- Calculated field indexes (for filtering and sorting)
CREATE INDEX idx_users_total_followers ON users (total_followers) WHERE role = 'athlete';
CREATE INDEX idx_users_avg_engagement_rate ON users (avg_engagement_rate) WHERE role = 'athlete';
CREATE INDEX idx_users_profile_completion_score ON users (profile_completion_score) WHERE role = 'athlete';

-- Username lookup (from migration 031)
CREATE INDEX idx_users_username ON users(username);

-- Composite matchmaking index
CREATE INDEX idx_users_athlete_matchmaking
  ON users (role, total_followers, avg_engagement_rate, profile_completion_score)
  WHERE role = 'athlete' AND onboarding_completed = true;
```

### Schema Enhancement Recommendations

#### 1. Add Profile View Tracking (Optional - Future Enhancement)
```sql
CREATE TABLE athlete_profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  viewer_role user_role,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  referrer TEXT,
  user_agent TEXT
);

CREATE INDEX idx_profile_views_athlete ON athlete_profile_views(athlete_id, viewed_at DESC);
CREATE INDEX idx_profile_views_viewer ON athlete_profile_views(viewer_id, viewed_at DESC);
```

#### 2. Add Social Media Verification History (Optional)
```sql
CREATE TABLE social_media_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  verification_method TEXT,  -- 'oauth' | 'api_scrape' | 'manual'
  followers_at_verification INTEGER,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB
);
```

---

## API Endpoints

### 1. GET /api/profile

**Description:** Fetch the authenticated user's complete profile
**Authentication:** Required (session-based)
**Authorization:** User can only fetch their own profile

**Request:**
```typescript
// Query Parameters
{
  userId: string  // UUID of authenticated user
}
```

**Response:**
```typescript
{
  profile: {
    // Core Identity
    id: string;
    email: string;
    role: UserRole;
    username: string | null;

    // Personal Info
    first_name: string | null;
    last_name: string | null;
    bio: string | null;
    date_of_birth: string | null;
    phone: string | null;
    parent_email: string | null;

    // School Info
    school_name: string | null;
    graduation_year: number | null;
    major: string | null;
    gpa: number | null;

    // Athletic Info
    primary_sport: string | null;
    position: string | null;
    team_name: string | null;
    division: string | null;
    achievements: string[];
    secondary_sports: string[];

    // Social Media
    social_media_stats: SocialMediaStat[];
    total_followers: number;
    avg_engagement_rate: number;

    // Interests
    hobbies: string[];
    content_creation_interests: string[];
    brand_affinity: string[];
    lifestyle_interests: string[];
    causes_care_about: string[];

    // NIL
    nil_preferences: NILPreferences;
    nil_interests: string[];
    nil_concerns: string[];

    // Portfolio
    content_samples: ContentSample[];
    profile_video_url: string | null;

    // Calculated
    profile_completion_score: number;

    // Metadata
    created_at: string;
    updated_at: string;
    onboarding_completed: boolean;
  }
}
```

**Error Responses:**
- `400`: Missing userId
- `401`: Unauthorized (no session)
- `404`: Profile not found
- `500`: Internal server error

**Implementation:**
```typescript
// File: /app/api/profile/route.ts
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Validate input
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // 3. Authorize (user can only fetch own profile)
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot access other user profiles' },
        { status: 403 }
      );
    }

    // 4. Fetch profile
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[GET /api/profile] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // 5. Return success
    return NextResponse.json({ profile });

  } catch (error) {
    console.error('[GET /api/profile] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### 2. PUT /api/profile

**Description:** Update the authenticated user's profile
**Authentication:** Required
**Authorization:** User can only update their own profile

**Request:**
```typescript
{
  userId: string;
  updates: {
    // Only include fields to update
    first_name?: string;
    last_name?: string;
    bio?: string;
    phone?: string;
    school_name?: string;
    graduation_year?: number;
    major?: string;
    gpa?: number;
    primary_sport?: string;
    position?: string;
    team_name?: string;
    division?: string;
    achievements?: string[];
    secondary_sports?: string[];
    social_media_stats?: SocialMediaStat[];
    hobbies?: string[];
    content_creation_interests?: string[];
    brand_affinity?: string[];
    lifestyle_interests?: string[];
    causes_care_about?: string[];
    nil_preferences?: NILPreferences;
    nil_interests?: string[];
    content_samples?: ContentSample[];
    profile_video_url?: string;
  };
}
```

**Response:**
```typescript
{
  profile: CompleteProfile;  // Updated profile
}
```

**Validation Rules:**
- `bio`: Max 500 characters
- `gpa`: 0.0 - 4.0
- `graduation_year`: 2024 - 2035
- `social_media_stats`: Valid platform names, positive followers/engagement
- `content_samples`: Valid URLs, proper types
- `nil_preferences.min_compensation`: Must be < max_compensation
- Array fields: Max 50 items each
- String fields: Sanitized (no XSS)

**Error Responses:**
- `400`: Validation error (with details)
- `401`: Unauthorized
- `403`: Forbidden (trying to update another user)
- `404`: Profile not found
- `500`: Internal server error

**Implementation:**
```typescript
// File: /app/api/profile/route.ts
export async function PUT(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Validate input
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json(
        { error: 'userId and updates are required' },
        { status: 400 }
      );
    }

    // Validate updates using Zod schema
    const validationResult = profileUpdateSchema.safeParse(updates);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }

    // 3. Authorize
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot update other user profiles' },
        { status: 403 }
      );
    }

    // 4. Sanitize and prepare data
    const sanitizedUpdates = sanitizeProfileUpdates(validationResult.data);

    // 5. Update profile
    const { data: updatedProfile, error } = await supabaseAdmin
      .from('users')
      .update({
        ...sanitizedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[PUT /api/profile] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // 6. Return success
    return NextResponse.json({ profile: updatedProfile });

  } catch (error) {
    console.error('[PUT /api/profile] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### 3. GET /api/athletes/[username]

**Description:** Fetch public athlete profile by username
**Authentication:** Optional (public endpoint)
**Authorization:** Public data only

**Request:**
```typescript
// URL Parameter
username: string  // e.g., "sarah-johnson"
```

**Response:**
```typescript
{
  profile: {
    // Public Identity
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    bio: string | null;

    // School (Public)
    school_name: string | null;
    graduation_year: number | null;
    major: string | null;

    // Athletic (Public)
    primary_sport: string | null;
    position: string | null;
    team_name: string | null;
    division: string | null;
    achievements: string[];

    // Social Media (Public)
    social_media_stats: SocialMediaStat[];  // Handles visible, but not exact follower counts unless athlete chooses
    total_followers: number;
    avg_engagement_rate: number;

    // Interests (Public)
    nil_interests: string[];
    brand_affinity: string[];
    content_creation_interests: string[];
    lifestyle_interests: string[];
    causes_care_about: string[];

    // Portfolio (Public)
    content_samples: ContentSample[];
    profile_video_url: string | null;

    // FMV (Only if athlete made it public)
    fmv_score: number | null;
    fmv_tier: string | null;
    percentile_rank: number | null;

    // Public Stats
    active_deals_count: number;
    profile_completion_score: number;

    // Metadata
    created_at: string;
  }
}
```

**Fields Excluded (Private):**
- email
- phone
- parent_email
- date_of_birth
- gpa (unless athlete chooses to share)
- nil_preferences (detailed preferences)
- nil_concerns

**Error Responses:**
- `400`: Invalid username format
- `404`: Athlete not found
- `500`: Internal server error

**Caching Strategy:**
- Cache public profiles for 5 minutes
- Invalidate cache on profile update
- Use Redis or Vercel Edge caching

**Implementation:**
```typescript
// File: /app/api/athletes/[username]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // 1. Validate username format
    if (!username || !isValidUsername(username)) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      );
    }

    // 2. Check cache (optional)
    const cachedProfile = await getFromCache(`profile:${username}`);
    if (cachedProfile) {
      return NextResponse.json({ profile: cachedProfile });
    }

    // 3. Fetch athlete profile
    const { data: athlete, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('role', 'athlete')
      .single();

    if (error || !athlete) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      );
    }

    // 4. Fetch FMV data (if public)
    const { data: fmvData } = await supabaseAdmin
      .from('athlete_fmv_data')
      .select('fmv_score, fmv_tier, percentile_rank, is_public_score')
      .eq('athlete_id', athlete.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 5. Count active NIL deals
    const { count: activeDealsCount } = await supabaseAdmin
      .from('nil_deals')
      .select('*', { count: 'exact', head: true })
      .eq('athlete_id', athlete.id)
      .in('status', ['active', 'completed']);

    // 6. Build public profile
    const publicProfile = buildPublicProfile(athlete, fmvData, activeDealsCount || 0);

    // 7. Cache result
    await setInCache(`profile:${username}`, publicProfile, 300); // 5 min TTL

    // 8. Return success
    return NextResponse.json({ profile: publicProfile });

  } catch (error) {
    console.error('[GET /api/athletes/[username]] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### 4. POST /api/profile/calculate-fmv

**Description:** Trigger FMV (Fair Market Value) recalculation for authenticated athlete
**Authentication:** Required
**Authorization:** Athlete role only, own profile

**Request:**
```typescript
{
  userId: string;
  forceRecalculation?: boolean;  // Bypass daily limit (admin only)
}
```

**Response:**
```typescript
{
  fmv: {
    fmv_score: number;
    fmv_tier: 'elite' | 'high' | 'medium' | 'developing' | 'emerging';
    score_breakdown: {
      social_score: number;
      athletic_score: number;
      market_score: number;
      brand_score: number;
    };
    estimated_deal_value: {
      low: number;
      mid: number;
      high: number;
    };
    improvement_suggestions: Array<{
      area: string;
      current: string;
      target: string;
      action: string;
      impact: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    next_calculation_date: string;
  }
}
```

**Business Rules:**
- Athletes can recalculate FMV once per day (3 times max)
- Calculation requires minimum profile completion (60%+)
- Results are private by default
- Algorithm considers: social reach, engagement, athletic performance, market demand

**Error Responses:**
- `400`: Profile incomplete or daily limit reached
- `401`: Unauthorized
- `403`: Not an athlete or not own profile
- `429`: Rate limit exceeded
- `500`: Calculation error

**Implementation:**
```typescript
// File: /app/api/profile/calculate-fmv/route.ts
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Validate input
    const body = await request.json();
    const { userId, forceRecalculation = false } = body;

    // 3. Authorize (athlete role only)
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role, profile_completion_score')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'athlete') {
      return NextResponse.json(
        { error: 'FMV calculation only available for athletes' },
        { status: 403 }
      );
    }

    if (session.user.id !== userId && !forceRecalculation) {
      return NextResponse.json(
        { error: 'Cannot calculate FMV for other users' },
        { status: 403 }
      );
    }

    // 4. Check profile completion
    if (user.profile_completion_score < 60) {
      return NextResponse.json(
        {
          error: 'Profile must be at least 60% complete to calculate FMV',
          current_completion: user.profile_completion_score
        },
        { status: 400 }
      );
    }

    // 5. Check rate limits
    const { data: fmvData } = await supabaseAdmin
      .from('athlete_fmv_data')
      .select('calculation_count_today, last_calculation_reset_date, next_calculation_date')
      .eq('athlete_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fmvData && !forceRecalculation) {
      const today = new Date().toISOString().split('T')[0];
      const lastReset = fmvData.last_calculation_reset_date?.split('T')[0];

      if (lastReset === today && fmvData.calculation_count_today >= 3) {
        return NextResponse.json(
          {
            error: 'Daily calculation limit reached (3/day)',
            next_available: fmvData.next_calculation_date
          },
          { status: 429 }
        );
      }
    }

    // 6. Trigger FMV calculation (calls external service or internal algorithm)
    const fmvResult = await calculateAthleteFMV(userId);

    // 7. Save results
    const { data: savedFMV, error } = await supabaseAdmin
      .from('athlete_fmv_data')
      .upsert({
        athlete_id: userId,
        ...fmvResult,
        calculation_count_today: (fmvData?.calculation_count_today || 0) + 1,
        last_calculation_date: new Date().toISOString(),
        next_calculation_date: addDays(new Date(), 1).toISOString(),
        last_calculation_reset_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/profile/calculate-fmv] Save error:', error);
      return NextResponse.json(
        { error: 'Failed to save FMV calculation' },
        { status: 500 }
      );
    }

    // 8. Return success
    return NextResponse.json({ fmv: savedFMV });

  } catch (error) {
    console.error('[POST /api/profile/calculate-fmv] Error:', error);
    return NextResponse.json(
      { error: 'FMV calculation failed' },
      { status: 500 }
    );
  }
}
```

---

### 5. GET /api/profile/completion

**Description:** Get detailed profile completion breakdown
**Authentication:** Required
**Authorization:** Own profile only

**Request:**
```typescript
{
  userId: string;
}
```

**Response:**
```typescript
{
  completion: {
    percentage: number;  // 0-100
    score: number;
    maxScore: number;
    tier: 'incomplete' | 'basic' | 'good' | 'excellent';
    sections: {
      personal: {
        completed: number;
        total: number;
        fields: Array<{
          name: string;
          label: string;
          completed: boolean;
          boost: number;  // Points this field adds
        }>;
      };
      school: {
        completed: number;
        total: number;
        fields: Array<FieldStatus>;
      };
      athletic: {
        completed: number;
        total: number;
        fields: Array<FieldStatus>;
      };
      social: {
        completed: number;
        total: number;
        fields: Array<FieldStatus>;
      };
      nil: {
        completed: number;
        total: number;
        fields: Array<FieldStatus>;
      };
      content: {
        completed: number;
        total: number;
        fields: Array<FieldStatus>;
      };
    };
    incompleteSections: Array<{
      id: string;
      label: string;
      boost: number;
      category: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  }
}
```

**Implementation:**
```typescript
// File: /app/api/profile/completion/route.ts
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch profile
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // 3. Calculate completion
    const completion = calculateDetailedCompletion(profile);

    // 4. Return breakdown
    return NextResponse.json({ completion });

  } catch (error) {
    console.error('[GET /api/profile/completion] Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate completion' },
      { status: 500 }
    );
  }
}
```

---

### 6. POST /api/profile/validate-username

**Description:** Check if username is available
**Authentication:** Optional
**Authorization:** Public

**Request:**
```typescript
{
  username: string;
  userId?: string;  // If updating existing user
}
```

**Response:**
```typescript
{
  available: boolean;
  valid: boolean;
  suggestions?: string[];  // If not available
  error?: string;  // If invalid format
}
```

**Validation Rules:**
- Lowercase only
- Alphanumeric + hyphens + underscores
- 3-30 characters
- Not reserved words (admin, api, app, etc.)

**Implementation:**
```typescript
// File: /app/api/profile/validate-username/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, userId } = body;

    // Validate format
    if (!isValidUsernameFormat(username)) {
      return NextResponse.json({
        available: false,
        valid: false,
        error: 'Username must be 3-30 characters, lowercase, alphanumeric with hyphens or underscores'
      });
    }

    // Check reserved words
    if (RESERVED_USERNAMES.includes(username)) {
      return NextResponse.json({
        available: false,
        valid: true,
        error: 'This username is reserved'
      });
    }

    // Check database availability
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    // If exists and it's not the current user, not available
    const available = !existing || (userId && existing.id === userId);

    // Generate suggestions if not available
    const suggestions = available ? undefined : generateUsernameSuggestions(username);

    return NextResponse.json({
      available,
      valid: true,
      suggestions
    });

  } catch (error) {
    console.error('[POST /api/profile/validate-username] Error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}
```

---

## Validation Schemas

All validation uses **Zod** for type-safe runtime validation.

### Core Validation Schema

```typescript
// File: /lib/validation/profile-schemas.ts

import { z } from 'zod';

// ============================================================================
// Social Media Validation
// ============================================================================

export const socialMediaPlatformEnum = z.enum([
  'instagram',
  'tiktok',
  'twitter',
  'youtube',
  'facebook',
  'linkedin',
  'twitch',
  'snapchat'
]);

export const socialMediaStatSchema = z.object({
  platform: socialMediaPlatformEnum,
  handle: z.string()
    .min(1, 'Handle is required')
    .max(50, 'Handle too long')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid handle format'),
  followers: z.number()
    .int('Followers must be a whole number')
    .min(0, 'Followers cannot be negative')
    .max(1_000_000_000, 'Followers value too high'),
  engagement_rate: z.number()
    .min(0, 'Engagement rate cannot be negative')
    .max(100, 'Engagement rate cannot exceed 100%'),
  verified: z.boolean().default(false),
  last_updated: z.string().datetime().optional(),
  notes: z.string().max(200).optional()
});

export const socialMediaStatsArraySchema = z.array(socialMediaStatSchema)
  .max(10, 'Maximum 10 social media platforms');

// ============================================================================
// NIL Preferences Validation
// ============================================================================

export const nilPreferencesSchema = z.object({
  preferred_deal_types: z.array(z.enum([
    'sponsored_posts',
    'brand_ambassador',
    'appearances',
    'content_creation',
    'product_endorsement',
    'affiliate_marketing',
    'event_hosting',
    'consulting'
  ])).optional(),

  min_compensation: z.number()
    .int()
    .min(0, 'Minimum compensation cannot be negative')
    .optional(),

  max_compensation: z.number()
    .int()
    .min(0, 'Maximum compensation cannot be negative')
    .optional(),

  preferred_partnership_length: z.enum([
    'one_time',
    '1-3 months',
    '3-6 months',
    '6-12 months',
    '12+ months'
  ]).optional(),

  content_types_willing: z.array(z.enum([
    'instagram_posts',
    'instagram_stories',
    'instagram_reels',
    'tiktok_videos',
    'youtube_videos',
    'youtube_shorts',
    'twitter_posts',
    'blog_posts',
    'podcast_appearances',
    'live_streams'
  ])).optional(),

  blacklist_categories: z.array(z.enum([
    'alcohol',
    'tobacco',
    'gambling',
    'cryptocurrency',
    'adult_content',
    'political',
    'pharmaceuticals'
  ])).optional(),

  preferred_brand_sizes: z.array(z.enum([
    'startup',
    'small_business',
    'mid_market',
    'enterprise',
    'fortune_500'
  ])).optional(),

  negotiation_flexibility: z.enum([
    'firm',
    'somewhat_flexible',
    'very_flexible'
  ]).optional(),

  requires_agent_approval: z.boolean().default(false),
  requires_parent_approval: z.boolean().default(false),
  exclusivity_willing: z.boolean().default(false),

  usage_rights_consideration: z.enum([
    'limited',
    'standard',
    'extended',
    'perpetual'
  ]).optional(),

  travel_willing: z.boolean().default(false),
  max_travel_distance_miles: z.number().int().min(0).max(10000).optional(),
  typical_response_time_hours: z.number().int().min(0).max(168).optional(),
  additional_notes: z.string().max(500).optional()
}).refine(
  (data) => {
    // Validate min < max compensation
    if (data.min_compensation && data.max_compensation) {
      return data.min_compensation <= data.max_compensation;
    }
    return true;
  },
  {
    message: 'Minimum compensation must be less than maximum',
    path: ['min_compensation']
  }
);

// ============================================================================
// Content Samples Validation
// ============================================================================

export const contentSampleSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum([
    'instagram_post',
    'instagram_story',
    'tiktok_video',
    'youtube_video',
    'twitter_post',
    'blog_post',
    'other'
  ]),
  url: z.string().url('Must be a valid URL'),
  description: z.string().max(200).optional(),
  platform: z.string().max(50).optional(),

  // Engagement metrics
  likes: z.number().int().min(0).optional(),
  comments: z.number().int().min(0).optional(),
  shares: z.number().int().min(0).optional(),
  views: z.number().int().min(0).optional(),
  engagement_rate: z.number().min(0).max(100).optional(),

  // Metadata
  date: z.string().datetime(),
  sponsored: z.boolean().default(false),
  brand: z.string().max(100).optional(),
  campaign_type: z.string().max(100).optional(),
  thumbnail_url: z.string().url().optional(),

  // Display
  featured: z.boolean().default(false),
  display_order: z.number().int().min(0).max(100).default(0)
});

export const contentSamplesArraySchema = z.array(contentSampleSchema)
  .max(20, 'Maximum 20 content samples');

// ============================================================================
// Profile Update Schema (Main)
// ============================================================================

export const profileUpdateSchema = z.object({
  // Personal Info
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .optional(),

  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .optional(),

  bio: z.string()
    .max(500, 'Bio must be under 500 characters')
    .optional(),

  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .nullable(),

  date_of_birth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .nullable(),

  // School Info
  school_name: z.string().max(100).optional().nullable(),

  graduation_year: z.number()
    .int()
    .min(2024, 'Graduation year must be 2024 or later')
    .max(2035, 'Graduation year too far in future')
    .optional()
    .nullable(),

  major: z.string().max(100).optional().nullable(),

  gpa: z.number()
    .min(0.0, 'GPA cannot be negative')
    .max(4.0, 'GPA cannot exceed 4.0')
    .optional()
    .nullable(),

  // Athletic Info
  primary_sport: z.string().max(50).optional().nullable(),
  position: z.string().max(50).optional().nullable(),
  team_name: z.string().max(100).optional().nullable(),
  division: z.string().max(50).optional().nullable(),

  achievements: z.array(z.string().max(200))
    .max(50, 'Maximum 50 achievements')
    .optional(),

  secondary_sports: z.array(z.string().max(50))
    .max(10, 'Maximum 10 secondary sports')
    .optional(),

  // Social Media
  social_media_stats: socialMediaStatsArraySchema.optional(),

  // Interests
  hobbies: z.array(z.string().max(50))
    .max(30, 'Maximum 30 hobbies')
    .optional(),

  content_creation_interests: z.array(z.string().max(50))
    .max(30, 'Maximum 30 interests')
    .optional(),

  brand_affinity: z.array(z.string().max(50))
    .max(30, 'Maximum 30 brands')
    .optional(),

  lifestyle_interests: z.array(z.string().max(50))
    .max(30, 'Maximum 30 interests')
    .optional(),

  causes_care_about: z.array(z.string().max(50))
    .max(30, 'Maximum 30 causes')
    .optional(),

  // NIL
  nil_preferences: nilPreferencesSchema.optional(),

  nil_interests: z.array(z.string().max(50))
    .max(30, 'Maximum 30 NIL interests')
    .optional(),

  nil_concerns: z.array(z.string().max(100))
    .max(20, 'Maximum 20 NIL concerns')
    .optional(),

  // Portfolio
  content_samples: contentSamplesArraySchema.optional(),

  profile_video_url: z.string()
    .url('Must be a valid URL')
    .optional()
    .nullable()
});

// ============================================================================
// Username Validation
// ============================================================================

export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(/^[a-z0-9_-]+$/, 'Username must be lowercase letters, numbers, hyphens, or underscores only')
  .refine(
    (val) => !RESERVED_USERNAMES.includes(val),
    'This username is reserved'
  );

export const RESERVED_USERNAMES = [
  'admin', 'api', 'app', 'auth', 'blog', 'cdn', 'chat',
  'dashboard', 'docs', 'help', 'login', 'logout', 'mail',
  'news', 'profile', 'register', 'settings', 'signup',
  'support', 'terms', 'privacy', 'about', 'contact',
  'athletes', 'agencies', 'schools', 'business'
];

// ============================================================================
// Type Exports
// ============================================================================

export type SocialMediaStat = z.infer<typeof socialMediaStatSchema>;
export type NILPreferences = z.infer<typeof nilPreferencesSchema>;
export type ContentSample = z.infer<typeof contentSampleSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
```

---

## Data Transformation Layer

### Onboarding to Profile Mapping

```typescript
// File: /lib/transformers/onboarding-to-profile.ts

import type {
  AthletePersonalInfo,
  AthleteSchoolInfo,
  AthleteSportsInfo,
  AthleteNILInfo,
  AthleteSocialMedia,
  AthleteInterests,
  AthleteNILPreferences,
  AthleteContentSamples
} from '@/lib/onboarding-types';

import type { Database } from '@/lib/types';

type UserInsert = Database['public']['Tables']['users']['Insert'];

/**
 * Transform onboarding form data to database user record
 *
 * This function maps the multi-step onboarding flow data into the
 * flat users table structure, handling type conversions and defaults.
 */
export function transformOnboardingToProfile(
  formData: Record<string, any>
): Partial<UserInsert> {
  const profile: Partial<UserInsert> = {};

  // ==================== Personal Info ====================
  if (formData.firstName) {
    profile.first_name = sanitizeString(formData.firstName);
  }

  if (formData.lastName) {
    profile.last_name = sanitizeString(formData.lastName);
  }

  if (formData.email) {
    profile.email = formData.email.toLowerCase().trim();
  }

  if (formData.dateOfBirth) {
    profile.date_of_birth = formData.dateOfBirth;
  }

  if (formData.phone) {
    profile.phone = sanitizePhone(formData.phone);
  }

  if (formData.parentEmail) {
    profile.parent_email = formData.parentEmail.toLowerCase().trim();
  }

  // ==================== School Info ====================
  if (formData.schoolName) {
    profile.school_name = sanitizeString(formData.schoolName);
  }

  if (formData.graduationYear) {
    profile.graduation_year = parseInt(formData.graduationYear, 10);
  }

  if (formData.major) {
    profile.major = sanitizeString(formData.major);
  }

  if (formData.gpa) {
    profile.gpa = parseFloat(formData.gpa);
  }

  // ==================== Athletic Info ====================
  if (formData.primarySport) {
    profile.primary_sport = sanitizeString(formData.primarySport);
  }

  if (formData.position) {
    profile.position = sanitizeString(formData.position);
  }

  if (formData.secondarySports && Array.isArray(formData.secondarySports)) {
    profile.secondary_sports = formData.secondarySports.map(sanitizeString);
  }

  if (formData.teamName) {
    profile.team_name = sanitizeString(formData.teamName);
  }

  if (formData.division) {
    profile.division = sanitizeString(formData.division);
  }

  // Achievements - handle both string (comma-separated) and array
  if (formData.achievements) {
    if (typeof formData.achievements === 'string') {
      profile.achievements = formData.achievements
        .split(',')
        .map(a => sanitizeString(a.trim()))
        .filter(a => a.length > 0);
    } else if (Array.isArray(formData.achievements)) {
      profile.achievements = formData.achievements
        .map(sanitizeString)
        .filter(a => a.length > 0);
    }
  }

  // ==================== Social Media ====================
  if (formData.social_media_stats && Array.isArray(formData.social_media_stats)) {
    profile.social_media_stats = formData.social_media_stats;
    // Calculated fields will be auto-updated by trigger
  }

  // Legacy social_media_handles support (from old onboarding)
  if (formData.socialMediaHandles && typeof formData.socialMediaHandles === 'object') {
    profile.social_media_stats = transformLegacySocialHandles(formData.socialMediaHandles);
  }

  // ==================== Interests ====================
  if (formData.hobbies && Array.isArray(formData.hobbies)) {
    profile.hobbies = formData.hobbies.map(sanitizeString);
  }

  if (formData.content_creation_interests && Array.isArray(formData.content_creation_interests)) {
    profile.content_creation_interests = formData.content_creation_interests.map(sanitizeString);
  }

  if (formData.brand_affinity && Array.isArray(formData.brand_affinity)) {
    profile.brand_affinity = formData.brand_affinity.map(sanitizeString);
  }

  if (formData.lifestyle_interests && Array.isArray(formData.lifestyle_interests)) {
    profile.lifestyle_interests = formData.lifestyle_interests.map(sanitizeString);
  }

  if (formData.causes_care_about && Array.isArray(formData.causes_care_about)) {
    profile.causes_care_about = formData.causes_care_about.map(sanitizeString);
  }

  // ==================== NIL Data ====================
  if (formData.nil_preferences && typeof formData.nil_preferences === 'object') {
    profile.nil_preferences = formData.nil_preferences;
  }

  if (formData.brandInterests && Array.isArray(formData.brandInterests)) {
    // Legacy field - map to nil_interests
    profile.nil_interests = formData.brandInterests.map(sanitizeString);
  }

  if (formData.nilGoals && Array.isArray(formData.nilGoals)) {
    // Store in nil_interests
    profile.nil_interests = formData.nilGoals.map(sanitizeString);
  }

  // ==================== Portfolio ====================
  if (formData.bio) {
    profile.bio = sanitizeString(formData.bio);
  }

  if (formData.profile_video_url) {
    profile.profile_video_url = formData.profile_video_url;
  }

  if (formData.content_samples && Array.isArray(formData.content_samples)) {
    profile.content_samples = formData.content_samples;
  }

  return profile;
}

/**
 * Transform legacy social media handles format to new social_media_stats array
 */
function transformLegacySocialHandles(handles: Record<string, string>) {
  const stats = [];

  const platformMap: Record<string, string> = {
    instagram: 'instagram',
    tiktok: 'tiktok',
    twitter: 'twitter',
    youtube: 'youtube',
    facebook: 'facebook',
    linkedin: 'linkedin'
  };

  for (const [platform, handle] of Object.entries(handles)) {
    if (handle && handle.trim() && platformMap[platform]) {
      stats.push({
        platform: platformMap[platform],
        handle: handle.trim(),
        followers: 0,  // Will be updated later
        engagement_rate: 0,
        verified: false,
        last_updated: new Date().toISOString()
      });
    }
  }

  return stats;
}

/**
 * Sanitize string input (XSS prevention)
 */
function sanitizeString(str: string): string {
  if (!str) return '';

  return str
    .trim()
    .replace(/[<>]/g, '')  // Remove angle brackets
    .replace(/javascript:/gi, '')  // Remove javascript: protocol
    .replace(/on\w+=/gi, '');  // Remove event handlers
}

/**
 * Sanitize phone number
 */
function sanitizePhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-numeric characters except +
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Calculate aggregate social media stats from array
 */
export function calculateSocialAggregates(social_media_stats: any[]): {
  total_followers: number;
  avg_engagement_rate: number;
} {
  if (!Array.isArray(social_media_stats) || social_media_stats.length === 0) {
    return { total_followers: 0, avg_engagement_rate: 0 };
  }

  const total_followers = social_media_stats.reduce(
    (sum, stat) => sum + (stat.followers || 0),
    0
  );

  const validRates = social_media_stats
    .filter(stat => typeof stat.engagement_rate === 'number')
    .map(stat => stat.engagement_rate);

  const avg_engagement_rate = validRates.length > 0
    ? validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length
    : 0;

  return {
    total_followers,
    avg_engagement_rate: Math.round(avg_engagement_rate * 100) / 100
  };
}
```

### Public Profile Builder

```typescript
// File: /lib/transformers/build-public-profile.ts

import type { Database } from '@/lib/types';

type User = Database['public']['Tables']['users']['Row'];

/**
 * Build sanitized public profile from user record
 * Removes all sensitive data and applies privacy settings
 */
export function buildPublicProfile(
  user: User,
  fmvData?: any,
  activeDealsCount: number = 0
) {
  return {
    // Public Identity
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    bio: user.bio,

    // School (Public)
    school_name: user.school_name,
    graduation_year: user.graduation_year,
    major: user.major,
    // GPA intentionally excluded (private)

    // Athletic (Public)
    primary_sport: user.primary_sport,
    position: user.position,
    team_name: user.team_name,
    division: user.division,
    achievements: user.achievements || [],
    secondary_sports: user.secondary_sports || [],

    // Social Media (Public)
    social_media_stats: user.social_media_stats || [],
    total_followers: user.total_followers || 0,
    avg_engagement_rate: user.avg_engagement_rate || 0,

    // Interests (Public)
    nil_interests: user.nil_interests || [],
    brand_affinity: user.brand_affinity || [],
    content_creation_interests: user.content_creation_interests || [],
    lifestyle_interests: user.lifestyle_interests || [],
    causes_care_about: user.causes_care_about || [],
    hobbies: user.hobbies || [],

    // Portfolio (Public)
    content_samples: user.content_samples || [],
    profile_video_url: user.profile_video_url,

    // FMV (Only if public)
    fmv_score: fmvData?.is_public_score ? fmvData.fmv_score : null,
    fmv_tier: fmvData?.is_public_score ? fmvData.fmv_tier : null,
    percentile_rank: fmvData?.is_public_score ? fmvData.percentile_rank : null,

    // Public Stats
    active_deals_count: activeDealsCount,
    profile_completion_score: user.profile_completion_score || 0,

    // Metadata
    created_at: user.created_at
  };
}

/**
 * Determine which fields are private vs public based on user settings
 */
export function getPrivacySettings(user: User) {
  // Future: This could be stored in a user_privacy_settings table
  // For now, use sensible defaults

  return {
    show_email: false,
    show_phone: false,
    show_parent_email: false,
    show_date_of_birth: false,
    show_gpa: false,
    show_exact_followers: true,  // Could be toggled by user
    show_fmv: user.athlete_fmv_data?.is_public_score || false,
    show_nil_preferences: false,  // Detailed preferences are private
    show_active_deals: true
  };
}
```

---

## Database Queries & Performance

### Optimized Query Patterns

#### 1. Fetch Own Profile (Minimal Fields)
```typescript
// Fetch only fields needed for dashboard display
const { data } = await supabase
  .from('users')
  .select(`
    id,
    first_name,
    last_name,
    username,
    bio,
    primary_sport,
    school_name,
    total_followers,
    profile_completion_score
  `)
  .eq('id', userId)
  .single();
```

#### 2. Fetch Complete Profile (All Fields)
```typescript
// Fetch everything for profile edit page
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

#### 3. Public Profile with Related Data
```typescript
// Efficient join for public profile
const { data } = await supabase
  .from('users')
  .select(`
    id,
    username,
    first_name,
    last_name,
    bio,
    school_name,
    graduation_year,
    primary_sport,
    position,
    achievements,
    social_media_stats,
    total_followers,
    avg_engagement_rate,
    content_samples,
    profile_video_url,
    profile_completion_score,
    created_at,
    athlete_fmv_data!inner (
      fmv_score,
      fmv_tier,
      is_public_score
    )
  `)
  .eq('username', username)
  .eq('role', 'athlete')
  .single();
```

#### 4. Batch Update (Multiple Fields)
```typescript
// Update multiple fields efficiently
const { data } = await supabase
  .from('users')
  .update({
    bio: updatedBio,
    social_media_stats: updatedStats,
    content_samples: updatedSamples,
    updated_at: new Date().toISOString()
  })
  .eq('id', userId)
  .select()
  .single();

// Triggers will auto-update:
// - total_followers
// - avg_engagement_rate
// - profile_completion_score
```

#### 5. Search Athletes (Matchmaking Query)
```typescript
// Complex matchmaking query with filters
const { data, count } = await supabase
  .from('users')
  .select('*', { count: 'exact' })
  .eq('role', 'athlete')
  .eq('onboarding_completed', true)
  .gte('total_followers', minFollowers)
  .lte('total_followers', maxFollowers)
  .gte('avg_engagement_rate', minEngagement)
  .contains('brand_affinity', targetBrands)  // Array overlap
  .ilike('school_name', `%${schoolQuery}%`)
  .order('profile_completion_score', { ascending: false })
  .range(offset, offset + limit - 1);
```

### Performance Optimization Strategies

#### 1. Index Utilization
All queries should use existing indexes:
- Username lookups: `idx_users_username`
- Follower filters: `idx_users_total_followers`
- Engagement filters: `idx_users_avg_engagement_rate`
- Array searches: GIN indexes on all array fields
- JSONB searches: GIN indexes on JSONB fields

#### 2. Caching Strategy
```typescript
// Redis cache for public profiles
const CACHE_TTL = 300; // 5 minutes

async function getCachedProfile(username: string) {
  const cacheKey = `profile:public:${username}`;

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const profile = await fetchPublicProfile(username);

  // Cache result
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(profile));

  return profile;
}

// Invalidate cache on profile update
async function invalidateProfileCache(username: string) {
  await redis.del(`profile:public:${username}`);
}
```

#### 3. Pagination
Always paginate large result sets:
```typescript
const PAGE_SIZE = 20;

const { data, count } = await supabase
  .from('users')
  .select('*', { count: 'exact' })
  .eq('role', 'athlete')
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

const totalPages = Math.ceil(count / PAGE_SIZE);
```

#### 4. Selective Field Loading
Only fetch fields you need:
```typescript
// Dashboard - minimal fields
.select('id, first_name, username, total_followers, profile_completion_score')

// Card view - public summary
.select('id, username, first_name, last_name, bio, primary_sport, total_followers')

// Full profile - everything
.select('*')
```

---

## Triggers & Stored Procedures

All triggers and functions already exist from **Migration 016**. Here's the verification and usage guide:

### Existing Functions

#### 1. calculate_total_followers(stats JSONB)
```sql
-- Sums followers across all social media platforms
SELECT calculate_total_followers('[
  {"platform": "instagram", "followers": 50000},
  {"platform": "tiktok", "followers": 100000}
]'::jsonb);
-- Returns: 150000
```

#### 2. calculate_avg_engagement_rate(stats JSONB)
```sql
-- Calculates average engagement rate
SELECT calculate_avg_engagement_rate('[
  {"platform": "instagram", "engagement_rate": 4.5},
  {"platform": "tiktok", "engagement_rate": 8.2}
]'::jsonb);
-- Returns: 6.35
```

#### 3. calculate_profile_completion_score(user_row users)
```sql
-- Calculates profile completion 0-100
-- Called automatically by trigger on INSERT/UPDATE
-- Weights:
-- - Core profile: 40 points (name, email, bio, photos)
-- - Athlete fields: 30 points (sport, school, achievements)
-- - Interests: 15 points (hobbies, brand affinity, etc.)
-- - Social media: 10 points (stats, content samples)
-- - NIL preferences: 5 points
```

### Existing Trigger

#### trigger_update_calculated_fields
```sql
-- Automatically fires on INSERT or UPDATE of:
CREATE TRIGGER trigger_update_calculated_fields
  BEFORE INSERT OR UPDATE OF
    social_media_stats,
    bio,
    profile_video_url,
    content_samples,
    hobbies,
    lifestyle_interests,
    brand_affinity,
    causes_care_about,
    content_creation_interests,
    nil_preferences,
    first_name,
    last_name,
    email,
    school_name,
    primary_sport,
    position,
    graduation_year,
    achievements
  ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_calculated_fields();
```

**What it does:**
1. Auto-calculates `total_followers` from `social_media_stats`
2. Auto-calculates `avg_engagement_rate` from `social_media_stats`
3. Auto-calculates `profile_completion_score` from all profile fields

**Usage:** No manual intervention needed. Just update the fields and the trigger handles the rest.

### Recommended Additional Functions

#### 1. Username Generator Function
```sql
-- File: migrations/060_username_generator.sql

CREATE OR REPLACE FUNCTION generate_unique_username(
  first_name TEXT,
  last_name TEXT,
  user_id UUID
) RETURNS TEXT AS $$
DECLARE
  base_username TEXT;
  candidate TEXT;
  suffix INTEGER := 0;
BEGIN
  -- Create base username: firstname-lastname
  base_username := LOWER(
    CONCAT(
      REGEXP_REPLACE(first_name, '[^a-zA-Z0-9]', '', 'g'),
      '-',
      REGEXP_REPLACE(last_name, '[^a-zA-Z0-9]', '', 'g')
    )
  );

  -- Try base username first
  candidate := base_username;

  -- If taken, append numbers until we find available one
  WHILE EXISTS (
    SELECT 1 FROM users
    WHERE username = candidate
    AND id != user_id
  ) LOOP
    suffix := suffix + 1;
    candidate := base_username || '-' || suffix::TEXT;
  END LOOP;

  RETURN candidate;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_unique_username IS
'Generates a unique username from first and last name, appending numbers if needed';
```

#### 2. Profile Validation Function
```sql
CREATE OR REPLACE FUNCTION validate_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate GPA range
  IF NEW.gpa IS NOT NULL AND (NEW.gpa < 0.0 OR NEW.gpa > 4.0) THEN
    RAISE EXCEPTION 'GPA must be between 0.0 and 4.0';
  END IF;

  -- Validate graduation year
  IF NEW.graduation_year IS NOT NULL AND
     (NEW.graduation_year < 2024 OR NEW.graduation_year > 2035) THEN
    RAISE EXCEPTION 'Graduation year must be between 2024 and 2035';
  END IF;

  -- Validate bio length
  IF NEW.bio IS NOT NULL AND LENGTH(NEW.bio) > 500 THEN
    RAISE EXCEPTION 'Bio cannot exceed 500 characters';
  END IF;

  -- Validate username format (if changed)
  IF NEW.username IS NOT NULL AND
     NEW.username != OLD.username AND
     NEW.username !~ '^[a-z0-9_-]{3,30}$' THEN
    RAISE EXCEPTION 'Username must be 3-30 characters, lowercase alphanumeric with hyphens or underscores';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
CREATE TRIGGER trigger_validate_profile_update
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_update();
```

#### 3. Profile Update Timestamp Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
CREATE TRIGGER trigger_update_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();
```

---

## Security Architecture

### Row Level Security (RLS) Policies

**IMPORTANT:** All profile data access is secured by RLS policies on the `users` table.

#### 1. Read Own Profile Policy
```sql
-- Users can read their own complete profile
CREATE POLICY "users_select_own_profile"
ON users
FOR SELECT
USING (auth.uid() = id);
```

#### 2. Update Own Profile Policy
```sql
-- Users can update their own profile (with field restrictions)
CREATE POLICY "users_update_own_profile"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = OLD.role  -- Cannot change role
  AND email = OLD.email  -- Cannot change email
  AND created_at = OLD.created_at  -- Cannot change created_at
);
```

#### 3. Public Profile Read Policy
```sql
-- Anyone can read public athlete profiles (sanitized fields only)
CREATE POLICY "users_select_public_athlete_profiles"
ON users
FOR SELECT
USING (
  role = 'athlete'
  AND onboarding_completed = true
);

-- Note: This policy allows SELECT * but the API layer filters sensitive fields
-- For stricter security, create a view with only public fields:

CREATE VIEW public_athlete_profiles AS
SELECT
  id,
  username,
  first_name,
  last_name,
  bio,
  school_name,
  graduation_year,
  major,  -- Exclude GPA
  primary_sport,
  position,
  team_name,
  division,
  achievements,
  secondary_sports,
  social_media_stats,
  total_followers,
  avg_engagement_rate,
  hobbies,
  content_creation_interests,
  brand_affinity,
  lifestyle_interests,
  causes_care_about,
  nil_interests,  -- Exclude nil_preferences (detailed)
  content_samples,
  profile_video_url,
  profile_completion_score,
  created_at
FROM users
WHERE role = 'athlete'
AND onboarding_completed = true;

-- Then use this view for public profile queries
```

#### 4. Agency/School Read Access Policy (Future)
```sql
-- Agencies can read athlete profiles they've matched with
CREATE POLICY "agencies_read_matched_athletes"
ON users
FOR SELECT
USING (
  role = 'athlete'
  AND EXISTS (
    SELECT 1 FROM agency_athlete_matches
    WHERE athlete_id = users.id
    AND agency_id = auth.uid()
    AND status IN ('contacted', 'interested', 'in_discussion', 'partnered')
  )
);
```

### API-Level Security

#### 1. Input Validation
- All inputs validated using Zod schemas
- XSS prevention: Sanitize all string inputs
- SQL injection prevention: Use parameterized queries only
- File upload validation: Content type, size, malware scanning

#### 2. Authentication Checks
```typescript
// Every protected route must verify session
const session = await getSession(request);
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

#### 3. Authorization Checks
```typescript
// Verify user can access requested resource
if (session.user.id !== resourceOwnerId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

#### 4. Rate Limiting
```typescript
// Implement rate limiting for expensive operations
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

// In API route:
const identifier = session.user.id;
const { success } = await ratelimit.limit(identifier);

if (!success) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429 }
  );
}
```

### Data Sanitization

```typescript
// File: /lib/security/sanitize.ts

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML/text input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (!input) return '';

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: []
  }).trim();
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // Only allow https and http
    if (!['https:', 'http:'].includes(parsed.protocol)) {
      return null;
    }

    // Block javascript: protocol
    if (parsed.protocol === 'javascript:') {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize all profile update fields
 */
export function sanitizeProfileUpdates(updates: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  // String fields
  const stringFields = [
    'first_name', 'last_name', 'bio', 'phone',
    'school_name', 'major', 'primary_sport', 'position',
    'team_name', 'division'
  ];

  for (const field of stringFields) {
    if (updates[field] !== undefined) {
      sanitized[field] = sanitizeString(updates[field]);
    }
  }

  // Array fields
  const arrayFields = [
    'achievements', 'secondary_sports', 'hobbies',
    'content_creation_interests', 'brand_affinity',
    'lifestyle_interests', 'causes_care_about',
    'nil_interests', 'nil_concerns'
  ];

  for (const field of arrayFields) {
    if (Array.isArray(updates[field])) {
      sanitized[field] = updates[field].map(sanitizeString);
    }
  }

  // URL field
  if (updates.profile_video_url) {
    sanitized.profile_video_url = sanitizeUrl(updates.profile_video_url);
  }

  // JSONB fields (validate structure)
  if (updates.social_media_stats) {
    sanitized.social_media_stats = sanitizeSocialMediaStats(updates.social_media_stats);
  }

  if (updates.nil_preferences) {
    sanitized.nil_preferences = updates.nil_preferences; // Already validated by Zod
  }

  if (updates.content_samples) {
    sanitized.content_samples = sanitizeContentSamples(updates.content_samples);
  }

  // Numeric fields (already validated by Zod)
  if (updates.gpa !== undefined) sanitized.gpa = updates.gpa;
  if (updates.graduation_year !== undefined) sanitized.graduation_year = updates.graduation_year;

  return sanitized;
}

function sanitizeSocialMediaStats(stats: any[]): any[] {
  return stats.map(stat => ({
    platform: sanitizeString(stat.platform),
    handle: sanitizeString(stat.handle),
    followers: parseInt(stat.followers, 10) || 0,
    engagement_rate: parseFloat(stat.engagement_rate) || 0,
    verified: Boolean(stat.verified),
    last_updated: stat.last_updated || new Date().toISOString(),
    notes: stat.notes ? sanitizeString(stat.notes) : undefined
  }));
}

function sanitizeContentSamples(samples: any[]): any[] {
  return samples.map(sample => ({
    ...sample,
    url: sanitizeUrl(sample.url),
    description: sample.description ? sanitizeString(sample.description) : undefined,
    brand: sample.brand ? sanitizeString(sample.brand) : undefined,
    campaign_type: sample.campaign_type ? sanitizeString(sample.campaign_type) : undefined,
    thumbnail_url: sample.thumbnail_url ? sanitizeUrl(sample.thumbnail_url) : undefined
  }));
}
```

---

## Error Handling Strategy

### Error Response Format

All API errors return consistent JSON format:

```typescript
{
  error: string;          // Human-readable error message
  code?: string;          // Machine-readable error code
  details?: any;          // Additional error context (validation errors, etc.)
  timestamp: string;      // ISO 8601 timestamp
  path: string;           // Request path that caused error
  requestId?: string;     // Unique request ID for debugging
}
```

### Error Types

#### 1. Validation Errors (400)
```typescript
{
  error: 'Validation failed',
  code: 'VALIDATION_ERROR',
  details: {
    fieldErrors: {
      bio: ['Bio must be under 500 characters'],
      gpa: ['GPA must be between 0.0 and 4.0']
    }
  },
  timestamp: '2025-10-27T12:00:00Z',
  path: '/api/profile'
}
```

#### 2. Authentication Errors (401)
```typescript
{
  error: 'Unauthorized',
  code: 'AUTH_REQUIRED',
  details: 'Valid session token required',
  timestamp: '2025-10-27T12:00:00Z',
  path: '/api/profile'
}
```

#### 3. Authorization Errors (403)
```typescript
{
  error: 'Forbidden',
  code: 'ACCESS_DENIED',
  details: 'You do not have permission to access this resource',
  timestamp: '2025-10-27T12:00:00Z',
  path: '/api/profile'
}
```

#### 4. Not Found Errors (404)
```typescript
{
  error: 'Profile not found',
  code: 'RESOURCE_NOT_FOUND',
  timestamp: '2025-10-27T12:00:00Z',
  path: '/api/athletes/nonexistent-user'
}
```

#### 5. Rate Limit Errors (429)
```typescript
{
  error: 'Too many requests',
  code: 'RATE_LIMIT_EXCEEDED',
  details: {
    limit: 10,
    window: '1 minute',
    retryAfter: 45  // seconds
  },
  timestamp: '2025-10-27T12:00:00Z',
  path: '/api/profile/calculate-fmv'
}
```

#### 6. Server Errors (500)
```typescript
{
  error: 'Internal server error',
  code: 'INTERNAL_ERROR',
  details: 'An unexpected error occurred. Please try again later.',
  requestId: 'req_abc123xyz',  // For support reference
  timestamp: '2025-10-27T12:00:00Z',
  path: '/api/profile'
}
```

### Error Logging

```typescript
// File: /lib/logging/error-logger.ts

import * as Sentry from '@sentry/nextjs';

export function logError(
  error: Error,
  context: {
    userId?: string;
    path: string;
    method: string;
    statusCode: number;
    requestBody?: any;
  }
) {
  // Log to console (development)
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', {
      error: error.message,
      stack: error.stack,
      ...context
    });
  }

  // Send to Sentry (production)
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: {
        path: context.path,
        method: context.method,
        statusCode: context.statusCode.toString()
      },
      user: context.userId ? { id: context.userId } : undefined,
      extra: {
        requestBody: context.requestBody
      }
    });
  }
}

// Usage in API route:
try {
  // ... API logic
} catch (error) {
  logError(error as Error, {
    userId: session?.user?.id,
    path: request.url,
    method: request.method,
    statusCode: 500,
    requestBody: await request.json()
  });

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## Testing Approach

### 1. Unit Tests (Jest + TypeScript)

Test individual functions in isolation:

```typescript
// File: /lib/transformers/__tests__/onboarding-to-profile.test.ts

import { transformOnboardingToProfile } from '../onboarding-to-profile';

describe('transformOnboardingToProfile', () => {
  it('should map personal info correctly', () => {
    const formData = {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'SARAH@EXAMPLE.COM',
      phone: '(123) 456-7890'
    };

    const result = transformOnboardingToProfile(formData);

    expect(result.first_name).toBe('Sarah');
    expect(result.last_name).toBe('Johnson');
    expect(result.email).toBe('sarah@example.com'); // Lowercased
    expect(result.phone).toBe('+11234567890'); // Sanitized
  });

  it('should handle array fields', () => {
    const formData = {
      achievements: 'All-State, Team Captain, MVP',
      hobbies: ['gaming', 'cooking', 'photography']
    };

    const result = transformOnboardingToProfile(formData);

    expect(result.achievements).toEqual([
      'All-State',
      'Team Captain',
      'MVP'
    ]);
    expect(result.hobbies).toEqual(['gaming', 'cooking', 'photography']);
  });

  it('should sanitize XSS attempts', () => {
    const formData = {
      bio: '<script>alert("xss")</script>My bio',
      first_name: 'Sarah<script>alert(1)</script>'
    };

    const result = transformOnboardingToProfile(formData);

    expect(result.bio).not.toContain('<script>');
    expect(result.first_name).toBe('Sarah');
  });
});
```

### 2. Integration Tests (API Routes)

Test full API endpoints:

```typescript
// File: /app/api/profile/__tests__/route.test.ts

import { GET, PUT } from '../route';
import { createMockRequest, createMockSession } from '@/lib/test-utils';

describe('GET /api/profile', () => {
  it('should return 401 when not authenticated', async () => {
    const request = createMockRequest({
      url: 'http://localhost/api/profile?userId=123'
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return profile for authenticated user', async () => {
    const mockSession = createMockSession({
      user: { id: 'user-123', email: 'athlete@test.com' }
    });

    const request = createMockRequest({
      url: 'http://localhost/api/profile?userId=user-123',
      session: mockSession
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.profile).toBeDefined();
    expect(data.profile.id).toBe('user-123');
  });

  it('should return 403 when accessing other user profile', async () => {
    const mockSession = createMockSession({
      user: { id: 'user-123' }
    });

    const request = createMockRequest({
      url: 'http://localhost/api/profile?userId=user-456',
      session: mockSession
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('Forbidden');
  });
});

describe('PUT /api/profile', () => {
  it('should update profile with valid data', async () => {
    const mockSession = createMockSession({
      user: { id: 'user-123' }
    });

    const request = createMockRequest({
      method: 'PUT',
      body: {
        userId: 'user-123',
        updates: {
          bio: 'Updated bio',
          primary_sport: 'Basketball'
        }
      },
      session: mockSession
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.profile.bio).toBe('Updated bio');
    expect(data.profile.primary_sport).toBe('Basketball');
  });

  it('should reject invalid data', async () => {
    const mockSession = createMockSession({
      user: { id: 'user-123' }
    });

    const request = createMockRequest({
      method: 'PUT',
      body: {
        userId: 'user-123',
        updates: {
          gpa: 5.0  // Invalid: exceeds max
        }
      },
      session: mockSession
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });
});
```

### 3. Database Tests (Triggers & Functions)

Test database logic:

```typescript
// File: /tests/database/triggers.test.ts

import { supabaseAdmin } from '@/lib/supabase-client';

describe('Database Triggers', () => {
  it('should auto-calculate total_followers on insert', async () => {
    const { data: user } = await supabaseAdmin
      .from('users')
      .insert({
        email: 'test@example.com',
        role: 'athlete',
        first_name: 'Test',
        last_name: 'User',
        social_media_stats: [
          { platform: 'instagram', handle: '@test', followers: 10000, engagement_rate: 5.0 },
          { platform: 'tiktok', handle: '@test', followers: 20000, engagement_rate: 8.0 }
        ]
      })
      .select()
      .single();

    expect(user.total_followers).toBe(30000);
    expect(user.avg_engagement_rate).toBe(6.5);

    // Cleanup
    await supabaseAdmin.from('users').delete().eq('id', user.id);
  });

  it('should recalculate on update', async () => {
    // Create user
    const { data: user } = await supabaseAdmin
      .from('users')
      .insert({
        email: 'test2@example.com',
        role: 'athlete',
        first_name: 'Test',
        last_name: 'User2',
        social_media_stats: [
          { platform: 'instagram', handle: '@test', followers: 10000, engagement_rate: 5.0 }
        ]
      })
      .select()
      .single();

    expect(user.total_followers).toBe(10000);

    // Update social media
    const { data: updated } = await supabaseAdmin
      .from('users')
      .update({
        social_media_stats: [
          { platform: 'instagram', handle: '@test', followers: 15000, engagement_rate: 5.0 }
        ]
      })
      .eq('id', user.id)
      .select()
      .single();

    expect(updated.total_followers).toBe(15000);

    // Cleanup
    await supabaseAdmin.from('users').delete().eq('id', user.id);
  });
});
```

### 4. End-to-End Tests (Playwright)

Test complete user flows:

```typescript
// File: /e2e/profile-completion.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Profile Completion Flow', () => {
  test('athlete can complete profile', async ({ page }) => {
    // Login as athlete
    await page.goto('/login');
    await page.fill('[name="email"]', 'athlete@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to profile
    await page.goto('/profile');

    // Check initial completion score
    const initialScore = await page.textContent('[data-testid="completion-score"]');
    expect(parseInt(initialScore!)).toBeLessThan(100);

    // Fill in bio
    await page.fill('[name="bio"]', 'Student athlete passionate about basketball and community service.');
    await page.click('button:has-text("Save")');

    // Wait for success message
    await expect(page.locator('text=Profile updated')).toBeVisible();

    // Check updated completion score
    const updatedScore = await page.textContent('[data-testid="completion-score"]');
    expect(parseInt(updatedScore!)).toBeGreaterThan(parseInt(initialScore!));
  });
});
```

### 5. Load Testing (k6)

Test performance under load:

```javascript
// File: /tests/load/profile-api.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% errors
  },
};

export default function () {
  // Test public profile endpoint
  const username = `athlete-${Math.floor(Math.random() * 1000)}`;
  const res = http.get(`http://localhost:3000/api/athletes/${username}`);

  check(res, {
    'status is 200 or 404': (r) => [200, 404].includes(r.status),
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## Implementation Roadmap

### Phase 1: Core Profile API (Week 1)
- [ ] Implement GET /api/profile
- [ ] Implement PUT /api/profile
- [ ] Create profile validation schemas
- [ ] Add input sanitization utilities
- [ ] Write unit tests for transformers
- [ ] Test with existing onboarding flow

### Phase 2: Public Profiles (Week 2)
- [ ] Enhance GET /api/athletes/[username]
- [ ] Implement public profile builder
- [ ] Add caching layer (Redis)
- [ ] Create public profile view (optional)
- [ ] Write integration tests
- [ ] Performance testing

### Phase 3: Profile Completion (Week 3)
- [ ] Implement GET /api/profile/completion
- [ ] Create detailed completion calculator
- [ ] Build completion UI components
- [ ] Add suggestions algorithm
- [ ] User testing

### Phase 4: FMV Integration (Week 4)
- [ ] Implement POST /api/profile/calculate-fmv
- [ ] Build FMV calculation algorithm
- [ ] Add rate limiting
- [ ] Create FMV display components
- [ ] Integration testing

### Phase 5: Advanced Features (Week 5)
- [ ] Username validation endpoint
- [ ] Profile view tracking (optional)
- [ ] Social media verification (optional)
- [ ] Advanced search/filtering
- [ ] Analytics dashboard

### Phase 6: Polish & Launch (Week 6)
- [ ] End-to-end testing
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation
- [ ] Monitoring setup
- [ ] Production deployment

---

## Appendix

### A. Environment Variables

```bash
# .env.local

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis (for caching)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Sentry (error tracking)
SENTRY_DSN=your-sentry-dsn

# Rate Limiting
RATE_LIMIT_ENABLED=true

# FMV Calculation
FMV_CALCULATION_LIMIT_PER_DAY=3
FMV_MIN_PROFILE_COMPLETION=60

# Feature Flags
ENABLE_PUBLIC_PROFILES=true
ENABLE_FMV_CALCULATION=true
ENABLE_PROFILE_VIEWS_TRACKING=false
```

### B. Database Migration Checklist

Before deploying profile system:

- [x] Migration 016 applied (athlete enhancements)
- [x] Migration 031 applied (username field)
- [ ] Verify all triggers are active
- [ ] Verify all indexes exist
- [ ] Test calculated fields auto-update
- [ ] Backup production database

### C. Monitoring & Alerts

Setup monitoring for:

1. **API Performance**
   - Response time p50, p95, p99
   - Error rate
   - Request volume

2. **Database Performance**
   - Query execution time
   - Connection pool usage
   - Index hit rate

3. **Cache Performance**
   - Hit rate
   - Miss rate
   - Eviction rate

4. **Business Metrics**
   - Profile completion rate
   - FMV calculation requests
   - Public profile views
   - Profile update frequency

---

**END OF DOCUMENT**

This architecture provides a complete, production-ready backend system for comprehensive athlete profiles on the ChatNIL platform.
