#!/usr/bin/env tsx
/**
 * Test Login Fix - Verify API route works without PGRST errors
 */

async function testLogin() {
  const email = 'nike.agency@test.com';
  const password = 'Nike2024!';

  console.log('🧪 TESTING LOGIN FIX');
  console.log('='.repeat(80));
  console.log(`\nAttempting login: ${email}\n`);

  try {
    // Step 1: Login
    console.log('1️⃣ Authenticating with Supabase Auth...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const loginResult = await loginResponse.json();
    console.log('Login response status:', loginResponse.status);

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResult);
      return;
    }

    console.log('✅ Authentication successful');
    console.log('User ID:', loginResult.user?.id);

    // Step 2: Fetch Profile
    console.log('\n2️⃣ Fetching user profile...');
    const profileResponse = await fetch('http://localhost:3000/api/auth/get-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: loginResult.user.id })
    });

    const profileResult = await profileResponse.json();
    console.log('Profile response status:', profileResponse.status);

    if (!profileResponse.ok) {
      console.log('❌ Profile fetch failed:', profileResult);

      if (profileResult.details?.includes('PGRST')) {
        console.log('\n⚠️  PGRST ERROR STILL PRESENT');
        console.log('The PostgREST cache issue persists');
      }
      return;
    }

    console.log('✅ Profile fetched successfully!');
    console.log('\n📋 Profile Data:');
    console.log('  Email:', profileResult.profile?.email);
    console.log('  Role:', profileResult.profile?.role);
    console.log('  Company:', profileResult.profile?.company_name);
    console.log('  Onboarding completed:', profileResult.profile?.onboarding_completed);

    if (profileResult.profile?.social_media_stats) {
      console.log('\n📊 Social Media Stats:',
        Array.isArray(profileResult.profile.social_media_stats)
          ? `${profileResult.profile.social_media_stats.length} entries`
          : 'None'
      );
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ LOGIN FIX SUCCESSFUL - No PGRST errors!');
    console.log('='.repeat(80));

  } catch (error: any) {
    console.error('💥 Test failed:', error.message);
  }
}

testLogin().catch(console.error);
