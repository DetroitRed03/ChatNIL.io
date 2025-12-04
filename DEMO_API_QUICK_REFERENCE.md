# Demo API Quick Reference

Quick reference for integrating with the FMV & Matchmaking Demo API endpoints.

## Base URL
```
/api/demo
```

## Endpoints Summary

| Endpoint | Method | Purpose | Response Time |
|----------|--------|---------|---------------|
| `/fmv/athletes` | GET | List all athletes | < 500ms |
| `/fmv/athlete/[id]` | GET | Get athlete FMV profile | < 800ms |
| `/matchmaking/campaigns` | GET | List all campaigns | < 300ms |
| `/matchmaking/run` | POST | Run matchmaking | < 2s |
| `/matchmaking/athlete/[athleteId]/campaigns` | GET | Find campaigns for athlete | < 3s |
| `/matchmaking/breakdown/[athleteId]/[campaignId]` | GET | Detailed breakdown | < 1s |

## Common Use Cases

### Use Case 1: Show FMV for Selected Athlete

```javascript
// Step 1: Get all athletes for dropdown
const athletesResponse = await fetch('/api/demo/fmv/athletes');
const { athletes } = await athletesResponse.json();

// Step 2: User selects athlete, fetch full profile
const athleteId = athletes[0].id;
const profileResponse = await fetch(`/api/demo/fmv/athlete/${athleteId}`);
const { athlete, fmv, socialStats, comparables } = await profileResponse.json();

// Display:
// - FMV Score: fmv.fmv_score (0-100)
// - FMV Tier: fmv.fmv_tier
// - Deal Value: $${fmv.estimated_deal_value_low / 100} - $${fmv.estimated_deal_value_high / 100}
// - Breakdowns: fmv.social_score, fmv.athletic_score, fmv.market_score, fmv.brand_score
// - Comparables: comparables array
```

### Use Case 2: Run Matchmaking for Campaign

```javascript
// Step 1: Get all campaigns
const campaignsResponse = await fetch('/api/demo/matchmaking/campaigns');
const { campaigns } = await campaignsResponse.json();

// Step 2: User selects campaign, run matchmaking
const campaignId = campaigns[0].id;
const matchResponse = await fetch('/api/demo/matchmaking/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaignId,
    filters: {
      minMatchScore: 60,
      maxResults: 25,
      sportFilter: ['Basketball', 'Football']
    }
  })
});

const { campaign, matches, summary } = await matchResponse.json();

// Display:
// - Campaign: campaign.name, campaign.brand
// - Top Matches: matches[0..9] (sorted by matchPercentage)
// - Summary: summary.totalMatches, summary.avgMatchScore
// - Confidence: summary.confidenceBreakdown
```

### Use Case 3: Show Detailed Match Breakdown

```javascript
// User clicks on a specific athlete-campaign match
const breakdown = await fetch(
  `/api/demo/matchmaking/breakdown/${athleteId}/${campaignId}`
);
const data = await breakdown.json();

// Display:
// - Overall Match: data.matchPercentage + "%"
// - Confidence: data.confidence badge
// - Strengths: data.strengths (green checkmarks)
// - Concerns: data.concerns (yellow warnings)
// - Recommended Offer: $${data.recommendedOffer / 100}
// - Score Breakdown Chart: data.detailedBreakdown (7 categories)
```

## Response Samples

### GET /api/demo/fmv/athletes

```json
{
  "athletes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Sarah Johnson",
      "sport": "Basketball",
      "school": "University of Kentucky",
      "fmv_score": 78,
      "fmv_tier": "high"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Marcus Williams",
      "sport": "Football",
      "school": "University of Texas",
      "fmv_score": 85,
      "fmv_tier": "elite"
    }
  ],
  "total": 157
}
```

### GET /api/demo/fmv/athlete/[id]

```json
{
  "athlete": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "primary_sport": "Basketball",
    "school_name": "University of Kentucky",
    "graduation_year": 2025,
    "bio": "Point guard for Kentucky Wildcats...",
    "hobbies": ["fashion", "photography", "cooking"],
    "brand_affinity": ["Nike", "Gatorade", "Apple"],
    "causes_care_about": ["mental health", "education"]
  },
  "fmv": {
    "fmv_score": 78,
    "fmv_tier": "high",
    "social_score": 24,
    "athletic_score": 26,
    "market_score": 16,
    "brand_score": 12,
    "estimated_deal_value_low": 1200000,
    "estimated_deal_value_mid": 2500000,
    "estimated_deal_value_high": 3750000,
    "improvement_suggestions": [
      {
        "area": "social",
        "current": "12K followers",
        "target": "25K followers",
        "action": "Increase posting frequency to 5x/week",
        "impact": "+4 points",
        "priority": "high"
      }
    ],
    "strengths": ["Strong social media presence", "High athletic achievement"],
    "weaknesses": []
  },
  "socialStats": [
    {
      "platform": "instagram",
      "followers": 12500,
      "engagement_rate": 6.2,
      "verified": true
    },
    {
      "platform": "tiktok",
      "followers": 8300,
      "engagement_rate": 8.5,
      "verified": false
    }
  ],
  "comparables": [
    {
      "id": "...",
      "name": "Emily Davis",
      "score": 76,
      "sport": "Basketball"
    }
  ]
}
```

### POST /api/demo/matchmaking/run

```json
{
  "campaign": {
    "id": "campaign-001",
    "name": "Spring Athleisure Collection",
    "brand": "Nike",
    "budget": 5000000,
    "budgetPerAthlete": 250000,
    "targetSports": ["Basketball", "Track & Field"],
    "targetStates": ["KY", "CA", "TX"],
    "status": "active"
  },
  "matches": [
    {
      "athleteId": "550e8400-e29b-41d4-a716-446655440000",
      "athleteName": "Sarah Johnson",
      "athleteProfile": {
        "sport": "Basketball",
        "school_name": "University of Kentucky",
        "state": "KY",
        "total_followers": 20800
      },
      "campaignId": "campaign-001",
      "campaignName": "Spring Athleisure Collection",
      "matchScore": {
        "total": 85,
        "brandValues": 18,
        "interests": 13,
        "campaignFit": 20,
        "budget": 14,
        "geography": 10,
        "demographics": 8,
        "engagement": 2
      },
      "matchPercentage": 85,
      "strengths": [
        "Strong brand alignment",
        "Perfect campaign fit",
        "Geographic match"
      ],
      "concerns": [
        "Below engagement requirements"
      ],
      "recommendedOffer": 240000,
      "confidence": "high"
    }
  ],
  "summary": {
    "totalMatches": 42,
    "avgMatchScore": 68,
    "confidenceBreakdown": {
      "high": 12,
      "medium": 23,
      "low": 7
    }
  }
}
```

## TypeScript Types

```typescript
// FMV Types
interface Athlete {
  id: string;
  name: string;
  sport: string;
  school: string;
  fmv_score: number;
  fmv_tier: 'elite' | 'high' | 'medium' | 'developing' | 'emerging';
}

interface AthleteFMVProfile {
  athlete: User;
  fmv: FMVData;
  socialStats: SocialStat[];
  publicProfile: PublicProfile;
  comparables: Comparable[];
}

// Matchmaking Types
interface Campaign {
  id: string;
  name: string;
  brand: string;
  budget: number;
  targetSports: string[];
  status: string;
}

interface MatchingResult {
  campaign: CampaignDetails;
  matches: AthleteMatch[];
  summary: MatchingSummary;
}

interface AthleteMatch {
  athleteId: string;
  athleteName: string;
  athleteProfile: any;
  campaignId: string;
  campaignName: string;
  matchScore: MatchScore;
  matchPercentage: number;
  strengths: string[];
  concerns: string[];
  recommendedOffer: number;
  confidence: 'high' | 'medium' | 'low';
}

interface MatchScore {
  total: number;
  brandValues: number;
  interests: number;
  campaignFit: number;
  budget: number;
  geography: number;
  demographics: number;
  engagement: number;
}
```

## React Hook Example

```typescript
// hooks/useFMVDemo.ts
import { useState } from 'react';

export function useFMVDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAthletes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo/fmv/athletes');
      if (!res.ok) throw new Error('Failed to fetch athletes');
      return await res.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAthleteProfile = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/demo/fmv/athlete/${id}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return await res.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getAthletes, getAthleteProfile, loading, error };
}
```

## Component Example

```tsx
// components/FMVDemoViewer.tsx
'use client';

import { useState, useEffect } from 'react';
import { useFMVDemo } from '@/hooks/useFMVDemo';

export function FMVDemoViewer() {
  const { getAthletes, getAthleteProfile, loading } = useFMVDemo();
  const [athletes, setAthletes] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getAthletes().then(data => setAthletes(data.athletes));
  }, []);

  const handleSelect = async (id: string) => {
    const profile = await getAthleteProfile(id);
    setSelected(profile);
  };

  return (
    <div>
      <select onChange={(e) => handleSelect(e.target.value)}>
        {athletes.map(a => (
          <option key={a.id} value={a.id}>
            {a.name} - {a.sport} - FMV: {a.fmv_score}
          </option>
        ))}
      </select>

      {selected && (
        <div>
          <h2>{selected.athlete.first_name} {selected.athlete.last_name}</h2>
          <div>FMV Score: {selected.fmv.fmv_score}/100</div>
          <div>Tier: {selected.fmv.fmv_tier}</div>
          <div>Deal Value: ${selected.fmv.estimated_deal_value_low / 100} - ${selected.fmv.estimated_deal_value_high / 100}</div>
        </div>
      )}
    </div>
  );
}
```

## Error Handling

```typescript
async function safeApiCall<T>(
  fetcher: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fetcher();
  } catch (error) {
    console.error('API Error:', error);
    return fallback;
  }
}

// Usage
const athletes = await safeApiCall(
  () => fetch('/api/demo/fmv/athletes').then(r => r.json()),
  { athletes: [], total: 0 }
);
```

## Performance Tips

1. **Pagination**: Use `maxResults` filter to limit data transfer
2. **Caching**: Cache athlete list and campaign list (low change frequency)
3. **Debouncing**: Debounce filter changes before re-running matchmaking
4. **Loading States**: Show skeletons while matchmaking runs (can take 1-3s)
5. **Optimistic Updates**: Update UI immediately, refetch in background

## Common Issues

### Issue: 404 Not Found
**Cause**: Invalid athlete or campaign ID
**Solution**: Verify ID exists by listing all athletes/campaigns first

### Issue: Slow Response Time
**Cause**: Matchmaking runs against all 157 athletes
**Solution**: Use `minMatchScore` and `maxResults` filters aggressively

### Issue: Empty Matches
**Cause**: Campaign criteria too restrictive
**Solution**: Lower `minMatchScore` to 40-50, remove optional filters

---

**Last Updated**: 2025-10-29
