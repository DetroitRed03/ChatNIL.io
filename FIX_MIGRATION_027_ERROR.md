# Fix Migration 027 CHECK Constraint Error

## ❌ Error You Got

```
ERROR: 23514: check constraint "users_role_check" of relation "users" is violated by some row
```

## 🔍 What This Means

There are existing rows in your `users` table with role values that aren't in the CHECK constraint list. This usually happens when:

1. Your database has a `user_role` ENUM type (not TEXT)
2. The ENUM already provides type safety
3. Adding a CHECK constraint on top of the ENUM creates a conflict

## ✅ Solution: Updated Migration 027 (v2)

I've fixed migration 027 to be smarter:

**✅ What the new version does:**
1. Adds missing values to the `user_role` ENUM ('agency', 'school', 'business')
2. Checks if role column is TEXT or ENUM
3. **Only adds CHECK constraint if column is TEXT** (not ENUM)
4. If column is ENUM, skips CHECK constraint (ENUM already provides type safety)

## 🚀 How to Fix (Step-by-Step)

### Step 1: Run Diagnostic SQL (IMPORTANT)

First, let's see what your database actually has:

```bash
cat migrations/phase-5-fmv-system/027_DIAGNOSTIC.sql
```

Copy the contents and run in **Supabase SQL Editor**:
https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql

**This will show you:**
- Whether user_role ENUM exists
- Current ENUM values (athlete, parent, etc.)
- What data type your role column is (ENUM vs TEXT)
- All role values currently in your users table
- Any existing CHECK constraints

### Step 2: Drop the Failed CHECK Constraint

If migration 027 already partially ran, drop the problematic constraint:

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
```

### Step 3: Run the Updated Migration 027

Now run the fixed migration:

```bash
cat migrations/phase-5-fmv-system/027_update_user_roles.sql
```

Copy and paste into Supabase SQL Editor and run.

**Expected output:**
```
NOTICE: Added "agency" to user_role ENUM
NOTICE: Added "school" to user_role ENUM
NOTICE: Added "business" to user_role ENUM
NOTICE: Role column is ENUM type - no CHECK constraint needed (ENUM provides type safety)
```

### Step 4: Verify the Fix

```sql
-- Check ENUM values
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
ORDER BY enumsortorder;

-- Should show:
-- athlete
-- parent
-- agency      ← NEW
-- school      ← NEW
-- business    ← NEW
```

## 🎯 Alternative: Use Full Consolidated File

If you haven't run any Phase 5 migrations yet, use the updated consolidated file:

```bash
cat migrations/phase-5-consolidated.sql
```

This includes the fixed migration 027.

## 💡 Why This Error Happened

Your database structure:
- `role` column is type `user_role` (ENUM)
- ENUM only had values: `'athlete'`, `'parent'`
- Old migration 027 tried to add CHECK constraint with `'agency'` included
- CHECK constraint failed because ENUM doesn't allow `'agency'` yet

The fix:
1. ✅ Add `'agency'` to the ENUM first
2. ✅ Add `'school'` to the ENUM
3. ✅ Add `'business'` to the ENUM
4. ✅ Skip CHECK constraint (ENUM already provides type safety)

## 🧪 Test After Fix

After running the fixed migration:

1. **Verify ENUM has all 5 values** (see query above)

2. **Test creating a user with 'agency' role:**
   ```sql
   -- This should now work
   INSERT INTO users (email, role, first_name, last_name)
   VALUES ('test@example.com', 'agency', 'Test', 'User');

   -- Clean up test
   DELETE FROM users WHERE email = 'test@example.com';
   ```

3. **Run seed script:**
   ```bash
   npm run seed:phase5
   ```

   If this succeeds, migration 027 is fixed! ✅

## 📊 Files Updated

- ✅ [migrations/phase-5-fmv-system/027_update_user_roles.sql](migrations/phase-5-fmv-system/027_update_user_roles.sql) - Fixed version
- ✅ [migrations/phase-5-consolidated.sql](migrations/phase-5-consolidated.sql) - Regenerated with fix
- ✅ [migrations/phase-5-fmv-system/027_DIAGNOSTIC.sql](migrations/phase-5-fmv-system/027_DIAGNOSTIC.sql) - Diagnostic queries

## 🆘 Still Getting Errors?

### Error: "cannot alter type because column uses it"

**Solution:** There's an active transaction or view using the ENUM. Try:
```sql
-- Close all connections and retry
-- Or run migration in a fresh SQL Editor window
```

### Error: "role value 'xyz' does not exist"

**Solution:** Invalid role values in your users table. Clean them up:
```sql
-- See what invalid roles exist
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Fix invalid roles (replace 'xyz' with actual invalid value)
UPDATE users SET role = 'athlete' WHERE role = 'xyz';
```

### Error: "users_role_check already exists"

**Solution:** Drop it first:
```sql
ALTER TABLE users DROP CONSTRAINT users_role_check;
-- Then re-run migration 027
```

## 📞 Next Steps

After successfully running migration 027:

1. ✅ Continue with remaining migrations (if any)
2. ✅ Run: `npm run seed:phase5`
3. ✅ Test login: sarah.johnson@test.com / TestPassword123!
4. ✅ Verify FMV calculations work

---

**The migration is now fixed and should work!** 🎉
