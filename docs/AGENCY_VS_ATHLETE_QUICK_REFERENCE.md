# Agency vs Athlete: Quick Reference Guide

**TL;DR:** Athletes and Agencies have COMPLETELY DIFFERENT experiences on ChatNIL. This is not just a visual difference - it's a fundamental architectural difference.

---

## At a Glance

| | Athlete | Agency |
|---|---------|--------|
| **User Type** | Student-athlete (individual) | Business/Brand (organization) |
| **Layout** | Left sidebar + Main content | Top nav only + Main content |
| **Sidebar** | ✅ YES (Chat history) | ❌ NO (No AI chat) |
| **Primary Goal** | Learn NIL, build brand | Find talent, manage campaigns |
| **Dashboard Focus** | Personal growth metrics | Business KPIs |
| **"Messages"** | AI chat assistant | Direct athlete communication |
| **Navigation Pages** | Dashboard, Profile, Badges, Quizzes, Library, Messages, Settings | Dashboard, Discover, Campaigns, Athletes, Messages, Analytics, Settings |
| **Tone** | Encouraging, warm, Gen Z | Professional, data-driven, efficient |

---

## Navigation Comparison

### Athlete Navigation

```
┌──────────────┬────────────────────────────────────────┐
│              │ [Header with Profile Menu]            │
│              ├────────────────────────────────────────┤
│  Sidebar:    │                                        │
│  - New Chat  │                                        │
│  - Chat 1    │         Main Content                  │
│  - Chat 2    │         (Chat Interface)              │
│  - Chat 3    │                                        │
│              │                                        │
│  Recent:     │                                        │
│  - Dashboard │                                        │
│  - Profile   │                                        │
│  - Badges    │                                        │
└──────────────┴────────────────────────────────────────┘
```

### Agency Navigation

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Dashboard Discover Campaigns Athletes Messages  │
│                             Analytics Settings [Profile]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│                  Main Content                           │
│                  (Full Width - No Sidebar)              │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Dashboard Comparison

### Athlete Dashboard

**Header:**
- "🏆 Your NIL Dashboard"
- "Welcome back, Sarah! 👋 Let's level up your NIL game"
- Animated gradient, shimmer effects
- Gen Z energy

**Widgets:**
- Profile Completion Progress (75%)
- FMV Score Card ($45K - $65K)
- Campaign Opportunities (3 new)
- Activity Feed (quiz completed, badge earned)
- Upcoming Events (quiz deadline, webinar)
- Quick Actions (Take Quiz, Complete Profile)

**Tone:** Personal, encouraging, warm, playful

### Agency Dashboard

**Header:**
- "Agency Dashboard"
- "Manage your NIL campaigns and athlete partnerships"
- Clean gradient, professional
- Corporate-friendly

**Widgets:**
- Active Athletes (127, +12% MoM)
- Active Campaigns (23, +5% MoM)
- Total Impressions (2.4M, +18% MoM)
- Campaign Spend ($487K, -8% under budget)
- Active Campaigns List (with progress bars)
- Top Performing Athletes (with metrics)
- Recent Activity (messages, invites, milestones)
- Pending Approvals (payments, contracts)
- Upcoming Milestones (deadlines, dates)

**Tone:** Professional, data-driven, efficient, results-focused

---

## Key Pages

### Athlete Pages

1. **Dashboard** - Personal metrics, learning progress
2. **Profile** - Edit athlete profile (sport, school, social media)
3. **Badges** - Achievement showcase, gamification
4. **Quizzes** - NIL education, learning modules
5. **Library** - Knowledge base, articles, resources
6. **Messages** - AI chat assistant (ChatGPT-style)
7. **Opportunities** - Campaign invites from agencies
8. **Settings** - Account preferences, notifications

### Agency Pages

1. **Dashboard** - Business overview, campaign performance
2. **Discover** - Find athletes (search, filter, AI recommendations)
3. **Campaigns** - Create and manage campaigns
4. **Athletes** - My roster (athletes I've worked with)
5. **Messages** - Direct communication with athletes
6. **Analytics** - Deep-dive metrics, ROI, reporting
7. **Settings** - Company profile, billing, team management

---

## "Messages" Terminology Confusion

**CRITICAL DIFFERENCE:**

| User Type | What "Messages" Means |
|-----------|----------------------|
| **Athlete** | AI chat assistant (like ChatGPT) - Learning conversations |
| **Agency** | Direct messages with athletes - Business communication |

**Why This Matters:**
- Athlete clicks "Messages" → Opens chat with AI
- Agency clicks "Messages" → Opens inbox of athlete conversations
- These are COMPLETELY DIFFERENT features with the same label

**Solution:**
- Athletes: Keep "Messages" for AI chat (or maybe "Chat" to be clearer)
- Agencies: "Messages" means athlete inbox (like LinkedIn messages)

---

## Routes

### Athlete Routes
```
/                    → Chat interface (AI)
/dashboard           → Athlete dashboard
/profile             → Athlete profile
/profile/edit        → Edit profile
/badges              → Badge showcase
/quizzes             → Learning quizzes
/library             → Knowledge base
/messages            → AI chat (same as /)
/opportunities       → Campaign opportunities
/settings            → User settings
```

### Agency Routes
```
/agencies/dashboard  → Agency dashboard
/agencies/discover   → Find athletes
/agencies/campaigns  → Manage campaigns
/agencies/athletes   → My athlete roster
/agencies/messages   → Athlete inbox
/agencies/analytics  → Metrics & reporting
/agencies/settings   → Company settings
```

---

## Component Reuse

### Fully Shared ✅
- Card, Button, Badge, Input (design system)
- Color palette (warm oranges, ambers)
- Typography
- Animations (Framer Motion)

### Partially Shared ⚠️
- Layout wrappers (different structure)
- StatCard (same component, different metrics)
- EmptyState (same component, different copy)

### NOT Shared ❌

**Athlete-Only:**
- ChatInterface
- AIComposer
- QuizCard
- BadgeShowcase
- FMVScoreCard
- ProfileCompletionIndicator

**Agency-Only:**
- AthleteDiscoveryCard
- CampaignCard
- PerformanceChart
- AthleteRosterTable
- MessageThread (agency <-> athlete)
- CampaignWizard

---

## Design Guidelines

### Athlete Aesthetic
- **Colors:** More saturated oranges/ambers (vibrant)
- **Gradients:** Frequent use, playful
- **Animations:** Shimmer, pulse, playful
- **Emojis:** Frequent (👋 🏆 ⭐)
- **Tone:** Warm, cozy, encouraging
- **Typography:** Larger, bolder, energetic
- **Whitespace:** Generous, airy

### Agency Aesthetic
- **Colors:** Muted oranges (corporate-friendly warm)
- **Gradients:** Subtle, professional
- **Animations:** Smooth transitions, not playful
- **Emojis:** Minimal or none
- **Tone:** Clean, efficient, data-driven
- **Typography:** Smaller, denser, professional
- **Whitespace:** Efficient, not excessive

---

## Data Models

### Athlete Data
```typescript
interface AthleteProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  sport: string;
  school: string;
  graduation_year: number;
  social_media: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
  };
  profile_completion: number; // 0-100%
  fmv_score: number; // Fair Market Value
  badges: Badge[];
}
```

### Agency Data
```typescript
interface AgencyProfile {
  user_id: string;
  company_name: string;
  industry: string;
  website: string;
  team_size: number;
}

interface Campaign {
  id: string;
  agency_user_id: string;
  campaign_name: string;
  brand_name: string;
  total_budget: number;
  start_date: Date;
  end_date: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
  athletes: CampaignInvite[];
  performance: CampaignMetrics;
}
```

---

## Common Pitfalls

### ❌ Don't Do This

1. **Using athlete components for agencies:**
   ```tsx
   // BAD: Using FMVScoreCard on agency dashboard
   <FMVScoreCard /> // This is for athletes only!
   ```

2. **Using athlete terminology for agencies:**
   ```tsx
   // BAD: "Complete Your Profile" on agency page
   <Button>Complete Your Profile</Button> // Too personal

   // GOOD: "Update Company Profile"
   <Button>Update Company Profile</Button>
   ```

3. **Showing sidebar for agencies:**
   ```tsx
   // BAD: Rendering Sidebar for all users
   {user && <Sidebar />}

   // GOOD: Only render for athletes
   {user && user.role === 'athlete' && <Sidebar />}
   ```

4. **Mixing AI chat with athlete messages:**
   ```tsx
   // BAD: Same "Messages" page for both
   // GOOD: Separate routes and components
   ```

### ✅ Do This

1. **Role-based routing:**
   ```tsx
   if (user.role === 'athlete') {
     return <AthleteDashboard />;
   } else if (user.role === 'agency') {
     return <AgencyDashboard />;
   }
   ```

2. **Role-specific components:**
   ```tsx
   // components/athlete/FMVScoreCard.tsx
   // components/agencies/CampaignCard.tsx
   ```

3. **Separate API namespaces:**
   ```
   /api/dashboard/athlete/*
   /api/dashboard/agency/*
   ```

---

## Testing Checklist

When testing agency vs athlete experiences:

- [ ] Log in as athlete → See sidebar? ✅
- [ ] Log in as athlete → Click "Messages" → AI chat opens? ✅
- [ ] Log in as agency → See sidebar? ❌ Should be NO
- [ ] Log in as agency → Click "Messages" → Athlete inbox opens? ✅
- [ ] Log in as agency → Dashboard shows business metrics? ✅
- [ ] Log in as agency → Navigation is horizontal (top nav)? ✅
- [ ] Agency can't access athlete-only routes? ✅
- [ ] Athlete can't access agency-only routes? ✅

---

## Quick Wins

### Phase 1 (Must Do)
1. Ensure agencies DON'T see sidebar
2. Update agency dashboard to show business metrics (not personal growth)
3. Confirm role-based routing works

### Phase 2 (Should Do)
4. Enhance Discover page for agencies
5. Build campaign creation flow
6. Create athlete roster page

### Phase 3 (Nice to Have)
7. Implement agency-athlete messaging
8. Build analytics dashboard
9. Add reporting and exports

---

## Questions? Reference

- **Full Architecture:** `/docs/AGENCY_PLATFORM_ARCHITECTURE.md`
- **Database Schema:** `/migrations/040_agency_platform.sql`
- **Components:** Check `components/agencies/` vs `components/athlete/`

---

**Remember:** Athletes and agencies are two DIFFERENT products sharing the same platform. Treat them as such!
