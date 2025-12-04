import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createSarahAthlete() {
  console.log('🔧 Creating Sarah Johnson athlete account...\n');

  const email = 'sarah.johnson@test.com';
  const password = 'TestPassword123!';
  const fullName = 'Sarah Johnson';
  const username = 'sarah-johnson';

  // Step 1: Create auth user
  console.log('1️⃣ Creating auth.users account...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      username: username
    }
  });

  if (authError) {
    console.error('❌ Error creating auth user:', authError);
    return;
  }

  const userId = authData.user.id;
  console.log('✅ Auth user created:', userId);

  // Step 2: Create public.users record
  console.log('\n2️⃣ Creating public.users record...');
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email,
      username,
      full_name: fullName,
      role: 'athlete',
      profile_photo_url: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff&size=400',
      onboarding_completed: true,
      created_at: new Date().toISOString()
    });

  if (userError) {
    console.error('❌ Error creating public user:', userError);
    console.log('Continuing anyway - this table might not have all columns');
  } else {
    console.log('✅ Public user created');
  }

  // Step 3: Create athlete_profiles record
  console.log('\n3️⃣ Creating athlete_profiles record...');
  const { error: profileError } = await supabase
    .from('athlete_profiles')
    .insert({
      user_id: userId,
      sport: 'Basketball',
      position: 'Guard',
      school: 'UCLA',
      year: 'Junior',
      height: '5\'9"',
      weight: 145,
      bio: 'Point guard with exceptional court vision and defensive skills. Two-time All-Pac-12 selection.',
      achievements: [
        'All-Pac-12 First Team (2023, 2024)',
        'Team Captain',
        'Academic All-American',
        '1,200+ career points'
      ],
      estimated_fmv: 75000,
      username: username,
      instagram_handle: '@sarahjbasketball',
      instagram_followers: 45000,
      instagram_engagement_rate: 4.8,
      tiktok_handle: '@sarahjhoops',
      tiktok_followers: 82000,
      tiktok_engagement_rate: 6.2,
      twitter_handle: '@SJohnson_UCLA',
      twitter_followers: 15000,
      youtube_channel: null,
      youtube_subscribers: 0,
      total_followers: 142000,
      avg_engagement_rate: 5.5,
      content_categories: ['Sports', 'Fitness', 'Lifestyle', 'Fashion'],
      is_available_for_partnerships: true,
      created_at: new Date().toISOString()
    });

  if (profileError) {
    console.error('❌ Error creating athlete profile:', profileError);
    return;
  }
  console.log('✅ Athlete profile created');

  console.log('\n🎉 SUCCESS! Sarah Johnson account created:\n');
  console.log('📧 Email:', email);
  console.log('🔑 Password:', password);
  console.log('👤 User ID:', userId);
  console.log('🏀 Sport: Basketball - Guard');
  console.log('🎓 School: UCLA');
  console.log('\n✅ You can now log in with these credentials!');
}

createSarahAthlete();
