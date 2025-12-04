#!/usr/bin/env tsx

/**
 * Seed using direct SQL via exec_sql RPC
 * This bypasses RLS since we're using service role
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedAthletePublicProfiles() {
  console.log('🎯 Seeding Athlete Public Profiles via SQL...');

  // Get all athletes with their social stats
  const { data: athletes, error: athletesError } = await supabase
    .from('users')
    .select('id, first_name, last_name, primary_sport, position, school_name, school_level, graduation_year, bio, lifestyle_interests, content_creation_interests, brand_affinity')
    .eq('role', 'athlete');

  if (athletesError) {
    console.error('❌ Error fetching athletes:', athletesError);
    return;
  }

  const { data: socialStats, error: socialError } = await supabase
    .from('social_media_stats')
    .select('*');

  if (socialError) {
    console.error('❌ Error fetching social stats:', socialError);
    return;
  }

  console.log(`Found ${athletes.length} athletes and ${socialStats.length} social stats`);

  // Generate SQL INSERT statements
  const values: string[] = [];

  for (const athlete of athletes) {
    const athleteSocial = socialStats.filter(s => s.user_id === athlete.id);
    const totalFollowers = athleteSocial.reduce((sum, s) => sum + s.followers, 0);
    const avgEngagement = athleteSocial.reduce((sum, s) => sum + s.engagement_rate, 0) / (athleteSocial.length || 1);

    // Calculate FMV in cents
    let fmvMin: number, fmvMax: number;
    if (totalFollowers < 5000) { fmvMin = 50000; fmvMax = 150000; }
    else if (totalFollowers < 25000) { fmvMin = 150000; fmvMax = 500000; }
    else if (totalFollowers < 100000) { fmvMin = 500000; fmvMax = 1500000; }
    else if (totalFollowers < 500000) { fmvMin = 1500000; fmvMax = 5000000; }
    else { fmvMin = 5000000; fmvMax = 20000000; }

    const instagramStats = athleteSocial.find(s => s.platform === 'instagram');
    const tiktokStats = athleteSocial.find(s => s.platform === 'tiktok');
    const twitterStats = athleteSocial.find(s => s.platform === 'twitter');
    const youtubeStats = athleteSocial.find(s => s.platform === 'youtube');

    // Random US state for demo
    const states = ['KY', 'CA', 'TX', 'FL', 'NY', 'OH', 'IN', 'TN', 'IL', 'PA'];
    const state = states[Math.floor(Math.random() * states.length)];

    values.push(`(
      '${athlete.id}',
      '${(athlete.first_name + ' ' + athlete.last_name).replace(/'/g, "''")}',
      ${athlete.bio ? `'${athlete.bio.replace(/'/g, "''")}'` : 'NULL'},
      '${athlete.primary_sport || 'Basketball'}',
      ${athlete.position ? `'${athlete.position}'` : 'NULL'},
      '${athlete.school_name.replace(/'/g, "''")}',
      '${athlete.school_level || 'college'}',
      ${athlete.graduation_year || 2026},
      '${state}',
      ${instagramStats ? instagramStats.followers : 0},
      ${instagramStats ? instagramStats.engagement_rate * 100 : 0},
      ${tiktokStats ? tiktokStats.followers : 0},
      ${tiktokStats ? tiktokStats.engagement_rate * 100 : 0},
      ${twitterStats ? twitterStats.followers : 0},
      ${youtubeStats ? youtubeStats.followers : 0},
      ${fmvMin},
      ${fmvMax},
      ${avgEngagement * 100},
      ARRAY[${athlete.content_creation_interests?.map(c => `'${c.replace(/'/g, "''")}'`).join(',') || ''}]::text[],
      ARRAY[${athlete.brand_affinity?.map(b => `'${b.replace(/'/g, "''")}'`).join(',') || ''}]::text[],
      ${Math.random() > 0.2},
      ${Math.floor(Math.random() * 41) + 60},
      ${Math.floor(Math.random() * 47) + 2}
    )`);
  }

  const insertSQL = `
    INSERT INTO athlete_public_profiles (
      user_id, display_name, bio, sport, position,
      school_name, school_level, graduation_year, state,
      instagram_followers, instagram_engagement_rate,
      tiktok_followers, tiktok_engagement_rate,
      twitter_followers, youtube_subscribers,
      estimated_fmv_min, estimated_fmv_max, avg_engagement_rate,
      content_categories, brand_values,
      is_available_for_partnerships, response_rate, avg_response_time_hours
    ) VALUES ${values.join(',\n')}
    ON CONFLICT (user_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      instagram_followers = EXCLUDED.instagram_followers,
      tiktok_followers = EXCLUDED.tiktok_followers,
      updated_at = NOW();
  `;

  const { error } = await supabase.rpc('exec_sql', {
    query: insertSQL
  });

  if (error) {
    console.error('❌ Error seeding:', error);
  } else {
    console.log(`✅ Seeded ${athletes.length} athlete public profiles`);
  }
}

seedAthletePublicProfiles();
