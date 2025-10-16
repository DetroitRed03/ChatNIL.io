# ChatNIL Database Migrations

This directory contains SQL migration files for the ChatNIL application database schema.

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended for Development)
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file in order:
   - `01_initial_schema.sql`
   - `02_row_level_security.sql`
   - `03_helper_functions.sql`
4. Execute each migration

### Option 2: Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Apply migrations
supabase db push
```

### Option 3: Manual Application
Connect to your Supabase database using your preferred PostgreSQL client and execute the migration files in order.

## Migration Files

### 01_initial_schema.sql
- Creates custom types (`user_role`, `message_role`)
- Creates all core tables (users, profiles, chat tables)
- Sets up indexes for performance
- Creates triggers for automatic timestamp updates

### 02_row_level_security.sql
- Enables Row Level Security on all tables
- Creates policies ensuring users can only access their own data
- Implements secure data access patterns

### 03_helper_functions.sql
- Creates utility functions for user profile management
- Implements automatic user profile creation on signup
- Adds functions for chat session management

## Environment Setup

After applying migrations, make sure to:

1. Update your `.env.local` file with your Supabase project details:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Configure Supabase Storage for file uploads (if needed):
   - Create a `chat-attachments` bucket
   - Set up appropriate policies for file access

## Troubleshooting

- If you get permission errors, make sure you're connected as a superuser or have appropriate privileges
- Check that all environment variables are correctly set
- Verify that Row Level Security policies are working by testing with different user contexts

## Next Steps

After applying migrations:
1. Test authentication flows
2. Verify profile creation works correctly
3. Test chat message storage and retrieval
4. Set up file upload storage policies if using file attachments