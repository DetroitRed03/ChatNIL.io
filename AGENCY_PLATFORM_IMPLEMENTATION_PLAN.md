# Agency Platform Implementation Plan
## Complete 6-Phase Rollout

**Created**: 2025-10-30
**Status**: Ready to Execute
**Timeline**: 6-8 weeks for complete implementation

---

## Overview

This plan transforms the ChatNIL agency experience from a visual clone of the athlete dashboard into a **purpose-built business platform** for talent discovery, campaign management, and ROI tracking.

### Core Principle
**Athletes and Agencies have fundamentally different needs.** This plan creates two distinct experiences that share design system foundations but diverge in structure, features, and workflows.

---

## Phase 1: Agency Dashboard Overhaul
**Priority**: P0 - CRITICAL
**Timeline**: Week 1 (5 days)
**Team**: Nova (Frontend), Forge (Backend), Copywriter, Brand Guardian

### Goal
Replace athlete-focused dashboard with business-focused KPI dashboard.

### What's Wrong Now
- Dashboard shows athlete metrics (profile completion, FMV score, badges)
- Copy is personal/encouraging ("Welcome back! Let's level up")
- Widgets focus on learning/growth, not business performance
- Warm aesthetic is TOO Gen Z for business users

### What We're Building

#### 1.1 New Dashboard Widgets

**A. Campaign Performance Overview** (Hero Widget)
```tsx
Components:
- Active campaigns count (23)
- Total impressions (2.4M)
- Average engagement rate (4.8%)
- Campaign spend vs budget ($487K / $500K)
- Weekly performance chart (impressions over time)

Design:
- Large, bold numbers (text-5xl for key metrics)
- Subdued warm colors (professional orange/amber, not playful)
- Data visualization (line chart for trends)
- Quick filters (7d, 30d, 90d, 1y)

Copy:
- "Campaign Performance" (not "Your NIL Journey")
- "2.4M Total Impressions" (not "Profile Views")
- "ROI: 3.2x" (business language)
```

**B. Active Athletes Roster** (Main Widget)
```tsx
Components:
- List of athletes in active campaigns
- Performance by athlete (impressions, engagement, clicks)
- Contract status (active, pending, expired)
- Quick actions (message, view profile, renew)

Design:
- Table/list view (data-dense)
- Avatar + name + sport + school
- Performance bars (visual comparison)
- Status badges (active = green, pending = yellow)

Copy:
- "Active Athletes (127)" (not "Brand Matches")
- "Top Performers This Month"
- Clear, professional labels
```

**C. Budget Tracker** (Financial Widget)
```tsx
Components:
- Total budget allocated ($500K)
- Spent to date ($487K)
- Remaining budget ($13K)
- Upcoming payments (next 30 days)
- Spend by campaign (breakdown)

Design:
- Progress bars for budget utilization
- Color-coded (green = on track, yellow = warning, red = over)
- Mini chart showing spend over time
- Professional financial styling

Copy:
- "Budget Overview" (straightforward)
- "Campaign Spend" (not "Total Earned")
- Clear dollar amounts with commas
```

**D. Pending Actions** (Task Widget)
```tsx
Components:
- Approvals needed (3 contracts)
- Content to review (5 posts)
- Messages to respond to (8 unread)
- Upcoming deadlines (2 this week)

Design:
- Action list with counts
- Priority indicators (urgent = red dot)
- Click to navigate to relevant page
- Compact, scannable format

Copy:
- "Action Required" or "To Do"
- Clear task descriptions
- Due dates visible
```

**E. Recent Activity Feed** (Update Widget)
```tsx
Components:
- Athlete responses (Sarah accepted invite)
- Campaign milestones (Summer Basketball hit 500K impressions)
- Contract updates (Jake signed agreement)
- Payment confirmations (processed $5K to Emma)

Design:
- Timeline format
- Icons for activity type (message, milestone, contract, payment)
- Timestamps (2h ago, 1d ago)
- Muted warm colors (not flashy)

Copy:
- Factual, business tone
- "Sarah Williams accepted your campaign invite" (not "You got a match!")
- Professional event descriptions
```

**F. Quick Stats** (Metrics Row)
```tsx
Components (4 cards):
1. Active Athletes: 127 (+12 vs last month)
2. Active Campaigns: 23 (+5 vs last month)
3. Total Impressions: 2.4M (+18% vs last month)
4. Campaign Spend: $487K (-8% vs last month)

Design:
- Same StatCard component as athlete dashboard
- Professional warm colors (muted orange/amber)
- Trend indicators (↑↓ arrows with percentages)
- Slightly smaller than athlete version

Copy:
- Business metrics (not personal growth)
- "Active Athletes" (not "Brand Matches")
- Professional labels throughout
```

#### 1.2 Layout Changes

**Remove**:
- ❌ Chat sidebar (agencies don't need AI assistant)
- ❌ "Get Things Done" widget (too personal)
- ❌ Quiz prompts
- ❌ Badge showcases
- ❌ Profile completion indicators

**Add**:
- ✅ Top navigation bar (Dashboard, Discover, Campaigns, Athletes, Messages, Analytics)
- ✅ Date range selector (7d, 30d, 90d, 1y)
- ✅ Export button (download reports)
- ✅ "Create Campaign" CTA (prominent, top-right)

**Grid Structure**:
```
[Header with date range selector]

[Quick Stats - 4 cards in a row]

[Main Area: 2/3 width]          [Sidebar: 1/3 width]
- Campaign Performance (hero)    - Pending Actions
- Active Athletes (table)        - Budget Tracker
- Recent Activity (feed)         - Upcoming Deadlines
```

#### 1.3 Copy Updates (Copywriter)

**Tone Shift**:
- FROM: "Welcome back! Let's level up your NIL game 👋"
- TO: "Good afternoon, Nike. Campaign performance overview for October."

**Example Changes**:
- "Your NIL Dashboard" → "Agency Dashboard"
- "Brands Want You" → "Campaign Opportunities"
- "Get Things Done ⚡" → "Pending Actions"
- "What You Missed 🔔" → "Recent Activity"
- "Your Schedule 📅" → "Upcoming Deadlines"

**Emoji Usage**:
- Reduce by 80% (only in context, not in headers)
- Professional contexts only (📊 for reports, 💰 for payments)
- Never in primary navigation or headers

#### 1.4 Design Adjustments (Nova + Brand Guardian)

**Keep**:
- Warm color palette (orange/amber/yellow)
- Design system components (Card, Button, Badge)
- Typography scale
- Hover effects and animations

**Adjust**:
- Saturation: Reduce by 20% (more muted, professional)
- Gradients: Use sparingly (only for CTAs and accents)
- Text sizes: Slightly smaller for denser data
- Spacing: Tighter for efficiency (business users want information density)

**Example**:
```tsx
// Athlete Dashboard Header
className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600"
emoji="🏆"
greeting="Welcome back, Sarah! 👋 Let's level up your NIL game"

// Agency Dashboard Header
className="bg-gradient-to-r from-orange-600/90 via-orange-700/90 to-amber-700/90"
emoji=none
greeting="Agency Dashboard"
```

#### 1.5 API Routes (Forge)

**Create**:
```
GET /api/dashboard/agency/overview
Response: {
  activeAthletes: 127,
  activeCampaigns: 23,
  totalImpressions: 2400000,
  campaignSpend: 487000,
  trends: { athletes: +12, campaigns: +5, impressions: +18, spend: -8 }
}

GET /api/dashboard/agency/campaigns/active
Response: [
  { id, name, athletes, impressions, engagement, budget, status, progress }
]

GET /api/dashboard/agency/athletes/active
Response: [
  { id, name, sport, school, fmv, engagement, followers, contractStatus }
]

GET /api/dashboard/agency/activity/recent
Response: [
  { id, type, description, timestamp }
]

GET /api/dashboard/agency/actions/pending
Response: {
  approvals: 3,
  contentReviews: 5,
  unreadMessages: 8,
  upcomingDeadlines: 2
}
```

#### 1.6 Testing Checklist

- [ ] Agency user sees business dashboard (not athlete dashboard)
- [ ] No chat sidebar visible
- [ ] All metrics show business data (not personal data)
- [ ] Copy is professional and data-driven
- [ ] Warm aesthetic is muted (not Gen Z playful)
- [ ] "Create Campaign" CTA is prominent
- [ ] Date range selector works (7d, 30d, 90d, 1y)
- [ ] All links navigate to correct agency pages
- [ ] Mobile responsive (works on tablet/phone)
- [ ] Performance: loads under 2 seconds

---

## Phase 2: Discover Page Enhancement
**Priority**: P0 - CRITICAL
**Timeline**: Weeks 2-3 (10 days)
**Team**: Nova (Frontend), Forge (Backend), Copywriter

### Goal
Build the **core value proposition** for agencies: discovering and filtering athletes that match their brand.

### What Exists Now
- Basic discover page structure (`/app/agencies/discover/page.tsx`)
- Athlete profile cards
- Some filtering components

### What We're Building

#### 2.1 Advanced Filtering System

**Filter Categories**:
```tsx
1. Sport (multi-select)
   - Basketball, Football, Soccer, Baseball, etc.
   - "Select all" / "Clear all" options

2. School Level (radio)
   - High School
   - College
   - Both

3. Location (multi-select)
   - State dropdown (50 states)
   - Region grouping (Southeast, West Coast, etc.)

4. FMV Range (slider)
   - Min: $0, Max: $500K
   - Preset ranges: <$10K, $10-50K, $50-100K, $100K+

5. Social Media (sliders)
   - Instagram followers: 0 - 1M+
   - TikTok followers: 0 - 1M+
   - Twitter followers: 0 - 500K+
   - YouTube subscribers: 0 - 500K+
   - Total reach: calculated field

6. Engagement Rate (slider)
   - 0% - 20%
   - Color-coded (red <2%, yellow 2-5%, green >5%)

7. Content Categories (multi-select)
   - Fitness, Fashion, Gaming, Food, Travel, etc.
   - 20+ categories

8. Brand Values (multi-select)
   - Sustainability, Innovation, Community, Performance, etc.
   - 15+ values

9. Audience Demographics (dropdowns)
   - Age range: 13-17, 18-24, 25-34, 35+
   - Gender: Male, Female, Mixed
   - Location: US, International

10. Availability (checkbox)
    - Available for partnerships now
    - Response rate > 80%
    - Verified athletes only
```

**Filter UI**:
```tsx
Components:
- Left sidebar (collapsible) with all filters
- Filter count badge (8 filters applied)
- "Clear all filters" button
- "Save search" button (for later)
- Recently saved searches

Design:
- Accordion sections for categories
- Visual sliders for ranges
- Multi-select with checkboxes
- Clean, professional layout
- Warm color accents for active filters
```

#### 2.2 Search Results Display

**Layout Options**:
```tsx
1. Grid View (default)
   - 3 cards per row
   - Athlete photo, name, sport, school
   - Key metrics (FMV, followers, engagement)
   - "View Profile" CTA

2. List View (detailed)
   - Table format
   - More metrics visible
   - Sortable columns
   - Bulk actions (select multiple)

3. Map View (geographic)
   - US map with athlete locations
   - Cluster markers for dense areas
   - Filter by clicking regions
```

**Athlete Cards**:
```tsx
Components:
- Profile photo (circular, high quality)
- Name + sport + school
- FMV range ($50K - $75K)
- Total followers (247K)
- Engagement rate (8.4%)
- Match score (94% - calculated by AI)
- Quick actions:
  - "View Profile" (button)
  - "Save" (heart icon)
  - "Message" (chat icon)
  - "Add to Campaign" (+ icon)

Design:
- Professional card with warm borders
- Hover effect (gentle lift + shadow)
- Match score badge (prominent if >80%)
- Status indicators (available = green dot)
```

#### 2.3 AI Recommendations

**Recommendation Engine**:
```tsx
Features:
- "Recommended for You" section (top of results)
- Based on agency's past campaigns
- ML matching: brand values + content categories + audience
- Confidence score (High, Medium, Low)

Components:
- "Why this athlete?" explanation
  - "Sarah matches 94% of your brand criteria"
  - "Strong audience overlap with your target demographic"
  - "High engagement rate (8.4%) in your industry"
- "Similar athletes" suggestions
- "Trending athletes" in your filters

Design:
- Special card treatment for recommendations
- Gold border or badge ("Recommended")
- AI icon to indicate algorithmic match
```

#### 2.4 Save & Organize

**Features**:
```tsx
1. Save Individual Athletes
   - Heart icon on cards
   - Add to "Saved Athletes" list
   - Organize into custom lists ("Basketball Roster", "Spring Campaign")

2. Save Searches
   - Name your filter combination
   - Quick access from dropdown
   - "Alert me" option (new athletes matching criteria)

3. Lists
   - Create custom lists
   - Drag & drop athletes between lists
   - Share lists with team members
   - Export lists to CSV
```

#### 2.5 Sorting & Pagination

**Sort Options**:
```tsx
- Relevance (AI match score) [default]
- FMV (high to low / low to high)
- Followers (high to low)
- Engagement rate (high to low)
- Recently added (newest first)
- Alphabetical (A-Z)

Pagination:
- 30 results per page
- Infinite scroll option
- "Load more" button
- Jump to page number
```

#### 2.6 API Routes (Forge)

**Create**:
```
POST /api/agencies/athletes/discover
Body: {
  filters: {
    sports: ["basketball", "football"],
    schoolLevel: "college",
    states: ["CA", "TX", "FL"],
    fmvMin: 50000,
    fmvMax: 150000,
    minFollowers: 100000,
    minEngagement: 5.0,
    contentCategories: ["fitness", "fashion"],
    isAvailable: true
  },
  sort: "relevance",
  page: 1,
  limit: 30
}
Response: {
  athletes: [ /* athlete objects */ ],
  totalCount: 247,
  recommendations: [ /* top 5 AI matches */ ],
  page: 1,
  totalPages: 9
}

POST /api/agencies/athletes/save
Body: { athleteId: "uuid", listId: "uuid" }

POST /api/agencies/searches/save
Body: { name: "Spring Basketball", filters: { /* filter object */ } }

GET /api/agencies/searches/saved
Response: [ { id, name, filters, createdAt } ]
```

#### 2.7 Testing Checklist

- [ ] All 10 filter categories work independently
- [ ] Multi-filter combinations work correctly
- [ ] Results update in real-time as filters change
- [ ] AI recommendations appear at top
- [ ] Match scores calculate correctly
- [ ] Save athlete feature works (heart icon)
- [ ] Save search feature works
- [ ] Sort options change result order
- [ ] Pagination works (30 per page)
- [ ] Grid, list, and map views toggle correctly
- [ ] Mobile responsive (filters in drawer)
- [ ] Performance: filters apply under 1 second

---

## Phase 3: Campaign Management System
**Priority**: P0 - CRITICAL
**Timeline**: Weeks 4-5 (10 days)
**Team**: Nova (Frontend), Forge (Backend), Copywriter, Brand Guardian

### Goal
Enable agencies to create, manage, and track campaigns from start to finish.

### What We're Building

#### 3.1 Campaign Creation Wizard (6 Steps)

**Step 1: Campaign Basics**
```tsx
Fields:
- Campaign name (text input)
- Campaign description (textarea)
- Campaign goals (multi-select):
  - Brand Awareness
  - Product Launch
  - Event Promotion
  - Lead Generation
  - Sales Conversion
- Campaign dates (date range picker)
- Campaign category (dropdown): Sports, Lifestyle, Tech, Food, etc.

Design:
- Clean form layout
- Progress indicator (step 1 of 6)
- "Save draft" option
- "Next" button (disabled until required fields filled)
```

**Step 2: Budget & Compensation**
```tsx
Fields:
- Total budget (currency input)
- Budget allocation:
  - Athlete payments (% slider)
  - Production costs (% slider)
  - Platform fees (% slider)
- Compensation model (radio):
  - Fixed fee per athlete
  - Performance-based (CPM, CPC, CPA)
  - Revenue share
- Payment schedule (dropdown):
  - Upfront
  - Milestone-based
  - Net 30/60/90

Design:
- Visual budget breakdown (pie chart)
- Real-time calculations
- Warning if over budget
```

**Step 3: Target Athletes**
```tsx
Features:
- Add athletes from:
  - Saved lists (dropdown)
  - Discover page (open in modal)
  - Manual search (type name)
  - CSV import (bulk upload)
- Athlete table:
  - Name, sport, school, FMV, expected reach
  - Remove button
  - Reorder (drag & drop)
- Projected reach (calculated):
  - Total followers: 1.2M
  - Expected impressions: 450K
  - Estimated engagement: 36K

Design:
- Dual-panel (available athletes | selected athletes)
- Search & filter within step
- Bulk select option
```

**Step 4: Content Requirements**
```tsx
Fields:
- Content types (multi-select):
  - Instagram post
  - Instagram story
  - Instagram reel
  - TikTok video
  - Twitter post
  - YouTube video
  - Blog post
- Quantity per athlete (number inputs)
- Content guidelines (rich text editor):
  - Brand messaging
  - Hashtags required
  - Mentions required
  - Visual guidelines
  - Do's and don'ts
- Example content (file uploads)
- Approval required? (toggle)

Design:
- Content type cards (icon + name)
- Visual quantity selector
- WYSIWYG editor for guidelines
- File upload with preview
```

**Step 5: Timeline & Milestones**
```tsx
Features:
- Key dates:
  - Campaign kickoff (auto: start date)
  - Content due date
  - Review & approval deadline
  - Publishing window
  - Campaign end date
  - Final reporting date
- Milestones (add custom):
  - Name
  - Date
  - Responsible party
  - Notification settings
- Gantt chart view (visual timeline)

Design:
- Interactive timeline
- Drag to adjust dates
- Color-coded milestones
- Dependency arrows (if applicable)
```

**Step 6: Review & Launch**
```tsx
Components:
- Summary of all steps:
  1. Campaign: "Summer Basketball 2024"
  2. Budget: $125K total
  3. Athletes: 45 selected (projected 1.2M reach)
  4. Content: 90 Instagram posts, 45 reels
  5. Timeline: June 1 - Aug 31, 2024
- Edit buttons for each section
- Terms & conditions (checkbox)
- Launch options:
  - "Save as draft" (gray button)
  - "Schedule launch" (date picker)
  - "Launch now" (orange gradient button)

Design:
- Card-based summary
- Clear visual hierarchy
- Prominent CTA
- Confirmation modal on launch
```

#### 3.2 Campaign Dashboard (Detail Page)

**Layout**:
```
[Campaign Header]
- Name, status badge, edit button
- Key metrics: impressions, engagement, spend

[Tabs]
1. Overview
2. Athletes
3. Content
4. Performance
5. Budget
6. Timeline
```

**Tab 1: Overview**
```tsx
Widgets:
- Performance summary (impressions, engagement, clicks, conversions)
- Progress bars (content submitted, content approved, content published)
- Recent activity feed (athlete updates, content submissions, milestones)
- Next actions (3 pending approvals, 2 upcoming deadlines)

Design:
- Dashboard-style layout
- Charts for trends
- Quick links to detailed tabs
```

**Tab 2: Athletes**
```tsx
Features:
- Table of campaign athletes:
  - Name, sport, school, contract status
  - Content submitted / required
  - Impressions delivered
  - Engagement rate
  - Payment status
- Actions:
  - Message athlete
  - View submissions
  - Remove from campaign
  - Mark payment sent
- Add more athletes (button)

Design:
- Sortable table
- Status badges (active, pending, completed)
- Quick action dropdowns
```

**Tab 3: Content**
```tsx
Features:
- Gallery view of all submissions:
  - Thumbnail preview
  - Athlete name
  - Post type (Instagram, TikTok, etc.)
  - Status (pending review, approved, rejected, published)
  - Metrics (likes, comments, shares)
- Bulk actions:
  - Approve selected
  - Request revisions
  - Download all
- Filter: by status, athlete, post type

Design:
- Grid layout (4-5 per row)
- Lightbox for full view
- Approve/reject buttons on hover
- Notes/feedback modal
```

**Tab 4: Performance**
```tsx
Metrics:
- Impressions over time (line chart)
- Engagement by athlete (bar chart)
- Content performance (table: post, impressions, engagement, clicks)
- Audience demographics (pie charts)
- Top performing posts (leaderboard)
- Conversion tracking (if applicable)

Design:
- Chart-heavy dashboard
- Export to PDF/Excel
- Date range selector
- Comparison mode (vs other campaigns)
```

**Tab 5: Budget**
```tsx
Components:
- Budget vs actual (progress bar)
- Spend by category (pie chart)
- Payment schedule (timeline)
- Pending payments (table)
- Transaction history (ledger)
- Invoice generation

Design:
- Financial dashboard
- Color-coded (green = under budget, red = over)
- Export to CSV
```

**Tab 6: Timeline**
```tsx
Features:
- Gantt chart of campaign
- Milestones marked
- Progress indicators
- Late items highlighted (red)
- Edit dates (if campaign active)

Design:
- Interactive timeline
- Zoom in/out
- Today marker
```

#### 3.3 Campaign List Page

**Views**:
```tsx
1. Active Campaigns (default)
   - Currently running
   - Sorted by end date (soonest first)

2. Upcoming Campaigns
   - Scheduled but not started
   - Sorted by start date

3. Completed Campaigns
   - Ended campaigns
   - Sorted by end date (most recent first)

4. Draft Campaigns
   - Incomplete wizard submissions
   - Sorted by last edited
```

**Campaign Card**:
```tsx
Components:
- Campaign name
- Status badge (active, upcoming, completed, draft)
- Date range
- Key metrics (athletes, impressions, budget)
- Progress bar (% complete)
- Quick actions:
  - View details
  - Edit campaign
  - Duplicate
  - Archive

Design:
- Horizontal card layout
- Metrics in grid
- Color-coded status
- Hover actions
```

**Filters & Search**:
```tsx
- Search by name
- Filter by status
- Filter by date range
- Sort by: end date, budget, performance
```

#### 3.4 Campaign Templates

**Features**:
```tsx
- Pre-built campaign structures:
  - Product Launch
  - Seasonal Promotion
  - Event Activation
  - Brand Awareness
  - Contest/Giveaway
- Template library
- Create custom templates (save current campaign as template)
- Duplicate & customize

Design:
- Template gallery
- Preview mode
- "Use template" button
```

#### 3.5 API Routes (Forge)

**Create**:
```
POST /api/agencies/campaigns/create
Body: { /* all wizard data */ }
Response: { campaignId, status: "draft" }

PUT /api/agencies/campaigns/:id/launch
Response: { campaignId, status: "active", launchDate }

GET /api/agencies/campaigns/:id
Response: { campaign details, athletes, content, metrics }

GET /api/agencies/campaigns/list?status=active
Response: [ { campaign summaries } ]

POST /api/agencies/campaigns/:id/athletes/add
Body: { athleteIds: [] }

POST /api/agencies/campaigns/:id/content/review
Body: { contentId, status: "approved/rejected", feedback }

GET /api/agencies/campaigns/:id/performance
Response: { impressions, engagement, conversions, trends }
```

#### 3.6 Testing Checklist

- [ ] Campaign wizard completes all 6 steps
- [ ] Draft campaigns save and can be resumed
- [ ] Athletes can be added from multiple sources
- [ ] Budget calculations are accurate
- [ ] Timeline dates validate (no overlaps/conflicts)
- [ ] Campaign launches successfully
- [ ] Campaign detail tabs all load
- [ ] Content review workflow works (approve/reject)
- [ ] Performance metrics update in real-time
- [ ] Budget tracking shows accurate spend
- [ ] Bulk actions work (approve multiple submissions)
- [ ] Templates can be created and used
- [ ] Mobile responsive (wizard works on tablet)

---

## Phase 4: Athlete Roster Management
**Priority**: P1 - Important
**Timeline**: Week 6 (5 days)
**Team**: Nova (Frontend), Forge (Backend)

### Goal
Manage relationships with athletes across multiple campaigns.

### What We're Building

#### 4.1 Athletes List Page (`/agencies/athletes`)

**Views**:
```tsx
1. All Athletes (default)
   - Every athlete agency has worked with
   - Current + past partnerships

2. Active Partnerships
   - Athletes in active campaigns

3. Favorites
   - Athletes marked as favorites

4. By Sport
   - Grouped by sport type
```

**Athlete Row**:
```tsx
Components:
- Avatar + name
- Sport + school
- Contract status (active, expired, pending)
- Campaigns count (participated in 5 campaigns)
- Total impressions delivered (1.2M)
- Avg engagement rate (8.4%)
- Last contacted (5 days ago)
- Quick actions:
  - View profile
  - Message
  - Add to campaign
  - Mark favorite
  - View contracts

Design:
- Table layout (sortable)
- Status badges
- Action dropdown menu
- Hover actions
```

**Filters**:
```tsx
- Search by name
- Filter by sport
- Filter by school
- Filter by contract status
- Filter by campaign participation
- Sort by: name, performance, last contacted
```

#### 4.2 Athlete Detail Page (Agency View)

**Layout**:
```
[Athlete Header]
- Photo, name, sport, school
- Contact info (email, phone if shared)
- Social media links
- Favorite star (toggle)

[Tabs]
1. Profile
2. Campaigns
3. Performance
4. Contracts
5. Messages
```

**Tab 1: Profile**
```tsx
Components:
- Bio
- FMV range
- Social media stats (followers, engagement by platform)
- Content categories
- Brand values
- Audience demographics
- Portfolio (sample content)
- Verification badges

Design:
- Read-only profile view
- Visual stats (charts/graphs)
- Portfolio gallery
```

**Tab 2: Campaigns**
```tsx
Components:
- List of campaigns this athlete participated in
- Campaign name, dates, role, status
- Performance summary per campaign
- Content submitted (links/previews)

Design:
- Timeline view
- Expandable campaign cards
```

**Tab 3: Performance**
```tsx
Metrics:
- Total impressions across all campaigns
- Average engagement rate
- Best performing content (top 5)
- Audience reach growth over time
- Engagement trend (line chart)

Design:
- Chart-heavy dashboard
- Comparison to other athletes
- Export data
```

**Tab 4: Contracts**
```tsx
Components:
- List of all contracts
- Contract date, campaign, amount, status
- Payment history
- Pending payments
- Upload new contract (PDF)
- E-signature status

Design:
- Document list
- Status indicators
- Download/view buttons
```

**Tab 5: Messages**
```tsx
Components:
- Message thread with this athlete
- Historical messages
- Compose new message
- Attachments

Design:
- Chat interface
- Integrated with Messages page
```

#### 4.3 Relationship Management

**Features**:
```tsx
- Notes: Add private notes about athlete
- Tags: Custom labels (e.g., "basketball", "high engagement", "reliable")
- Reminders: Set follow-up reminders
- Contact history: Log of all interactions
- Performance rating: Internal star rating
```

#### 4.4 Bulk Actions

**Features**:
```tsx
- Select multiple athletes
- Add to campaign (bulk invite)
- Send message (bulk message)
- Export to CSV
- Assign tags
```

#### 4.5 API Routes (Forge)

**Create**:
```
GET /api/agencies/athletes/roster
Response: [ { athlete details, relationship data } ]

GET /api/agencies/athletes/:id/profile
Response: { full athlete profile, campaigns, performance }

POST /api/agencies/athletes/:id/notes
Body: { note: "Great performance on Summer campaign" }

POST /api/agencies/athletes/:id/favorite
Body: { isFavorite: true }

GET /api/agencies/athletes/:id/contracts
Response: [ { contract details, status } ]
```

#### 4.6 Testing Checklist

- [ ] Athletes list shows all roster members
- [ ] Filters work (by sport, status, etc.)
- [ ] Athlete detail page loads all tabs
- [ ] Performance metrics calculate correctly
- [ ] Contract uploads work
- [ ] Notes can be added and viewed
- [ ] Favorite toggle works
- [ ] Bulk actions work (select multiple)
- [ ] Mobile responsive

---

## Phase 5: Direct Messaging System
**Priority**: P1 - Important
**Timeline**: Week 7 (5 days)
**Team**: Nova (Frontend), Forge (Backend)

### Goal
Enable direct communication between agencies and athletes.

**Note**: This is DIFFERENT from athlete AI chat. This is human-to-human messaging.

### What We're Building

#### 5.1 Messages Page (`/agencies/messages`)

**Layout**:
```
[Left Sidebar: Conversations]
- Search conversations
- Filter (all, unread, archived)
- List of conversations:
  - Avatar + name
  - Last message preview
  - Timestamp
  - Unread badge (count)

[Right Panel: Active Conversation]
- Athlete header (name, sport, school)
- Message thread (scrollable)
- Compose box (textarea + attachments)
- Quick actions (add to campaign, view profile)
```

**Conversation List**:
```tsx
Components:
- Athlete avatar (or group avatar for campaigns)
- Name
- Last message preview (truncated to 50 chars)
- Timestamp (2h ago, Yesterday, May 15)
- Unread indicator (blue dot + count)
- Pin icon (for pinned conversations)

Design:
- List view
- Hover highlight
- Active conversation highlighted (blue border)
- Unread conversations bold
```

**Message Thread**:
```tsx
Components:
- Messages grouped by date
- Sender avatar (athlete vs agency user)
- Message bubble (left = received, right = sent)
- Timestamp on hover
- Attachments (images, PDFs, links)
- Delivery status (sent, delivered, read)
- Typing indicator ("Sarah is typing...")

Design:
- Chat interface (like Slack/iMessage)
- Warm colors for agency messages (orange-100 background)
- Gray for athlete messages
- Auto-scroll to bottom
```

**Compose Box**:
```tsx
Features:
- Text input (multiline, auto-expand)
- Attachments button (images, PDFs, videos)
- Emoji picker
- Templates dropdown (pre-written messages)
- Send button (orange gradient)
- Keyboard shortcuts (Cmd+Enter to send)

Design:
- Fixed at bottom
- Clean, minimal
- Character count (if applicable)
```

#### 5.2 Message Templates

**Features**:
```tsx
Templates:
- Campaign invite (personalized)
- Follow-up reminder
- Content feedback
- Payment confirmation
- Thank you message

Template Variables:
- {athlete_name}
- {campaign_name}
- {payment_amount}
- {deadline_date}

Design:
- Template library modal
- Preview before using
- Customize before sending
```

#### 5.3 Notifications

**Features**:
```tsx
- Browser notification (new message received)
- Unread count badge (top nav Messages icon)
- Email notification (optional, user setting)
- In-app notification banner
```

#### 5.4 Group Conversations

**Features**:
```tsx
- Create group (agency + multiple athletes)
- Group name
- Add/remove participants
- Campaign-based groups (auto-created)

Design:
- Group avatar (overlapping athlete avatars)
- Participant list in sidebar
```

#### 5.5 Search & Filter

**Features**:
```tsx
- Search within conversation (find keyword)
- Global search (across all conversations)
- Filter:
  - Unread only
  - Starred/important
  - Has attachments
  - By athlete
  - By date range
```

#### 5.6 API Routes (Forge)

**Create**:
```
GET /api/agencies/messages/conversations
Response: [ { conversationId, participants, lastMessage, unreadCount } ]

GET /api/agencies/messages/:conversationId
Response: { messages: [], participants: [] }

POST /api/agencies/messages/send
Body: { conversationId, content, attachments }
Response: { messageId, timestamp }

POST /api/agencies/messages/mark-read
Body: { conversationId }

GET /api/agencies/messages/templates
Response: [ { id, name, content, variables } ]
```

**WebSocket** (Real-time):
```
- Connect: wss://api.chatnil.io/messages
- Events:
  - message.new (new message received)
  - message.read (recipient read message)
  - user.typing (someone is typing)
```

#### 5.7 Testing Checklist

- [ ] Conversations list loads
- [ ] Message thread displays correctly
- [ ] Send message works (text + attachments)
- [ ] Real-time updates (new messages appear)
- [ ] Unread count updates correctly
- [ ] Typing indicator shows
- [ ] Search within conversation works
- [ ] Templates can be used and customized
- [ ] Group conversations work
- [ ] Notifications trigger correctly
- [ ] Mobile responsive (conversations list in drawer)

---

## Phase 6: Analytics Dashboard
**Priority**: P2 - Nice-to-Have
**Timeline**: Week 8 (5 days)
**Team**: Nova (Frontend), Forge (Backend)

### Goal
Provide deep-dive analytics and ROI insights across all campaigns.

### What We're Building

#### 6.1 Analytics Page (`/agencies/analytics`)

**Layout**:
```
[Header]
- Date range selector (custom range + presets)
- Export button (PDF, Excel, CSV)
- Compare mode toggle

[Main Dashboard]
- KPI cards (4-6 top metrics)
- Performance over time (line chart)
- Campaign comparison (bar chart)
- Athlete performance (leaderboard)
- Content analysis (table)
- ROI calculator
```

**KPI Cards**:
```tsx
Metrics:
1. Total Impressions (2.4M)
2. Total Engagement (187K)
3. Average Engagement Rate (4.8%)
4. Total Spend ($487K)
5. Cost Per Impression ($0.20)
6. ROI (3.2x)

Design:
- Large numbers (text-4xl)
- Trend indicators (↑↓ + %)
- Sparkline charts
- Color-coded (green = good, red = bad)
```

**Performance Over Time**:
```tsx
Chart:
- Line chart (impressions, engagement, spend)
- Multiple lines (toggle on/off)
- Hover tooltips (date + value)
- Zoom controls

Metrics:
- Daily impressions
- Daily engagement
- Cumulative spend

Design:
- Full-width chart
- Professional colors (not too bright)
- Grid lines and axis labels
```

**Campaign Comparison**:
```tsx
Chart:
- Horizontal bar chart
- Compare up to 10 campaigns
- Metrics:
  - Total impressions
  - Engagement rate
  - Cost per impression
  - ROI

Design:
- Sortable (by metric)
- Color-coded bars (warm gradient)
- Value labels on bars
```

**Athlete Performance Leaderboard**:
```tsx
Table:
- Top 20 athletes (paginated)
- Columns:
  - Rank (#1, #2, etc.)
  - Name + avatar
  - Campaigns participated
  - Total impressions
  - Avg engagement rate
  - Cost per impression
  - Performance score (calculated)

Design:
- Podium icons for top 3 (🥇🥈🥉)
- Sortable columns
- Clickable rows (open athlete detail)
```

**Content Analysis**:
```tsx
Table:
- All content pieces
- Columns:
  - Thumbnail
  - Post type (Instagram, TikTok, etc.)
  - Athlete
  - Campaign
  - Publish date
  - Impressions
  - Engagement
  - Engagement rate
  - Clicks (if tracked)
  - Conversions (if tracked)

Filters:
- By campaign
- By athlete
- By post type
- By date range

Design:
- Table with thumbnails
- Sortable columns
- Export to CSV
```

**ROI Calculator**:
```tsx
Inputs:
- Campaign spend (auto-filled from data)
- Revenue generated (manual input if available)
- Goals achieved (leads, sales, signups)

Calculations:
- ROI = (Revenue - Spend) / Spend
- Cost per acquisition
- Cost per lead
- ROAS (Return on Ad Spend)

Design:
- Interactive calculator
- Visual gauge (ROI meter)
- Scenario modeling (what-if analysis)
```

#### 6.2 Custom Reports

**Features**:
```tsx
- Report builder:
  - Select metrics (multi-select)
  - Select campaigns (multi-select)
  - Select date range
  - Select chart type
- Save report template
- Schedule recurring reports (email weekly/monthly)
- Export formats (PDF, Excel, PowerPoint, CSV)
```

**Report Templates**:
```tsx
Pre-built:
- Executive summary (high-level KPIs)
- Campaign performance (single campaign deep-dive)
- Athlete performance (roster analysis)
- Content effectiveness (post-level analysis)
- Budget analysis (spend breakdown)
```

#### 6.3 Data Exports

**Features**:
```tsx
Formats:
- PDF (formatted report with charts)
- Excel (raw data + pivot tables)
- CSV (raw data)
- PowerPoint (slides with charts)

Options:
- Include charts (yes/no)
- Include athlete details (yes/no)
- Include raw data (yes/no)
- Date range filter
```

#### 6.4 Benchmarking

**Features**:
```tsx
- Compare to:
  - Industry averages (sports marketing)
  - Your historical performance
  - Similar campaigns (within ChatNIL)
- Metrics:
  - Engagement rates
  - Cost per impression
  - Follower growth
  - Content effectiveness

Design:
- Side-by-side comparison
- Percentage difference (+15% above average)
- Color-coded (green = outperforming)
```

#### 6.5 API Routes (Forge)

**Create**:
```
GET /api/agencies/analytics/overview?startDate=2024-01-01&endDate=2024-10-30
Response: {
  totalImpressions: 2400000,
  totalEngagement: 187000,
  avgEngagementRate: 4.8,
  totalSpend: 487000,
  costPerImpression: 0.20,
  roi: 3.2
}

GET /api/agencies/analytics/campaigns/compare?ids=1,2,3
Response: [ { campaignId, metrics } ]

GET /api/agencies/analytics/athletes/leaderboard?limit=20
Response: [ { athleteId, rank, metrics } ]

GET /api/agencies/analytics/content?campaignId=1
Response: [ { contentId, metrics } ]

POST /api/agencies/analytics/reports/create
Body: { reportConfig }
Response: { reportId, downloadUrl }
```

#### 6.6 Testing Checklist

- [ ] Analytics page loads with default date range
- [ ] KPI cards show correct metrics
- [ ] Charts render correctly (line, bar, pie)
- [ ] Campaign comparison works (select up to 10)
- [ ] Athlete leaderboard sorts correctly
- [ ] Content analysis table sortable
- [ ] ROI calculator computes correctly
- [ ] Custom reports can be created
- [ ] Reports export in all formats (PDF, Excel, CSV, PPT)
- [ ] Benchmarking data loads
- [ ] Mobile responsive (charts scale down)
- [ ] Performance: dashboard loads under 3 seconds

---

## Timeline Summary

| Phase | Focus | Duration | Status |
|-------|-------|----------|--------|
| 1 | Agency Dashboard Overhaul | Week 1 (5 days) | Ready to start |
| 2 | Discover Page Enhancement | Weeks 2-3 (10 days) | Planned |
| 3 | Campaign Management | Weeks 4-5 (10 days) | Planned |
| 4 | Athlete Roster | Week 6 (5 days) | Planned |
| 5 | Direct Messaging | Week 7 (5 days) | Planned |
| 6 | Analytics Dashboard | Week 8 (5 days) | Planned |

**Total Timeline**: 8 weeks (40 working days)
**MVP (Phases 1-3)**: 5 weeks
**Full Platform**: 8 weeks

---

## Success Metrics

### Phase 1 (Dashboard)
- Agency users see business-focused dashboard (not athlete dashboard)
- Dashboard loads under 2 seconds
- All metrics accurate within 5% margin

### Phase 2 (Discover)
- Agencies can filter athletes by 10+ criteria
- Search results return under 1 second
- AI recommendations achieve >70% acceptance rate

### Phase 3 (Campaigns)
- Agencies can create campaign in under 10 minutes
- Campaign wizard completion rate >80%
- Performance tracking updates within 1 hour

### Phase 4 (Roster)
- Agencies can manage roster of 100+ athletes
- Contract status always accurate
- Performance metrics calculate correctly

### Phase 5 (Messages)
- Real-time messaging latency under 1 second
- Message delivery rate >99%
- Unread count always accurate

### Phase 6 (Analytics)
- Analytics dashboard loads under 3 seconds
- Reports export successfully 100% of time
- ROI calculations accurate within 1%

---

## Team Coordination

**Daily Standup** (15 minutes):
- What did you complete yesterday?
- What are you working on today?
- Any blockers?

**Weekly Demo** (30 minutes):
- Demo completed features
- Get feedback from stakeholders
- Adjust next week's priorities

**Tools**:
- GitHub: Code repository
- Linear/Jira: Task tracking
- Figma: Design specs
- Slack: Team communication

---

## Risk Mitigation

**Risk 1: Scope Creep**
- Mitigation: Strict phase gates. Each phase must be approved before next begins.

**Risk 2: Data Inaccuracy**
- Mitigation: Comprehensive testing of all calculations. QA phase between each development phase.

**Risk 3: Performance Issues**
- Mitigation: Load testing after Phase 3. Optimize queries and caching.

**Risk 4: User Confusion**
- Mitigation: User testing with 3-5 agencies after Phase 1 and Phase 3.

**Risk 5: Timeline Slippage**
- Mitigation: 20% buffer built into each phase. Daily progress tracking.

---

## Post-Launch Plan

**Week 9: Monitoring & Feedback**
- Monitor error rates
- Collect user feedback
- Fix critical bugs
- Plan Phase 7 enhancements

**Week 10+: Iteration**
- Implement user-requested features
- Optimize performance
- Enhance AI recommendations
- Add integrations (Stripe, DocuSign, etc.)

---

## Appendix: Technology Stack

**Frontend**:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Recharts (data visualization)

**Backend**:
- Next.js API routes
- Supabase (database + auth)
- PostgreSQL
- Row Level Security (RLS)

**Real-time**:
- Supabase Realtime (WebSockets)
- React Query (data fetching)

**File Storage**:
- Supabase Storage (S3-compatible)

**Deployment**:
- Vercel (hosting)
- GitHub Actions (CI/CD)

---

**End of Implementation Plan**

This plan is ready for execution. Each phase is independent, testable, and delivers value. Team coordination is clear, and success metrics are defined.

Let's build! 🚀
