# Comprehensive Athlete Profile System - Master Plan

## Executive Summary

This master plan consolidates architectural design, UI/UX specifications, and backend architecture for building comprehensive student athlete profile pages on ChatNIL. The system transforms 60+ data fields collected during onboarding into a polished public showcase and powerful private editing interface.

---

## 🎯 Project Goals

1. **Display ALL athlete data comprehensively** - No more missing fields
2. **Reuse onboarding components** - Especially sport/position selection with smart popup fields
3. **Support multiple sports** - Primary sport + secondary sports array
4. **Create cohesive experience** - Polished for brands/agencies to evaluate athletes
5. **Enable easy editing** - Intuitive interface for athletes to manage their profiles

---

## 📊 Current State Analysis

### What's Working ✅
- Basic public profile at `/athletes/[username]`
- Basic edit page at `/profile`
- Header with 4 stat cards (Followers, Engagement, FMV, Deals)
- Social media presence section
- Achievements display
- Some interests shown

### What's Missing ❌
- **Coach information** (coach_name, coach_email)
- **Secondary sports** array support
- **Hobbies** and **lifestyle_interests**
- **NIL preferences** (deal types, compensation, content willing to create)
- **Content samples** portfolio/media gallery
- **Profile video** display
- **Major and GPA** in about section
- **Comparable athletes** section
- **Smart position picker** from onboarding

### Data Coverage Gap
Currently displaying: **~30% of available fields**
Target: **100% of available fields**

---

## 🏗️ System Architecture

### Component Hierarchy

```
/app/athletes/[username]     → Public Profile Page
/app/profile                 → Private Edit Page

/components/profile/
├── /shared                  → Reusable components
│   ├── SportsPositionPicker.tsx      ⭐ NEW
│   ├── PositionPickerModal.tsx       ⭐ NEW
│   ├── SecondarySportsManager.tsx    ⭐ NEW
│   ├── InterestsSelector.tsx         ⭐ NEW
│   ├── SocialMediaStatsCard.tsx      ⭐ NEW
│   ├── PortfolioItemCard.tsx         ⭐ NEW
│   └── MediaGallery.tsx              ⭐ NEW
│
├── /public                  → Public showcase components
│   ├── ProfileHero.tsx
│   ├── AboutSection.tsx
│   ├── AthleticSection.tsx           (Enhanced)
│   ├── SocialMediaSection.tsx
│   ├── InterestsSection.tsx          (Enhanced)
│   ├── NILPreferencesSection.tsx     ⭐ NEW
│   ├── PortfolioSection.tsx          ⭐ NEW
│   ├── ComparableAthletesSection.tsx ⭐ NEW
│   └── ProfileSidebar.tsx
│
└── /edit                    → Private editing components
    ├── PersonalInfoTab.tsx
    ├── AthleticInfoTab.tsx           (Enhanced)
    ├── SocialMediaTab.tsx
    ├── InterestsTab.tsx              (Enhanced)
    ├── NILPreferencesTab.tsx         ⭐ NEW
    └── PortfolioTab.tsx              ⭐ NEW
```

---

## 📋 Complete Data Model

All fields from the `users` table that need to be displayed/editable:

### Personal Information (8 fields)
- `first_name`, `last_name`, `email` (read-only)
- `bio` (500 chars)
- `school_name`, `graduation_year`
- `major`, `gpa` ⚠️ Currently not shown
- `date_of_birth`, `phone`

### Athletic Information (9 fields)
- `primary_sport`, `position`
- `secondary_sports[]` ⚠️ Currently not shown (array)
- `team_name`, `division`
- `achievements[]` (array)
- `coach_name`, `coach_email` ⚠️ Currently not shown

### Social Media (4 platforms in JSONB)
- `social_media_stats.instagram` (handle, followers, engagement_rate)
- `social_media_stats.tiktok` (handle, followers, engagement_rate)
- `social_media_stats.twitter` (handle, followers, engagement_rate)
- `social_media_stats.youtube` (subscribers, handle)
- Computed: `total_followers`, `avg_engagement_rate`

### Interests & Values (5 arrays)
- `hobbies[]` ⚠️ Currently not shown
- `content_creation_interests[]`
- `lifestyle_interests[]` ⚠️ Currently not shown
- `causes_care_about[]`
- `brand_affinity[]`

### NIL Preferences (JSONB object) ⚠️ Entire section missing
```typescript
nil_preferences: {
  preferred_deal_types: string[];
  min_compensation: number;
  max_compensation: number;
  preferred_partnership_length: string;
  content_types_willing: string[];
  blacklist_categories: string[];
  negotiation_flexibility: 'firm' | 'somewhat_flexible' | 'very_flexible';
  travel_willing: boolean;
  max_travel_distance_miles: number;
}
```

### Portfolio (JSONB array + URL) ⚠️ Currently placeholder only
- `content_samples[]` (type, url, metrics, sponsored, brand)
- `profile_video_url`

### FMV Data (from athlete_fmv_data table)
- `fmv_score`, `fmv_tier`, `percentile_rank`

### NIL Deals (from nil_deals table)
- `active_deals_count`

**Total Fields:** 60+ fields across 7 major categories

---

## 🎨 UI/UX Design Specifications

### Public Profile Layout (`/athletes/[username]`)

```
┌─────────────────────────────────────────────────┐
│ HERO HEADER (Gradient: Orange → Gold)          │
│ ┌──────┐  Sarah Johnson                         │
│ │Avatar│  🏀 Basketball - Point Guard           │
│ └──────┘  Kentucky High School | Class of 2025  │
│           [Message] [Share]                      │
│                                                  │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│ │25.4K │ │ 4.2% │ │ 85th │ │  3   │            │
│ │Follow│ │Engage│ │ FMV  │ │Deals │            │
│ └──────┘ └──────┘ └──────┘ └──────┘            │
└─────────────────────────────────────────────────┘

┌──────────────────────┐  ┌────────────────────┐
│ MAIN (2/3)           │  │ SIDEBAR (1/3)      │
│                      │  │                    │
│ ✓ About              │  │ Quick Actions      │
│ ✓ Athletic Info      │  │ Availability       │
│ ✓ Achievements       │  │ FMV Breakdown      │
│ ⭐ Interests (Full)  │  │ Verification       │
│ ✓ Social Media       │  └────────────────────┘
│ ⭐ NIL Preferences   │
│ ⭐ Portfolio         │
│ ⭐ Comparable        │
└──────────────────────┘
```

### Private Edit Page Layout (`/profile`)

```
┌─────────────────────────────────────────────────┐
│ Edit Profile    [View Public] [Save Changes]    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Profile Completion: ████████░░░░ 65%            │
│ "Complete 5 more fields to reach Excellent!"    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ [Personal] [Athletic] [Social] [Interests]      │
│ [NIL Prefs] [Portfolio]                         │
│                                                  │
│ ┌───────────────────────────────────────────┐   │
│ │ TAB CONTENT                               │   │
│ │ • Auto-save on blur (500ms debounce)      │   │
│ │ • Inline validation                       │   │
│ │ • "Saving..." → "Saved ✓" indicator      │   │
│ └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 🔑 Key New Components

### 1. SportsPositionPicker (Reusable)

**Purpose:** Unified sport + position selection with autocomplete and modal picker

**Features:**
- Autocomplete from 20+ sports in `sports-data.ts`
- Click sport → Opens PositionPickerModal
- Sport-specific positions (e.g., Basketball shows PG, SG, SF, PF, C)
- Custom position input fallback
- Used in: Athletic tab, Secondary sports

**Props:**
```typescript
interface SportsPositionPickerProps {
  value: { sport: string; position?: string };
  onChange: (sport: string, position?: string) => void;
  label: string;
  error?: string;
  showPositionButton?: boolean;
}
```

**Visual:**
```
┌──────────────────────────────────────┐
│ Primary Sport *                      │
│ ┌──────────────────┐ [Select Pos]   │
│ │ Basketball   ▼   │                │
│ └──────────────────┘                │
│                                      │
│ Selected Position: Point Guard (PG) │
└──────────────────────────────────────┘
```

---

### 2. PositionPickerModal

**Purpose:** Modal popup with sport-specific position grid

**Triggered by:** Clicking "Select Position" button

**UI:**
```
┌────────────────────────────────────┐
│ Select Position for Basketball  ✕  │
│                                    │
│ ┌─────────┐ ┌─────────┐          │
│ │  Point  │ │Shooting │          │
│ │ Guard   │ │ Guard   │          │
│ │  (PG)   │ │  (SG)   │          │
│ └─────────┘ └─────────┘          │
│                                    │
│ ┌─────────┐ ┌─────────┐          │
│ │ Small   │ │ Power   │          │
│ │ Forward │ │ Forward │          │
│ │  (SF)   │ │  (PF)   │          │
│ └─────────┘ └─────────┘          │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ Custom Position (if not     │  │
│ │ listed above)               │  │
│ └──────────────────────────────┘  │
│                                    │
│          [Cancel]  [Confirm]       │
└────────────────────────────────────┘
```

**Integration with Onboarding:**
- Uses same `getPositionsForSport()` function from `sports-data.ts`
- Replicates UX from `AthleteSportsInfoStep.tsx`

---

### 3. SecondarySportsManager

**Purpose:** Manage up to 3 secondary sports with positions

**Features:**
- Add/remove sports dynamically
- Each uses SportsPositionPicker
- Limit: 3 secondary sports

**Visual:**
```
┌──────────────────────────────────────┐
│ Secondary Sports (Optional)   [+ Add]│
│                                      │
│ ┌──────────────────────┐  [Remove]  │
│ │ Soccer - Midfielder  │    ✕       │
│ └──────────────────────┘            │
│                                      │
│ ┌──────────────────────┐  [Remove]  │
│ │ Tennis - Singles     │    ✕       │
│ └──────────────────────┘            │
│                                      │
│ [+ Add Secondary Sport]              │
│ (1 slot remaining)                   │
└──────────────────────────────────────┘
```

---

### 4. NILPreferencesSection (Public) / NILPreferencesTab (Edit)

**Purpose:** Display/edit athlete's NIL partnership preferences

**Public View (for agencies):**
```
┌────────────────────────────────────┐
│ NIL Partnership Preferences        │
│                                    │
│ 💼 Deal Types Interested In:       │
│ • Sponsored Posts                  │
│ • Brand Ambassador                 │
│ • Content Creation                 │
│                                    │
│ 💰 Compensation Range:             │
│ $500 - $5,000 per partnership      │
│                                    │
│ 📹 Content Willing to Create:      │
│ • Instagram Posts & Stories        │
│ • TikTok Videos                    │
│ • YouTube Videos                   │
│                                    │
│ ✈️ Travel: Willing to travel       │
│    (Up to 100 miles)               │
│                                    │
│ 🤝 Partnership Length:              │
│ Prefers 3-6 month partnerships     │
└────────────────────────────────────┘
```

**Edit View:**
- Multi-select checkboxes for deal types
- Dual-handle slider for compensation range
- Multi-select for content types
- Toggle for travel willingness
- Dropdown for partnership length

---

### 5. PortfolioSection / MediaGallery

**Purpose:** Display athlete's content samples and work

**Features:**
- Grid layout (3 columns desktop, 2 tablet, 1 mobile)
- Each item shows thumbnail, platform, metrics
- Sponsored content badge
- Click to expand/view details

**Visual:**
```
┌────────────────────────────────────┐
│ Portfolio & Content Samples        │
│                                    │
│ ┌─────┐ ┌─────┐ ┌─────┐           │
│ │ IG  │ │TikTk│ │ YT  │           │
│ │Post │ │Video│ │Vid  │           │
│ │5.2K │ │12K  │ │8.3K │           │
│ │❤️    │ │👁️   │ │👁️   │           │
│ │SPON │ │     │ │     │           │
│ └─────┘ └─────┘ └─────┘           │
│                                    │
│ ┌─────┐ ┌─────┐ ┌─────┐           │
│ │Tweet│ │ IG  │ │Blog │           │
│ │1.2K │ │Reel │ │Post │           │
│ │👁️    │ │3.8K │ │500  │           │
│ │     │ │❤️    │ │👁️   │           │
│ └─────┘ └─────┘ └─────┘           │
└────────────────────────────────────┘
```

**Upload (Edit Mode):**
- Drag & drop or click to upload
- URL input for existing content
- Platform auto-detection
- Metrics input (likes, views, etc.)
- Mark as sponsored checkbox

---

## 🔧 Backend Architecture

### API Endpoints

#### 1. GET `/api/profile`
**Purpose:** Fetch own complete profile (all 60+ fields)

**Request:**
```typescript
GET /api/profile?userId={userId}
```

**Response:**
```typescript
{
  success: true,
  profile: ComprehensiveAthleteProfile,
  completionScore: 65,
  missingFields: ["major", "gpa", "coach_email"]
}
```

---

#### 2. PUT `/api/profile`
**Purpose:** Update profile fields with validation

**Request:**
```typescript
PUT /api/profile
{
  userId: string,
  updates: {
    bio?: string,
    primary_sport?: string,
    secondary_sports?: string[],
    nil_preferences?: NILPreferences,
    // ... any field
  }
}
```

**Validation:**
- Zod schemas for each field type
- XSS sanitization for text fields
- URL validation for content samples
- Sport/position validation against sports-data

**Response:**
```typescript
{
  success: true,
  profile: UpdatedProfile,
  completionScore: 72, // Updated
  changedFields: ["bio", "secondary_sports"]
}
```

---

#### 3. GET `/api/athletes/[username]`
**Purpose:** Public profile (sanitized data)

**Enhancement:** Add missing fields to response

**Current Response (partial):**
```typescript
{
  id, username, first_name, last_name,
  bio, school_name, primary_sport, position,
  social_media_stats, achievements,
  fmv_score, percentile_rank, active_deals_count
}
```

**Enhanced Response (comprehensive):**
```typescript
{
  // ... existing fields
  secondary_sports: ["Soccer", "Tennis"],
  major: "Sports Management",
  coach_name: "Coach Smith",
  coach_email: "smith@school.edu", // Only if athlete allows
  hobbies: ["Photography", "Music"],
  lifestyle_interests: ["Fashion", "Travel"],
  nil_preferences: { /* sanitized */ },
  content_samples: [/* portfolio items */],
  profile_video_url: "https://..."
}
```

---

#### 4. POST `/api/profile/calculate-fmv`
**Purpose:** Trigger FMV recalculation

**Rate Limit:** 3 times per day per user

**Request:**
```typescript
POST /api/profile/calculate-fmv
{ userId: string }
```

**Response:**
```typescript
{
  success: true,
  fmv_score: 87,
  fmv_tier: "elite",
  percentile_rank: 85,
  updated_at: "2025-10-27T..."
}
```

---

#### 5. GET `/api/profile/completion`
**Purpose:** Get detailed completion breakdown

**Request:**
```typescript
GET /api/profile/completion?userId={userId}
```

**Response:**
```typescript
{
  overall: 65,
  bySection: {
    personal: 80,      // bio, school, major, gpa
    athletic: 70,      // sport, position, achievements, coach
    social: 100,       // all platforms filled
    interests: 50,     // some categories missing
    nil: 30,           // preferences incomplete
    portfolio: 0       // no content samples
  },
  missingFields: [
    { field: "major", section: "personal", weight: 3 },
    { field: "coach_email", section: "athletic", weight: 2 }
  ],
  nextMilestone: {
    target: 80,
    fieldsNeeded: 5,
    estimatedPoints: 15
  }
}
```

---

### Database Considerations

**Good News:** No new tables needed! All fields exist in `users` table from Migration 016.

**Fields to Verify:**
```sql
-- Check if these exist (they should from Migration 016)
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN (
  'secondary_sports',
  'coach_name',
  'coach_email',
  'hobbies',
  'lifestyle_interests'
);
```

**Triggers Already in Place:**
- `update_total_followers()` - Auto-calculates from social_media_stats
- `update_avg_engagement()` - Auto-calculates average engagement
- `update_profile_completion()` - Auto-calculates completion score

---

### Security & Privacy

**Row-Level Security (RLS) Policies:**

1. **Own Profile (Full Access):**
```sql
-- User can read/write their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);
```

2. **Public Profiles (Read-Only, Sanitized):**
```sql
-- Anyone can read public profile fields
CREATE POLICY "users_select_public" ON users
  FOR SELECT USING (
    onboarding_completed = true
    AND username IS NOT NULL
  );
```

**Field-Level Privacy:**
- Email: Never public
- Phone: Never public
- Coach email: Athlete can toggle visibility
- NIL preferences: Compensation range public, but exact figures private

---

## 📱 Responsive Design

### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Layout Adaptations

**Public Profile:**
- Desktop: 2-column (content + sidebar)
- Tablet: 2-column (narrower sidebar)
- Mobile: Stacked, sidebar becomes bottom sheet

**Edit Profile:**
- Desktop: Wide form fields, 2-3 columns
- Tablet: Single column forms
- Mobile: Full-width, larger touch targets

**Stats Cards (Hero):**
- Desktop: 4 columns (25% each)
- Tablet: 2x2 grid
- Mobile: Stacked vertical

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1)
**Goal:** Shared component library

**Tasks:**
1. Create `/components/profile/shared/` directory
2. Build `SportsPositionPicker.tsx`
3. Build `PositionPickerModal.tsx`
4. Build `SecondarySportsManager.tsx`
5. Build `InterestsSelector.tsx`
6. Build `SocialMediaStatsCard.tsx`
7. Build `PortfolioItemCard.tsx` & `MediaGallery.tsx`
8. Create test data for Sarah Johnson with all fields

**Deliverables:**
- ✅ 7 reusable components
- ✅ TypeScript interfaces
- ✅ Storybook stories (optional)
- ✅ Unit tests

---

### Phase 2: Private Edit Page (Week 2)
**Goal:** Full profile editing capability

**Tasks:**
1. Refactor `/app/profile/page.tsx`
2. Implement 6-tab layout:
   - Personal Info
   - Athletic Info (with SportsPositionPicker)
   - Social Media (reuse onboarding component)
   - Interests (reuse onboarding component)
   - NIL Preferences (NEW)
   - Portfolio (NEW)
3. Add auto-save functionality (500ms debounce)
4. Add profile completion indicator
5. Integrate all shared components

**Deliverables:**
- ✅ Tabbed edit interface
- ✅ Auto-save with visual feedback
- ✅ Validation for all fields
- ✅ Profile completion tracking

---

### Phase 3: Public Profile Enhancement (Week 3)
**Goal:** Comprehensive public showcase

**Tasks:**
1. Enhance `/app/athletes/[username]/page.tsx`
2. Add missing sections:
   - Enhanced About (add major, GPA)
   - Enhanced Athletic (add secondary sports, coach)
   - Enhanced Interests (add hobbies, lifestyle)
   - NEW: NIL Preferences section
   - NEW: Portfolio/Media Gallery section
   - NEW: Comparable Athletes section
3. Update sidebar with additional info
4. Add mobile bottom sheet for sidebar

**Deliverables:**
- ✅ All 60+ fields displayed
- ✅ 3 new sections
- ✅ Mobile-optimized

---

### Phase 4: Backend API (Week 4)
**Goal:** Robust API layer

**Tasks:**
1. Create validation schemas in `/lib/validation/`
2. Build data transformers in `/lib/transformers/`
3. Implement API endpoints:
   - Enhanced GET `/api/profile`
   - Enhanced PUT `/api/profile`
   - Enhanced GET `/api/athletes/[username]`
   - NEW: POST `/api/profile/calculate-fmv`
   - NEW: GET `/api/profile/completion`
4. Add error handling
5. Add rate limiting

**Deliverables:**
- ✅ 5 API endpoints
- ✅ Zod validation schemas
- ✅ Error handling
- ✅ API documentation

---

### Phase 5: Testing & Polish (Week 5)
**Goal:** Production-ready

**Tasks:**
1. Unit tests for components
2. Integration tests for API
3. E2E tests with Playwright
4. Performance optimization
5. Accessibility audit
6. Browser compatibility testing
7. Load testing

**Deliverables:**
- ✅ 80%+ test coverage
- ✅ WCAG AA compliance
- ✅ < 2s load time
- ✅ Works in all major browsers

---

### Phase 6: Launch & Monitor (Week 6)
**Goal:** Deploy and gather feedback

**Tasks:**
1. Deploy to production
2. Monitor error rates
3. Gather user feedback
4. Hotfix critical issues
5. Plan iteration 2

**Deliverables:**
- ✅ Production deployment
- ✅ Monitoring dashboard
- ✅ User feedback collected
- ✅ Iteration 2 roadmap

---

## ✅ Success Metrics

### Quantitative KPIs
- **Profile Completion Rate:** Increase from current baseline to 85%+
- **Edit Page Engagement:** Average session time > 5 minutes
- **Public Profile Views:** Increase 50% (better discovery)
- **NIL Inquiries:** Increase 40% (agencies see preferences)
- **Bounce Rate:** Decrease to < 30% on public profiles

### Qualitative Goals
- Athletes report profile "feels complete"
- Agencies report "all info I need is visible"
- Position selection "intuitive and fast"
- Auto-save "seamless and reliable"

---

## 🎯 Key Decisions Summary

### 1. Component Reusability
**Decision:** Extract shared components from onboarding, use in both onboarding and profile editing

**Rationale:**
- DRY principle
- Consistent UX across flows
- Easier maintenance

### 2. Position Selection UX
**Decision:** Modal popup with sport-specific position grid (not dropdown)

**Rationale:**
- Visual, scannable
- Matches onboarding pattern users already learned
- Supports custom positions

### 3. State Management
**Decision:** React Context for profile edit state, no Redux

**Rationale:**
- Profile data is user-scoped
- Simple use case
- Avoid over-engineering

### 4. Auto-Save Strategy
**Decision:** Debounced auto-save on blur (500ms), with optimistic updates

**Rationale:**
- Better UX than manual save button
- Prevents data loss
- Visual feedback builds confidence

### 5. Data Architecture
**Decision:** No new tables, use existing `users` table

**Rationale:**
- All fields already exist from Migration 016
- Triggers auto-calculate aggregates
- Simpler to maintain

---

## 📚 Documentation Created

1. **ATHLETE_PROFILE_DESIGN.md** (350+ lines)
   - UI/UX specifications
   - Component designs
   - Interaction patterns
   - Accessibility guidelines

2. **ATHLETE_PROFILE_IMPLEMENTATION_GUIDE.md** (400+ lines)
   - Step-by-step integration guide
   - Code examples
   - API connection instructions
   - Testing checklists

3. **ATHLETE_PROFILE_BACKEND_ARCHITECTURE.md** (12,000+ lines)
   - Database architecture
   - API specifications
   - Validation schemas
   - Security policies
   - Performance optimization
   - Error handling

4. **ATHLETE_PROFILE_MASTER_PLAN.md** (This document)
   - Consolidated overview
   - Implementation roadmap
   - Success metrics

---

## 🔗 Integration Points

### With Existing Code

**Reuse from Onboarding:**
- `lib/sports-data.ts` - Sport/position data
- `lib/onboarding-types.ts` - Validation schemas
- `components/onboarding/steps/AthleteSocialMediaStep.tsx`
- `components/onboarding/steps/AthleteInterestsStep.tsx`
- `components/onboarding/steps/AthleteNILPreferencesStep.tsx`
- `components/onboarding/steps/AthleteContentSamplesStep.tsx`

**Existing UI Components:**
- `components/ui/Card.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Avatar.tsx`
- `components/ui/Progress.tsx`
- `components/ui/Tabs.tsx`
- `components/ui/Input.tsx`

**Existing Utilities:**
- `lib/profile-data.ts` - Profile fetching
- `lib/profile-completion.ts` - Completion calculation
- `lib/supabase-client.ts` - Database client

---

## 🚨 Risk Assessment

### Technical Risks

**Risk 1: Position Picker Complexity**
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** Use onboarding component as reference, extensive testing

**Risk 2: Auto-Save Race Conditions**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Debounce, optimistic updates with rollback, mutex locks

**Risk 3: Data Migration (secondary_sports)**
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:** Verify field exists before Phase 1, add migration if needed

### UX Risks

**Risk 1: Form Fatigue**
- **Issue:** 60+ fields overwhelming
- **Mitigation:** Tabbed interface, progressive disclosure, completion incentives

**Risk 2: Position Picker Discoverability**
- **Issue:** Users may not realize position selection available
- **Mitigation:** Clear visual cues, inline help, onboarding tooltip

---

## 📞 Support & Resources

### Documentation
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Zod Validation](https://zod.dev/)

### Internal Resources
- Design System V4: `/components/ui/`
- Sports Data: `/lib/sports-data.ts`
- Onboarding Components: `/components/onboarding/steps/`
- Database Schema: `/lib/types.ts`

---

## 🎉 Conclusion

This comprehensive plan provides a complete blueprint for transforming ChatNIL's athlete profiles from basic display to comprehensive showcase. By reusing onboarding components, building a shared library with smart position selection, and displaying all 60+ data fields, we achieve:

1. ✅ **Comprehensive Data Display** - No more missing fields
2. ✅ **Intelligent Position Selection** - Sport-specific popup from onboarding
3. ✅ **Component Reusability** - DRY principle across platform
4. ✅ **Polished UX** - Auto-save, validation, visual feedback
5. ✅ **Agency-Ready** - NIL preferences, portfolio, discovery tools

The phased 6-week approach ensures manageable implementation with continuous value delivery. All three specialized agents (Blueprint, Nova, Forge) have provided detailed specifications ready for immediate development.

---

## 🚀 Next Steps

1. **Review this plan** with your team
2. **Verify database fields** (especially `secondary_sports`)
3. **Assign developers** to Phase 1 tasks
4. **Set up project board** for tracking
5. **Schedule daily standups** during implementation
6. **Plan user testing** for end of Phase 3

**Ready to begin? Start with Phase 1: Foundation (Week 1)**

---

*Generated by Blueprint Architect, Nova Frontend Architect, and Forge Backend Engineer*
*Date: October 27, 2025*
*Version: 1.0*
