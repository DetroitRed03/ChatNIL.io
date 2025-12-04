/**
 * Diagnose Profile Completion Issues
 *
 * Fetches Sarah's profile and shows:
 * 1. What data exists in database
 * 2. What the profile completion calculator sees
 * 3. What's missing for 100% completion
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function diagnoseProfile() {
  console.log('🔍 Diagnosing Profile Completion for Sarah...\n');

  const sarahId = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

  // Fetch all profile data
  console.log('📊 Fetching profile data from all tables...\n');

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', sarahId)
    .single();

  const { data: athleteData } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', sarahId)
    .maybeSingle();

  const { data: socialStats } = await supabase
    .from('social_media_stats')
    .select('*')
    .eq('user_id', sarahId)
    .maybeSingle();

  console.log('═══════════════════════════════════════════════════════');
  console.log('USERS TABLE DATA');
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ first_name:', userData?.first_name || '❌ MISSING');
  console.log('✅ last_name:', userData?.last_name || '❌ MISSING');
  console.log('✅ email:', userData?.email || '❌ MISSING');
  console.log('✅ phone:', userData?.phone || '❌ MISSING');
  console.log('✅ date_of_birth:', userData?.date_of_birth || '❌ MISSING');
  console.log('✅ school_name:', userData?.school_name || '❌ MISSING');
  console.log('');

  console.log('═══════════════════════════════════════════════════════');
  console.log('ATHLETE_PROFILES TABLE DATA');
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ sport:', athleteData?.sport || '❌ MISSING');
  console.log('✅ position:', athleteData?.position || '❌ MISSING');
  console.log('✅ school:', athleteData?.school || '❌ MISSING');
  console.log('✅ year:', athleteData?.year || '❌ MISSING');
  console.log('✅ bio:', athleteData?.bio ? `"${athleteData.bio.substring(0, 50)}..."` : '❌ MISSING');
  console.log('✅ major:', athleteData?.major || '❌ MISSING');
  console.log('✅ gpa:', athleteData?.gpa || '❌ MISSING');
  console.log('✅ graduation_year:', athleteData?.graduation_year || '❌ MISSING');
  console.log('✅ achievements:', athleteData?.achievements ?
    `${Array.isArray(athleteData.achievements) ? athleteData.achievements.length : 0} items` : '❌ MISSING');
  console.log('✅ nil_interests:', athleteData?.nil_interests ?
    `${Array.isArray(athleteData.nil_interests) ? athleteData.nil_interests.length : 0} items` : '❌ MISSING');
  console.log('✅ nil_concerns:', athleteData?.nil_concerns ?
    `${Array.isArray(athleteData.nil_concerns) ? athleteData.nil_concerns.length : 0} items` : '❌ MISSING');
  console.log('✅ nil_goals:', athleteData?.nil_goals ?
    `${Array.isArray(athleteData.nil_goals) ? athleteData.nil_goals.length : 0} items` : '❌ MISSING');
  console.log('✅ content_samples:', athleteData?.content_samples ?
    `${Array.isArray(athleteData.content_samples) ? athleteData.content_samples.length : 0} items` : '❌ MISSING');
  console.log('');

  console.log('═══════════════════════════════════════════════════════');
  console.log('SOCIAL_MEDIA_STATS TABLE DATA');
  console.log('═══════════════════════════════════════════════════════');
  if (socialStats) {
    console.log('✅ instagram_followers:', socialStats.instagram_followers?.toLocaleString() || '0');
    console.log('✅ tiktok_followers:', socialStats.tiktok_followers?.toLocaleString() || '0');
    console.log('✅ twitter_followers:', socialStats.twitter_followers?.toLocaleString() || '0');
    console.log('✅ youtube_subscribers:', socialStats.youtube_subscribers?.toLocaleString() || '0');
    console.log('✅ total_followers:', socialStats.total_followers?.toLocaleString() || '0');
    console.log('✅ engagement_rate:', socialStats.engagement_rate + '%' || '0%');
  } else {
    console.log('❌ No social media stats found');
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════');
  console.log('PROFILE COMPLETION SCORE BREAKDOWN');
  console.log('═══════════════════════════════════════════════════════');

  let score = 0;
  const breakdown: string[] = [];

  // Personal Info (20 points)
  if (userData?.first_name && userData?.last_name) {
    score += 5;
    breakdown.push('✅ Name: +5 points');
  } else {
    breakdown.push('❌ Name: 0 points (missing)');
  }

  if (userData?.email) {
    score += 5;
    breakdown.push('✅ Email: +5 points');
  } else {
    breakdown.push('❌ Email: 0 points (missing)');
  }

  if (userData?.phone) {
    score += 5;
    breakdown.push('✅ Phone: +5 points');
  } else {
    breakdown.push('❌ Phone: 0 points (missing)');
  }

  if (athleteData?.bio && athleteData.bio.length > 50) {
    score += 5;
    breakdown.push(`✅ Bio (${athleteData.bio.length} chars): +5 points`);
  } else {
    breakdown.push(`❌ Bio: 0 points (${athleteData?.bio?.length || 0} chars, need 50+)`);
  }

  // School Info (15 points)
  if (userData?.school_name) {
    score += 5;
    breakdown.push('✅ School Name: +5 points');
  } else {
    breakdown.push('❌ School Name: 0 points (missing)');
  }

  if (athleteData?.graduation_year) {
    score += 5;
    breakdown.push('✅ Graduation Year: +5 points');
  } else {
    breakdown.push('❌ Graduation Year: 0 points (missing)');
  }

  if (athleteData?.major || athleteData?.gpa) {
    score += 5;
    breakdown.push('✅ Major/GPA: +5 points');
  } else {
    breakdown.push('❌ Major/GPA: 0 points (missing)');
  }

  // Athletic Info (20 points)
  if (athleteData?.sport) {
    score += 7;
    breakdown.push('✅ Sport: +7 points');
  } else {
    breakdown.push('❌ Sport: 0 points (missing)');
  }

  if (athleteData?.position) {
    score += 7;
    breakdown.push('✅ Position: +7 points');
  } else {
    breakdown.push('❌ Position: 0 points (missing)');
  }

  if (athleteData?.achievements && Array.isArray(athleteData.achievements) && athleteData.achievements.length > 0) {
    score += 6;
    breakdown.push(`✅ Achievements (${athleteData.achievements.length} items): +6 points`);
  } else {
    breakdown.push('❌ Achievements: 0 points (missing or empty)');
  }

  // Social Media (25 points)
  let socialPlatforms = 0;
  if (socialStats) {
    if (socialStats.instagram_followers > 0) socialPlatforms++;
    if (socialStats.tiktok_followers > 0) socialPlatforms++;
    if (socialStats.twitter_followers > 0) socialPlatforms++;
    if (socialStats.youtube_subscribers > 0) socialPlatforms++;
  }
  const socialScore = Math.min(socialPlatforms * 8, 25);
  score += socialScore;
  breakdown.push(`${socialScore > 0 ? '✅' : '❌'} Social Media (${socialPlatforms} platforms): +${socialScore} points`);

  // NIL Preferences (10 points)
  if (athleteData?.nil_interests && Array.isArray(athleteData.nil_interests) && athleteData.nil_interests.length > 0) {
    score += 5;
    breakdown.push(`✅ NIL Interests (${athleteData.nil_interests.length} items): +5 points`);
  } else {
    breakdown.push('❌ NIL Interests: 0 points (missing or empty)');
  }

  if (athleteData?.nil_concerns && Array.isArray(athleteData.nil_concerns) && athleteData.nil_concerns.length > 0) {
    score += 5;
    breakdown.push(`✅ NIL Concerns (${athleteData.nil_concerns.length} items): +5 points`);
  } else {
    breakdown.push('❌ NIL Concerns: 0 points (missing or empty)');
  }

  // Content (10 points)
  if (athleteData?.content_samples && Array.isArray(athleteData.content_samples) && athleteData.content_samples.length > 0) {
    score += 10;
    breakdown.push(`✅ Content Samples (${athleteData.content_samples.length} items): +10 points`);
  } else {
    breakdown.push('❌ Content Samples: 0 points (missing or empty)');
  }

  console.log(breakdown.join('\n'));
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`TOTAL SCORE: ${score}/100 (${Math.min(score, 100)}%)`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  if (score < 100) {
    console.log('📝 TO REACH 100%:');
    console.log('─────────────────────────────────────────────────────');
    breakdown.filter(line => line.startsWith('❌')).forEach(line => {
      console.log(line.replace('❌', '  →'));
    });
  } else {
    console.log('🎉 Profile is 100% complete!');
  }
}

diagnoseProfile().catch(console.error);
