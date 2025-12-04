# Brand & Business Accounts Summary

## ✅ Site Status
- **Dev Server**: Running at http://localhost:3000
- **Status**: All systems operational

## 👟 Nike Account

**Login Credentials:**
- Email: `nike.agency@test.com`
- Role: Agency
- Password: Use password reset or check seeding scripts

**Business Profile:**
- ✅ Profile Created
- Business Name: Nike
- Type: National Brand
- Industry: Athletic Footwear & Apparel
- Description: "Just Do It. Nike is the world's leading athletic footwear and apparel brand, empowering athletes at every level."
- Website: https://www.nike.com
- Contact: partnerships@nike.com
- Location: Beaverton, OR

## 🥤 Gatorade Account

**Login Credentials:**
- Email: `gatorade.agency@test.com`
- Role: Agency
- Password: Use password reset or check seeding scripts

**Business Profile:**
- ✅ Profile Created
- Business Name: Gatorade
- Type: National Brand
- Industry: Sports Nutrition
- Description: "Fuel your performance. Gatorade is the #1 sports drink scientifically formulated to refuel, rehydrate, and replenish."
- Website: https://www.gatorade.com
- Contact: partnerships@gatorade.com
- Location: Chicago, IL

## 🏪 Local Business Account

**Login Credentials:**
- Email: `local.agency@test.com`
- Role: Agency
- Password: Use password reset or check seeding scripts

**Business Profile:**
- ✅ Profile Created
- Business Name: Campus Connections Marketing
- Type: Local Business
- Industry: Marketing & Advertising
- Description: "Your local partner for authentic athlete marketing. We connect college athletes with local businesses for genuine community partnerships."
- Website: https://campusconnections.local
- Contact: hello@campusconnections.local
- Location: College Station, TX

## 🔧 What Was Done

### Migrations Applied:
1. **201_add_brand_business_profiles.sql** - Created business profiles for all three accounts
2. **202_grant_business_profiles_permissions.sql** - Granted proper table permissions

### Database Changes:
- ✅ Nike business profile inserted
- ✅ Gatorade business profile inserted
- ✅ Campus Connections (local business) profile inserted
- ✅ Permissions granted on business_profiles table

## 📊 All Available Test Accounts

### Athletes (14 accounts)
- sarah.johnson@test.com
- marcus.williams@test.com
- emma.garcia@test.com
- olivia.brown@test.com
- Plus 10 more seeded athlete accounts

### Agencies (6 accounts)
- **nike.agency@test.com** ✅ (Has profile)
- **gatorade.agency@test.com** ✅ (Has profile)
- **local.agency@test.com** ✅ (Has profile)
- team@sportsbrand.co
- hello@nilpros.com
- contact@athletex.com

## 🔑 How to Access

1. Navigate to: http://localhost:3000
2. Click "Sign In"
3. Use one of the brand account emails above
4. Use password reset if needed, or check original seeding scripts for passwords

## 🎯 Testing Recommendations

### Nike Account - Test Scenarios:
- National brand partnership campaigns
- Multi-state athlete recruiting
- High-budget NIL deals
- Performance-based contracts

### Gatorade Account - Test Scenarios:
- Sports nutrition partnerships
- Event sponsorships
- Social media campaigns
- Product endorsements

### Local Business Account - Test Scenarios:
- Local athlete partnerships
- Community event promotion
- Small-budget campaigns ($500-$5,000)
- Regional marketing initiatives

## 🚀 Next Steps

If you want to:
1. **Reset passwords** - Use Supabase Auth or create a password reset flow
2. **Add more brands** - Copy migration 201 and modify for new brands
3. **View in admin panel** - Check if you have admin access to view all accounts
4. **Test NIL deals** - Use these accounts to create and manage NIL opportunities

## 📝 Technical Notes

- Business profiles use the `business_profiles` table
- User accounts have role=`agency`
- All profiles linked via `id` field (references `users.id`)
- Permissions granted to service_role for API access

## 🔍 Verification

Run these scripts to verify:
```bash
# Check all accounts
npx tsx scripts/check-accounts.ts

# Check specific brand accounts
npx tsx scripts/check-nike-account.ts

# Check business profiles directly
npx tsx scripts/check-agency-profiles-direct.ts
```

---

**Status**: ✅ All brand accounts active and ready for testing!
