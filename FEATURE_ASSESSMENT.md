# Feature Assessment: Matchmaking & NIL Deals

**Assessment Date:** December 4, 2025
**Assessed By:** Claude Code

---

## 1. MATCHMAKING FEATURE

### 1.1 What Currently Works

| Component | Status | Details |
|-----------|--------|---------|
| **Matchmaking Engine** | Working | 11-factor scoring algorithm in `lib/matchmaking-engine.ts` |
| **Database Tables** | Working | `agency_athlete_matches` table exists with 3 rows |
| **Match Generation API** | Working | `POST /api/matches/generate` creates matches |
| **Match Listing API** | Working | `GET /api/matches` returns matches with stats |
| **Match Update API** | Working | `PATCH /api/matches/[id]` updates status |
| **Discovery UI** | Working | `MatchDiscovery.tsx` shows match grid |
| **Match Cards** | Working | `AthleteMatchCard.tsx` displays score breakdown |

### 1.2 Scoring Factors Implemented

| Factor | Max Points | Implementation Status |
|--------|-----------|----------------------|
| Sport Alignment | 10 | Full - checks campaign interests |
| Geographic Match | 10 | Partial - state pattern matching |
| School Division | 5 | Partial - keyword inference |
| Follower Count | 10 | Full - calculates from social stats |
| Engagement Rate | 15 | Full - averages across platforms |
| Audience Demographics | 5 | Stub - returns 4 for completed profiles |
| Hobby Overlap | 15 | Full - compares arrays |
| Brand Affinity | 10 | Partial - basic brand matching |
| Past NIL Success | 10 | Stub - checks nil_preferences field |
| Content Quality | 5 | Partial - counts content samples |
| Response Rate | 5 | Stub - returns 4 for completed profiles |

### 1.3 What's Broken

| Issue | Severity | Details |
|-------|----------|---------|
| **Schema Mismatch** | Medium | DB uses `tier` column, code expects `match_tier` |
| **Missing `score_breakdown`** | Medium | Sample match JSON shows no breakdown, just `match_reasons` |
| **No athlete view** | High | Athletes cannot see who's interested in them |
| **Missing notifications** | Medium | `/api/matches/notifications` route exists but unclear if functional |

### 1.4 What's Missing

| Feature | Priority | Description |
|---------|----------|-------------|
| Athlete-side matches view | High | Athletes should see agencies interested in them |
| Two-way matching | Medium | Athletes should be able to express interest first |
| Campaign-specific matching | Medium | Match athletes to specific campaigns, not just agencies |
| Real-time notifications | Low | Push notifications when matched |
| Match expiration | Low | Auto-expire old suggestions |
| AI-generated match reasons | Low | Better explanations via OpenAI |

### 1.5 MVP Recommendation for Matchmaking

**Minimum viable scope:**
1. Fix schema alignment (`tier` vs `match_tier`)
2. Add athlete view at `/opportunities` or `/matches`
3. Enable status updates from athlete side (interested/not_interested)
4. Basic email notification when agency contacts athlete

**Files to modify:**
- `lib/matchmaking-engine.ts` - Ensure score_breakdown stored
- `app/api/matches/route.ts` - Fix tier column reference
- `app/opportunities/page.tsx` - Create athlete matches view
- `components/matchmaking/AthleteOpportunityCard.tsx` - New component

---

## 2. NIL DEALS FEATURE

### 2.1 What Currently Works

| Component | Status | Details |
|-----------|--------|---------|
| **Database Table** | Working | `nil_deals` table exists with 1 row |
| **Full CRUD API** | Working | GET/POST at `/api/nil-deals`, GET/PATCH/DELETE at `/api/nil-deals/[id]` |
| **Deal Dashboard** | Working | `NILDealsDashboard.tsx` with stats |
| **Deal Cards** | Working | `DealCard.tsx` displays deal info |
| **Create Modal** | Working | `CreateDealModal.tsx` for new deals |
| **Status Management** | Working | Can update status (draft/pending/active/completed) |
| **Payment Tracking** | Partial | Schema supports it, UI doesn't expose |

### 2.2 Database Schema Features

| Feature | Status | Notes |
|---------|--------|-------|
| Deal types enum | Working | 9 types: sponsorship, endorsement, etc. |
| Deal status enum | Working | 7 statuses: draft through on_hold |
| Payment status enum | Working | 5 statuses: pending through disputed |
| Deliverables JSONB | Working | Array of deliverable objects |
| Payment schedule JSONB | Working | Array of payment objects |
| Performance metrics JSONB | Working | Stores engagement data |
| Compliance fields | Working | school_approved, parent_approved flags |
| Contract management | Working | contract_file_url, signed flags |
| Auto triggers | Working | Updated_at, payment status calculation |

### 2.3 What's Broken

| Issue | Severity | Details |
|-------|----------|---------|
| **Missing userId in requests** | High | Dashboard doesn't pass userId to API |
| **CreateDealModal broken** | High | Missing athlete_id, agency_id in POST body |
| **No authorization check** | Critical | Anyone can view/edit any deal |
| **Deprecated import** | Medium | Uses `supabaseAdmin` from old path |

### 2.4 What's Missing

| Feature | Priority | Description |
|---------|----------|-------------|
| **Proper authorization** | Critical | RLS policies + API checks |
| **Match-to-deal flow** | High | Convert matches to deals |
| **Deliverable tracking UI** | Medium | Mark deliverables complete |
| **Payment tracking UI** | Medium | Record payments made |
| **Contract upload** | Medium | Upload and sign contracts |
| **Compliance workflow** | Medium | School/parent approval process |
| **Deal templates** | Low | Pre-made deal structures |
| **Analytics dashboard** | Low | Deal performance metrics |

### 2.5 MVP Recommendation for NIL Deals

**Minimum viable scope:**
1. Fix authentication - pass userId from auth context
2. Fix CreateDealModal to include athlete_id and agency_id
3. Add RLS policies for nil_deals table
4. Create "Propose Deal" button from match card
5. Basic deal lifecycle: draft -> pending -> active -> completed

**Files to modify:**
- `app/api/nil-deals/route.ts` - Fix auth, use createClient
- `components/nil-deals/NILDealsDashboard.tsx` - Pass userId
- `components/nil-deals/CreateDealModal.tsx` - Add required fields
- `components/matchmaking/AthleteMatchCard.tsx` - Add "Propose Deal" action
- `migrations/xxx_nil_deals_rls.sql` - Add RLS policies

---

## 3. INTEGRATION POINTS

### Match -> Deal Conversion Flow

```
1. Agency generates matches (POST /api/matches/generate)
2. Agency reviews matches on /discover
3. Agency clicks "Contact" -> status = 'contacted'
4. Athlete sees notification, clicks "Interested" -> status = 'interested'
5. Agency clicks "Propose Deal" -> Creates NIL deal draft
6. Both parties review and sign
7. Deal becomes 'active'
```

### Current Gap

The flow from step 4-5 is not implemented. Need:
- Button on match card to create deal pre-populated with athlete/agency IDs
- Deal creation should update match status to 'partnered'
- Match should reference deal_id after conversion

---

## 4. DATABASE STATUS

### Tables Verified

| Table | Rows | Status |
|-------|------|--------|
| `nil_deals` | 1 | Working |
| `agency_athlete_matches` | 3 | Working |
| `campaigns` | 1 | Working |

### Missing RLS Policies

Neither `nil_deals` nor `agency_athlete_matches` have proper RLS policies for user-level access control. Currently using service role which bypasses RLS.

---

## 5. PRIORITY RANKING

### Critical (Must Fix Before Demo)
1. NIL Deals authorization (anyone can view/edit any deal)
2. CreateDealModal missing required fields
3. Schema mismatch in matches (tier vs match_tier)

### High (Needed for MVP)
4. Athlete-side matches view
5. Match-to-deal conversion flow
6. Dashboard userId passing

### Medium (Nice to Have)
7. Deliverable tracking UI
8. Payment tracking UI
9. Email notifications
10. Contract upload

### Low (Post-MVP)
11. AI-generated match reasons
12. Deal templates
13. Analytics dashboard
14. Match expiration

---

## 6. RECOMMENDED IMPLEMENTATION ORDER

### Phase 1: Fix Critical Issues (1-2 hours)
1. Add RLS policies for nil_deals table
2. Fix CreateDealModal to include athlete_id/agency_id
3. Update API to use authenticated client
4. Fix match_tier column reference

### Phase 2: Complete MVP Flow (2-3 hours)
5. Create athlete opportunities page
6. Add "Propose Deal" button on match card
7. Pre-populate deal form from match data
8. Update match status when deal created

### Phase 3: Polish (1-2 hours)
9. Add basic email notifications
10. Improve error handling
11. Add loading states
12. Test full flow end-to-end

---

**Document generated:** December 4, 2025
