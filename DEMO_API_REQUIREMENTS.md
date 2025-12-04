# Demo UI API Requirements

## Overview

This document defines the API endpoints required to support the FMV & Matchmaking Demo UI. All endpoints should return JSON and follow RESTful conventions.

---

## FMV (Fair Market Value) APIs

### 1. Get Demo Athletes List

**Endpoint**: `GET /api/demo/fmv/athletes`

**Purpose**: Fetch list of athletes for the athlete selector dropdown

**Response**:
```json
{
  "athletes": [
    {
      "id": "uuid-string",
      "full_name": "Sarah Martinez",
      "primary_sport": "Basketball",
      "fmv_score": 78,
      "fmv_tier": "high",
      "avatar_url": "https://..."
    }
  ]
}
```

**Notes**:
- Should return 10-20 demo athletes
- Mix of different sports and tiers
- Include realistic FMV scores (20-95 range)

---

### 2. Get Athlete FMV Data

**Endpoint**: `GET /api/demo/fmv/athlete/[id]`

**Purpose**: Fetch complete FMV data for a specific athlete

**Response**:
```json
{
  "fmv_score": 78,
  "fmv_tier": "high",
  "social_score": 24,
  "athletic_score": 26,
  "market_score": 14,
  "brand_score": 14,
  "estimated_deal_value_low": 1500000,
  "estimated_deal_value_mid": 3750000,
  "estimated_deal_value_high": 5625000
}
```

**Score Ranges**:
- `fmv_score`: 0-100 (total of all category scores)
- `social_score`: 0-30
- `athletic_score`: 0-30
- `market_score`: 0-20
- `brand_score`: 0-20
- Deal values in cents (e.g., 1500000 = $15,000)

**Tier Calculation**:
- Elite: 90-100
- High: 75-89
- Medium: 55-74
- Developing: 35-54
- Emerging: 0-34

---

## Matchmaking APIs

### 3. Get Demo Campaigns List

**Endpoint**: `GET /api/demo/matchmaking/campaigns`

**Purpose**: Fetch list of campaigns for the campaign selector dropdown

**Response**:
```json
{
  "campaigns": [
    {
      "id": "uuid-string",
      "campaign_name": "Spring Basketball Showcase",
      "brand_name": "Nike",
      "budget_min": 1000000,
      "budget_max": 5000000,
      "sports_targeting": ["Basketball", "Football"],
      "status": "active"
    }
  ]
}
```

**Notes**:
- Should return 5-10 demo campaigns
- Budget in cents (1000000 = $10,000)
- Mix of different sports and budget ranges

---

### 4. Get Campaign Details

**Endpoint**: `GET /api/demo/matchmaking/campaign/[id]`

**Purpose**: Fetch detailed information about a specific campaign

**Response**:
```json
{
  "id": "uuid-string",
  "campaign_name": "Spring Basketball Showcase",
  "brand_name": "Nike",
  "budget_min": 1000000,
  "budget_max": 5000000,
  "sports_targeting": ["Basketball", "Football"],
  "states_targeting": ["KY", "TN", "OH", "IN"],
  "min_followers": 5000,
  "min_fmv_score": 50,
  "content_types": ["Instagram Post", "TikTok Video", "Instagram Story"]
}
```

---

### 5. Run Matchmaking

**Endpoint**: `POST /api/demo/matchmaking/run`

**Purpose**: Run matchmaking algorithm for a campaign and return ranked athlete matches

**Request Body**:
```json
{
  "campaign_id": "uuid-string"
}
```

**Response**:
```json
{
  "matches": [
    {
      "athlete_id": "uuid-string",
      "athlete_name": "Sarah Martinez",
      "sport": "Basketball",
      "fmv_score": 78,
      "fmv_tier": "high",
      "match_score": 92,
      "confidence_level": "high",
      "recommended_offer_low": 1500000,
      "recommended_offer_high": 3000000,
      "avatar_url": "https://...",
      "state": "KY",
      "match_breakdown": {
        "brand_values_match": 18,
        "interests_match": 12,
        "campaign_fit": 19,
        "budget_alignment": 14,
        "geography_match": 10,
        "demographics_match": 9,
        "engagement_potential": 10
      },
      "strengths": [
        "Strong social media presence with 50K+ followers",
        "Excellent engagement rate (8.5%)",
        "Perfect geographic match (KY resident)",
        "Brand values align with campaign objectives"
      ],
      "concerns": [
        "Limited experience with TikTok content",
        "No previous brand partnerships"
      ],
      "offer_justification": "Based on Sarah's FMV score of 78, strong social reach, and perfect geographic alignment, we recommend an offer between $15K-$30K. Her high engagement rate and brand values alignment make her an excellent fit for this campaign."
    }
  ]
}
```

**Match Score Calculation**:
- Total: 100 points
- Brand Values: 20 pts
- Interests: 15 pts
- Campaign Fit: 20 pts
- Budget Alignment: 15 pts
- Geography: 10 pts
- Demographics: 10 pts
- Engagement: 10 pts

**Confidence Levels**:
- High: Match score ≥ 85
- Medium: Match score 70-84
- Low: Match score < 70

**Sorting**: Results should be sorted by match_score descending (best matches first)

---

### 6. Get Athlete Campaign Matches

**Endpoint**: `GET /api/demo/matchmaking/athlete/[athleteId]/campaigns`

**Purpose**: Get top campaigns that match a specific athlete (reverse matchmaking)

**Response**:
```json
{
  "matches": [
    {
      "campaign_id": "uuid-string",
      "campaign_name": "Spring Basketball Showcase",
      "brand_name": "Nike",
      "match_score": 92,
      "confidence_level": "high",
      "recommended_offer_low": 1500000,
      "recommended_offer_high": 3000000,
      "match_breakdown": { ... },
      "strengths": [ ... ],
      "concerns": [ ... ],
      "offer_justification": "..."
    }
  ]
}
```

**Notes**:
- Same structure as campaign matchmaking, but shows campaigns instead of athletes
- Should return top 5-10 best campaign matches
- Sorted by match_score descending

---

## Data Seeding Recommendations

### Demo Athletes (10-15 athletes)

**Mix of Sports**:
- 4 Basketball players
- 3 Football players
- 2 Soccer players
- 2 Track & Field athletes
- 1-2 Other sports (Baseball, Softball, Swimming)

**Mix of Tiers**:
- 2 Elite (90-95)
- 3 High (75-85)
- 4 Medium (55-70)
- 3 Developing (40-50)
- 1 Emerging (25-35)

**Geographic Diversity**:
- Mix of states: KY, TN, OH, CA, TX, FL, NY

**Social Media Ranges**:
- Elite: 100K+ followers
- High: 25K-100K followers
- Medium: 5K-25K followers
- Developing: 1K-5K followers
- Emerging: <1K followers

---

### Demo Campaigns (5-8 campaigns)

**Brand Types**:
- Sportswear (Nike, Adidas, Under Armour)
- Energy Drinks (Red Bull, Gatorade)
- Tech (Apple, Samsung)
- Food/Beverage (McDonald's, Coca-Cola)
- Financial (Cash App, Venmo)

**Budget Ranges**:
- Premium: $50K-$150K
- High: $15K-$50K
- Mid: $5K-$15K
- Entry: $1K-$5K

**Sport Focus**:
- Multi-sport campaigns (Basketball + Football)
- Single-sport campaigns (Basketball only)
- All-sports campaigns (any sport)

---

## Error Handling

All endpoints should return appropriate HTTP status codes:

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

**Error Response Format**:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details (optional)"
}
```

---

## Performance Considerations

- **Caching**: Consider caching athlete and campaign lists (5-10 minute TTL)
- **Pagination**: Not required for demo (limited results)
- **Response Time**: Aim for <500ms for list endpoints, <1s for matchmaking
- **Rate Limiting**: Not required for demo

---

## Security Notes

These are demo/public endpoints, so:
- No authentication required
- Demo data only (no real user data)
- Consider adding `X-Demo-Mode: true` header in responses
- Rate limit to prevent abuse (optional)

---

## Testing

**Example cURL commands**:

```bash
# Get athletes list
curl http://localhost:3000/api/demo/fmv/athletes

# Get specific athlete FMV
curl http://localhost:3000/api/demo/fmv/athlete/[id]

# Get campaigns list
curl http://localhost:3000/api/demo/matchmaking/campaigns

# Run matchmaking
curl -X POST http://localhost:3000/api/demo/matchmaking/run \
  -H "Content-Type: application/json" \
  -d '{"campaign_id":"[id]"}'
```

---

## Implementation Priority

1. **Highest Priority** (needed for athlete demo page):
   - GET /api/demo/fmv/athletes
   - GET /api/demo/fmv/athlete/[id]

2. **High Priority** (needed for agency demo page):
   - GET /api/demo/matchmaking/campaigns
   - GET /api/demo/matchmaking/campaign/[id]
   - POST /api/demo/matchmaking/run

3. **Medium Priority** (nice to have):
   - GET /api/demo/matchmaking/athlete/[athleteId]/campaigns

---

## Notes

- All monetary values are in **cents** (e.g., 1000000 = $10,000)
- All IDs should be UUIDs
- Timestamps not required for demo data
- Consider creating seed script to populate demo data
- Demo data should be realistic but clearly fictional (no real athlete data)
