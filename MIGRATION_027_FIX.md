# Migration 027 Fix - User Roles ENUM Update

## ❌ Error You Encountered

```
ERROR: 22P02: invalid input value for enum user_role: "agency"
```

## 🔍 Root Cause

Your database has a `user_role` ENUM type that only contains `'athlete'` and `'parent'`. The previous migration 027 was trying to add a CHECK constraint without updating the underlying ENUM type first.

## ✅ Fix Applied

I've updated migration 027 to properly handle the `user_role` ENUM by:

1. **Adding missing values to the ENUM** (agency, school, business)
2. **Using conditional logic** to check if values already exist
3. **Adding a CHECK constraint** as a safety measure

## 🚀 How to Apply the Fixed Migration

### Option 1: Run Updated Consolidated File (Recommended)

The consolidated file has been regenerated with the fix:

```bash
# Copy this file
cat migrations/phase-5-consolidated.sql
```

Then paste into **Supabase SQL Editor**:
https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql

### Option 2: Run Just Migration 027 Individually

If you've already applied migrations 022-025, just run this one:

```bash
# Copy this file
cat migrations/phase-5-fmv-system/027_update_user_roles.sql
```

## 📋 What the Fixed Migration Does

```sql
-- 1. Adds 'agency' to user_role ENUM (if not exists)
ALTER TYPE user_role ADD VALUE 'agency';

-- 2. Adds 'school' to user_role ENUM (if not exists)
ALTER TYPE user_role ADD VALUE 'school';

-- 3. Adds 'business' to user_role ENUM (if not exists)
ALTER TYPE user_role ADD VALUE 'business';

-- 4. Adds CHECK constraint for safety
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role::TEXT IN ('athlete', 'parent', 'agency', 'school', 'business'));
```

## 🧪 Verify the Fix

After running the migration, verify it worked:

```sql
-- Check ENUM values
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
ORDER BY enumsortorder;

-- Expected output:
-- athlete
-- parent
-- agency
-- school
-- business
```

## 🎯 Next Steps

1. **Clear any previous failed migration attempts** (if needed):
   ```sql
   -- Only if migration 027 partially failed
   ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
   ```

2. **Run the updated migration** (Option 1 or 2 above)

3. **Continue with remaining migrations** (028, 029) if desired

4. **Run seed script**:
   ```bash
   npm run seed:phase5
   ```

## 💡 Why This Happened

When you first set up the database, the `user_role` ENUM was created with only:
- `'athlete'`
- `'parent'`

Later migrations added the `'agency'` role, but migration 027 was written assuming the ENUM didn't exist or was a TEXT column. The fix now properly handles the ENUM type.

## ⚠️ Note About Business Role

Remember that we marked the **business role as NOT IMPLEMENTED** (migration 026). While the ENUM includes `'business'`, there's no frontend implementation for it. Local businesses should use the `'agency'` role instead.

If you want to remove 'business' from the ENUM later:

```sql
-- WARNING: This is complex with ENUMs and requires recreating the type
-- Only do this if you're sure no data uses 'business' role

-- 1. Convert column to TEXT temporarily
ALTER TABLE users ALTER COLUMN role TYPE TEXT;

-- 2. Drop and recreate ENUM
DROP TYPE user_role;
CREATE TYPE user_role AS ENUM ('athlete', 'parent', 'agency', 'school');

-- 3. Convert back to ENUM
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;
```

But for now, just leave it - it's harmless.
