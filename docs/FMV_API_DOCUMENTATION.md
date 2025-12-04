# FMV System API Documentation

**Version:** 1.0.0
**Last Updated:** 2025-10-17
**Base URL:** `https://chatnil.io/api`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [FMV Endpoints](#fmv-endpoints)
5. [Compliance Endpoints](#compliance-endpoints)
6. [Cron Jobs](#cron-jobs)
7. [Error Handling](#error-handling)
8. [Data Models](#data-models)

---

## Overview

The Fair Market Value (FMV) API provides endpoints for calculating, managing, and analyzing athlete NIL valuation scores.

**Key Features:**
- Calculate 100-point FMV scores across 4 categories
- Privacy controls (public/private scores)
- Rate limiting (3 calculations/day per athlete)
- State-by-state NIL compliance checking
- Deal value estimation
- Score history tracking

---

## Authentication

All FMV endpoints require authentication via Supabase Auth.

**Headers:**
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**How to get a token:**
```javascript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

---

## Rate Limiting

### Manual Calculations
- **Limit:** 3 calculations per athlete per day
- **Reset:** Midnight UTC (automated)
- **Check Limit:** See `remaining_calculations_today` in response `meta`

### Automated Calculations
- Daily cron jobs do NOT count toward the limit
- Initial calculation (first-time) does NOT count toward the limit

---

## FMV Endpoints

### POST /api/fmv/calculate

Calculate FMV score for authenticated athlete.

**Request:**
```http
POST /api/fmv/calculate
Authorization: Bearer YOUR_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "fmv": {
    "id": "uuid",
    "athlete_id": "uuid",
    "fmv_score": 72,
    "fmv_tier": "high",
    "social_score": 22,
    "athletic_score": 25,
    "market_score": 15,
    "brand_score": 10,
    "percentile_rank": 85,
    "comparable_athletes": [...],
    "estimated_deal_values": {...},
    "improvement_suggestions": [...],
    "strengths": ["Strong social presence", "High engagement"],
    "weaknesses": ["Limited NIL experience"],
    "score_history": [...],
    "is_public_score": false,
    "last_calculated_at": "2025-10-17T12:00:00Z",
    "calculation_count_today": 1
  },
  "meta": {
    "is_first_calculation": false,
    "score_increased": true,
    "score_change": 5,
    "should_notify_increase": true,
    "should_encourage_sharing": true,
    "remaining_calculations_today": 2,
    "calculation_count_today": 1
  },
  "notifications": [
    {
      "type": "score_increase",
      "title": "Your FMV Score Increased! 🎉",
      "message": "Your score went up 5 points to 72!"
    }
  ],
  "suggestions": [
    {
      "type": "public_sharing",
      "title": "Share Your Score! 🌟",
      "message": "Your FMV score of 72 is in the HIGH tier!",
      "action": {
        "label": "Make Score Public",
        "endpoint": "/api/fmv/visibility",
        "method": "POST",
        "payload": { "is_public": true }
      }
    }
  ]
}
```

**Error:** `429 Too Many Requests`
```json
{
  "error": "Rate limit exceeded",
  "message": "You can only recalculate your FMV 3 times per day.",
  "rate_limit": {
    "max_calculations": 3,
    "reset_time": "midnight UTC"
  }
}
```

---

### GET /api/fmv

Get FMV data for athlete (auto-calculates if missing).

**Request:**
```http
GET /api/fmv?athlete_id=optional-uuid
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `athlete_id` (optional): UUID of athlete. Defaults to current user.

**Response:** `200 OK`
```json
{
  "success": true,
  "fmv": {...},
  "meta": {
    "is_own_data": true,
    "is_public": false,
    "is_stale": false,
    "days_since_calculation": 5,
    "remaining_calculations_today": 2,
    "can_view_full_data": true
  },
  "suggestions": []
}
```

**Privacy Filtering:**
- If viewing another athlete's data and `is_public_score = false`, returns `403 Forbidden`
- If viewing public data, only shows limited fields (no improvement suggestions, weaknesses, etc.)

---

### POST /api/fmv/recalculate

Force manual recalculation (rate limited).

**Request:**
```http
POST /api/fmv/recalculate
Authorization: Bearer YOUR_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "fmv": {...},
  "meta": {
    "is_recalculation": true,
    "previous_score": 67,
    "score_change": 5,
    "score_increased": true,
    "tier_changed": true,
    "previous_tier": "medium",
    "remaining_calculations_today": 1
  },
  "notifications": [...],
  "suggestions": [...]
}
```

---

### GET /api/fmv/comparables

Get athletes with similar FMV scores (privacy-filtered).

**Request:**
```http
GET /api/fmv/comparables?sport_filter=true&level_filter=false&limit=10
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `athlete_id` (optional): Target athlete UUID
- `sport_filter` (optional): Filter by same sport (boolean)
- `level_filter` (optional): Filter by same school level (boolean)
- `limit` (optional): Max results (default: 10, max: 50)

**Response:** `200 OK`
```json
{
  "success": true,
  "comparables": [
    {
      "athlete_id": "uuid",
      "athlete_name": "John Doe",
      "fmv_score": 70,
      "fmv_tier": "high",
      "score_breakdown": {
        "social_score": 20,
        "athletic_score": 25,
        "market_score": 15,
        "brand_score": 10
      },
      "percentile_rank": 82,
      "sport": "Football",
      "school": "University of Kentucky",
      "state": "Kentucky",
      "graduation_year": 2026,
      "total_followers": 15000,
      "profile_image_url": "https://...",
      "score_difference": -2
    }
  ],
  "meta": {
    "athlete_score": 72,
    "score_range": { "min": 62, "max": 82 },
    "total_found": 8,
    "filters_applied": {
      "sport": "Football",
      "level": null
    },
    "insights": {
      "avg_score": 69,
      "higher_scoring": 3,
      "lower_scoring": 5,
      "athlete_rank_in_group": 6
    }
  }
}
```

**Privacy:** Only shows athletes with `is_public_score = true`

---

### POST /api/fmv/visibility

Toggle FMV score visibility (public/private).

**Request:**
```http
POST /api/fmv/visibility
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "is_public": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Your FMV score is now public",
  "fmv": {
    "is_public_score": true,
    "fmv_score": 72,
    "fmv_tier": "high"
  },
  "meta": {
    "visibility_changed": true,
    "previous_setting": false,
    "new_setting": true,
    "benefits": [
      "Your score will appear in comparable athlete searches",
      "Other athletes can see your score as a benchmark",
      "Businesses and agencies can discover your NIL value"
    ]
  }
}
```

---

### GET /api/fmv/visibility

Get current visibility setting.

**Request:**
```http
GET /api/fmv/visibility
Authorization: Bearer YOUR_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "visibility": {
    "is_public": false,
    "fmv_score": 72,
    "fmv_tier": "high"
  }
}
```

---

### GET /api/fmv/notifications

Get pending FMV notifications.

**Request:**
```http
GET /api/fmv/notifications
Authorization: Bearer YOUR_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "notifications": [
    {
      "id": "score_increase",
      "type": "achievement",
      "priority": "high",
      "title": "Your FMV Score Increased by 8 Points! 🎉",
      "message": "Your score went from 64 to 72.",
      "data": {
        "previous_score": 64,
        "current_score": 72,
        "increase": 8
      },
      "action": null,
      "created_at": "2025-10-17T12:00:00Z"
    }
  ],
  "meta": {
    "has_fmv_data": true,
    "total_notifications": 3,
    "fmv_score": 72,
    "fmv_tier": "high",
    "remaining_calculations_today": 2
  }
}
```

**Notification Types:**
- `achievement`: Score increases, milestones
- `reminder`: Stale scores, calculations available
- `suggestion`: Public sharing, improvements
- `info`: Rate limits, updates
- `action_required`: Initial calculation needed

---

## Compliance Endpoints

### POST /api/compliance/check-deal

Check if NIL deal complies with state regulations.

**Request:**
```http
POST /api/compliance/check-deal
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "athlete_id": "optional-uuid",
  "state_code": "KY",
  "deal_category": "sports_apparel",
  "has_school_approval": true,
  "has_agent_registration": false,
  "has_disclosure": true,
  "has_financial_literacy": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "compliance": {
    "compliant": false,
    "state": "Kentucky",
    "state_code": "KY",
    "athlete_level": "college",
    "violations": [
      "Kentucky requires agents to be registered with the state"
    ],
    "warnings": [
      "Kentucky requires athletes to complete financial literacy education"
    ],
    "requirements": [
      "Ensure your agent/agency is registered with the state",
      "Complete required financial literacy course"
    ],
    "summary": "NIL Compliance Check - Kentucky\n\n❌ Violations:\n  - Agent registration required\n\n⚠️ Warnings:\n  - Financial literacy needed"
  },
  "recommendations": [
    "Do not proceed until all violations are addressed",
    "Contact your school's compliance office",
    "Review state NIL regulations"
  ]
}
```

---

### GET /api/compliance/check-deal

Get state NIL rules summary.

**Request:**
```http
GET /api/compliance/check-deal?state_code=KY
Authorization: Bearer YOUR_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "state_rules": {
    "state_code": "KY",
    "state_name": "Kentucky",
    "allows_nil": true,
    "high_school_allowed": true,
    "college_allowed": true,
    "school_approval_required": false,
    "agent_registration_required": false,
    "disclosure_required": true,
    "financial_literacy_required": false,
    "prohibited_categories": ["alcohol", "gambling", "cannabis"],
    "restrictions": [],
    "rules_summary": "Kentucky allows NIL deals for both HS and college...",
    "effective_date": "2021-07-01"
  }
}
```

---

## Cron Jobs

### POST /api/cron/fmv-rate-limit-reset

Reset daily rate limits (midnight UTC).

**Authentication:** `Bearer ${CRON_SECRET}` (production only)

**Schedule:** `0 0 * * *` (daily at midnight UTC)

**Response:**
```json
{
  "success": true,
  "message": "Daily rate limit reset complete",
  "reset_count": 247,
  "duration": 150
}
```

---

### POST /api/cron/fmv-daily-recalculation

Recalculate FMV for eligible athletes (2 AM UTC).

**Authentication:** `Bearer ${CRON_SECRET}`

**Schedule:** `0 2 * * *` (daily at 2 AM UTC)

**Criteria:**
- Athletes with public scores
- Athletes with scores >7 days old
- Athletes with recent activity

**Response:**
```json
{
  "success": true,
  "message": "Daily FMV recalculation complete",
  "processed": 150,
  "updated": 148,
  "errors": 2,
  "duration": 45000
}
```

---

### POST /api/cron/sync-external-rankings

Sync external athlete rankings (Sunday 3 AM UTC).

**Authentication:** `Bearer ${CRON_SECRET}`

**Schedule:** `0 3 * * 0` (weekly on Sunday at 3 AM UTC)

**Sources:** On3, Rivals, 247Sports, ESPN, MaxPreps

**Response:**
```json
{
  "success": true,
  "message": "External rankings sync complete",
  "total_scraped": 5000,
  "total_matched": 4200,
  "errors": 0,
  "duration": 120000
}
```

---

## Error Handling

### Standard Error Format

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": "Optional additional details"
}
```

### HTTP Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing/invalid authentication
- `403 Forbidden`: Insufficient permissions (e.g., private score access)
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Common Errors

**Rate Limit Exceeded:**
```json
{
  "error": "Rate limit exceeded",
  "message": "You have used all 3 FMV calculations for today.",
  "rate_limit": {
    "max_calculations": 3,
    "used_today": 3,
    "reset_time": "midnight UTC"
  }
}
```

**Private Score Access:**
```json
{
  "error": "This athlete's FMV score is private",
  "message": "The athlete has chosen to keep their score private."
}
```

**Missing FMV Data:**
```json
{
  "error": "FMV data not found",
  "message": "No FMV score exists for this athlete. Calculate first."
}
```

---

## Data Models

### FMVTier

```typescript
type FMVTier = 'elite' | 'high' | 'medium' | 'developing' | 'emerging';
```

**Tier Mapping:**
- `elite`: 80-100 points
- `high`: 70-79 points
- `medium`: 50-69 points
- `developing`: 30-49 points
- `emerging`: 0-29 points

---

### FMVScoreBreakdown

```typescript
interface FMVScoreBreakdown {
  social_score: number;      // 0-30
  athletic_score: number;    // 0-30
  market_score: number;      // 0-20
  brand_score: number;       // 0-20
}
```

---

### ImprovementSuggestion

```typescript
interface ImprovementSuggestion {
  area: 'social' | 'athletic' | 'market' | 'brand';
  current: string;
  target: string;
  action: string;
  impact: string;           // e.g., "+5 points"
  priority: 'high' | 'medium' | 'low';
}
```

---

### DealValueEstimates

```typescript
interface DealValueEstimates {
  sponsored_post: { low: number; mid: number; high: number };
  brand_ambassador: { low: number; mid: number; high: number };
  event_appearance: { low: number; mid: number; high: number };
  product_endorsement: { low: number; mid: number; high: number };
  content_creation: { low: number; mid: number; high: number };
}
```

---

### AthleteFMVData (Complete)

```typescript
interface AthleteFMVData {
  id: string;
  athlete_id: string;
  fmv_score: number;                      // 0-100
  fmv_tier: FMVTier;
  social_score: number;                   // 0-30
  athletic_score: number;                 // 0-30
  market_score: number;                   // 0-20
  brand_score: number;                    // 0-20
  percentile_rank: number | null;         // 0-100
  comparable_athletes: string[];          // Array of athlete IDs
  estimated_deal_values: DealValueEstimates;
  improvement_suggestions: ImprovementSuggestion[];
  strengths: string[];
  weaknesses: string[];
  score_history: FMVScoreHistory[];
  is_public_score: boolean;               // Privacy control
  last_calculated_at: string;             // ISO 8601
  calculation_count_today: number;        // 0-3
  last_calculation_reset_date: string;    // YYYY-MM-DD
  last_notified_score: number | null;     // For 5+ point notifications
  created_at: string;
  updated_at: string;
}
```

---

## Best Practices

### 1. Check Rate Limits Before Calculation

```javascript
const { data } = await fetch('/api/fmv');
if (data.meta.remaining_calculations_today === 0) {
  alert('No calculations remaining today');
  return;
}
```

### 2. Handle Stale Scores

```javascript
if (data.meta.is_stale && data.meta.days_since_calculation > 30) {
  showRecalculationPrompt();
}
```

### 3. Respect Privacy Settings

```javascript
if (!data.meta.is_own_data && !data.fmv.is_public_score) {
  // Will return 403, handle gracefully
}
```

### 4. Use Notifications for UX

```javascript
const { data } = await fetch('/api/fmv/notifications');
if (data.notifications.length > 0) {
  showNotificationBadge(data.notifications.length);
}
```

---

## SDK Example (Coming Soon)

```javascript
import { FMVClient } from '@chatnil/fmv-sdk';

const fmv = new FMVClient({ apiKey: 'YOUR_KEY' });

// Calculate FMV
const result = await fmv.calculate();

// Get comparables
const comparables = await fmv.getComparables({
  sportFilter: true,
  limit: 10
});

// Toggle visibility
await fmv.setVisibility(true);

// Check compliance
const compliance = await fmv.checkCompliance({
  dealCategory: 'sports_apparel',
  hasSchoolApproval: true
});
```

---

## Support

**Documentation:** https://docs.chatnil.io/fmv
**API Status:** https://status.chatnil.io
**Support Email:** support@chatnil.io
**GitHub Issues:** https://github.com/chatnil/issues

---

**Last Updated:** 2025-10-17
**API Version:** 1.0.0
