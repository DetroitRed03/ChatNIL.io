# Migration Application Guide - Immediate Actions

**Time Estimate:** 45 minutes
**Date:** October 24, 2025
**Purpose:** Apply chat system, quiz system, and vector extension migrations

---

## Prerequisites

✅ Supabase project: `enbuwffusjhpcyoveewb`
✅ Access to Supabase Dashboard SQL Editor
✅ All migration files exist in `/supabase/migrations/`

---

## Phase 1: Apply Chat System Migrations (15 min)

### Step 1: Navigate to Supabase SQL Editor

1. Open browser: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql
2. Click "New Query"

### Step 2: Apply Migration 010 (chat_sessions)

**File:** `supabase/migrations/010_create_chat_sessions_table.sql`

1. Copy the entire contents of the migration file
2. Paste into SQL Editor
3. Click "Run" or press `Ctrl+Enter`
4. **Expected Output:**
   ```
   NOTICE: Migration 010 completed: chat_sessions table created successfully!
   NOTICE: Helper functions created: get_user_chat_sessions, auto_archive_old_sessions
   ```

**Verification:**
```sql
-- Run this to verify
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'chat_sessions';

-- Should return: chat_sessions
```

### Step 3: Apply Migration 011 (chat_messages)

**File:** `supabase/migrations/011_create_chat_messages_table.sql`

1. Copy the entire contents of the migration file
2. Paste into SQL Editor
3. Click "Run"
4. **Expected Output:**
   ```
   NOTICE: Migration 011 completed: chat_messages table created successfully!
   NOTICE: Helper functions created: get_session_messages, get_session_message_count, search_user_messages
   NOTICE: Trigger created: auto-update session timestamp on new message
   ```

**Verification:**
```sql
-- Verify both tables and RLS
SELECT
  t.table_name,
  t.row_security as rls_enabled
FROM information_schema.tables t
JOIN pg_tables pt ON t.table_name = pt.tablename
WHERE t.table_schema = 'public'
AND t.table_name IN ('chat_sessions', 'chat_messages');

-- Expected result:
-- chat_sessions    | on
-- chat_messages    | on
```

### Step 4: Update Dashboard Code

**File:** `lib/dashboard-data.ts`

Change the `getRecentChats()` function from:
```typescript
export async function getRecentChats(userId: string): Promise<RecentChat[]> {
  // TODO: Enable once chat_sessions migration is applied to Supabase
  // For now return empty to prevent 404 errors
  return [];
}
```

To:
```typescript
export async function getRecentChats(userId: string): Promise<RecentChat[]> {
  const supabase = createClient();

  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select(`
      id,
      title,
      updated_at,
      is_archived
    `)
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching chat sessions:', error);
    return [];
  }

  if (!sessions || sessions.length === 0) {
    return [];
  }

  // Fetch messages for each session to get last message
  const chatsWithMessages = await Promise.all(
    sessions.map(async (session) => {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('content, created_at, role')
        .eq('session_id', session.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session.id);

      const lastMessage = messages && messages.length > 0 ? messages[0] : null;

      return {
        id: session.id,
        title: session.title,
        lastMessage: lastMessage?.content || 'No messages yet',
        updatedAt: session.updated_at,
        messageCount: count || 0,
      };
    })
  );

  return chatsWithMessages;
}
```

**Verification:**
- Restart dev server: `npm run dev`
- Visit dashboard: http://localhost:3000/dashboard
- Check browser console - should NOT see 404 errors on `chat_sessions`

---

## Phase 2: Apply Quiz System Migrations (10 min)

### Step 1: Check for Required Function

The quiz migrations depend on `update_updated_at_column()` function.

**Run this check:**
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'update_updated_at_column';
```

**If the function doesn't exist, create it:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Step 2: Apply Migration 008 (quiz_questions)

**File:** `supabase/migrations/008_create_quiz_questions_table.sql`

1. Copy entire contents
2. Paste into SQL Editor
3. Click "Run"
4. **Expected Output:**
   ```
   Successfully created quiz_difficulty enum
   Successfully created quiz_category enum
   Successfully created quiz_questions table
   ```

**Verification:**
```sql
-- Check table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'quiz_questions';

-- Check enums created
SELECT typname FROM pg_type
WHERE typname IN ('quiz_difficulty', 'quiz_category');
```

### Step 3: Apply Migration 009 (user_quiz_progress)

**File:** `supabase/migrations/009_create_user_quiz_progress_table.sql`

1. Copy entire contents
2. Paste into SQL Editor
3. Click "Run"
4. **Expected Output:**
   ```
   NOTICE: Migration 009 completed: user_quiz_progress table created successfully!
   NOTICE: Helper functions created: record_quiz_answer, get_user_quiz_stats, get_quiz_session_results, get_recommended_questions
   ```

**Verification:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('quiz_questions', 'user_quiz_progress');

-- Check helper function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_user_quiz_stats';

-- Should return: get_user_quiz_stats
```

**Application Verification:**
- Refresh dashboard: http://localhost:3000/dashboard
- Check browser console - should NOT see `PGRST202: Could not find function get_user_quiz_stats`
- Quiz stats widget should display (showing 0 quizzes if none taken)

---

## Phase 3: Enable Vector Extension & Knowledge Base (20 min)

### Step 1: Apply Migration 012 (pgvector + knowledge_base)

**File:** `supabase/migrations/012_enable_vector_and_knowledge_base.sql`

1. Copy entire contents
2. Paste into SQL Editor
3. Click "Run"
4. **Expected Output:**
   ```
   NOTICE: ✅ Migration 012 completed successfully!
   NOTICE: 📦 pgvector extension enabled
   NOTICE: 🗄️ knowledge_base table created with vector(1536) for OpenAI embeddings
   NOTICE: 🔍 Indexes created: B-tree, GIN (tags, metadata, full-text), HNSW (vector)
   NOTICE: ⚡ Helper functions created:
   NOTICE:    - search_knowledge_base (semantic search)
   NOTICE:    - hybrid_search_knowledge_base (vector + full-text)
   NOTICE:    - increment_knowledge_base_views
   NOTICE:    - get_featured_content
   ```

### Step 2: Verify Vector Extension

**Check extension installed:**
```sql
SELECT
  extname as extension_name,
  extversion as version
FROM pg_extension
WHERE extname = 'vector';

-- Expected: vector | 0.5.0 (or similar)
```

**Check knowledge_base table:**
```sql
SELECT
  table_name,
  (SELECT count(*) FROM information_schema.columns
   WHERE table_name = 'knowledge_base') as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'knowledge_base';

-- Expected: knowledge_base | 17
```

**Check vector column:**
```sql
SELECT
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'knowledge_base'
AND column_name = 'embedding';

-- Expected:
-- column_name: embedding
-- data_type: USER-DEFINED
-- udt_name: vector
```

### Step 3: Test Insert (Optional)

**Insert a test knowledge base entry:**
```sql
INSERT INTO knowledge_base (
  title,
  content,
  summary,
  content_type,
  category,
  tags,
  difficulty_level,
  target_roles
) VALUES (
  'What is NIL?',
  'Name, Image, and Likeness (NIL) refers to the right of college athletes to profit from their personal brand. This includes endorsement deals, social media promotions, autograph signings, and other commercial activities using their name, image, or likeness.',
  'Introduction to NIL rights for college athletes',
  'educational_article',
  'nil_basics',
  ARRAY['nil', 'basics', 'introduction', 'college sports'],
  'beginner',
  ARRAY['athlete', 'parent']
)
RETURNING id, title, content_type;
```

**Query it back:**
```sql
SELECT
  id,
  title,
  content_type,
  category,
  tags,
  difficulty_level,
  created_at
FROM knowledge_base
ORDER BY created_at DESC
LIMIT 1;
```

---

## Phase 4: Final Verification (5 min)

### Complete System Check

**Run this comprehensive verification:**
```sql
-- 1. List all newly created tables
SELECT
  table_name,
  (SELECT count(*) FROM information_schema.columns
   WHERE c.table_name = columns.table_name) as columns
FROM information_schema.tables c
WHERE table_schema = 'public'
AND table_name IN (
  'chat_sessions',
  'chat_messages',
  'quiz_questions',
  'user_quiz_progress',
  'knowledge_base'
)
ORDER BY table_name;

-- Expected output:
-- chat_messages      | 8
-- chat_sessions      | 9
-- knowledge_base     | 17
-- quiz_questions     | 14
-- user_quiz_progress | 18


-- 2. Check RLS is enabled on all tables
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'chat_sessions',
  'chat_messages',
  'quiz_questions',
  'user_quiz_progress',
  'knowledge_base'
)
ORDER BY tablename;

-- All should show: rls_enabled = true


-- 3. List all new helper functions
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'get_user_chat_sessions',
  'auto_archive_old_sessions',
  'get_session_messages',
  'search_user_messages',
  'record_quiz_answer',
  'get_user_quiz_stats',
  'get_quiz_session_results',
  'get_recommended_questions',
  'search_knowledge_base',
  'hybrid_search_knowledge_base',
  'increment_knowledge_base_views',
  'get_featured_content'
)
ORDER BY routine_name;

-- Should return 12 functions


-- 4. Check vector extension and indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'knowledge_base'
AND indexname LIKE '%embedding%';

-- Should show HNSW index for vector similarity search
```

### Application Testing

**1. Test Chat System:**
- Visit: http://localhost:3000/dashboard
- Check console - NO 404 errors on chat_sessions
- Click "Start New Conversation"
- Send a message
- Refresh page
- Verify chat persists in Recent AI Conversations widget

**2. Test Quiz System:**
- Visit: http://localhost:3000/dashboard
- Check console - NO PGRST202 errors
- Learning Progress widget displays (even if 0 quizzes)

**3. Test Knowledge Base (via Supabase):**
```sql
-- Test semantic search function (will work once embeddings are added)
SELECT * FROM search_knowledge_base(
  NULL::vector(1536), -- Replace with actual embedding later
  0.5,
  10
);

-- Test featured content function
SELECT * FROM get_featured_content(NULL, 5);
```

---

## Troubleshooting

### Issue: "function update_updated_at_column does not exist"

**Solution:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Issue: "type message_role already exists"

**This is normal** - the migration handles this with:
```sql
DO $$ BEGIN
    CREATE TYPE message_role AS ENUM ('user', 'assistant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
```

### Issue: Vector extension fails to install

**Check permissions:**
```sql
-- You need to be superuser or have CREATE EXTENSION privilege
SELECT current_user, usesuper FROM pg_user WHERE usename = current_user;
```

If you're not a superuser, contact Supabase support or enable it via Dashboard → Database → Extensions.

### Issue: Chat messages not persisting

**Check RLS policies:**
```sql
-- Verify policies exist
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('chat_sessions', 'chat_messages');

-- Should see 4 policies for chat_sessions, 4 for chat_messages
```

---

## Next Steps After Migrations

### 1. Create Embedding Generation API Route

**File:** `app/api/knowledge-base/generate-embeddings/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service-client';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text, id } = await request.json();

    // Generate embedding using OpenAI
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    const embedding = response.data[0].embedding;

    // Update knowledge_base entry with embedding
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('knowledge_base')
      .update({ embedding })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Embedding generation error:', error);
    return NextResponse.json({ error: 'Failed to generate embedding' }, { status: 500 });
  }
}
```

### 2. Implement RAG in Chat

Update chat API to use knowledge base for context:

```typescript
// In your chat API route
const { data: relevantContent } = await supabase.rpc('search_knowledge_base', {
  query_embedding: queryEmbedding,
  match_threshold: 0.7,
  match_count: 5,
});

// Include in system prompt
const systemPrompt = `
You are a NIL (Name, Image, Likeness) expert assistant.

Relevant knowledge:
${relevantContent.map(c => c.content).join('\n\n')}

User question: ${userMessage}
`;
```

### 3. Add Knowledge Base Admin UI

Create pages for:
- `/admin/knowledge-base` - List all entries
- `/admin/knowledge-base/new` - Create new entry
- `/admin/knowledge-base/[id]` - Edit entry

---

## Summary

After completing this guide, you will have:

✅ **Chat System Fully Functional**
- `chat_sessions` and `chat_messages` tables created
- RLS policies enabled
- Chat history persists across sessions
- Helper functions available

✅ **Quiz System Ready**
- `quiz_questions` and `user_quiz_progress` tables created
- Helper functions for stats and recommendations
- Dashboard displays without errors

✅ **Vector Extension Enabled**
- pgvector installed
- `knowledge_base` table with vector(1536) column
- Semantic and hybrid search functions ready
- HNSW index for fast similarity search
- Ready for OpenAI embedding integration

**Total Implementation Time:** ~45 minutes
**Status:** Production-ready infrastructure for AI-powered NIL education platform

---

**Next:** Implement embedding generation pipeline and RAG integration in chat system.
