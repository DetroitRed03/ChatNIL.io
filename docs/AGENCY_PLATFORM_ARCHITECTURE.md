# Agency Platform Architecture Blueprint

**Document Version:** 1.0
**Created:** 2025-10-30
**Status:** Planning / Design Phase
**Owner:** Blueprint (System Architect)

---

## Executive Summary

### The Fundamental Problem

ChatNIL currently has a **dual-user platform** (athletes + agencies) but a **single-experience design**. The agency dashboard was created by applying warm visual aesthetics to the athlete dashboard, but agencies have fundamentally different goals, workflows, and mental models than athletes.

**Athletes are personal users:**
- Learning-focused (education, guidance)
- Self-improvement journey (build brand, grow following)
- Need encouragement and support
- Chat with AI assistant for guidance
- Warm, cozy, Gen Z aesthetic

**Agencies are business users:**
- Task-focused (find talent, manage campaigns)
- ROI-driven (metrics, performance, efficiency)
- Need data and insights
- Communicate with athletes (not AI)
- Professional, data-driven aesthetic (still warm, but corporate-friendly)

### The Solution

Create a **completely separate experience** for agencies that shares the design system foundation but has:
1. Different navigation structure (no chat sidebar)
2. Different dashboard content (business metrics, not personal growth)
3. Different information architecture (discovery, campaigns, roster management)
4. Different user flows (talent acquisition, not learning)
5. Different terminology ("Messages" = athlete communication, not AI chat)

---

## 1. Navigation Architecture

### Current State Analysis

**Athlete Navigation:**
- **Left Sidebar:** Chat history, AI conversations, recent pages
- **Top Header:** User profile, settings, notifications
- **Navigation Pages:** Dashboard, Profile, Badges, Quizzes, Library, Messages (AI chat), Settings

**Agency Navigation (Current - INCORRECT):**
- **No Sidebar:** Correctly removed (agencies don't need chat history)
- **Top Nav:** Dashboard, Discover, My Athletes, Campaigns, Messages, Analytics
- **Problem:** Navigation is good BUT pages still feel athlete-like

### Recommended Agency Navigation Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Dashboard  Discover  Campaigns  Athletes  Messages │
│                                          Analytics  Settings │
│                                                    [Profile ▼]│
└─────────────────────────────────────────────────────────────┘
```

**Top Navigation Items:**

| Nav Item | Icon | Purpose | Priority |
|----------|------|---------|----------|
| Dashboard | LayoutDashboard | Business overview, KPIs, quick actions | P0 (Essential) |
| Discover | Search | Find and filter athletes by criteria | P0 (Essential) |
| Campaigns | Megaphone | Create, manage, track marketing campaigns | P0 (Essential) |
| Athletes | Users | My roster - athletes I've worked with | P1 (Important) |
| Messages | Mail | Direct communication with athletes | P1 (Important) |
| Analytics | BarChart3 | Deep-dive metrics and reporting | P2 (Nice-to-have) |
| Settings | Settings | Account preferences, billing, team | P1 (Important) |

**No Sidebar Rationale:**
- Agencies are task-focused, not conversational
- No AI chat history needed (athletes chat with AI, not agencies)
- Horizontal navigation better for business workflows
- More screen real estate for data tables and charts

---

## 2. Agency Dashboard Architecture

### Design Philosophy Comparison

| Aspect | Athlete Dashboard | Agency Dashboard |
|--------|-------------------|------------------|
| Tone | "Your NIL Dashboard" - Personal | "Agency Dashboard" - Professional |
| Header | Gradient with shimmer, Gen Z energy | Clean gradient, corporate-friendly |
| Widgets | Personal growth, learning progress | Business metrics, campaign performance |
| CTAs | "Take Quiz", "Complete Profile" | "Create Campaign", "Find Athletes" |
| Metrics | Profile completion, FMV score, badges | Active athletes, campaign spend, ROI |
| Aesthetic | Warm, cozy, encouraging | Warm but data-driven, efficient |

### Dashboard Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: Agency Dashboard                                        │
│ "Manage your NIL campaigns and athlete partnerships"           │
│ [Schedule Campaign]  [Create Campaign]                         │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────── Performance Overview ──────────────────────┐
│ [Time Range Selector: 7d | 30d | 90d | 1yr]                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────── Key Metrics (4-col grid) ────────────────┐
│ Active Athletes │ Active Campaigns │ Total Impressions │ Spend  │
│     127 +12%   │      23 +5%     │    2.4M +18%     │ $487K │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Main Content (2/3 width)          │ Right Sidebar (1/3 width)  │
│                                    │                             │
│ Active Campaigns                   │ Quick Actions              │
│ - Campaign cards with progress     │ - Create Campaign CTA      │
│ - Performance metrics per campaign │ - Find Athletes            │
│                                    │                             │
│ Top Performing Athletes            │ Pending Approvals          │
│ - Athlete cards with metrics       │ - Payment approvals        │
│ - Engagement, FMV, followers       │ - Contract reviews         │
│                                    │                             │
│ Recent Activity                    │ Upcoming Milestones        │
│ - Timeline of events               │ - Content deadlines        │
│ - Messages, acceptances, metrics   │ - Payment dates            │
│                                    │                             │
│                                    │ Support                    │
│                                    │ - Contact help             │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard Widgets & Components

**1. Quick Metrics (Top Row)**
```typescript
interface AgencyMetrics {
  activeAthletes: number;          // Athletes currently in campaigns
  athletesChange: number;          // Month-over-month change
  activeCampaigns: number;         // Live campaigns
  campaignsChange: number;         // MoM change
  totalImpressions: string;        // e.g., "2.4M"
  impressionsChange: number;       // MoM change
  campaignSpend: string;           // e.g., "$487K"
  spendChange: number;             // MoM change (negative = under budget!)
}
```

**2. Active Campaigns Widget**
- Shows 3-5 most recent active campaigns
- Each campaign card displays:
  - Campaign name and status
  - Number of athletes involved
  - Total impressions to date
  - Engagement rate
  - Budget and spend
  - Progress bar (time or deliverables)
- Click to view full campaign details

**3. Top Performing Athletes Widget**
- Shows 3 athletes with best performance in current campaigns
- Displays:
  - Athlete photo/avatar
  - Name, sport, school
  - Star rating (4.9/5.0)
  - FMV (Fair Market Value)
  - Engagement rate
  - Total followers
- Click to view full athlete profile

**4. Recent Activity Feed**
- Timeline of important events:
  - New athlete messages
  - Campaign invitations accepted/declined
  - Milestone achievements (500K impressions, etc.)
  - Payment processing confirmations
- Real-time or near-real-time updates

**5. Pending Approvals (Sidebar)**
- Athlete payment approvals needed
- Contract reviews pending
- Content submissions requiring approval
- Quick approve/decline actions

**6. Upcoming Milestones (Sidebar)**
- Content deadlines (2 days)
- Campaign end dates (5 days)
- Payment release dates (1 week)
- Performance review checkpoints

**7. Quick Actions (Sidebar CTA)**
- Prominent "Create Campaign" button
- Secondary actions:
  - Schedule campaign
  - Find athletes
  - View reports

---

## 3. Key Agency Pages

### 3.1 Discover Page (Talent Marketplace)

**Purpose:** Find athletes that match campaign criteria

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Discovery Stats (Top)                                       │
│ Total Athletes: 3,247 | Verified: 2,891 | New This Week: 42│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AI Recommendations                                          │
│ "Based on your recent campaigns, you might like..."         │
│ [Athlete Card] [Athlete Card] [Athlete Card]               │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────────────────────────────────────┐
│ Filters      │ Results (Sortable Grid)                      │
│ (Sidebar)    │                                              │
│              │ Sort by: [Followers ▼] [Engagement] [Value] │
│ Search       │                                              │
│              │ ┌────────┬────────┬────────┐                │
│ Sports       │ │Athlete │Athlete │Athlete │                │
│ ☑ Basketball │ │ Card   │ Card   │ Card   │                │
│ ☐ Football   │ │        │        │        │                │
│              │ ├────────┼────────┼────────┤                │
│ Location     │ │Athlete │Athlete │Athlete │                │
│ ☑ Texas      │ │ Card   │ Card   │ Card   │                │
│ ☐ California │ │        │        │        │                │
│              │ └────────┴────────┴────────┘                │
│ School Level │                                              │
│ ○ High School│ [Load More Athletes]                        │
│ ● College    │                                              │
│              │                                              │
│ Followers    │                                              │
│ [10K - 500K] │                                              │
│              │                                              │
│ Engagement   │                                              │
│ [2% - 10%]   │                                              │
│              │                                              │
│ FMV Range    │                                              │
│ [$5K - $50K] │                                              │
│              │                                              │
│ [Apply       │                                              │
│  Filters]    │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

**Key Features:**
- **Advanced Filtering:**
  - Search by name/school/location
  - Multi-select sports
  - Location (state-based)
  - School level (high school vs college)
  - Follower count range (slider)
  - Engagement rate range (slider)
  - FMV range (slider)
  - Content categories (fitness, fashion, gaming, etc.)
  - Available for partnerships only (toggle)

- **AI-Powered Recommendations:**
  - Based on past campaigns
  - Similar athletes to ones you've worked with
  - Trending athletes in your target categories
  - Match score algorithm (agency needs vs athlete profile)

- **Sortable Results:**
  - By total followers (default)
  - By engagement rate
  - By FMV (ascending or descending)
  - By match score (AI recommendation strength)

- **Athlete Discovery Card:**
  ```
  ┌─────────────────────────────────┐
  │ [Profile Photo]                 │
  │                                 │
  │ Marcus Johnson ⭐ 4.9           │
  │ Basketball • Duke University   │
  │                                 │
  │ 247K Followers | 8.4% Engagement│
  │ FMV: $125K                      │
  │                                 │
  │ [❤️ Save]  [💬 Message]        │
  └─────────────────────────────────┘
  ```

- **Save for Later:**
  - Bookmark athletes to lists
  - Create custom lists ("Q1 2025 Campaign", "Basketball Prospects", etc.)

### 3.2 Campaigns Page

**Purpose:** Create, manage, and track marketing campaigns

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Campaigns                                [+ Create Campaign] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Filters: [All Campaigns ▼] [Active] [Paused] [Completed]   │
│ Sort by: [Recently Updated ▼] [Start Date] [Budget]        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Campaign List (Cards or Table View)                         │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Summer Basketball Campaign              [Active 🟢]   │ │
│ │ 45 athletes • 847K impressions • 4.2% engagement      │ │
│ │ Budget: $125K | Spend: $83K (67%)                     │ │
│ │ ████████████░░░░ 67%                                  │ │
│ │ [View Details →]                                       │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Football Season Kickoff                 [Active 🟢]   │ │
│ │ 32 athletes • 623K impressions • 5.1% engagement      │ │
│ │ Budget: $98K | Spend: $41K (42%)                      │ │
│ │ ██████░░░░░░░░░░ 42%                                  │ │
│ │ [View Details →]                                       │ │
│ └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Campaign Creation Flow:**

**Step 1: Campaign Basics**
- Campaign name
- Brand name
- Campaign description
- Start and end dates
- Campaign goals (awareness, engagement, conversions)

**Step 2: Budget & Compensation**
- Total campaign budget
- Budget per athlete (or custom per athlete)
- Payment terms

**Step 3: Target Athletes**
- Use discovery filters OR
- Select from saved lists OR
- Import specific athletes

**Step 4: Deliverables**
- Instagram posts (quantity)
- Instagram stories (quantity)
- TikTok videos (quantity)
- YouTube videos (quantity)
- Event appearances (quantity)
- Other custom deliverables

**Step 5: Terms & Requirements**
- Campaign guidelines
- Content approval process
- Payment milestones
- Contract terms

**Step 6: Review & Launch**
- Preview campaign
- Send invitations to athletes
- Track acceptance/decline

**Campaign Detail Page:**
```
┌─────────────────────────────────────────────────────────────┐
│ Summer Basketball Campaign                                   │
│ [Edit] [Pause] [Export Report]                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Overview | Athletes | Performance | Content | Budget        │
└─────────────────────────────────────────────────────────────┘

[Overview Tab]
- Campaign details
- Timeline
- Status
- Key metrics dashboard

[Athletes Tab]
- List of invited athletes
- Invitation status (pending, accepted, declined)
- Individual athlete performance
- Payment status per athlete

[Performance Tab]
- Impressions over time (line chart)
- Engagement metrics
- Reach and frequency
- Top performing content
- ROI calculations

[Content Tab]
- All submitted content from athletes
- Approval workflow
- Content library

[Budget Tab]
- Budget allocation
- Spend tracking
- Payment schedule
- Projected vs actual costs
```

### 3.3 Athletes Page (My Roster)

**Purpose:** Manage relationships with athletes you've worked with

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ My Athletes                                                  │
│ Total: 127 | Active Partnerships: 45 | Past: 82            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Filters: [All ▼] [Active] [Past] [Favorites]               │
│ Sort by: [Recently Active ▼] [Name] [Performance]          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Athlete List (Table View)                                   │
│                                                              │
│ Name          Sport      School      Campaigns  Performance │
│ ────────────────────────────────────────────────────────────│
│ Marcus Johnson Basketball Duke       3 active   ⭐⭐⭐⭐⭐    │
│ Sarah Williams Soccer     Stanford   2 active   ⭐⭐⭐⭐⭐    │
│ Tyler Davis    Football   Alabama    1 active   ⭐⭐⭐⭐     │
└─────────────────────────────────────────────────────────────┘
```

**Athlete Detail Page (Agency View):**
- Full athlete profile (public info)
- Campaign history with this athlete
- Performance across all campaigns
- Communication history
- Payment history
- Notes and tags (private to agency)
- Quick actions: Message, Add to Campaign, Add to List

### 3.4 Messages Page

**Purpose:** Direct communication with athletes

**CRITICAL DIFFERENCE:**
- **Athletes:** "Messages" = AI chat interface
- **Agencies:** "Messages" = Athlete direct messages (like LinkedIn, email)

**Layout:**
```
┌───────────────────┬─────────────────────────────────────────┐
│ Conversations     │ Active Conversation                     │
│                   │                                         │
│ 🔍 Search         │ Marcus Johnson                          │
│                   │ Basketball • Duke University           │
│ ┌───────────────┐ │ ─────────────────────────────────────  │
│ │Marcus Johnson │ │                                         │
│ │Re: Summer Camp│ │ [Message Thread]                       │
│ │2 hours ago    │ │                                         │
│ └───────────────┘ │ Agency: "Hi Marcus, we have a great..." │
│                   │                                         │
│ ┌───────────────┐ │ Marcus: "Thanks! I'm interested in..." │
│ │Sarah Williams │ │                                         │
│ │Payment confirm│ │ Agency: "Perfect! Here are the..."     │
│ │Yesterday      │ │                                         │
│ └───────────────┘ │ [Attachment: Campaign_Details.pdf]     │
│                   │                                         │
│ ┌───────────────┐ │ ─────────────────────────────────────  │
│ │Tyler Davis    │ │                                         │
│ │Campaign invite│ │ [Message Composer]                     │
│ │3 days ago     │ │ Type your message...                   │
│ └───────────────┘ │ [📎 Attach] [📧 Send]                  │
└───────────────────┴─────────────────────────────────────────┘
```

**Key Features:**
- Threaded conversations per athlete
- Rich text formatting
- File attachments (contracts, media kits, briefs)
- Quick actions:
  - Send campaign invite from message
  - Schedule meeting
  - Send payment
- Message templates (common outreach messages)
- Bulk messaging (send to multiple athletes with personalization)
- Read receipts
- Email notifications for new messages

### 3.5 Analytics Page

**Purpose:** Deep-dive metrics and cross-campaign reporting

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Analytics Dashboard                                          │
│ Date Range: [Jan 1, 2025 - Jan 31, 2025]        [Export]   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Top-Level KPIs                                              │
│                                                              │
│ Total Spend     Total Impressions   Avg Engagement   ROI   │
│ $487K           2.4M               4.5%             3.2x   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Impressions Over Time (Line Chart)                         │
│ [Chart showing daily/weekly/monthly impressions]            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Campaign Performance Comparison (Table)                     │
│                                                              │
│ Campaign Name         Spend    Impressions  Engagement  ROI│
│ ─────────────────────────────────────────────────────────── │
│ Summer Basketball     $125K    847K         4.2%        2.8x│
│ Football Kickoff      $98K     623K         5.1%        3.5x│
│ Women's Soccer        $75K     412K         6.3%        4.1x│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Top Performing Athletes (by ROI)                           │
│ Athlete demographics breakdown                              │
│ Content category performance                                │
│ Geographic performance                                      │
└─────────────────────────────────────────────────────────────┘
```

**Analytics Features:**
- Custom date ranges
- Campaign comparisons
- Athlete performance rankings
- Content type effectiveness
- Demographic insights
- Geographic performance
- Export reports (PDF, CSV, Excel)
- Scheduled reports (email weekly/monthly reports)

---

## 4. Data Architecture

### Database Tables (Already Created in Migration 040)

**Key Tables:**

1. **athlete_public_profiles**
   - What agencies see when discovering talent
   - Public-facing athlete data
   - Social media stats
   - FMV estimates
   - Availability status

2. **athlete_portfolio_items**
   - Showcase work (posts, videos, campaigns)
   - Performance metrics per content piece

3. **agency_campaigns**
   - Campaign metadata
   - Budget and timeline
   - Target criteria
   - Status tracking

4. **campaign_athlete_invites**
   - Many-to-many: campaigns <-> athletes
   - Invitation status
   - Deliverables per athlete
   - Performance tracking per invite

5. **agency_athlete_messages**
   - Direct messages between agencies and athletes
   - Thread-based conversations
   - Attachments support

6. **agency_saved_searches**
   - Saved filter combinations
   - Notification preferences

7. **agency_athlete_lists**
   - Custom athlete lists/collections
   - Like playlists

8. **agency_athlete_list_items**
   - Athletes within lists
   - Private notes and tags

### API Routes

**Agency Dashboard:**
```
GET  /api/dashboard/agency/metrics
GET  /api/dashboard/agency/campaigns/active
GET  /api/dashboard/agency/athletes/top-performing
GET  /api/dashboard/agency/activity-feed
GET  /api/dashboard/agency/approvals
GET  /api/dashboard/agency/milestones
```

**Discover (Athlete Discovery):**
```
GET  /api/agencies/athletes/discover
POST /api/agencies/athletes/discover/save
GET  /api/agencies/athletes/discover/recommendations
POST /api/agencies/athletes/filters/save
GET  /api/agencies/athletes/filters/saved
```

**Campaigns:**
```
GET    /api/agencies/campaigns
POST   /api/agencies/campaigns
GET    /api/agencies/campaigns/:id
PUT    /api/agencies/campaigns/:id
DELETE /api/agencies/campaigns/:id
POST   /api/agencies/campaigns/:id/invite-athlete
GET    /api/agencies/campaigns/:id/invites
PUT    /api/agencies/campaigns/:id/invites/:invite_id
GET    /api/agencies/campaigns/:id/performance
```

**Athletes (Roster):**
```
GET  /api/agencies/athletes/roster
GET  /api/agencies/athletes/roster/:athlete_id
POST /api/agencies/athletes/roster/:athlete_id/notes
GET  /api/agencies/athletes/roster/:athlete_id/campaigns
GET  /api/agencies/athletes/roster/:athlete_id/performance
```

**Messages:**
```
GET    /api/agencies/messages/threads
GET    /api/agencies/messages/threads/:thread_id
POST   /api/agencies/messages/send
PUT    /api/agencies/messages/:message_id/read
POST   /api/agencies/messages/templates
GET    /api/agencies/messages/templates
```

**Analytics:**
```
GET  /api/agencies/analytics/overview
GET  /api/agencies/analytics/campaigns/compare
GET  /api/agencies/analytics/athletes/performance
GET  /api/agencies/analytics/export
POST /api/agencies/analytics/reports/schedule
```

---

## 5. User Flows

### Flow 1: Find Athletes for Campaign

```
1. Agency logs in → Dashboard
2. Click "Discover" in top nav
3. Set filters:
   - Sport: Basketball
   - Location: Texas
   - School Level: College
   - Followers: 50K - 200K
   - Engagement: > 4%
   - FMV: $10K - $50K
4. Click "Apply Filters"
5. Browse results (sorted by followers by default)
6. View athlete profile (click card)
7. Save athlete to list "Q1 Basketball Campaign"
8. Message athlete OR add to campaign
9. Repeat for more athletes
```

**Key Decision Points:**
- Do I save for later or message immediately?
- Do I add to existing campaign or create new one?
- Does this athlete match my brand?

### Flow 2: Create Campaign

```
1. Agency logs in → Dashboard
2. Click "Create Campaign" (top right or sidebar)
3. Campaign Creation Wizard:

   Step 1: Basics
   - Name: "Spring Basketball Showcase"
   - Brand: "Nike"
   - Description: "..."
   - Dates: March 1 - April 30, 2025

   Step 2: Budget
   - Total: $100,000
   - Per athlete: $2,500 (40 athletes)

   Step 3: Target Athletes
   - Option A: Use filters (sport, location, etc.)
   - Option B: Select from saved list
   - Option C: Manually select specific athletes

   Step 4: Deliverables
   - 3 Instagram posts per athlete
   - 5 Instagram stories per athlete
   - 1 TikTok video per athlete

   Step 5: Terms
   - Upload campaign brief (PDF)
   - Set content approval process
   - Define payment milestones

   Step 6: Review & Launch
   - Preview campaign details
   - Send invitations to 40 athletes
   - Campaign status: "Active - Awaiting Responses"

4. Campaign created! Redirected to campaign detail page
5. Monitor invitation responses in real-time
6. Athletes accept/decline
7. Track campaign performance as content is posted
```

**Key Decision Points:**
- Should I send to all athletes at once or phase it?
- What if budget runs out before filling slots?
- How do I handle athlete counter-offers?

### Flow 3: Review Campaign Performance

```
1. Agency logs in → Dashboard
2. Dashboard shows "Summer Basketball Campaign reached 500K impressions"
3. Click campaign card → Campaign Detail Page
4. Navigate to "Performance" tab
5. View metrics:
   - Impressions: 847K (vs goal of 800K ✓)
   - Engagement: 4.2% (vs goal of 4.0% ✓)
   - Top performing athlete: Marcus Johnson (127K impressions, 8.4% engagement)
   - Worst performing athlete: Jake Thompson (18K impressions, 1.2% engagement)
6. Navigate to "Athletes" tab
7. Click Marcus Johnson → See all his content
8. Save Marcus to "Top Performers" list for future campaigns
9. Navigate to "Budget" tab
10. See spend: $83K of $125K (on track)
11. Export performance report (PDF) for stakeholders
```

**Key Decision Points:**
- Should I increase budget for this campaign?
- Should I shift budget from low-performers to high-performers?
- Should I reach out to top performers for future campaigns?

### Flow 4: Communicate with Athlete

```
1. Agency discovers athlete on Discover page
2. Click "Message" button on athlete card
3. Opens message composer:
   - Pre-filled: Athlete name
   - Template options: "Campaign Invitation", "General Inquiry", "Partnership Proposal"
4. Select "Campaign Invitation" template
5. Customize message:
   "Hi Marcus,

   I'm reaching out from Nike Athletics. We're planning a Spring Basketball
   campaign and think you'd be a perfect fit! We're targeting 50-100K followers
   with high engagement, and your profile stood out.

   Campaign Details:
   - Dates: March 1 - April 30
   - Deliverables: 3 posts, 5 stories, 1 video
   - Compensation: $2,500

   Would love to discuss further. Are you available for a quick call this week?

   Best,
   Sarah Chen
   Nike Athletics"
6. Attach campaign brief PDF
7. Click "Send"
8. Message delivered to athlete's Messages page
9. Athlete responds
10. Conversation continues in Messages page
11. If interested, agency sends formal campaign invite
```

**Key Decision Points:**
- Should I send a templated message or personalize?
- Should I attach full campaign brief upfront?
- Should I mention compensation in first message?

---

## 6. Design Philosophy & Visual Differences

### Shared Design System Components

Both athlete and agency experiences use the same foundational components:
- `Card` - Content containers
- `Button` - Interactive elements
- `Badge` - Status indicators
- `Input` - Form fields
- `StatCard` - Metric displays
- `Progress` - Progress bars
- Color palette (warm oranges, ambers, yellows)
- Typography scale
- Animation patterns (Framer Motion)

### Where They Diverge

| Element | Athlete Experience | Agency Experience |
|---------|-------------------|-------------------|
| **Layout** | Sidebar + Main content | Top nav only + Main content |
| **Dashboard Header** | Personal, Gen Z energy, emojis | Professional, data-driven, minimal emojis |
| **Widgets** | Personal growth (FMV score, badges, quizzes) | Business metrics (campaigns, ROI, athletes) |
| **Navigation** | Learning journey (quizzes, library, messages) | Business workflow (discover, campaigns, analytics) |
| **Terminology** | "Messages" = AI chat | "Messages" = Athlete communication |
| **CTAs** | "Take Quiz", "Learn More" | "Create Campaign", "Find Athletes" |
| **Tone** | Encouraging, supportive, warm | Professional, efficient, results-focused |
| **Data Viz** | Simple charts (profile completion) | Complex charts (ROI, performance over time) |
| **Aesthetic Weight** | Light, airy, playful | Substantial, data-rich, trustworthy |

### Color Usage Guidelines

**Athlete Pages:**
- More saturated oranges and ambers
- Gradient overlays for warmth
- Playful animations (shimmer, pulse)
- Higher contrast for energy

**Agency Pages:**
- More muted oranges (corporate-friendly warm)
- Cleaner whites with subtle gradients
- Professional animations (smooth transitions)
- Lower contrast for sophistication

---

## 7. Component Reusability Strategy

### Fully Shared Components (100% Reusable)

```typescript
// Design system primitives
- Card
- Button
- Badge
- Input
- Select
- Checkbox
- Radio
- Modal
- Toast
- Tooltip
- Dropdown
- Avatar
- Skeleton loader
```

### Partially Shared Components (80% Reusable)

```typescript
// Shared structure, different content
- Dashboard layout wrapper (different widgets)
- StatCard (same component, different metrics)
- EmptyState (same component, different messaging)
- ErrorBoundary
- LoadingSpinner
```

### Experience-Specific Components (0% Reusable)

```typescript
// Athlete-only
- ChatInterface
- AIComposer
- QuizCard
- BadgeShowcase
- LearningProgress
- FMVScoreCard
- ProfileCompletionIndicator

// Agency-only
- AthleteDiscoveryCard
- CampaignCard
- PerformanceChart
- AthleteRosterTable
- MessageThread (agency <-> athlete)
- DiscoverFilters
- CampaignWizard
```

### Naming Convention

```typescript
// Generic (shared)
components/ui/Card.tsx
components/ui/Button.tsx

// Athlete-specific
components/athlete/FMVScoreCard.tsx
components/athlete/BadgeShowcase.tsx

// Agency-specific
components/agencies/AthleteDiscoveryCard.tsx
components/agencies/CampaignCard.tsx
components/agencies/DiscoverFilters.tsx

// Dashboard-specific
components/dashboard/QuickStatsCard.tsx        // Athlete
components/dashboard/agency/MetricsCard.tsx    // Agency
```

---

## 8. Technical Specifications

### Route Structure

```
# Athlete Routes
/                      → Chat interface (AI)
/dashboard             → Athlete dashboard (personal metrics)
/profile               → Athlete profile (self)
/profile/edit          → Edit athlete profile
/badges                → Badge showcase
/quizzes               → Learning quizzes
/library               → Knowledge library
/messages              → AI chat (same as /)
/settings              → User settings
/opportunities         → Campaign opportunities (athlete view)

# Agency Routes
/agencies/dashboard    → Agency dashboard (business metrics)
/agencies/discover     → Athlete discovery/search
/agencies/campaigns    → Campaign management
/agencies/campaigns/new → Campaign creation wizard
/agencies/campaigns/:id → Campaign detail page
/agencies/athletes     → My roster (athletes I've worked with)
/agencies/athletes/:id → Athlete detail (agency view)
/agencies/messages     → Direct messages with athletes
/agencies/messages/:thread_id → Message thread
/agencies/analytics    → Deep analytics
/agencies/settings     → Agency settings
/agencies/profile      → Agency profile (company info)

# Shared Public Routes
/                      → Homepage (different for authed vs non-authed)
/athletes/:username    → Public athlete profile
/about                 → About ChatNIL
/contact               → Contact form
```

### Layout Files

```typescript
// Root layout (all pages)
app/layout.tsx
  → Uses NavigationShell component
  → NavigationShell conditionally shows Sidebar or not
  → Sidebar only for athlete routes

// Athlete layout (if needed)
// Currently handled by NavigationShell

// Agency layout (ESSENTIAL)
app/agencies/layout.tsx
  → Uses AgencyTopNav component (horizontal nav)
  → NO Sidebar
  → Different background (less warm, more professional)
  → Role check: redirect non-agency users
```

### State Management

**Athlete Experience:**
```typescript
// Chat state
useChatHistoryStore() // Zustand
useChatSync() // Real-time chat sync

// Profile state
useProfileCompletion() // Profile progress
useFMVScore() // Fair Market Value

// Learning state
useBadges() // Badge progress
useQuizzes() // Quiz attempts
```

**Agency Experience:**
```typescript
// Campaign state
useCampaigns() // Campaign list
useCampaignDetail(id) // Single campaign
useCampaignPerformance(id) // Performance metrics

// Athlete discovery state
useAthleteDiscovery(filters) // Filtered athletes
useAthleteProfile(id) // Single athlete (agency view)
useSavedSearches() // Saved filter combinations

// Message state
useMessageThreads() // All threads
useMessageThread(id) // Single thread
```

### Authentication & Authorization

**Role-Based Access:**

```typescript
// User roles
type UserRole = 'athlete' | 'agency' | 'school_admin' | 'admin';

// Route guards
// Already exists: ProtectedRoute component
// Need to add: RoleProtectedRoute component

<RoleProtectedRoute allowedRoles={['agency']}>
  <AgencyDashboard />
</RoleProtectedRoute>

// In layout.tsx for /agencies
useEffect(() => {
  if (user && user.role !== 'agency') {
    router.push('/dashboard'); // Redirect to athlete dashboard
  }
}, [user]);
```

**RLS (Row Level Security) - Already Configured:**
- Athletes can only see their own data
- Agencies can see:
  - All public athlete profiles
  - Their own campaigns
  - Their own messages
  - Athletes they've worked with
- Cross-user access properly restricted

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1) - P0

**Goal:** Ensure agency experience is structurally different from athlete

**Tasks:**
1. Audit agency layout
   - Confirm no Sidebar renders for agencies
   - Ensure AgencyTopNav is being used
   - Verify role-based routing works

2. Update agency dashboard
   - Replace any athlete-focused widgets
   - Add business metrics widgets
   - Add quick action CTAs
   - Professional header (not Gen Z energy)

3. Create RoleProtectedRoute component
   - Enforce role-based access
   - Redirect non-agency users
   - Clear error messages

4. Documentation
   - Update README with agency vs athlete distinction
   - Create component usage guide
   - Document API routes

**Deliverables:**
- Agency dashboard that feels business-focused
- Clear separation of navigation (no sidebar for agencies)
- Role-based routing enforced

**Success Criteria:**
- Agency user logs in and sees NO chat sidebar
- Dashboard shows business metrics, not personal growth
- Navigation makes sense for business workflows

### Phase 2: Discover & Athletes (Week 2-3) - P0

**Goal:** Enable core talent discovery workflow

**Tasks:**
1. Enhance Discover page
   - Build out filter UI (already started)
   - Connect to API (filter logic)
   - Implement sorting
   - Add save/bookmark functionality
   - AI recommendations widget

2. Build Athletes (Roster) page
   - List view of athletes worked with
   - Athlete detail page (agency view)
   - Performance history per athlete
   - Private notes/tags

3. API Development
   - GET /api/agencies/athletes/discover (with filters)
   - GET /api/agencies/athletes/roster
   - GET /api/agencies/athletes/roster/:id
   - POST /api/agencies/athletes/roster/:id/notes

4. Testing
   - Seed database with athlete profiles
   - Test filtering edge cases
   - Performance testing (1000+ athletes)

**Deliverables:**
- Functional athlete discovery with filtering
- Roster management page
- API endpoints for discovery and roster

**Success Criteria:**
- Agency can find athletes by sport, location, followers, FMV
- Agency can save athletes to lists
- Agency can view detailed athlete profiles

### Phase 3: Campaigns (Week 4-5) - P0

**Goal:** Enable campaign creation and management

**Tasks:**
1. Campaign creation wizard
   - Multi-step form (6 steps outlined above)
   - Form validation
   - Budget calculations
   - Athlete selection

2. Campaign list page
   - Display all campaigns
   - Status filtering
   - Search functionality

3. Campaign detail page
   - Multiple tabs (Overview, Athletes, Performance, Content, Budget)
   - Real-time status updates
   - Performance charts

4. API Development
   - POST /api/agencies/campaigns (create)
   - GET /api/agencies/campaigns (list)
   - GET /api/agencies/campaigns/:id (detail)
   - POST /api/agencies/campaigns/:id/invite-athlete
   - PUT /api/agencies/campaigns/:id/invites/:invite_id

5. Testing
   - Campaign creation flow
   - Invitation workflow
   - Budget tracking
   - Edge cases (campaign with 0 athletes, etc.)

**Deliverables:**
- Campaign creation wizard
- Campaign management dashboard
- Campaign detail pages with tabs
- Campaign APIs

**Success Criteria:**
- Agency can create campaign from scratch
- Agency can invite athletes to campaign
- Agency can track campaign status

### Phase 4: Messages (Week 6) - P1

**Goal:** Enable direct communication between agencies and athletes

**Tasks:**
1. Message thread UI
   - Inbox/conversation list
   - Thread detail view
   - Message composer with rich text
   - File attachments

2. Real-time messaging
   - WebSocket or polling for new messages
   - Read receipts
   - Typing indicators (optional)

3. Message templates
   - Pre-built templates
   - Custom template creation
   - Variable substitution

4. API Development
   - GET /api/agencies/messages/threads
   - GET /api/agencies/messages/threads/:thread_id
   - POST /api/agencies/messages/send
   - PUT /api/agencies/messages/:message_id/read

5. Testing
   - Send/receive flow
   - Attachment handling
   - Real-time updates

**Deliverables:**
- Message interface (agency side)
- Message interface (athlete side) - athletes receive messages
- Real-time message delivery
- Templates

**Success Criteria:**
- Agency can message athlete
- Athlete receives message and can reply
- Attachments work (PDFs, images)

### Phase 5: Analytics & Reporting (Week 7) - P2

**Goal:** Provide deep insights into campaign performance

**Tasks:**
1. Analytics dashboard
   - Overview KPIs
   - Performance charts
   - Campaign comparisons
   - Athlete rankings

2. Data visualization
   - Integrate charting library (Chart.js, Recharts, etc.)
   - Line charts (impressions over time)
   - Bar charts (campaign comparison)
   - Pie charts (demographic breakdown)

3. Export functionality
   - PDF reports
   - CSV exports
   - Scheduled reports (email)

4. API Development
   - GET /api/agencies/analytics/overview
   - GET /api/agencies/analytics/campaigns/compare
   - GET /api/agencies/analytics/athletes/performance
   - GET /api/agencies/analytics/export

5. Testing
   - Data accuracy
   - Chart rendering
   - Export functionality

**Deliverables:**
- Analytics dashboard
- Data visualizations
- Export tools
- Scheduled reporting

**Success Criteria:**
- Agency can see ROI across all campaigns
- Agency can compare campaign performance
- Agency can export reports for stakeholders

### Phase 6: Polish & Optimization (Week 8) - P2

**Goal:** Refine UX and optimize performance

**Tasks:**
1. UX refinements
   - User testing feedback
   - Accessibility audit
   - Mobile responsiveness
   - Loading states

2. Performance optimization
   - Database query optimization
   - Caching strategy
   - Lazy loading
   - Code splitting

3. Documentation
   - User guides
   - API documentation
   - Component storybook

4. Testing
   - End-to-end tests
   - Load testing
   - Security audit

**Deliverables:**
- Polished, production-ready agency experience
- Comprehensive documentation
- Test coverage

**Success Criteria:**
- Page load times < 2 seconds
- No critical accessibility issues
- Full feature documentation

---

## 10. Priority Recommendations

### Must-Have (P0) - Launch Blockers

1. **Agency Dashboard Overhaul**
   - Replace athlete-focused content with business metrics
   - Professional tone and design
   - Quick action CTAs for campaign creation

2. **Navigation Separation**
   - Confirm no sidebar for agencies
   - Top navigation only
   - Clear role-based routing

3. **Discover Page (Athlete Search)**
   - Filtering by sport, location, followers, FMV
   - Sortable results
   - Athlete discovery cards

4. **Campaign Creation**
   - Basic campaign wizard
   - Invite athletes
   - Track status

5. **Athlete Roster**
   - List of athletes worked with
   - Athlete detail pages (agency view)

### Important (P1) - Launch Soon After

6. **Messages**
   - Direct athlete communication
   - Thread management
   - Attachments

7. **Campaign Detail Pages**
   - Multiple tabs (performance, athletes, budget)
   - Real-time tracking
   - Content approval workflow

8. **Settings & Profile**
   - Agency profile (company info)
   - Team management
   - Billing

### Nice-to-Have (P2) - Post-Launch

9. **Analytics**
   - Deep-dive metrics
   - Campaign comparisons
   - ROI calculations
   - Export reports

10. **Advanced Features**
    - AI-powered athlete recommendations
    - Bulk messaging
    - Scheduled campaigns
    - Contract management
    - Payment processing

---

## 11. Key Differences Summary Table

| Aspect | Athlete Experience | Agency Experience |
|--------|-------------------|-------------------|
| **User Type** | Individual student-athlete | Business/Brand representative |
| **Primary Goal** | Learn NIL, build brand, get opportunities | Find talent, manage campaigns, drive ROI |
| **Mental Model** | Personal growth journey | Business workflow/CRM |
| **Navigation** | Left sidebar with chat history | Top horizontal nav |
| **Dashboard** | Personal metrics (FMV, badges, profile completion) | Business metrics (campaigns, spend, ROI) |
| **Key Pages** | Dashboard, Profile, Badges, Quizzes, Library, Messages (AI) | Dashboard, Discover, Campaigns, Athletes, Messages (Direct), Analytics |
| **"Messages"** | AI chat interface | Direct messages with athletes |
| **Tone** | Encouraging, warm, Gen Z | Professional, data-driven, efficient |
| **CTAs** | "Take Quiz", "Complete Profile", "Learn More" | "Create Campaign", "Find Athletes", "View Report" |
| **Data Focus** | Personal growth indicators | Business KPIs and campaign metrics |
| **Sidebar** | YES - Chat history | NO - Full screen for data |
| **Visual Weight** | Light, playful, animated | Substantial, clean, professional |
| **Color Saturation** | High saturation (vibrant) | Lower saturation (corporate-friendly) |
| **Emojis** | Frequent use (👋 🏆 ⭐) | Minimal use |

---

## 12. Success Metrics

### For Implementation

- **Code Coverage:** 80%+ test coverage on agency routes
- **Performance:** Page load < 2s, API response < 500ms
- **Accessibility:** WCAG 2.1 AA compliance
- **Mobile:** Fully responsive on tablet and mobile

### For User Adoption

- **Agency Signup:** 50+ agencies in first 3 months
- **Campaigns Created:** 100+ campaigns in first 3 months
- **Messages Sent:** 500+ agency-athlete messages in first 3 months
- **Discovery Usage:** 80% of agencies use Discover within first week
- **NPS Score:** 50+ (promoters outnumber detractors)

### For Business Impact

- **Athlete-Agency Matches:** 200+ successful matches in first 3 months
- **GMV (Gross Merchandise Value):** $500K+ in campaign budgets managed
- **Retention:** 70% of agencies return after first campaign
- **Expansion:** 30% of agencies create 2+ campaigns

---

## 13. Risks & Mitigations

### Risk 1: Role Confusion

**Problem:** Users confused about which dashboard they're on

**Mitigation:**
- Clear visual distinction (no sidebar for agencies)
- Logo/header shows role ("Agency Dashboard" vs "Your NIL Dashboard")
- Different color accents (more muted for agencies)
- Role switcher if user has multiple roles

### Risk 2: Data Overlap

**Problem:** Agencies see athlete private data or vice versa

**Mitigation:**
- Strict RLS policies (already in place from migration 040)
- API-level authorization checks
- Regular security audits
- Separate API namespaces (/api/dashboard/athlete vs /api/dashboard/agency)

### Risk 3: Performance with Scale

**Problem:** Discover page slow with 10,000+ athletes

**Mitigation:**
- Pagination (12 results per page)
- Database indexing on filterable fields
- Caching frequently accessed data
- Consider Elasticsearch for search if needed

### Risk 4: Messaging Spam

**Problem:** Agencies spam athletes with messages

**Mitigation:**
- Rate limiting on message sending
- Athlete can block agencies
- Report functionality
- Moderation tools for admins

### Risk 5: Campaign Complexity

**Problem:** Campaign creation too complex, agencies abandon

**Mitigation:**
- Progressive disclosure (wizard with clear steps)
- Save draft functionality
- Templates for common campaign types
- Onboarding tour for first-time users

---

## 14. Open Questions

1. **Role Switching:**
   - Can a user be both athlete AND agency?
   - If yes, how do they switch between views?
   - Separate accounts or unified account?

2. **Payment Processing:**
   - Does ChatNIL handle payments or third-party (Stripe Connect)?
   - What's the business model? (Platform fee? Subscription?)
   - When are agencies charged?

3. **Athlete Responses:**
   - Do athletes receive campaign invites in-app or email?
   - Can athletes counter-offer on compensation?
   - What's the negotiation workflow?

4. **Content Approval:**
   - Does agency approve content before it's posted?
   - How is content submitted by athletes?
   - Integration with Instagram/TikTok APIs?

5. **Verification:**
   - How are athletes verified?
   - How are agencies verified (legit businesses)?
   - What's the vetting process?

6. **Mobile App:**
   - Will there be a mobile app for agencies?
   - Mobile-first or desktop-first?
   - React Native or separate codebase?

---

## 15. Next Steps

### Immediate (This Week)

1. **Review this document** with team (Nova, Forge, Brand, Copywriter)
2. **Get feedback** on navigation structure and dashboard layout
3. **Prioritize features** (confirm P0, P1, P2 breakdown)
4. **Create detailed designs** for Phase 1 pages (Nova)

### Short-Term (Next 2 Weeks)

5. **Implement Phase 1** (Foundation)
   - Agency dashboard overhaul
   - Navigation confirmation
   - Role-based routing
6. **Begin Phase 2** (Discover & Athletes)
   - Discover page enhancement
   - API development
   - Roster page

### Medium-Term (Next Month)

7. **Complete Phase 2** (Discover & Athletes)
8. **Complete Phase 3** (Campaigns)
9. **User testing** with 3-5 agencies
10. **Iterate based on feedback**

### Long-Term (Next Quarter)

11. **Complete Phase 4** (Messages)
12. **Complete Phase 5** (Analytics)
13. **Launch to public**
14. **Marketing and onboarding**

---

## Appendix A: Component Inventory

### Agency-Specific Components to Build

```
components/agencies/
├── AgencyTopNav.tsx ✅ (exists)
├── AthleteDiscoveryCard.tsx ✅ (exists)
├── DiscoverFilters.tsx ✅ (exists)
├── AIRecommendations.tsx ✅ (exists)
├── DiscoveryStats.tsx ✅ (exists)
├── CampaignCard.tsx ⚠️ (needs enhancement)
├── CampaignWizard/
│   ├── StepBasics.tsx ❌ (to build)
│   ├── StepBudget.tsx ❌
│   ├── StepAthletes.tsx ❌
│   ├── StepDeliverables.tsx ❌
│   ├── StepTerms.tsx ❌
│   └── StepReview.tsx ❌
├── CampaignDetailTabs/
│   ├── OverviewTab.tsx ❌
│   ├── AthletesTab.tsx ❌
│   ├── PerformanceTab.tsx ❌
│   ├── ContentTab.tsx ❌
│   └── BudgetTab.tsx ❌
├── AthleteRosterTable.tsx ❌
├── MessageThread.tsx ❌
├── MessageComposer.tsx ❌
├── MessageInbox.tsx ❌
├── AnalyticsCharts/
│   ├── ImpressionsChart.tsx ❌
│   ├── CampaignComparisonChart.tsx ❌
│   ├── DemographicsChart.tsx ❌
│   └── ROIChart.tsx ❌
└── ExportReportModal.tsx ❌

components/dashboard/agency/ (NEW DIRECTORY)
├── MetricsCard.tsx ❌
├── ActiveCampaignsWidget.tsx ❌
├── TopAthletesWidget.tsx ❌
├── ActivityFeedWidget.tsx ❌
├── PendingApprovalsWidget.tsx ❌
├── UpcomingMilestonesWidget.tsx ❌
└── QuickActionsWidget.tsx ❌
```

Legend:
- ✅ Exists and works
- ⚠️ Exists but needs work
- ❌ Needs to be built

---

## Appendix B: Database Schema Reference

See `/migrations/040_agency_platform.sql` for full schema.

**Key Relationships:**

```
auth.users (user_id, role)
    ↓
athlete_public_profiles (user_id) ← What agencies search
    ↓
athlete_portfolio_items (athlete_profile_id) ← Showcase work

auth.users (agency_user_id, role='agency')
    ↓
agency_campaigns (agency_user_id)
    ↓
campaign_athlete_invites (campaign_id, athlete_profile_id)
    ← Links campaigns to athletes

agency_athlete_messages (agency_user_id, athlete_user_id, thread_id)
    ← Direct messages

agency_athlete_lists (agency_user_id)
    ↓
agency_athlete_list_items (list_id, athlete_profile_id)
    ← Saved athletes in lists
```

---

## Appendix C: API Route Summary

**Format:** `METHOD /endpoint → Response Type`

### Dashboard
- `GET /api/dashboard/agency/metrics → AgencyMetrics`
- `GET /api/dashboard/agency/campaigns/active → Campaign[]`
- `GET /api/dashboard/agency/athletes/top-performing → Athlete[]`
- `GET /api/dashboard/agency/activity-feed → ActivityItem[]`
- `GET /api/dashboard/agency/approvals → Approval[]`
- `GET /api/dashboard/agency/milestones → Milestone[]`

### Discover
- `GET /api/agencies/athletes/discover → { athletes: Athlete[], has_more: boolean }`
- `POST /api/agencies/athletes/discover/save → { success: boolean }`
- `GET /api/agencies/athletes/discover/recommendations → Athlete[]`
- `POST /api/agencies/athletes/filters/save → { filter_id: string }`
- `GET /api/agencies/athletes/filters/saved → SavedFilter[]`

### Campaigns
- `GET /api/agencies/campaigns → Campaign[]`
- `POST /api/agencies/campaigns → { campaign_id: string }`
- `GET /api/agencies/campaigns/:id → Campaign`
- `PUT /api/agencies/campaigns/:id → { success: boolean }`
- `DELETE /api/agencies/campaigns/:id → { success: boolean }`
- `POST /api/agencies/campaigns/:id/invite-athlete → { invite_id: string }`
- `GET /api/agencies/campaigns/:id/invites → Invite[]`
- `PUT /api/agencies/campaigns/:id/invites/:invite_id → { success: boolean }`
- `GET /api/agencies/campaigns/:id/performance → PerformanceMetrics`

### Athletes (Roster)
- `GET /api/agencies/athletes/roster → Athlete[]`
- `GET /api/agencies/athletes/roster/:athlete_id → AthleteDetail`
- `POST /api/agencies/athletes/roster/:athlete_id/notes → { success: boolean }`
- `GET /api/agencies/athletes/roster/:athlete_id/campaigns → Campaign[]`
- `GET /api/agencies/athletes/roster/:athlete_id/performance → PerformanceMetrics`

### Messages
- `GET /api/agencies/messages/threads → Thread[]`
- `GET /api/agencies/messages/threads/:thread_id → Message[]`
- `POST /api/agencies/messages/send → { message_id: string }`
- `PUT /api/agencies/messages/:message_id/read → { success: boolean }`
- `POST /api/agencies/messages/templates → { template_id: string }`
- `GET /api/agencies/messages/templates → Template[]`

### Analytics
- `GET /api/agencies/analytics/overview → AnalyticsOverview`
- `GET /api/agencies/analytics/campaigns/compare → CampaignComparison[]`
- `GET /api/agencies/analytics/athletes/performance → AthletePerformance[]`
- `GET /api/agencies/analytics/export → { download_url: string }`
- `POST /api/agencies/analytics/reports/schedule → { schedule_id: string }`

---

## Document Control

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-30 | Blueprint | Initial architecture document |

**Approval:**

- [ ] Technical Lead
- [ ] Product Owner
- [ ] Design Lead
- [ ] Engineering Team

**Distribution:**

- Nova (Frontend Agent)
- Forge (Backend Agent)
- Brand Guardian
- Copywriter
- Development Team

---

**End of Document**
