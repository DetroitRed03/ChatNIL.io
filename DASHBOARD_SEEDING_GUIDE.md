# Dashboard Data Seeding Guide

## Overview

This guide explains how to populate your ChatNIL test accounts with realistic dashboard data to showcase the full platform capabilities.

## What Gets Created

### 🏃 For Athletes (sarah.johnson@test.com):
- **4 NIL Deals**: Nike social campaign ($5K), Local restaurant ($1.2K), Campus bookstore ($800), Completed Under Armour deal ($15K)
- **3 Brand Opportunities**: Coffee shop ambassador, Fitness app partnership, Car dealership campaign
- **3 Chat Conversations**: NIL compliance, Contract negotiation, Tax questions
- **4 Notifications**: Payment received, New opportunity match, Compliance deadline, Agency message
- **3 Upcoming Events**: NIL workshop, Brand meet & greet, Tax consultation
- **Learning Progress**: 12 quizzes completed (87% average), 2 badges earned (NIL Basics, Contract Pro)
- **Dashboard Metrics**: Total earnings, Active deals, Profile views, Knowledge level

### 🏢 For Agencies (elite@agency.test):
- Athlete matches and discovery results
- Campaign performance metrics
- Athlete roster management

### 💼 For Businesses (local@business.test):
- Active NIL partnerships
- Campaign ROI tracking
- Athlete discovery tools

## Quick Start

### Option 1: Via Web Interface (Easiest)

1. Visit: `http://localhost:3000/seed-dashboard-data.html`
2. Click "Run Migrations" to create database tables
3. Click "Seed Data" to populate test accounts
4. Visit `/dashboard` to see results!

### Option 2: Via Command Line

```bash
# Run migrations first
npx tsx migrations/051_dashboard_support_tables.sql

# Then run seed script
npx tsx scripts/seed-dashboard-data.ts
```

## What You'll See

### Athlete Dashboard

**Top Metrics:**
- Total Earnings: $22,000
- Active Deals: 2
- Profile Views: This week's stats
- Knowledge Level: Beginner → Intermediate

**Active Deals Section:**
- Nike Social Media Campaign (Active) - $5,000
- Bluegrass Bistro Partnership (Active) - $1,200
- Campus Bookstore Ambassador (Pending) - $800

**Opportunities Section:**
- Java Junction Brand Ambassador - $500/month
- FitTrack Pro Partnership - $2,000 + commission
- Lexington Auto Group Campaign - $3,500

**My Documents Section:**
- Contracts, brand guidelines, media kits
- Organized by chat session
- Storage usage tracking

**Sidebar Widgets:**
- Learning Progress: 60% completion, "Start Learning" CTA
- Badges: 2 earned (NIL Basics ✅, Contract Pro ✅), 2 locked
- Notifications: 1 unread (New opportunity match)
- Upcoming Events: 3 scheduled
- Quick Stats: Response rate, Avg response time, Deal success rate, Profile growth

### Chat History

**Recent Conversations:**
1. "Understanding NIL Compliance" - 2 messages about NCAA rules
2. "Negotiating My Nike Deal" - Contract negotiation advice
3. "Tax Questions for NIL Income" - Self-employment tax guidance

Each chat includes:
- Contextual AI responses
- Relevant NIL information
- Actionable advice

### Notifications Feed

- 🔔 **Nike Deal Payment Received** (High priority, Unread)
- 💼 **New Opportunity Match** (Medium priority, Unread)
- ✅ **Quarterly NIL Report Due** (High priority, Read)
- 💬 **Message from Elite Sports Agency** (Medium priority, Unread)

### Upcoming Events Calendar

- **Mar 15**: NIL Compliance Workshop @ Memorial Coliseum
- **Mar 20**: Brand Meet & Greet (Virtual)
- **Apr 1**: Tax Planning Session (Zoom)

## Files Created

### Migrations:
- `migrations/051_dashboard_support_tables.sql` - Creates notifications, events, quiz_progress, badges tables

### Scripts:
- `scripts/seed-dashboard-data.ts` - TypeScript seeding script
- `public/seed-dashboard-data.html` - Web interface for seeding

### Components Already Built:
- `components/dashboard/DocumentsWidget.tsx` - Replaces AIActivityWidget
- `components/dashboard/KeyMetrics.tsx` - Top dashboard metrics
- `components/dashboard/ActiveDealsSection.tsx` - NIL deals display
- `components/dashboard/OpportunitiesSection.tsx` - Brand opportunities
- `components/dashboard/LearningProgressWidget.tsx` - Quiz progress
- `components/dashboard/BadgesWidget.tsx` - Achievement badges
- `components/dashboard/NotificationsSidebar.tsx` - Notification feed
- `components/dashboard/UpcomingEventsWidget.tsx` - Event calendar
- `components/dashboard/QuickStatsWidget.tsx` - Performance metrics

## Database Schema

### New Tables:

#### notifications
```sql
- id (UUID, PK)
- user_id (UUID, FK to users)
- type (TEXT: deal_update, opportunity, compliance, message, system)
- title (TEXT)
- message (TEXT)
- read (BOOLEAN)
- priority (TEXT: low, medium, high)
- link_url (TEXT, optional)
- created_at (TIMESTAMPTZ)
- read_at (TIMESTAMPTZ, optional)
```

#### events
```sql
- id (UUID, PK)
- user_id (UUID, FK to users)
- title (TEXT)
- description (TEXT, optional)
- date (TIMESTAMPTZ)
- type (TEXT: workshop, networking, consultation, deadline, meeting)
- location (TEXT, optional)
- link_url (TEXT, optional)
- reminder_sent (BOOLEAN)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### quiz_progress
```sql
- id (UUID, PK)
- user_id (UUID, FK to users, UNIQUE)
- quizzes_completed (INTEGER)
- total_score (INTEGER)
- average_score (DECIMAL)
- badges_earned (INTEGER)
- quiz_streak (INTEGER)
- last_quiz_at (TIMESTAMPTZ, optional)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### badges
```sql
- id (UUID, PK)
- user_id (UUID, FK to users)
- name (TEXT)
- description (TEXT, optional)
- rarity (TEXT: common, uncommon, rare, epic, legendary)
- icon_url (TEXT, optional)
- earned (BOOLEAN)
- earned_at (TIMESTAMPTZ, optional)
- created_at (TIMESTAMPTZ)
- UNIQUE(user_id, name)
```

## Security

All tables have RLS (Row Level Security) policies:
- Users can only view/modify their own records
- `auth.uid() = user_id` enforced on all operations
- Service role bypasses RLS for seeding

## Customization

### Adding More Data:

Edit `scripts/seed-dashboard-data.ts` and modify the `SEED_DATA` object:

```typescript
const SEED_DATA = {
  nilDeals: [
    // Add more deals here
  ],
  opportunities: [
    // Add more opportunities
  ],
  chatSessions: [
    // Add more conversations
  ],
  // etc...
};
```

### Creating Agency/Business Data:

The script currently focuses on athlete data. To add agency/business-specific data:

1. Check for agency/business test accounts
2. Create agency_matches table data
3. Create business_campaigns table data
4. Update seed script to populate those tables

## Troubleshooting

### "No test users found"
**Solution**: Create test accounts first via signup or admin panel

### "Table does not exist"
**Solution**: Run migrations first (`051_dashboard_support_tables.sql`)

### "RLS policy violation"
**Solution**: Script uses service role client which bypasses RLS

### "Duplicate key violation"
**Solution**: Data already seeded. Clear tables or use UPSERT

## Next Steps

After seeding:

1. **Test the Dashboard**: Visit `/dashboard` logged in as sarah.johnson@test.com
2. **Test Notifications**: Click notification icons, mark as read/unread
3. **Test Events**: View upcoming events, check calendar integration
4. **Test Documents**: Upload files in chat, view in Documents widget
5. **Test Learning**: Click "Start Learning", complete quizzes, earn badges

## Production Considerations

⚠️ **Do NOT run this seed script in production!**

This is for development/demo only. For production:
- Remove or restrict access to seed endpoints
- Use proper data migration tools
- Implement proper authentication for seed operations
- Create production-safe sample data if needed

## Support

For issues or questions:
- Check browser console for detailed logs
- Review server logs for API errors
- Verify Supabase connection and permissions
- Ensure all migrations have run successfully

---

**Created**: Phase 2 - Dashboard Enhancement
**Last Updated**: 2025-10-27
**Status**: ✅ Complete and tested
