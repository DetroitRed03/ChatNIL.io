# Phase 6B: School System - Testing Checklist

## ✅ Database Setup Verification

### Migration Status
- [x] Migration 027 applied successfully
- [x] `schools` table created with all columns
- [x] `users` table extended with school-related columns:
  - `school_created` (boolean)
  - `profile_completion_tier` (text: 'basic' | 'full')
  - `home_completion_required` (boolean)
  - `school_id` (UUID, foreign key)
  - `home_completed_at` (timestamptz)
- [x] Indexes created for performance
- [x] Test school seeded (slug: `test-hs`)

### Database Verification Commands
```bash
# Run these commands to verify setup
npx tsx scripts/verify-phase6b.ts
npx tsx scripts/seed-test-school-sql.ts
```

---

## 📋 Test 1: School Signup Page Loads

### URL to Test
```
http://localhost:3000/school/test-hs/signup
```

### Expected Results
- [ ] Page loads without 404 error
- [ ] School branding displays:
  - [ ] School name: "Test High School"
  - [ ] State: "KY"
  - [ ] Primary color: Blue (#3B82F6)
- [ ] FERPA compliance notice visible
- [ ] Information box showing "What happens after registration?"
- [ ] Signup form displays with 5 fields:
  - [ ] First Name (required)
  - [ ] Last Name (required)
  - [ ] Primary Sport (dropdown, required)
  - [ ] Grade Level (dropdown, required)
  - [ ] Graduation Year (dropdown, required)
- [ ] "Create Account" button visible
- [ ] Privacy notice at bottom mentions FERPA

### Screenshots
- [ ] Take screenshot of full signup page

---

## 📋 Test 2: Create School-Based Student Account

### Test Data
```
First Name: TestStudent
Last Name: Athlete
Sport: Basketball
Grade Level: 11
Graduation Year: 2026
```

### Steps
1. [ ] Fill out signup form with test data
2. [ ] Click "Create Account"
3. [ ] Wait for success screen

### Expected Results
- [ ] Success screen displays with:
  - [ ] Green checkmark icon
  - [ ] "Account Created Successfully!" heading
  - [ ] Welcome message with student's name
  - [ ] Yellow warning box: "IMPORTANT: Save These Credentials"
  - [ ] Temporary email displayed (format: `teststudent.athlete.[number]@school.chatnil.temp`)
  - [ ] Password displayed (format: animal name + 4 digits, e.g., "Tiger1234")
  - [ ] Copy buttons for email and password
  - [ ] Show/hide password toggle
  - [ ] "Next Steps" section with 4 numbered steps
  - [ ] "Go to Login" button

### Actions
- [ ] Copy the temporary email
- [ ] Copy the temporary password
- [ ] Save credentials for next test

### Verification
Navigate to Supabase Dashboard → Users table → Find the new user

Expected user record:
```
first_name: "TestStudent"
last_name: "Athlete"
email: [temp email from above]
role: "athlete"
primary_sport: "Basketball"
graduation_year: 2026
school_name: "Test High School"
school_created: true ✅
profile_completion_tier: "basic" ✅
home_completion_required: true ✅
school_id: [UUID matching test school]
onboarding_completed: false ✅
```

Navigate to Supabase Dashboard → Schools table → Find "Test High School"

Expected update:
```
students_registered: 1 (incremented from 0)
```

---

## 📋 Test 3: Login with School Account

### Steps
1. [ ] Navigate to `http://localhost:3000/login`
2. [ ] Enter temporary email from Test 2
3. [ ] Enter temporary password from Test 2
4. [ ] Click "Sign In"

### Expected Results
- [ ] Login succeeds
- [ ] **Automatically redirects to `/onboarding`** (not dashboard)
- [ ] Console log shows: "🏫 School-created account detected - switching to completion mode"

---

## 📋 Test 4: Home Completion Flow - Welcome Screen

### Expected Results on First Onboarding Screen

**WelcomeBackStep Component Should Display:**
- [ ] Bouncing trophy emoji (🏆)
- [ ] Heading: "Welcome back, TestStudent!"
- [ ] Subtitle mentions "Test High School"
- [ ] Green "What we already have" box showing:
  - [ ] ✓ Name: TestStudent Athlete
  - [ ] ✓ Sport: Basketball
  - [ ] ✓ School: Test High School
  - [ ] ✓ Graduation year: 2026
- [ ] Blue "What we'll ask for" box listing:
  - [ ] Personal email and phone
  - [ ] Athletic details (position, achievements)
  - [ ] Interests and hobbies
  - [ ] Social media accounts
  - [ ] NIL preferences
  - [ ] Content samples (optional)
- [ ] Time estimate: "Takes about 5-7 minutes"
- [ ] Large blue button: "Let's Complete My Profile"

### Actions
- [ ] Click "Let's Complete My Profile"
- [ ] Verify moves to next step

---

## 📋 Test 5: Completion Flow Steps

### Expected Flow (7 steps total, vs 12 in standard)

**Step 1: Welcome Back** ✅ (tested above)

**Step 2: Personal Info**
- [ ] Fields for email and phone
- [ ] First/last name should be prefilled (read-only or hidden)
- [ ] Enter test email: `teststudent@example.com`
- [ ] Enter test phone: `555-1234`

**Step 3: Athletic Details**
- [ ] Position field (enter: "Point Guard")
- [ ] Sport should be prefilled from school signup
- [ ] Stats/achievements (optional)

**Step 4: Interests** (Optional)
- [ ] Select 2-3 hobbies
- [ ] Can skip if desired

**Step 5: Social Media** (Optional)
- [ ] Instagram, Twitter, TikTok fields
- [ ] Can skip or enter test data

**Step 6: NIL Preferences** (Optional)
- [ ] Partnership preferences
- [ ] Deal types of interest

**Step 7: Content Samples** (Optional)
- [ ] Upload content or skip

### Verification Points
- [ ] Progress bar shows 7 steps (not 12)
- [ ] Steps that were already collected at school are skipped
- [ ] Data from school signup is preserved
- [ ] Can complete or skip optional steps

---

## 📋 Test 6: Onboarding Completion

### After Final Step

Expected behavior:
- [ ] "Onboarding Complete" screen displays
- [ ] Redirects to dashboard or profile
- [ ] No more "complete your profile" prompts

### Database Verification

Check Supabase → Users table → TestStudent record:

Expected updates:
```
email: "teststudent@example.com" (updated from temp)
phone: "555-1234"
position: "Point Guard"
interests: [array of selected hobbies]
profile_completion_tier: "full" ✅ (upgraded from "basic")
home_completed_at: [timestamp] ✅ (new)
home_completion_required: false ✅ (changed from true)
onboarding_completed: true ✅
```

Check Supabase → Schools table → "Test High School":

Expected update:
```
students_completed: 1 ✅ (incremented from 0)
```

---

## 📋 Test 7: Dashboard Access After Completion

### Steps
1. [ ] Navigate to `http://localhost:3000/dashboard`
2. [ ] Should load normally (no redirect to onboarding)

### Expected Results
- [ ] Dashboard displays without issues
- [ ] No "complete your profile" banners
- [ ] User can access all features

---

## 📋 Test 8: Regression - Standard Onboarding Still Works

### Purpose
Verify Phase 6B didn't break existing onboarding flow

### Steps
1. [ ] Logout from school account
2. [ ] Create a NEW regular account (not through school)
   - Go to `/signup`
   - Enter email: `regulartest@example.com`
   - Create password
   - Click "Sign Up"
3. [ ] Should see standard role selection
4. [ ] Select "Athlete"
5. [ ] Complete full onboarding

### Expected Results
- [ ] All 12 standard steps appear
- [ ] No "Welcome Back" screen
- [ ] No prefilled data
- [ ] All fields are blank and editable
- [ ] OnboardingContext mode is 'standard' (not 'completion')
- [ ] Console does NOT show "🏫 School-created account detected"

---

## 📋 Test 9: Invalid School Slug

### Steps
1. [ ] Navigate to `http://localhost:3000/school/invalid-slug/signup`

### Expected Results
- [ ] Returns 404 Not Found page
- [ ] Does NOT show signup form

---

## 📋 Test 10: Multiple Student Signups

### Purpose
Verify school statistics update correctly

### Steps
1. [ ] Create 2-3 more students through `/school/test-hs/signup`
2. [ ] Use different names each time
3. [ ] Complete onboarding for at least one of them

### Expected Results in Database

Schools table → "Test High School":
```
students_registered: 4 (or number of signups)
students_completed: 2 (or number completed)
```

---

## 🔧 Troubleshooting Guide

### Issue: School signup page shows 404

**Check:**
- Migration ran successfully?
- Test school exists in database?
- `custom_slug = 'test-hs'`?
- `active = true`?

**Fix:**
```bash
npx tsx scripts/seed-test-school-sql.ts
```

### Issue: "Permission denied" when creating student

**Check:**
- RLS policies on schools table
- Service role key is correct

**Fix:**
```bash
npx tsx scripts/fix-school-permissions.ts
```

### Issue: Welcome screen doesn't show after login

**Check Supabase users table:**
- `school_created = true`?
- `profile_completion_tier = 'basic'`?
- `home_completion_required = true`?

**Check browser console:**
- Look for "🏫 School-created account detected"
- If not present, OnboardingRouter detection isn't working

**Check files:**
- `OnboardingRouter.tsx` has school detection useEffect?
- `OnboardingContext.tsx` has `setMode` and `setPrefillData` methods?

### Issue: Still see all 12 steps instead of 7

**Check:**
- `getOnboardingFlow()` function exists in `lib/onboarding-registry.ts`?
- OnboardingRouter calls `getOnboardingFlow(state.role, state.mode)`?
- Mode is set to 'completion' in console logs?

**Check console:**
```
✅ Completion mode activated with prefilled data
```

### Issue: Profile not upgrading to "full" after completion

**Check:**
- `app/api/auth/complete-onboarding/route.ts` has Phase 6B upgrade logic?
- existingProfile query includes school fields?

**Expected code around line 199:**
```typescript
if (existingProfile.school_created && existingProfile.profile_completion_tier === 'basic') {
  updateData.profile_completion_tier = 'full';
  updateData.home_completion_required = false;
  updateData.home_completed_at = new Date().toISOString();
}
```

---

## ✅ Sign-Off Checklist

### Code Review
- [x] All Phase 6B files created
- [x] TypeScript types include School interface
- [x] User types include school-related fields
- [x] OnboardingContext has mode/prefill support
- [x] OnboardingRouter detects school accounts
- [x] getOnboardingFlow() function exists
- [x] Completion API upgrades profile tier

### Database
- [x] Migration 027 applied
- [x] Schools table exists
- [x] Users table extended
- [x] Test school seeded
- [x] RLS configured

### Build
- [ ] `npm run build` succeeds (Phase 6B files compile)
- [ ] No TypeScript errors in school-related files

### Testing
- [ ] School signup page loads
- [ ] Student account creation works
- [ ] Login with school account redirects to onboarding
- [ ] Welcome screen displays correctly
- [ ] Completion flow has correct steps
- [ ] Profile upgrades to "full" after completion
- [ ] School statistics update
- [ ] Standard onboarding still works

---

## 📊 Test Results Summary

**Date:** __________
**Tester:** __________

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | School signup page loads | ☐ Pass ☐ Fail | |
| 2 | Create school student account | ☐ Pass ☐ Fail | |
| 3 | Login with school account | ☐ Pass ☐ Fail | |
| 4 | Welcome screen displays | ☐ Pass ☐ Fail | |
| 5 | Completion flow (7 steps) | ☐ Pass ☐ Fail | |
| 6 | Onboarding completion | ☐ Pass ☐ Fail | |
| 7 | Dashboard access | ☐ Pass ☐ Fail | |
| 8 | Standard onboarding works | ☐ Pass ☐ Fail | |
| 9 | Invalid slug returns 404 | ☐ Pass ☐ Fail | |
| 10 | Multiple student signups | ☐ Pass ☐ Fail | |

**Overall Status:** ☐ All Tests Pass ☐ Issues Found

**Issues Found:**
_____________________________________________
_____________________________________________
_____________________________________________

**Next Steps:**
_____________________________________________
_____________________________________________
