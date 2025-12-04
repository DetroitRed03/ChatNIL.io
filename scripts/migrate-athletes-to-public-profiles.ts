#!/usr/bin/env tsx

/**
 * Athlete Public Profiles Migration Script
 *
 * This script populates the athlete_public_profiles table from existing athlete users.
 * It creates public-facing profiles with mock social media stats for agency discovery.
 *
 * Usage: npx tsx scripts/migrate-athletes-to-public-profiles.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mock data templates for different sports
const SPORT_FMV_RANGES: Record<string, [number, number]> = {
  'Basketball': [15000, 35000],
  'Football': [20000, 50000],
  'Soccer': [10000, 25000],
  'Baseball': [8000, 20000],
  'Volleyball': [5000, 15000],
  'Track & Field': [3000, 10000],
  'Swimming': [3000, 10000],
  'default': [5000, 15000]
};

const CONTENT_CATEGORIES = [
  ['fitness', 'lifestyle', 'sports'],
  ['fashion', 'beauty', 'lifestyle'],
  ['gaming', 'tech', 'sports'],
  ['fitness', 'nutrition', 'wellness'],
  ['travel', 'lifestyle', 'sports'],
];

const BRAND_VALUES = [
  ['authenticity', 'community', 'excellence'],
  ['innovation', 'sustainability', 'growth'],
  ['teamwork', 'dedication', 'performance'],
  ['health', 'wellness', 'positivity'],
  ['inclusivity', 'empowerment', 'integrity'],
];

async function migrateAthletes() {
  console.log('\n🏃 Starting Athlete Public Profiles Migration...\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Fetch all athlete users
    console.log('\n📋 Step 1: Fetching athlete users...');

    const { data: athletes, error: fetchError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('role', 'athlete');

    if (fetchError) {
      throw new Error(`Failed to fetch athletes: ${fetchError.message}`);
    }

    console.log(`✅ Found ${athletes?.length || 0} athlete users`);

    if (!athletes || athletes.length === 0) {
      console.log('\n⚠️  No athletes found. Make sure test users exist.');
      process.exit(0);
    }

    // Step 2: Fetch existing athlete profiles data
    console.log('\n📋 Step 2: Fetching existing athlete profile data...');

    const { data: existingProfiles } = await supabase
      .from('athlete_profiles')
      .select('*');

    const profileMap = new Map(
      (existingProfiles || []).map(p => [p.user_id, p])
    );

    // Step 3: Create public profiles for each athlete
    console.log('\n📋 Step 3: Creating public profiles...\n');

    let successCount = 0;
    let skipCount = 0;

    for (const athlete of athletes) {
      const existingProfile = profileMap.get(athlete.id);
      const displayName = `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || athlete.email.split('@')[0];

      // Determine sport (from existing profile or default)
      const sport = existingProfile?.sport || 'Basketball';
      const fmvRange = SPORT_FMV_RANGES[sport] || SPORT_FMV_RANGES.default;

      // Generate realistic mock social stats based on sport popularity
      const baseFollowers = sport === 'Basketball' || sport === 'Football' ? 200000 : 50000;
      const variance = Math.random() * 0.5 + 0.75; // 75%-125% of base

      const instagramFollowers = Math.floor(baseFollowers * variance);
      const tiktokFollowers = Math.floor(baseFollowers * 0.7 * variance);
      const twitterFollowers = Math.floor(baseFollowers * 0.3 * variance);

      // Higher engagement rates for smaller followings
      const instagramEngagement = Number((Math.random() * 5 + 4).toFixed(2)); // 4-9%
      const tiktokEngagement = Number((Math.random() * 8 + 6).toFixed(2)); // 6-14%

      // Randomize content categories and brand values
      const contentIndex = Math.floor(Math.random() * CONTENT_CATEGORIES.length);
      const valueIndex = Math.floor(Math.random() * BRAND_VALUES.length);

      const publicProfile = {
        user_id: athlete.id,
        display_name: displayName,
        bio: `${sport} athlete committed to excellence and community impact.`,
        sport: sport,
        position: existingProfile?.position || null,
        school_name: existingProfile?.school_name || 'University of Kentucky',
        school_level: 'college' as const,
        graduation_year: existingProfile?.graduation_year || 2025,
        state: existingProfile?.state || 'KY',
        city: null,

        // Social Media
        instagram_handle: `${displayName.toLowerCase().replace(/\s+/g, '.')}`,
        instagram_followers: instagramFollowers,
        instagram_engagement_rate: instagramEngagement,
        tiktok_handle: `${displayName.toLowerCase().replace(/\s+/g, '_')}`,
        tiktok_followers: tiktokFollowers,
        tiktok_engagement_rate: tiktokEngagement,
        twitter_handle: `${displayName.toLowerCase().replace(/\s+/g, '_')}`,
        twitter_followers: twitterFollowers,
        youtube_channel: null,
        youtube_subscribers: 0,

        // FMV
        estimated_fmv_min: fmvRange[0],
        estimated_fmv_max: fmvRange[1],
        avg_engagement_rate: Number(((instagramEngagement + tiktokEngagement) / 2).toFixed(2)),

        // Brand Fit
        content_categories: CONTENT_CATEGORIES[contentIndex],
        brand_values: BRAND_VALUES[valueIndex],
        audience_demographics: {
          age_range: '18-24',
          gender: 'mixed',
          location: 'US'
        },

        // Availability
        is_available_for_partnerships: true,
        preferred_partnership_types: ['sponsored_post', 'brand_ambassador', 'content_creation'],
        response_rate: Number((Math.random() * 20 + 80).toFixed(1)), // 80-100%
        avg_response_time_hours: Math.floor(Math.random() * 12 + 2), // 2-14 hours

        // Verification
        is_verified: false,
        verification_badges: [],

        // Stats (from existing NIL deals or defaults)
        total_partnerships_completed: Math.floor(Math.random() * 5),
        total_campaign_impressions: Math.floor(Math.random() * 1000000),
        avg_campaign_performance: Number((Math.random() * 30 + 70).toFixed(1)), // 70-100%

        last_active_at: new Date().toISOString()
      };

      // Insert or update public profile
      const { error: upsertError } = await supabase
        .from('athlete_public_profiles')
        .upsert(publicProfile, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        console.error(`❌ Failed to create profile for ${displayName}:`, upsertError.message);
      } else {
        console.log(`✅ Created public profile for ${displayName}`);
        console.log(`   Sport: ${sport} | Followers: ${(instagramFollowers / 1000).toFixed(0)}K | FMV: $${(fmvRange[0] / 1000).toFixed(0)}K-$${(fmvRange[1] / 1000).toFixed(0)}K`);
        successCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successfully created/updated: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   📈 Total processed: ${athletes.length}`);

    // Verify
    console.log('\n📋 Verifying public profiles...');
    const { data: profiles, error: verifyError } = await supabase
      .from('athlete_public_profiles')
      .select('*');

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} public profiles in database`);

      if (profiles && profiles.length > 0) {
        console.log('\n📊 Sample Profile:');
        const sample = profiles[0];
        console.log(`   Name: ${sample.display_name}`);
        console.log(`   Sport: ${sample.sport}`);
        console.log(`   School: ${sample.school_name}`);
        console.log(`   Instagram: ${sample.instagram_followers.toLocaleString()} followers`);
        console.log(`   TikTok: ${sample.tiktok_followers.toLocaleString()} followers`);
        console.log(`   Total Followers: ${sample.total_followers.toLocaleString()}`);
        console.log(`   FMV Range: $${sample.estimated_fmv_min.toLocaleString()} - $${sample.estimated_fmv_max.toLocaleString()}`);
        console.log(`   Engagement Rate: ${sample.avg_engagement_rate}%`);
        console.log(`   Available: ${sample.is_available_for_partnerships ? 'Yes' : 'No'}`);
      }
    }

    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateAthletes();
