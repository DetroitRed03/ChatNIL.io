# ChatNIL Migration Workflow

**Problem Solved**: You no longer need to manually paste migrations into Supabase! Claude can now run migrations programmatically for you.

## 🚀 One-Time Setup (Do This Once)

Run this command to initialize the migration system:

```bash
npx tsx scripts/init-migrations.ts
```

This will:
1. Copy SQL to your clipboard automatically
2. Give you the Supabase SQL Editor link
3. Tell you exactly what to do

**All you need to do:**
- Open the link it gives you
- Paste (Cmd+V)
- Click "Run"

That's it! After this one-time setup, migrations work automatically.

---

## 📝 Running Migrations (After Setup)

Once the setup is done, Claude or you can run any migration with a single command:

### Method 1: Simple Shell Script
```bash
./migrate.sh migrations/your-migration.sql
```

### Method 2: TypeScript Script
```bash
npx tsx scripts/run-migration.ts migrations/your-migration.sql
```

Both methods do the same thing - pick whichever you prefer!

---

## 🔧 How It Works

### The `exec_sql` Function
The one-time setup creates a PostgreSQL function called `exec_sql` that allows programmatic SQL execution with proper permissions.

### The Migration Runner
The `run-migration.ts` script:
1. Reads your SQL file
2. Splits it into statements
3. Executes each statement via `exec_sql`
4. Handles errors gracefully
5. Reports success/failure

### Smart Error Handling
The script automatically:
- ✅ Skips "already exists" errors (idempotent migrations)
- ✅ Shows clear error messages with context
- ✅ Validates environment variables
- ✅ Checks file existence before running

---

## 📋 Example Usage

### Running a New Migration
```bash
# Create your migration file
vim migrations/100_add_new_feature.sql

# Run it
./migrate.sh migrations/100_add_new_feature.sql
```

### What You'll See
```
🚀 ChatNIL Migration Runner
═══════════════════════════════════════════════════════════════════
📂 File: migrations/100_add_new_feature.sql
🌐 Database: https://enbuwffusjhpcyoveewb.supabase.co
═══════════════════════════════════════════════════════════════════

📖 Reading migration file...
   ✅ Loaded 1523 characters

⚡ Executing migration...

   [1/5] CREATE TABLE new_feature ...
        ✅ Success
   [2/5] CREATE INDEX idx_new_feature ...
        ✅ Success
   [3/5] ALTER TABLE users ADD COLUMN ...
        ⚠️  Already exists (skipping)
   [4/5] CREATE POLICY new_feature_policy ...
        ✅ Success
   [5/5] GRANT SELECT ON new_feature ...
        ✅ Success

═══════════════════════════════════════════════════════════════════
📊 MIGRATION SUMMARY
═══════════════════════════════════════════════════════════════════
✅ Executed: 4 statements
⚠️  Skipped: 1 statements (already exist)

🎉 Migration completed successfully!
```

---

## 🔥 Troubleshooting

### "exec_sql function does not exist"
You need to run the one-time setup:
```bash
npx tsx scripts/init-migrations.ts
```

### "Missing environment variables"
Make sure `.env.local` exists with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://enbuwffusjhpcyoveewb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### "Migration file not found"
Check the path - it should be relative to project root:
```bash
./migrate.sh migrations/my-file.sql  # ✅ Correct
./migrate.sh my-file.sql             # ❌ Wrong
```

### Permission Errors
The service role key in `.env.local` must have full database access.

---

## 🎯 Why This Is Better

### Before (Manual Process)
1. Create SQL file
2. Open Supabase Dashboard
3. Navigate to SQL Editor
4. Copy SQL from file
5. Paste into editor
6. Click Run
7. Check for errors
8. Repeat for each migration

**Time per migration: ~2-3 minutes**

### After (Automated)
1. Create SQL file
2. Run: `./migrate.sh migrations/file.sql`

**Time per migration: ~5 seconds**

### For Claude
Claude can now:
- ✅ Create migration files
- ✅ Run them automatically
- ✅ Handle errors
- ✅ Verify success

No more asking you to manually paste SQL!

---

## 🗂️ File Reference

| File | Purpose |
|------|---------|
| `scripts/init-migrations.ts` | One-time setup - creates exec_sql function |
| `scripts/run-migration.ts` | Main migration runner |
| `migrate.sh` | Simple shell wrapper for migrations |
| `scripts/setup-exec-sql.ts` | Alternative setup method (if needed) |

---

## 🔄 Database Switch Process

If you switch to a new Supabase database:

1. Update `.env.local` with new credentials
2. Run the one-time setup again:
   ```bash
   npx tsx scripts/init-migrations.ts
   ```
3. That's it! Migrations will work with the new database.

---

## 💡 Pro Tips

### Batch Migrations
Run multiple migrations in sequence:
```bash
./migrate.sh migrations/100_feature.sql && \
./migrate.sh migrations/101_permissions.sql && \
./migrate.sh migrations/102_indexes.sql
```

### Test Before Running
Check your SQL syntax locally:
```bash
cat migrations/your-file.sql | head -50
```

### Idempotent Migrations
Always use `IF NOT EXISTS` in your migrations:
```sql
CREATE TABLE IF NOT EXISTS my_table (...);
ALTER TABLE users ADD COLUMN IF NOT EXISTS new_col text;
```

This makes migrations safe to re-run.

---

## ✅ Summary

**Setup (once)**:
```bash
npx tsx scripts/init-migrations.ts
# Paste into Supabase, click Run
```

**Run migrations (anytime)**:
```bash
./migrate.sh migrations/your-file.sql
```

**That's it!** 🎉
