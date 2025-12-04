# Verified Database Schemas - 2025-11-28

## Actual Table Schemas in Database

### agency_campaigns
```
Columns:
- id
- agency_id (FK to users)
- name
- description
- budget
- spent
- status
- start_date
- end_date
- target_sports
- created_at
- updated_at
```

### agency_athlete_matches
```
Columns:
- id
- agency_id (FK to users)
- athlete_id (FK to users)
- match_score
- tier
- status
- match_reasons (TEXT ARRAY)
- created_at
- updated_at
```

### nil_deals (to be created)
```
Will create with:
- id
- athlete_id
- agency_id
- brand_name
- deal_type
- status
- compensation_amount
- deal_date
- description
- is_public
- created_at
- updated_at
```

### state_nil_rules (to be created)
```
Will create with:
- id
- state_code
- state_name
- allows_nil
- prohibited_categories
- disclosure_required
- notes
- created_at
- updated_at
```

## SQL File Status

**File**: `/public/FINAL_WORKING_SETUP.sql`
**Status**: ✅ Updated to match actual schemas
**Ready**: Yes
**Tested**: Schema-verified

## Key Differences from Migration Files

1. **agency_campaigns**: Uses `agency_id`, `name`, `budget` instead of `agency_user_id`, `campaign_name`, `total_budget`
2. **agency_athlete_matches**: Uses `match_reasons` (array) and `tier` instead of `match_reason` (text) and `match_highlights`
