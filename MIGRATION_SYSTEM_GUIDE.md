# Migration System Guide

## Quick Reference

### Run a Migration
```bash
./migrate.sh path/to/migration.sql
```

### Examples
```bash
# Run a specific migration
./migrate.sh migrations/040_agency_platform.sql

# Run from supabase folder
./migrate.sh supabase/migrations/complete_schema_setup.sql

# Run any SQL file
./migrate.sh my-custom-migration.sql
```

---

## How It Works

1. **exec_sql Function**: A PL/pgSQL function installed in your database that can execute DDL/DML
2. **run-migration.ts**: TypeScript script that reads SQL file and executes via exec_sql
3. **migrate.sh**: Simple shell wrapper for convenience

### The exec_sql Function
```sql
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
  RETURN 'Success';
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;
```

**Important:** The parameter name is `query` (not `sql_query`)!

---

## Setting Up on a New Database

If you need to set up the migration system on a fresh Supabase database:

```bash
# Run the init script
npx tsx scripts/init-migrations.ts

# It will copy SQL to your clipboard
# Then paste it into Supabase Dashboard > SQL Editor > Run
```

---

## Migration File Format

Your SQL files can contain:
- Multiple statements separated by semicolons
- Comments (-- or /* */)
- DDL (CREATE, ALTER, DROP)
- DML (INSERT, UPDATE, DELETE)
- Functions and triggers
- Transactions (BEGIN/COMMIT)

Example:
```sql
-- Create a new table
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL
);

-- Add an index
CREATE INDEX idx_my_table_name ON my_table(name);

-- Success message
SELECT 'Migration complete!' as message;
```

---

## Tips

### Smart Statement Detection
The migration runner intelligently splits statements:
- Handles multiline statements
- Respects function boundaries ($$, $BODY$, etc.)
- Preserves BEGIN...END blocks

### Error Handling
- If a statement fails, you'll see the exact error
- "Already exists" errors are treated as warnings, not failures
- Other errors stop execution

### Schema Cache
If you create/modify tables and get "table not found" errors:
```bash
./migrate.sh migrations/999_reload_schema.sql
```

This forces Supabase PostgREST to reload the schema cache.

---

## Troubleshooting

### "exec_sql function does not exist"
Run the init script:
```bash
npx tsx scripts/init-migrations.ts
# Then paste SQL into Supabase Dashboard
```

### "Invalid API key"
Check your `.env.local` has the correct Supabase credentials:
```bash
cat .env.local | grep SUPABASE
```

### "Permission denied"
The exec_sql function uses `SECURITY DEFINER` to run with elevated privileges. If you still get permission errors, check your RLS policies.

### "Could not find table in schema cache"
Run schema reload:
```bash
./migrate.sh migrations/999_reload_schema.sql
```

---

## No More Manual Pasting!

You'll never need to manually copy-paste migrations into Supabase Dashboard again. The migration system handles everything automatically.

Just run:
```bash
./migrate.sh path/to/your/migration.sql
```

And you're done!
