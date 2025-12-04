# API Quick Reference - Updated Endpoints

## ✅ Working APIs

### 1. Campaign Discovery API
**Endpoint:** `GET /api/matchmaking/athlete/campaigns`

**Query Parameters:**
- `userId` (required) - Athlete user ID
- `minScore` (optional) - Minimum match score (default: 50)
- `limit` (optional) - Results per page (default: 20)
- `offset` (optional) - Pagination offset (default: 0)

**Example Request:**
```bash
curl "http://localhost:3000/api/matchmaking/athlete/campaigns?userId=ca05429a-0f32-4280-8b71-99dc5baee0dc&minScore=60&limit=10"
```

**Response Format:**
```json
{
  "athlete": {
    "id": "uuid",
    "name": "First Last"
  },
  "campaigns": [
    {
      "campaign_id": "uuid",
      "campaign_name": "Campaign Name",
      "brand_name": "Brand Name",
      "match_score": 85,
      "confidence_level": "high",
      "recommended_offer_low": 450,
      "recommended_offer_high": 550,
      "strengths": ["Strong social media presence", "..."],
      "concerns": ["Limited engagement", "..."],
      "match_breakdown": {
        "brand_values": 80,
        "interests": 90,
        "campaign_fit": 85,
        "budget": 70,
        "geography": 95,
        "demographics": 88,
        "engagement": 75
      }
    }
  ],
  "total": 5,
  "summary": {
    "highConfidence": 2,
    "mediumConfidence": 3,
    "lowConfidence": 0,
    "avgMatchScore": 78
  },
  "pagination": {
    "total": 5,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### 2. NIL Deals API
**Endpoint:** `GET /api/nil-deals`

**Query Parameters:**
- `userId` (required) - User ID
- `status` (optional) - Filter by status (pending, active, completed)
- `athlete_id` (optional) - Filter by athlete (for parents/admins)
- `agency_id` (optional) - Filter by agency
- `limit` (optional) - Results per page (default: 20)
- `offset` (optional) - Pagination offset (default: 0)

**Example Request:**
```bash
curl "http://localhost:3000/api/nil-deals?userId=ca05429a-0f32-4280-8b71-99dc5baee0dc&status=active"
```

**Response Format:**
```json
{
  "success": true,
  "deals": [
    {
      "id": "uuid",
      "athlete_id": "uuid",
      "agency_id": "uuid",
      "deal_title": "Nike Partnership",
      "deal_type": "sponsorship",
      "status": "active",
      "compensation_amount": 50000,
      "start_date": "2024-01-01",
      "end_date": "2024-12-31",
      "athlete": {
        "id": "uuid",
        "first_name": "Sarah",
        "last_name": "Johnson",
        "email": "sarah@example.com"
      },
      "agency": {
        "id": "uuid",
        "name": "Nike Agency",
        "email": "agency@nike.com"
      }
    }
  ],
  "count": 3,
  "pagination": {
    "total": 3,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

**Create Deal:** `POST /api/nil-deals`

**Request Body:**
```json
{
  "userId": "uuid",
  "athlete_id": "uuid",
  "agency_id": "uuid",
  "deal_title": "Partnership Deal",
  "deal_type": "sponsorship",
  "compensation_amount": 50000,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "description": "Description here",
  "deliverables": ["Post on Instagram", "Wear branded gear"],
  "payment_schedule": []
}
```

**Valid deal_type values:**
- `sponsorship`
- `endorsement`
- `appearance`
- `content_creation`
- `social_media`
- `merchandise`
- `licensing`
- `event`
- `other`

---

## ⚠️ APIs Not Yet Fixed

### 3. Matchmaking System API
**Endpoint:** `GET /api/matches/athlete`

**Status:** Needs userId parameter added (same as Activity API pattern)

**Current Issue:** Returns "Unauthorized" - requires cookie-based auth

**Workaround:** Use Activity API endpoint instead:
```bash
curl "http://localhost:3000/api/dashboard/activity?userId=UUID&type=match"
```

---

### 4. Compliance Checking API
**Endpoint:** `GET /api/compliance/check`

**Status:** Returns HTML instead of JSON (routing issue)

**Current Issue:** Endpoint may not exist or Next.js routing configuration issue

---

## Common Patterns

### Authentication
All fixed APIs use the **userId parameter pattern**:
```typescript
const { searchParams } = new URL(request.url);
const userId = searchParams.get('userId');

if (!userId || !supabaseAdmin) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Pagination
All APIs support consistent pagination:
```typescript
const limit = parseInt(searchParams.get('limit') || '20', 10);
const offset = parseInt(searchParams.get('offset') || '0', 10);

// ... fetch data ...

return NextResponse.json({
  data: paginatedData,
  pagination: {
    total: allData.length,
    limit,
    offset,
    hasMore: allData.length > offset + limit
  }
});
```

### Foreign Key Replacement
**❌ Old (doesn't work):**
```typescript
const { data } = await supabase
  .from('nil_deals')
  .select(`
    *,
    athlete:users!nil_deals_athlete_id_fkey(first_name, last_name)
  `);
```

**✅ New (works):**
```typescript
const { data: deals } = await supabaseAdmin
  .from('nil_deals')
  .select('*');

for (const deal of deals) {
  const { data: athlete } = await supabaseAdmin
    .from('users')
    .select('first_name, last_name')
    .eq('id', deal.athlete_id)
    .single();
}
```

---

## Testing

**Test all APIs:**
```bash
npx tsx scripts/test-all-apis.ts
```

**Test individual endpoints:**
```bash
# Campaign Discovery
curl "http://localhost:3000/api/matchmaking/athlete/campaigns?userId=ca05429a-0f32-4280-8b71-99dc5baee0dc"

# NIL Deals
curl "http://localhost:3000/api/nil-deals?userId=ca05429a-0f32-4280-8b71-99dc5baee0dc"

# Activity (includes matches)
curl "http://localhost:3000/api/dashboard/activity?userId=ca05429a-0f32-4280-8b71-99dc5baee0dc&type=match"
```
