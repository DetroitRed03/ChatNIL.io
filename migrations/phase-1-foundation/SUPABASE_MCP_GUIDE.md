# Supabase MCP Server - Usage Guide

**Project**: ChatNIL.io
**MCP Server**: Supabase Official MCP
**URL**: https://mcp.supabase.com/mcp
**Status**: ✅ Configured in Claude Desktop

---

## What is Supabase MCP?

The **Supabase Model Context Protocol (MCP) Server** enables Claude to directly interact with your Supabase database, execute SQL queries, manage schema, and access project resources—all through natural language.

**Key Benefits**:
- 🔍 Query database without writing SQL
- 📊 Explore schema and relationships
- 🛠️ Generate migrations automatically
- 📝 Create TypeScript types from tables
- 🔎 Search Supabase documentation
- 🐛 Debug database issues with logs

---

## Configuration

### Current Setup

Your Claude Desktop is configured with:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp",
      "queryParams": {
        "project_ref": "enbuwffusjhpcyoveewb",
        "read_only": "false",
        "feature_groups": "account,database,debugging,development"
      }
    }
  }
}
```

**Configuration Options**:
- **project_ref**: `enbuwffusjhpcyoveewb` (your ChatNIL Supabase project)
- **read_only**: `false` (allows write operations for development)
- **feature_groups**: Limited to essential features for safety

### Security Settings

**Feature Groups Enabled**:
- ✅ `account` - Project management
- ✅ `database` - SQL queries, schema management
- ✅ `debugging` - Logs, advisors
- ✅ `development` - Migrations, TypeScript types

**Feature Groups Disabled** (for safety):
- ❌ `storage` - File operations (handled separately)
- ❌ `edge_functions` - Function management (not needed yet)
- ❌ `branching` - Database branching (experimental)
- ❌ `knowledge_base` - Full docs search (reduces noise)

### Authentication

**First Use**:
1. When you first use a Supabase MCP command, Claude will prompt for OAuth
2. A browser window opens → Log into your Supabase account
3. Grant access to the MCP server
4. Token is stored securely (no manual PAT needed)

**Permissions**:
- Operates under **your Supabase account permissions**
- Same access as logging into Supabase Dashboard
- Scoped to project `enbuwffusjhpcyoveewb` only

---

## Available Commands

### 1. Database Exploration

**List all tables**:
```
"List all tables in my Supabase project"
```

**Show table schema**:
```
"Show me the schema for the users table"
"What columns does the chat_messages table have?"
```

**Describe relationships**:
```
"What foreign keys does the user_badges table have?"
"Show me all relationships between users and chat_sessions"
```

**Find specific data**:
```
"How many users have completed onboarding?"
"Show me the 5 most recent chat sessions"
```

### 2. SQL Queries

**Simple queries**:
```
"Query all athletes with primary_sport = 'Basketball'"
"Count how many badges exist with rarity = 'legendary'"
```

**Complex queries**:
```
"Find all athletes who have earned at least 3 badges and completed onboarding"
"Show me users with incomplete profiles (where onboarding_completed is false)"
```

**Aggregations**:
```
"What's the average GPA of athletes in the database?"
"Count users by role (athlete, parent, coach)"
```

**JOINs**:
```
"Show me all parent-athlete relationships with parent names and athlete names"
"List all chat sessions with their message counts"
```

### 3. Schema Management

**Generate migrations**:
```
"Generate a migration to add a 'bio' column to the users table"
"Create a migration for a new table called 'nil_deals'"
```

**Create TypeScript types**:
```
"Generate TypeScript types for the users table"
"Create types for all badge-related tables"
```

**Check constraints**:
```
"What constraints exist on the users table?"
"Show me all UNIQUE constraints in the database"
```

### 4. Debugging

**View logs**:
```
"Show me recent database errors"
"What slow queries have been running?"
```

**Analyze performance**:
```
"Which tables are missing indexes?"
"Show me tables with the most rows"
```

**RLS policy checks**:
```
"List all RLS policies on the users table"
"Check if the chat_sessions table has RLS enabled"
```

### 5. Documentation Search

**Find Supabase docs**:
```
"Search Supabase docs for 'Row Level Security best practices'"
"How do I set up storage buckets in Supabase?"
```

**Code examples**:
```
"Show me how to query JSONB columns in Supabase"
"Example of creating RLS policies for multi-tenant apps"
```

---

## Example Workflows

### Workflow 1: Exploring User Data

```
You: "How many users do we have in each role?"

Claude: [Executes SQL query]
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

Results:
- athlete: 45
- parent: 18
- coach: 12
```

### Workflow 2: Debugging Profile Completion

```
You: "Show me users who haven't completed onboarding, grouped by role"

Claude: [Executes query]
SELECT role, email, created_at
FROM users
WHERE onboarding_completed = false
ORDER BY created_at DESC;

Results:
[List of incomplete profiles with creation dates]
```

### Workflow 3: Creating a New Table

```
You: "I need to add a table for NIL deals. Create a migration with:
- athlete_id (foreign key to users)
- brand_name (text)
- deal_type (enum: endorsement, appearance, social_media)
- amount (decimal)
- status (enum: pending, active, completed)
- start_date and end_date"

Claude: [Generates migration SQL]
CREATE TABLE nil_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  deal_type TEXT CHECK (deal_type IN ('endorsement', 'appearance', 'social_media')),
  amount DECIMAL(10,2),
  status TEXT CHECK (status IN ('pending', 'active', 'completed')) DEFAULT 'pending',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE nil_deals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Athletes can view their own deals" ON nil_deals
  FOR SELECT USING (auth.uid() = athlete_id);
```

### Workflow 4: Generating TypeScript Types

```
You: "Generate TypeScript types for the badges and user_badges tables"

Claude: [Generates types from schema]
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  category: 'learning' | 'engagement' | 'social' | 'achievement' | 'milestone';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  criteria: any;
  points: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  progress: any;
  is_displayed: boolean;
  display_order: number;
  notes: string | null;
  awarded_by: string | null;
  created_at: string;
  updated_at: string;
}
```

### Workflow 5: Checking RLS Policies

```
You: "Show me all RLS policies on the chat_sessions table and verify they're correct"

Claude: [Queries pg_policies]
Policies on chat_sessions:
1. "chat_sessions_select_own" (SELECT)
   - Users can only see their own sessions
   - USING: auth.uid() = user_id

2. "chat_sessions_insert_own" (INSERT)
   - Users can create sessions for themselves
   - WITH CHECK: auth.uid() = user_id

3. "service_role_all" (ALL)
   - Service role has full access
   - USING: auth.jwt() ->> 'role' = 'service_role'

✅ Policies look correct - users are isolated to their own data.
```

---

## Safety Features

### Read-Only Mode

To enable read-only mode (prevents accidental writes):

```json
{
  "queryParams": {
    "read_only": "true"  // Change from "false"
  }
}
```

**When to use**:
- Exploring unfamiliar data
- Debugging production issues
- Learning the schema

**Note**: Currently set to `"false"` for development work.

### Manual Approval

You can configure Claude Desktop to require manual approval for each MCP tool call:

1. Open Claude Desktop → Settings → Developer
2. Enable "Require approval for MCP tools"
3. Each database operation will prompt for confirmation

### Scoped to Project

The MCP server is already scoped to your ChatNIL project:
- **project_ref**: `enbuwffusjhpcyoveewb`
- Cannot access other Supabase projects
- Limited to enabled feature groups

---

## Troubleshooting

### Issue: "MCP server not responding"

**Solution**:
1. Restart Claude Desktop
2. Check internet connection
3. Verify Supabase project is online: https://app.supabase.com/project/enbuwffusjhpcyoveewb

### Issue: "Permission denied" errors

**Solution**:
1. Re-authenticate via OAuth (logout and log back in)
2. Check your Supabase account has access to the project
3. Verify you're not trying to access disabled feature groups

### Issue: "Invalid SQL syntax" in generated queries

**Solution**:
1. Review the query Claude generated
2. Provide more specific instructions
3. Reference exact table/column names from the schema

### Issue: "RLS policy preventing query"

**Solution**:
1. Check if you're querying with anon key (RLS applies) or service role (RLS bypassed)
2. MCP uses your user credentials (RLS applies)
3. Use service role in Next.js API routes for admin operations

---

## Best Practices

### 1. Be Specific with Table Names
❌ "Show me users"
✅ "Show me all rows from the users table"

### 2. Limit Result Sets
❌ "Query all chat messages"
✅ "Query the 100 most recent chat messages"

### 3. Use Aggregations for Counts
❌ "Show me all athletes and count them"
✅ "Count total athletes in the database"

### 4. Verify Before Writing
❌ "Delete all test users"
✅ "Show me all users with email ending in @test.com, then I'll decide if we should delete them"

### 5. Check Schema First
❌ "Add a 'bio' column to users" (might already exist!)
✅ "Does the users table have a 'bio' column? If not, generate a migration to add it"

---

## Advanced Usage

### Custom Queries with JSONB

**Query JSONB fields**:
```
"Find all users where social_media_handles contains an Instagram handle"

-- Generated SQL:
SELECT id, email, social_media_handles
FROM users
WHERE social_media_handles ? 'instagram';
```

**Filter by JSONB values**:
```
"Show athletes with 'Basketball' in their achievements array"

-- Generated SQL:
SELECT id, first_name, last_name, achievements
FROM users
WHERE 'Basketball' = ANY(achievements);
```

### Window Functions

```
"Show the 5 most active users by message count, with their rank"

-- Generated SQL:
SELECT
  u.id,
  u.email,
  COUNT(cm.id) as message_count,
  RANK() OVER (ORDER BY COUNT(cm.id) DESC) as activity_rank
FROM users u
LEFT JOIN chat_sessions cs ON u.id = cs.user_id
LEFT JOIN chat_messages cm ON cs.id = cm.session_id
GROUP BY u.id, u.email
ORDER BY message_count DESC
LIMIT 5;
```

### CTEs (Common Table Expressions)

```
"Show me athletes who have earned more badges than the average"

-- Generated SQL:
WITH avg_badges AS (
  SELECT AVG(badge_count) as avg_count
  FROM (
    SELECT user_id, COUNT(*) as badge_count
    FROM user_badges
    GROUP BY user_id
  ) counts
)
SELECT u.id, u.first_name, u.last_name, COUNT(ub.id) as badge_count
FROM users u
JOIN user_badges ub ON u.id = ub.user_id
GROUP BY u.id, u.first_name, u.last_name
HAVING COUNT(ub.id) > (SELECT avg_count FROM avg_badges)
ORDER BY badge_count DESC;
```

---

## Migration Strategy

### Generating Migrations with MCP

**Process**:
1. Describe desired changes to Claude
2. Claude generates migration SQL via MCP
3. Review generated SQL carefully
4. Save to new migration file: `migrations/015_description.sql`
5. Apply via Supabase Dashboard → SQL Editor
6. Update TypeScript types in `lib/types.ts`

**Example**:
```
You: "Generate a migration to add email notification preferences to the users table.
Include fields for:
- email_notifications_enabled (boolean, default true)
- notification_frequency (enum: immediate, daily, weekly)
- notification_types (jsonb array for granular settings)"

Claude: [Generates migration]
-- Migration: 015_add_email_notification_preferences
-- Date: 2025-10-15

ALTER TABLE users
ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN notification_frequency TEXT
  CHECK (notification_frequency IN ('immediate', 'daily', 'weekly'))
  DEFAULT 'immediate',
ADD COLUMN notification_types JSONB DEFAULT '[]'::jsonb;

-- Create index for frequent queries
CREATE INDEX idx_users_notifications ON users(email_notifications_enabled, notification_frequency);

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name LIKE 'notification%';
```

**Save as**: `migrations/015_add_email_notification_preferences.sql`

---

## Feature Group Reference

### Enabled Groups

**account** - Project Management
- List projects
- Get project details
- Manage project settings

**database** - SQL Operations
- Execute SQL queries
- List tables and schemas
- Create/modify tables
- Generate migrations
- Create TypeScript types

**debugging** - Troubleshooting
- View database logs
- Get query performance insights
- Analyze slow queries
- Check advisors (optimization tips)

**development** - Developer Tools
- Generate TypeScript types
- Create migrations
- Test queries
- Schema exploration

### Disabled Groups (Can Enable If Needed)

**storage** - File Operations
- Upload/download files
- Manage buckets
- Set storage policies

**edge_functions** - Serverless Functions
- Deploy functions
- Manage function logs
- Test function execution

**branching** - Database Branching (Experimental)
- Create database branches
- Merge branches
- Manage branch schemas

**knowledge_base** - Full Documentation
- Comprehensive docs search
- Code examples
- Best practices

**To Enable** (add to feature_groups):
```json
"feature_groups": "account,database,debugging,development,storage"
```

---

## Comparison: MCP vs. Direct Supabase

| Operation | Without MCP | With MCP |
|-----------|------------|----------|
| **List tables** | Log into Dashboard → Tables | "List all tables" |
| **Query data** | Write SQL in SQL Editor | "Show me recent users" |
| **Create migration** | Write SQL manually | "Generate migration for X" |
| **Check RLS** | Query pg_policies table | "Show RLS policies on users table" |
| **Generate types** | Use Supabase CLI | "Generate types for all tables" |
| **Debug slow queries** | Dashboard → Database → Slow Queries | "What queries are running slow?" |
| **Search docs** | Google → Supabase Docs | "Search Supabase docs for RLS" |

**Time Saved**: ~70% for common database operations

---

## Limits and Quotas

### Supabase Free Tier Limits
- **Database Size**: 500 MB
- **Monthly Egress**: 5 GB
- **API Requests**: Unlimited (rate limited)
- **Max Connections**: 25 concurrent
- **Backups**: 7 days (automatic)

### MCP Server Limits
- **Rate Limiting**: Standard API rate limits apply
- **Query Timeout**: 60 seconds per query
- **Result Set**: Up to 1000 rows per query (configurable)
- **Concurrent Requests**: Limited by Supabase connection pool

**Note**: The MCP server operates within your project's quotas.

---

## Learning Resources

### Official Documentation
- [Supabase MCP Server](https://supabase.com/docs/guides/getting-started/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Supabase Database Docs](https://supabase.com/docs/guides/database)

### Useful Queries to Try

**1. Database Statistics**:
```
"Show me table sizes ordered by largest first"
```

**2. Data Quality Checks**:
```
"Find all users with null emails or invalid roles"
```

**3. Relationship Verification**:
```
"Check for orphaned records in user_badges (badges with no user)"
```

**4. Performance Analysis**:
```
"What indexes exist on the chat_messages table?"
```

**5. Schema Validation**:
```
"List all foreign key constraints and their parent tables"
```

---

## Next Steps

Now that Supabase MCP is configured:

1. **Restart Claude Desktop** to load the MCP server
2. **Authenticate** when prompted (OAuth flow)
3. **Try a test command**: "List all tables in my Supabase project"
4. **Explore your schema**: "Show me the structure of the users table"
5. **Run analytics**: "How many users have completed onboarding?"

**Happy querying!** 🚀

---

**Document Version**: 1.0
**Last Updated**: October 15, 2025
**MCP Server Version**: Latest (auto-updated)
**Project**: ChatNIL.io (enbuwffusjhpcyoveewb)
