# Testing Brand Account Login

## Current Issue
Getting "Invalid API key" error when trying to log in with brand accounts.

## Quick Fix

The dev server has been restarted with the correct environment variables. Try logging in again at:

**http://localhost:3000**

## Test Accounts

### Nike Account
- Email: `nike.agency@test.com`
- Password: You'll need to either:
  1. Use the "Forgot Password" link to reset
  2. Or check if there's a default password in the seeding scripts

### Gatorade Account
- Email: `gatorade.agency@test.com`
- Same password options as above

### Local Business Account
- Email: `local.agency@test.com`
- Same password options as above

## If Login Still Fails

### Option 1: Reset Password via Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/auth/users
2. Find the user by email
3. Click "..." menu → "Reset Password"
4. Use the reset link

### Option 2: Create a Password Reset Migration

I can create a migration that sets a known password for these test accounts:

```sql
-- Set password to "TestPassword123!" for brand accounts
UPDATE auth.users
SET encrypted_password = crypt('TestPassword123!', gen_salt('bf'))
WHERE email IN (
  'nike.agency@test.com',
  'gatorade.agency@test.com',
  'local.agency@test.com'
);
```

Let me know if you want me to create this migration!

### Option 3: Check Original Password

The accounts may have been created with a default password. Let me search for it:

```bash
grep -r "TestPassword\|test.*password\|password.*test" scripts/*.ts migrations/*.sql
```

## Environment Variables Status

✅ NEXT_PUBLIC_SUPABASE_URL: Configured correctly
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Configured correctly
✅ SUPABASE_SERVICE_ROLE_KEY: Configured correctly

## Next Steps

1. Try logging in again now that server is restarted
2. If it fails, try password reset
3. Or let me know and I'll create a password-setting migration

The business profiles are definitely there and working - it's just a matter of getting authenticated!
