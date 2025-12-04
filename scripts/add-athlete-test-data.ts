import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function addAthleteTestData() {
  console.log('🏀 Adding test data for Sarah Johnson...\n');

  try {
    // Find Sarah Johnson
    const { data: sarah, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'sarah.johnson@test.com')
      .single();

    if (findError || !sarah) {
      console.error('❌ Sarah Johnson not found');
      return;
    }

    console.log('✅ Found Sarah Johnson:', sarah.id);

    // Update with comprehensive test data
    const { data: updated, error: updateError} = await supabase
      .from('users')
      .update({
        // Ensure username exists
        username: 'sarah-johnson',

        // Bio
        bio: 'Division I Basketball player at University of Kentucky. 2x All-Conference selection with a passion for community engagement and youth basketball development. Partnering with brands that share my values of teamwork, excellence, and giving back.',

        // Athletic info
        primary_sport: 'Basketball',
        position: 'Point Guard',

        // Achievements
        achievements: [
          '2x All-SEC First Team (2023, 2024)',
          'SEC All-Freshman Team (2022)',
          'Team Captain (2024)',
          'NCAA Tournament Sweet 16 (2023)',
          '500+ career assists',
          'Community Service Award (2023)',
        ],

        // Social media stats
        social_media_stats: {
          instagram: {
            handle: 'sarah.hoops',
            followers: 87500,
            engagement_rate: 4.8,
          },
          tiktok: {
            handle: 'sarahhoops23',
            followers: 124000,
            engagement_rate: 7.2,
          },
          twitter: {
            handle: 'SJohnson_UK',
            followers: 42300,
            engagement_rate: 3.5,
          },
        },

        // Content creation interests
        content_creation_interests: [
          'Sports Training',
          'Game Day Vlogs',
          'Fitness & Nutrition',
          'Fashion & Style',
          'Campus Life',
          'Mental Health Advocacy',
        ],

        // Lifestyle interests
        lifestyle_interests: [
          'Basketball',
          'Fitness',
          'Fashion',
          'Photography',
          'Music',
          'Travel',
        ],

        // Causes
        causes_care_about: [
          'Youth Sports Access',
          'Mental Health Awareness',
          'Gender Equality in Sports',
          'Education',
        ],

        // Brand affinity
        brand_affinity: [
          'Nike',
          'Gatorade',
          'Apple',
          'Target',
          'Chipotle',
        ],

        // Calculate total followers
        total_followers: 87500 + 124000 + 42300, // 253,800

        // Average engagement rate
        avg_engagement_rate: (4.8 + 7.2 + 3.5) / 3, // ~5.17%

        // Profile completion score
        profile_completion_score: 85,

        updated_at: new Date().toISOString(),
      })
      .eq('id', sarah.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating profile:', updateError);
      return;
    }

    console.log('\n✅ Successfully updated Sarah Johnson\'s profile!');
    console.log('\n📊 Profile Summary:');
    console.log('   Username: sarah-johnson');
    console.log('   Sport: Basketball (Point Guard)');
    console.log('   School: University of Kentucky');
    console.log('   Total Followers: 253,800');
    console.log('   Avg Engagement: 5.17%');
    console.log('   Achievements: 6 items');
    console.log('   Profile Completion: 85%');

    console.log('\n🌐 View public profile at:');
    console.log('   http://localhost:3000/athletes/sarah-johnson');

    console.log('\n✏️ Edit profile at:');
    console.log('   http://localhost:3000/profile');

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

addAthleteTestData();
