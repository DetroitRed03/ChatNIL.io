# Onboarding & Badge System Fix Instructions

## Summary of Issues Fixed

### 1. ✅ Array Field Type Mismatch
**Problem**: Database expects `TEXT[]` arrays for `achievements`, but form sends string
**Solution**: Added string-to-array conversion in [app/api/auth/complete-onboarding/route.ts](app/api/auth/complete-onboarding/route.ts#L153-163)

### 2. ✅ Badge System Architecture
**Problem**: Mixed client/server usage causing RLS permission issues
**Solution**: Created separate badge services:
- [lib/badges.ts](lib/badges.ts) - Client-side operations (read badges)
- [lib/badges-server.ts](lib/badges-server.ts) - Server-side operations (award badges)

### 3. ⚠️ Badge RLS Policies (REQUIRES MANUAL FIX)
**Problem**: Badges table RLS policies too restrictive - authenticated users can't read badges
**Solution**: Run SQL script below in Supabase SQL Editor

---

## 🔧 Required Manual Step: Fix Badge RLS Policies

### Instructions:
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the SQL script below
5. Click **Run** or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

### SQL Script to Run:

```sql
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Everyone can read active badges" ON badges;
DROP POLICY IF EXISTS "Service role can manage badges" ON badges;

-- Allow authenticated users to read active badges
CREATE POLICY "Authenticated users can read active badges" ON badges
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Service role has full access for awarding badges
CREATE POLICY "Service role has full access to badges" ON badges
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'badges';
```

### Expected Output:
You should see 2 policies listed:
- `Authenticated users can read active badges` (SELECT, for authenticated users)
- `Service role has full access to badges` (ALL, for service_role)

---

## 🧪 Testing Instructions

After running the SQL script above:

1. **Restart Dev Server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Test Complete Onboarding Flow**:
   - Open http://localhost:3000
   - Sign up with a NEW test email
   - Complete all onboarding steps
   - Fill out the achievements field (will auto-convert to array)
   - Submit onboarding

3. **Verify Success**:
   - ✅ No "malformed array literal" errors
   - ✅ No "permission denied for table badges" errors
   - ✅ Redirect to homepage/profile after completion
   - ✅ Badge "First Steps" awarded (check profile or badges page)
   - ✅ All onboarding data displays on profile page

---

## 🐛 If You Still See Errors

### "Service role client: Not configured" in browser console
**This is NORMAL** - Service role key is server-only and not available in browser. Badge operations will still work via API routes.

### "permission denied for table badges" after running SQL
1. Verify the SQL ran successfully (no errors)
2. Clear browser cache and reload
3. Try logging out and back in (refreshes auth session)
4. Check if user is authenticated (not anonymous)

### "malformed array literal" still occurring
1. Check which field is causing the error (look at server logs)
2. The `achievements` field fix is in place
3. If another array field has issues, let me know which one

---

## 📁 Files Modified

### Code Changes:
- ✅ [lib/badges.ts](lib/badges.ts) - Reverted to client supabase for client-side reads
- ✅ [lib/badges-server.ts](lib/badges-server.ts) - NEW: Server-side badge operations with admin access
- ✅ [app/api/badges/check/route.ts](app/api/badges/check/route.ts) - Updated to use server-side service
- ✅ [app/api/auth/complete-onboarding/route.ts](app/api/auth/complete-onboarding/route.ts) - Added string-to-array conversion for achievements

### Database Changes (Manual):
- ⚠️ [supabase/migrations/014_fix_badge_rls_policies.sql](supabase/migrations/014_fix_badge_rls_policies.sql) - Badge RLS fix (RUN MANUALLY in dashboard)

---

## 🎯 Next Steps

1. **Run the SQL script** in Supabase dashboard (see instructions above)
2. **Restart the dev server** if needed
3. **Test onboarding** with a new account
4. **Verify badge award** and profile data display

If everything works, you're all set! 🎉

If you encounter any issues, check the server logs and browser console for specific error messages.
