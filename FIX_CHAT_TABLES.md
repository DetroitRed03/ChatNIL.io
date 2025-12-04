# Fix Chat Tables Issue

## Problem
The `chat_sessions` table doesn't exist in the database, causing errors when the app tries to fetch chat sessions.

## Solution

### Step 1: Apply Chat Tables Migration
Open in browser: http://localhost:3000/apply-chat-tables.html

This will create:
- `chat_sessions` table
- `chat_messages` table
- `chat_attachments` table

### Step 2: Reload Supabase Schema Cache
After the migration completes, reload the PostgREST schema cache so it recognizes the new tables.

Run this command:
```bash
curl -X POST "https://lqskiijspudfocddhkqs.supabase.co/rest/v1/rpc/reload_schema" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I"
```

Or open in Supabase Dashboard:
https://supabase.com/dashboard/project/lqskiijspudfocddhkqs/sql/new

And run:
```sql
NOTIFY pgrst, 'reload schema';
```

### Step 3: Verify
The chat_sessions errors should disappear from the console.

## Status
- ✅ Migration file created: `/public/apply-chat-tables.html`
- ⏳ Waiting for you to open in browser and apply
- ⏳ Waiting for schema cache reload

## Notes
The notifications API error ("supabase.from is not a function") was already fixed in a previous session. The error you saw was likely from cached/old code. After restarting the dev server, this error should be gone.
