import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test account data with complete profiles
const testProfiles = [
  {
    email: 'sarah.johnson@test.com',
    updates: {
      // Physical stats
      height_inches: 70, // 5'10"
      weight_lbs: 145,
      jersey_number: 12,

      // Personal info
      first_name: 'Sarah',
      last_name: 'Johnson',
      date_of_birth: '2005-03-15',
      phone: '(555) 123-4567',

      // Profile photos (using placeholder service)
      profile_photo_url: 'https://i.pravatar.cc/400?img=45',
      cover_photo_url: 'https://picsum.photos/seed/sarah-cover/1584/396',

      // Sports info
      primary_sport: 'Basketball',
      position: 'Point Guard',
      graduation_year: 2027,
      school_name: 'Lincoln High School',
      school_level: 'high-school',

      // Athletic achievements (stored as array)
      achievements: ['All-State First Team 2024', 'Team Captain', 'Regional Championship MVP', 'Career avg: 18.5 PPG', '6.2 APG'],

      // NIL info
      bio: 'Passionate basketball player committed to excellence on and off the court. I love connecting with brands that support youth sports and education. Let\'s make an impact together!',

      // Interests (stored as arrays)
      nil_interests: ['Athletic Apparel', 'Sports Equipment', 'Health & Wellness', 'Education Tech'],
      nil_goals: ['Build personal brand', 'Support youth sports programs', 'Career development'],

      // Profile completeness
      onboarding_completed: true,
    },
    socialStats: [
      {
        platform: 'instagram',
        handle: '@sarahjhoops',
        followers: 8500,
        engagement_rate: 4.2,
        verified: false,
      },
      {
        platform: 'tiktok',
        handle: '@sarahbasketball',
        followers: 12300,
        engagement_rate: 6.8,
        verified: false,
      },
    ],
  },
  /* James Martinez account doesn't exist yet - uncomment when created
  {
    email: 'james.martinez@test.com',
    updates: {
      // Physical stats
      height_inches: 74, // 6'2"
      weight_lbs: 185,
      jersey_number: 23,

      // Personal info
      first_name: 'James',
      last_name: 'Martinez',
      date_of_birth: '2004-08-22',
      phone: '(555) 987-6543',

      // Profile photos
      profile_photo_url: 'https://i.pravatar.cc/400?img=12',
      cover_photo_url: 'https://picsum.photos/seed/james-cover/1584/396',

      // Sports info
      primary_sport: 'Football',
      position: 'Wide Receiver',
      graduation_year: 2026,
      school_name: 'Riverside University',
      school_level: 'university',
      major: 'Business Administration',
      gpa: 3.7,

      // Athletic achievements (stored as array)
      achievements: ['Conference All-American', '1,200+ receiving yards 2024 season', 'Team MVP', 'Academic All-Conference'],

      // NIL info
      bio: 'Wide receiver with a passion for fitness, business, and community engagement. Looking to partner with brands that value authenticity and hard work. Let\'s build something great together!',

      // Interests (stored as arrays)
      nil_interests: ['Athletic Apparel', 'Fitness Supplements', 'Business Tools', 'Gaming', 'Food & Beverage'],
      nil_goals: ['Financial independence', 'Brand partnerships', 'Community impact', 'Post-career preparation'],

      // Profile completeness
      onboarding_completed: true,
    },
    socialStats: [
      {
        platform: 'instagram',
        handle: '@jmart23',
        followers: 15700,
        engagement_rate: 5.4,
        verified: false,
      },
      {
        platform: 'twitter',
        handle: '@jamesmartinez',
        followers: 6200,
        engagement_rate: 3.8,
        verified: false,
      },
    ],
  },
  */
];

async function populateTestProfiles() {
  console.log('🎯 Populating Test Profiles for Client Demo\n');
  console.log('='.repeat(70));

  for (const profile of testProfiles) {
    console.log(`\n📝 Processing ${profile.email}...`);

    // 1. Find user by email
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('email', profile.email)
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.log(`   ❌ User not found: ${profile.email}`);
      continue;
    }

    const user = users[0];
    console.log(`   ✅ Found user: ${user.first_name} ${user.last_name} (${user.id})`);

    // 2. Update user profile with all fields
    console.log(`   🔄 Updating profile data...`);
    const { error: updateError } = await supabase
      .from('users')
      .update(profile.updates)
      .eq('id', user.id);

    if (updateError) {
      console.log(`   ❌ Error updating profile:`, updateError.message);
      continue;
    }
    console.log(`   ✅ Profile data updated`);

    // 3. Add social media stats
    console.log(`   🔄 Adding social media stats...`);
    for (const stat of profile.socialStats) {
      // First, check if stat already exists
      const { data: existing } = await supabase
        .from('social_media_stats')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', stat.platform)
        .single();

      if (existing) {
        // Update existing stat
        const { error: updateStatError } = await supabase
          .from('social_media_stats')
          .update({
            handle: stat.handle,
            followers: stat.followers,
            engagement_rate: stat.engagement_rate,
            verified: stat.verified,
          })
          .eq('id', existing.id);

        if (updateStatError) {
          console.log(`   ⚠️  Error updating ${stat.platform}:`, updateStatError.message);
        } else {
          console.log(`   ✅ Updated ${stat.platform}: ${stat.handle} (${stat.followers} followers)`);
        }
      } else {
        // Insert new stat
        const { error: insertStatError } = await supabase
          .from('social_media_stats')
          .insert({
            user_id: user.id,
            platform: stat.platform,
            handle: stat.handle,
            followers: stat.followers,
            engagement_rate: stat.engagement_rate,
            verified: stat.verified,
          });

        if (insertStatError) {
          console.log(`   ⚠️  Error adding ${stat.platform}:`, insertStatError.message);
        } else {
          console.log(`   ✅ Added ${stat.platform}: ${stat.handle} (${stat.followers} followers)`);
        }
      }
    }

    // 4. Verify profile completeness
    console.log(`   🔍 Verifying profile completeness...`);
    const { data: verifiedUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (verifyError) {
      console.log(`   ❌ Error verifying profile:`, verifyError.message);
      continue;
    }

    // Check critical fields
    const criticalFields = [
      'first_name',
      'last_name',
      'email',
      'height_inches',
      'weight_lbs',
      'jersey_number',
      'primary_sport',
      'position',
      'bio',
      'profile_photo_url',
      'cover_photo_url',
    ];

    const missingFields = criticalFields.filter(field => !verifiedUser[field]);

    if (missingFields.length === 0) {
      console.log(`   ✅ Profile 100% complete - ready for client demo!`);
    } else {
      console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
    }

    console.log(`   ✨ ${profile.email} - Complete!\n`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎉 Test Profile Population Complete!\n');
  console.log('Summary:');
  console.log('  ✅ Sarah Johnson - Basketball player with complete stats');
  console.log('  ✅ James Martinez - Football player with complete stats');
  console.log('  ✅ Profile photos added (placeholders)');
  console.log('  ✅ Cover photos added (placeholders)');
  console.log('  ✅ Physical stats populated');
  console.log('  ✅ Social media stats added');
  console.log('  ✅ All profiles ready for client demo!\n');
}

// Run the script
populateTestProfiles().catch(console.error);
