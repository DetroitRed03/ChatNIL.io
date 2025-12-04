# Agency Platform Implementation Checklist

**Purpose:** Step-by-step guide for implementing the agency experience

**Status Indicators:**
- ✅ Complete
- 🚧 In Progress
- ❌ Not Started
- ⚠️ Needs Review/Fix

---

## Phase 1: Foundation (Week 1)

### 1.1 Navigation & Layout

- [ ] **Verify agency layout doesn't render sidebar**
  - File: `/app/agencies/layout.tsx`
  - Check: Sidebar component is NOT imported or rendered
  - Verify: Only `AgencyTopNav` is used

- [ ] **Audit NavigationShell logic**
  - File: `/components/navigation/NavigationShell.tsx`
  - Ensure: Sidebar only renders when `user.role === 'athlete'`
  - Test: Log in as agency, confirm no sidebar appears

- [ ] **Confirm AgencyTopNav is correct**
  - File: `/components/agencies/AgencyTopNav.tsx`
  - Items: Dashboard, Discover, My Athletes, Campaigns, Messages, Analytics
  - Style: Horizontal navigation, professional aesthetic
  - Mobile: Responsive hamburger menu

### 1.2 Agency Dashboard Overhaul

- [ ] **Replace athlete-focused header**
  - File: `/app/agencies/dashboard/page.tsx`
  - Current: "🏆 Your NIL Dashboard" + Gen Z energy
  - New: "Agency Dashboard" + professional tone
  - Remove: Emojis, playful animations
  - Add: Time range selector (7d, 30d, 90d, 1y)

- [ ] **Update dashboard widgets**
  - Remove: Profile completion, FMV score, badges
  - Add: Active athletes count, active campaigns count
  - Add: Total impressions, campaign spend
  - Add: Top performing athletes list
  - Add: Recent activity feed (agency-relevant)
  - Add: Pending approvals widget
  - Add: Upcoming milestones widget

- [ ] **Create agency-specific components**
  - [ ] `components/dashboard/agency/MetricsCard.tsx`
  - [ ] `components/dashboard/agency/ActiveCampaignsWidget.tsx`
  - [ ] `components/dashboard/agency/TopAthletesWidget.tsx`
  - [ ] `components/dashboard/agency/ActivityFeedWidget.tsx`
  - [ ] `components/dashboard/agency/PendingApprovalsWidget.tsx`
  - [ ] `components/dashboard/agency/UpcomingMilestonesWidget.tsx`

- [ ] **Update mock data**
  - File: `/app/agencies/dashboard/page.tsx`
  - Ensure: Mock data reflects business metrics (not personal)
  - Add: Realistic campaign names, athlete names, metrics

### 1.3 Role-Based Access Control

- [ ] **Create RoleProtectedRoute component**
  - File: `/components/guards/RoleProtectedRoute.tsx`
  - Props: `allowedRoles: UserRole[]`
  - Logic: Check `user.role` against allowed roles
  - Redirect: Non-matching roles to appropriate dashboard

- [ ] **Apply role guards to agency routes**
  - [ ] `/app/agencies/dashboard/page.tsx`
  - [ ] `/app/agencies/discover/page.tsx`
  - [ ] `/app/agencies/campaigns/page.tsx`
  - [ ] `/app/agencies/athletes/page.tsx`
  - [ ] `/app/agencies/messages/page.tsx`
  - [ ] `/app/agencies/analytics/page.tsx`

- [ ] **Add redirect in agency layout**
  - File: `/app/agencies/layout.tsx`
  - Check: If `user.role !== 'agency'`, redirect to `/dashboard`
  - Add: Loading state while checking auth

### 1.4 Documentation

- [ ] **Update README**
  - Add section: "User Roles and Experiences"
  - Explain: Athlete vs Agency differences
  - Link to: Architecture documents

- [ ] **Create component usage guide**
  - Document: Which components are athlete-only
  - Document: Which components are agency-only
  - Document: Which components are shared

- [ ] **Document API routes**
  - List: All athlete API routes
  - List: All agency API routes
  - Clarify: Naming conventions

### 1.5 Testing

- [ ] **Test athlete experience**
  - [ ] Log in as athlete
  - [ ] Verify sidebar appears
  - [ ] Verify dashboard shows personal metrics
  - [ ] Verify "Messages" opens AI chat

- [ ] **Test agency experience**
  - [ ] Log in as agency
  - [ ] Verify NO sidebar
  - [ ] Verify dashboard shows business metrics
  - [ ] Verify navigation is horizontal

- [ ] **Test role guards**
  - [ ] Athlete tries to access `/agencies/dashboard` → Redirected
  - [ ] Agency tries to access athlete-only pages → Redirected

---

## Phase 2: Discover & Athletes (Week 2-3)

### 2.1 Discover Page Enhancement

**Current Status:** Basic structure exists, needs enhancement

- [ ] **Enhance filter UI**
  - File: `/components/agencies/DiscoverFilters.tsx`
  - Add: Sport multi-select (checkboxes)
  - Add: Location/state multi-select
  - Add: School level radio buttons
  - Add: Follower count range slider
  - Add: Engagement rate range slider
  - Add: FMV range slider
  - Add: Content categories multi-select
  - Add: "Available only" toggle

- [ ] **Improve athlete discovery cards**
  - File: `/components/agencies/AthleteDiscoveryCard.tsx`
  - Show: Profile photo, name, sport, school
  - Show: Follower count, engagement rate, FMV
  - Show: Star rating (if available)
  - Actions: Save to list, Message athlete
  - Hover: Expand with more details

- [ ] **Add AI recommendations**
  - File: `/components/agencies/AIRecommendations.tsx`
  - Logic: Based on past campaigns (placeholder for now)
  - Display: Carousel of 3-5 recommended athletes
  - Style: Prominent, eye-catching section

- [ ] **Implement sorting**
  - File: `/app/agencies/discover/page.tsx`
  - Options: Followers (default), Engagement, FMV
  - Toggle: Ascending/Descending
  - Update: URL params on sort change

- [ ] **Add pagination/load more**
  - Load: 12 athletes per page
  - Button: "Load More Athletes"
  - Infinite scroll: Optional enhancement

### 2.2 API Development (Discover)

- [ ] **Create discover API**
  - File: `/app/api/agencies/athletes/discover/route.ts`
  - Method: GET
  - Query params: All filter criteria
  - Response: `{ athletes: Athlete[], has_more: boolean }`
  - Database: Query `athlete_public_profiles` with filters
  - Indexing: Ensure indexes exist for filterable fields

- [ ] **Test filtering logic**
  - [ ] Filter by single sport → Correct results?
  - [ ] Filter by multiple sports → OR logic works?
  - [ ] Filter by follower range → Within range?
  - [ ] Filter by engagement range → Within range?
  - [ ] Combine multiple filters → AND logic works?

- [ ] **Optimize query performance**
  - [ ] Add database indexes if missing
  - [ ] Test with 1000+ athlete profiles
  - [ ] Measure query time (should be < 500ms)

### 2.3 Save Athletes to Lists

- [ ] **Create "Save to List" functionality**
  - Modal: Show list of existing lists + "Create New List"
  - API: POST `/api/agencies/athletes/lists/:list_id/add`
  - Database: Insert into `agency_athlete_list_items`

- [ ] **Create list management UI**
  - Page: `/app/agencies/athletes/lists/page.tsx`
  - Display: All lists created by agency
  - Actions: Create, rename, delete lists
  - View: Athletes within each list

### 2.4 Athletes (Roster) Page

- [ ] **Create roster page**
  - File: `/app/agencies/athletes/page.tsx`
  - Replace: Current "Coming Soon" placeholder
  - Layout: Table view (name, sport, school, campaigns, performance)
  - Filters: All, Active, Past, Favorites
  - Sorting: By name, by performance, by recent activity

- [ ] **Create athlete detail page (agency view)**
  - File: `/app/agencies/athletes/[id]/page.tsx`
  - Sections:
    - [ ] Athlete public profile (read-only)
    - [ ] Campaign history with this athlete
    - [ ] Performance metrics across campaigns
    - [ ] Communication history
    - [ ] Payment history
    - [ ] Private notes (agency-only)
    - [ ] Tags (agency-only)
  - Actions: Message, Add to Campaign, Add to List

- [ ] **API for roster**
  - [ ] GET `/api/agencies/athletes/roster`
  - [ ] GET `/api/agencies/athletes/roster/:athlete_id`
  - [ ] POST `/api/agencies/athletes/roster/:athlete_id/notes`
  - [ ] GET `/api/agencies/athletes/roster/:athlete_id/campaigns`

### 2.5 Testing (Discover & Athletes)

- [ ] **Seed database with test data**
  - [ ] Create 50+ athlete profiles
  - [ ] Vary sports, locations, follower counts
  - [ ] Ensure realistic data distribution

- [ ] **Test discover flow**
  - [ ] Apply filters → Results update?
  - [ ] Sort by followers → Correct order?
  - [ ] Save athlete to list → Appears in list?
  - [ ] Load more → Additional results load?

- [ ] **Test roster flow**
  - [ ] View all athletes → Table displays?
  - [ ] Click athlete → Detail page opens?
  - [ ] Add note → Saves correctly?
  - [ ] View campaign history → Shows past campaigns?

---

## Phase 3: Campaigns (Week 4-5)

### 3.1 Campaign Creation Wizard

- [ ] **Create wizard component**
  - File: `/components/agencies/CampaignWizard/index.tsx`
  - Structure: Multi-step form (6 steps)
  - Navigation: Progress indicator, back/next buttons
  - State: Store form data in React state or Zustand

- [ ] **Step 1: Basics**
  - File: `/components/agencies/CampaignWizard/StepBasics.tsx`
  - Fields: Campaign name, brand name, description
  - Fields: Start date, end date
  - Validation: Required fields, date logic (end > start)

- [ ] **Step 2: Budget**
  - File: `/components/agencies/CampaignWizard/StepBudget.tsx`
  - Fields: Total budget (in dollars, convert to cents)
  - Fields: Budget per athlete OR custom per athlete
  - Calculation: Show estimated athlete count (total / per athlete)

- [ ] **Step 3: Target Athletes**
  - File: `/components/agencies/CampaignWizard/StepAthletes.tsx`
  - Option A: Use discovery filters
  - Option B: Select from saved lists
  - Option C: Manually select specific athletes
  - Preview: Show selected athletes count

- [ ] **Step 4: Deliverables**
  - File: `/components/agencies/CampaignWizard/StepDeliverables.tsx`
  - Fields: Instagram posts (quantity)
  - Fields: Instagram stories (quantity)
  - Fields: TikTok videos (quantity)
  - Fields: Other custom deliverables (text area)

- [ ] **Step 5: Terms**
  - File: `/components/agencies/CampaignWizard/StepTerms.tsx`
  - Upload: Campaign brief (PDF/DOC)
  - Textarea: Contract terms
  - Checkboxes: Content approval required? Payment milestones?

- [ ] **Step 6: Review & Launch**
  - File: `/components/agencies/CampaignWizard/StepReview.tsx`
  - Display: All campaign details for review
  - Edit: Links to go back to each step
  - Submit: "Launch Campaign" button
  - API: POST `/api/agencies/campaigns`

### 3.2 Campaign List Page

- [ ] **Update campaigns page**
  - File: `/app/agencies/campaigns/page.tsx`
  - Replace: "Coming Soon" placeholder
  - Layout: Card view or table view (toggle)
  - Display: Campaign name, status, athletes, budget, progress
  - Filters: All, Active, Paused, Completed
  - Sorting: Recently updated, start date, budget

- [ ] **Campaign card component**
  - File: `/components/agencies/CampaignCard.tsx`
  - Display: Campaign details (name, brand, dates)
  - Display: Key metrics (impressions, engagement)
  - Display: Progress bar (time or deliverables)
  - Display: Budget (spend vs total)
  - Actions: View details, edit, pause/resume

### 3.3 Campaign Detail Page

- [ ] **Create campaign detail page**
  - File: `/app/agencies/campaigns/[id]/page.tsx`
  - Layout: Header + Tabs
  - Tabs: Overview, Athletes, Performance, Content, Budget

- [ ] **Overview tab**
  - File: `/components/agencies/CampaignDetailTabs/OverviewTab.tsx`
  - Display: Campaign details (dates, status, goals)
  - Display: Key metrics summary
  - Display: Timeline/milestones

- [ ] **Athletes tab**
  - File: `/components/agencies/CampaignDetailTabs/AthletesTab.tsx`
  - Display: List of invited athletes
  - Show: Invitation status (pending, accepted, declined)
  - Show: Individual athlete performance in this campaign
  - Show: Payment status per athlete
  - Actions: Send reminders, adjust compensation

- [ ] **Performance tab**
  - File: `/components/agencies/CampaignDetailTabs/PerformanceTab.tsx`
  - Chart: Impressions over time (line chart)
  - Chart: Engagement rate trend
  - Table: Top performing content
  - Calculation: ROI metrics

- [ ] **Content tab**
  - File: `/components/agencies/CampaignDetailTabs/ContentTab.tsx`
  - Display: All content submitted by athletes
  - Show: Posts, stories, videos with links
  - Actions: Approve, request changes
  - Gallery: Visual content library

- [ ] **Budget tab**
  - File: `/components/agencies/CampaignDetailTabs/BudgetTab.tsx`
  - Display: Budget allocation per athlete
  - Display: Spend tracking (actual vs projected)
  - Display: Payment schedule
  - Chart: Spend over time

### 3.4 Campaign APIs

- [ ] **Create campaign APIs**
  - [ ] POST `/api/agencies/campaigns` (create)
  - [ ] GET `/api/agencies/campaigns` (list)
  - [ ] GET `/api/agencies/campaigns/:id` (detail)
  - [ ] PUT `/api/agencies/campaigns/:id` (update)
  - [ ] DELETE `/api/agencies/campaigns/:id` (delete)

- [ ] **Campaign invite APIs**
  - [ ] POST `/api/agencies/campaigns/:id/invite-athlete`
  - [ ] GET `/api/agencies/campaigns/:id/invites`
  - [ ] PUT `/api/agencies/campaigns/:id/invites/:invite_id` (update status)

- [ ] **Performance APIs**
  - [ ] GET `/api/agencies/campaigns/:id/performance`
  - [ ] GET `/api/agencies/campaigns/:id/content`

### 3.5 Testing (Campaigns)

- [ ] **Test campaign creation**
  - [ ] Complete wizard all 6 steps → Campaign created?
  - [ ] Validation works on each step?
  - [ ] Can go back and edit previous steps?
  - [ ] Campaign saves as draft if incomplete?

- [ ] **Test campaign management**
  - [ ] Campaign list displays all campaigns?
  - [ ] Filter by status works?
  - [ ] Click campaign → Detail page opens?
  - [ ] All tabs load correctly?

- [ ] **Test invitation flow**
  - [ ] Invite athlete → Athlete receives notification?
  - [ ] Athlete accepts → Status updates in real-time?
  - [ ] Athlete declines → Status updates?

---

## Phase 4: Messages (Week 6)

### 4.1 Message UI Components

- [ ] **Create message inbox**
  - File: `/components/agencies/MessageInbox.tsx`
  - Layout: Two-column (threads list + active thread)
  - Left: List of conversations (athlete name, last message, timestamp)
  - Right: Active conversation thread

- [ ] **Create message thread**
  - File: `/components/agencies/MessageThread.tsx`
  - Display: All messages in thread
  - Show: Sender, message text, timestamp
  - Show: Attachments (PDFs, images)
  - Auto-scroll: To bottom on new message

- [ ] **Create message composer**
  - File: `/components/agencies/MessageComposer.tsx`
  - Textarea: Rich text (bold, italic, links)
  - Upload: File attachments
  - Send: Button or Ctrl+Enter
  - Templates: Dropdown to insert pre-written messages

### 4.2 Message Templates

- [ ] **Create templates UI**
  - File: `/app/agencies/messages/templates/page.tsx`
  - List: All saved templates
  - Actions: Create, edit, delete templates
  - Fields: Template name, subject, body

- [ ] **Template variables**
  - Variables: `{athlete_name}`, `{campaign_name}`, `{agency_name}`
  - Replace: On template insertion
  - Example: "Hi {athlete_name}, we have an exciting campaign..."

### 4.3 Message APIs

- [ ] **Create message APIs**
  - [ ] GET `/api/agencies/messages/threads` (list all)
  - [ ] GET `/api/agencies/messages/threads/:thread_id` (get messages)
  - [ ] POST `/api/agencies/messages/send` (send message)
  - [ ] PUT `/api/agencies/messages/:message_id/read` (mark as read)

- [ ] **Template APIs**
  - [ ] GET `/api/agencies/messages/templates` (list)
  - [ ] POST `/api/agencies/messages/templates` (create)
  - [ ] PUT `/api/agencies/messages/templates/:id` (update)
  - [ ] DELETE `/api/agencies/messages/templates/:id` (delete)

### 4.4 Real-Time Messaging

- [ ] **Implement real-time updates**
  - Option A: WebSocket connection
  - Option B: Polling (every 5 seconds)
  - Update: New messages appear instantly
  - Notification: Badge on "Messages" nav item

### 4.5 Athlete Side (Receive Messages)

- [ ] **Create athlete message inbox**
  - File: `/app/athletes/messages/page.tsx` (NEW)
  - Display: Messages from agencies
  - Reply: Athletes can respond
  - Differentiate: Agency messages vs AI chat

### 4.6 Testing (Messages)

- [ ] **Test send/receive**
  - [ ] Agency sends message → Athlete receives?
  - [ ] Athlete replies → Agency receives?
  - [ ] Attachments upload and download?
  - [ ] Real-time updates work?

- [ ] **Test templates**
  - [ ] Create template → Saves?
  - [ ] Insert template → Variables replaced?
  - [ ] Edit template → Updates correctly?

---

## Phase 5: Analytics (Week 7)

### 5.1 Analytics Dashboard

- [ ] **Create analytics page**
  - File: `/app/agencies/analytics/page.tsx`
  - Layout: Full-width, data-dense
  - Sections: KPIs, charts, tables

- [ ] **Top-level KPIs**
  - Display: Total spend, total impressions, avg engagement, ROI
  - Date range: Selector (7d, 30d, 90d, all time)
  - Comparison: vs previous period

### 5.2 Data Visualization

- [ ] **Install charting library**
  - Options: Chart.js, Recharts, Victory
  - Recommendation: Recharts (React-friendly)

- [ ] **Impressions over time chart**
  - File: `/components/agencies/AnalyticsCharts/ImpressionsChart.tsx`
  - Type: Line chart
  - X-axis: Time (daily, weekly, monthly)
  - Y-axis: Impressions count
  - Tooltip: Show exact values on hover

- [ ] **Campaign comparison chart**
  - File: `/components/agencies/AnalyticsCharts/CampaignComparisonChart.tsx`
  - Type: Bar chart
  - X-axis: Campaign names
  - Y-axis: Impressions, engagement, ROI (multi-series)

- [ ] **Demographics chart**
  - File: `/components/agencies/AnalyticsCharts/DemographicsChart.tsx`
  - Type: Pie chart or donut chart
  - Data: Athlete demographics (age, gender, location)

- [ ] **ROI chart**
  - File: `/components/agencies/AnalyticsCharts/ROIChart.tsx`
  - Type: Scatter plot or bar chart
  - X-axis: Campaign spend
  - Y-axis: Return (impressions, conversions)

### 5.3 Export Functionality

- [ ] **Export reports**
  - Button: "Export Report"
  - Formats: PDF, CSV, Excel
  - Content: Selected date range, all metrics

- [ ] **Scheduled reports**
  - Settings: Weekly or monthly reports
  - Delivery: Email with attached PDF
  - Customization: Choose metrics to include

### 5.4 Analytics APIs

- [ ] **Create analytics APIs**
  - [ ] GET `/api/agencies/analytics/overview`
  - [ ] GET `/api/agencies/analytics/campaigns/compare`
  - [ ] GET `/api/agencies/analytics/athletes/performance`
  - [ ] GET `/api/agencies/analytics/export`
  - [ ] POST `/api/agencies/analytics/reports/schedule`

### 5.5 Testing (Analytics)

- [ ] **Test data accuracy**
  - [ ] KPIs match database totals?
  - [ ] Charts render correctly?
  - [ ] Date range filter works?

- [ ] **Test export**
  - [ ] PDF exports correctly?
  - [ ] CSV contains all data?
  - [ ] Scheduled reports send via email?

---

## Phase 6: Polish & Optimization (Week 8)

### 6.1 UX Refinements

- [ ] **User testing**
  - Recruit: 3-5 agencies for user testing
  - Tasks: Complete key workflows (discover, campaign, message)
  - Collect: Feedback and pain points

- [ ] **Implement feedback**
  - Fix: Confusing UI elements
  - Add: Missing features identified by users
  - Improve: Unclear copy or instructions

### 6.2 Accessibility

- [ ] **Keyboard navigation**
  - [ ] All interactive elements focusable?
  - [ ] Tab order logical?
  - [ ] Shortcuts documented?

- [ ] **Screen reader support**
  - [ ] ARIA labels on all interactive elements?
  - [ ] Alt text on all images?
  - [ ] Semantic HTML used?

- [ ] **Color contrast**
  - [ ] All text meets WCAG AA contrast ratio?
  - [ ] Links distinguishable from regular text?
  - [ ] Focus indicators visible?

### 6.3 Performance Optimization

- [ ] **Database optimization**
  - [ ] All queries use proper indexes?
  - [ ] Slow queries identified and optimized?
  - [ ] Connection pooling configured?

- [ ] **Frontend optimization**
  - [ ] Code splitting implemented?
  - [ ] Lazy loading for images?
  - [ ] Bundle size analyzed and reduced?

- [ ] **Caching**
  - [ ] API responses cached (SWR)?
  - [ ] Static assets cached?
  - [ ] CDN configured?

### 6.4 Testing

- [ ] **End-to-end tests**
  - Tool: Playwright or Cypress
  - Coverage: All critical user flows

- [ ] **Load testing**
  - Tool: k6 or Artillery
  - Scenarios: 100+ concurrent users
  - Target: < 2s page load, < 500ms API response

- [ ] **Security audit**
  - [ ] RLS policies correct?
  - [ ] API authentication working?
  - [ ] Input validation on all forms?
  - [ ] XSS vulnerabilities checked?

### 6.5 Documentation

- [ ] **User documentation**
  - [ ] Getting started guide
  - [ ] Feature walkthroughs
  - [ ] FAQs

- [ ] **Developer documentation**
  - [ ] Component API docs
  - [ ] API endpoint docs
  - [ ] Deployment guide

---

## Launch Checklist

### Pre-Launch

- [ ] **All P0 features complete**
  - [ ] Dashboard
  - [ ] Discover
  - [ ] Campaigns
  - [ ] Athletes
  - [ ] Messages

- [ ] **Testing complete**
  - [ ] All critical flows tested
  - [ ] No major bugs
  - [ ] Performance acceptable

- [ ] **Documentation complete**
  - [ ] User guides
  - [ ] API docs
  - [ ] Internal docs

### Launch Day

- [ ] **Database seeded**
  - [ ] Athlete profiles
  - [ ] Sample campaigns (optional)

- [ ] **Monitoring enabled**
  - [ ] Error tracking (Sentry)
  - [ ] Analytics (Google Analytics, Mixpanel)
  - [ ] Uptime monitoring

- [ ] **Support ready**
  - [ ] Support email configured
  - [ ] FAQ page live
  - [ ] Team trained

### Post-Launch

- [ ] **Monitor metrics**
  - [ ] Sign-ups
  - [ ] Active users
  - [ ] Feature usage
  - [ ] Errors

- [ ] **Collect feedback**
  - [ ] User surveys
  - [ ] Support tickets
  - [ ] Feature requests

- [ ] **Iterate**
  - [ ] Fix critical bugs immediately
  - [ ] Plan next sprint based on feedback

---

## Notes

### Current Status (2025-10-30)

- ✅ Database schema created (migration 040)
- ✅ Agency layout created (no sidebar)
- ✅ AgencyTopNav created
- ✅ Basic discover page exists
- ⚠️ Dashboard has athlete-style content (needs overhaul)
- ❌ Campaigns page is placeholder
- ❌ Athletes roster page is placeholder
- ❌ Messages page is placeholder
- ❌ Analytics page doesn't exist

### Priority Order

1. **Phase 1** (P0) - Foundation must be solid
2. **Phase 2** (P0) - Discover is core value prop
3. **Phase 3** (P0) - Campaigns enable business workflow
4. **Phase 4** (P1) - Messages enable communication
5. **Phase 5** (P2) - Analytics nice to have
6. **Phase 6** (P2) - Polish when features work

### Key Contacts

- **Blueprint (Architect):** System design, technical decisions
- **Nova (Frontend):** UI implementation, components
- **Forge (Backend):** API development, database
- **Brand Guardian:** Design consistency, aesthetics
- **Copywriter:** Messaging, tone, content

---

**Last Updated:** 2025-10-30
