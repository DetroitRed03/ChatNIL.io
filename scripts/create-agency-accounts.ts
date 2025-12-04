import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define agencies with both user data and agency profile data
const agencyAccounts = [
  {
    user: {
      email: 'contact@elitesportsmanagement.com',
      first_name: 'Elite Sports',
      last_name: 'Management',
      role: 'agency'
    },
    agency: {
      company_name: 'Elite Sports Management',
      agency_type: 'sports_marketing',
      industry: 'Sports & Entertainment',
      company_size: '50-200',
      website: 'https://elitesportsmanagement.com',
      logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
      description: 'Leading NIL agency specializing in basketball and football athletes. Focus on brand partnerships and social media growth.'
    }
  },
  {
    user: {
      email: 'hello@athletebrandcollective.com',
      first_name: 'Athlete Brand',
      last_name: 'Collective',
      role: 'agency'
    },
    agency: {
      company_name: 'Athlete Brand Collective',
      agency_type: 'brand_management',
      industry: 'Marketing & Branding',
      company_size: '20-50',
      website: 'https://athletebrandcollective.com',
      logo_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200',
      description: 'Boutique agency focused on building authentic athlete brands. Expertise in content creation and influencer marketing.'
    }
  },
  {
    user: {
      email: 'team@nextlevelnil.com',
      first_name: 'Next Level',
      last_name: 'NIL Partners',
      role: 'agency'
    },
    agency: {
      company_name: 'Next Level NIL Partners',
      agency_type: 'nil_collective',
      industry: 'Sports Marketing',
      company_size: '10-20',
      website: 'https://nextlevelnil.com',
      logo_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=200',
      description: 'NIL collective connecting athletes with local and national brands. Strong focus on compliance and education.'
    }
  },
  {
    user: {
      email: 'info@westcoastathleteagency.com',
      first_name: 'West Coast',
      last_name: 'Athlete Agency',
      role: 'agency'
    },
    agency: {
      company_name: 'West Coast Athlete Agency',
      agency_type: 'talent_agency',
      industry: 'Sports & Entertainment',
      company_size: '100-500',
      website: 'https://westcoastathleteagency.com',
      logo_url: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200',
      description: 'Full-service talent agency representing top athletes. Specializes in high-profile endorsements and media opportunities.'
    }
  },
  {
    user: {
      email: 'contact@socialimpactsports.org',
      first_name: 'Social Impact',
      last_name: 'Sports',
      role: 'agency'
    },
    agency: {
      company_name: 'Social Impact Sports',
      agency_type: 'social_impact',
      industry: 'Sports & Social Good',
      company_size: '5-10',
      website: 'https://socialimpactsports.org',
      logo_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200',
      description: 'Mission-driven agency connecting athletes with cause-related campaigns. Focus on social justice and community engagement.'
    }
  },
  {
    user: {
      email: 'partners@premiernilgroup.com',
      first_name: 'Premier',
      last_name: 'NIL Group',
      role: 'agency'
    },
    agency: {
      company_name: 'Premier NIL Group',
      agency_type: 'nil_collective',
      industry: 'Sports Marketing',
      company_size: '20-50',
      website: 'https://premiernilgroup.com',
      logo_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200',
      description: 'Premier NIL collective with exclusive partnerships. Focus on high-value deals for top-tier athletes.'
    }
  },
  {
    user: {
      email: 'digital@athletesnetwork.com',
      first_name: 'Digital Athletes',
      last_name: 'Network',
      role: 'agency'
    },
    agency: {
      company_name: 'Digital Athletes Network',
      agency_type: 'digital_marketing',
      industry: 'Digital Marketing',
      company_size: '10-20',
      website: 'https://digitalathletesnetwork.com',
      logo_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200',
      description: 'Digital-first agency specializing in social media growth and content monetization. TikTok and Instagram experts.'
    }
  },
  {
    user: {
      email: 'support@hometownheroescollective.com',
      first_name: 'Hometown Heroes',
      last_name: 'Collective',
      role: 'agency'
    },
    agency: {
      company_name: 'Hometown Heroes Collective',
      agency_type: 'nil_collective',
      industry: 'Community Sports',
      company_size: '5-10',
      website: 'https://hometownheroescollective.com',
      logo_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200',
      description: 'Local-focused NIL collective connecting athletes with hometown businesses. Strong community ties.'
    }
  }
];

async function createAgencyAccounts() {
  console.log('🏢 CREATING AGENCY ACCOUNTS\n');
  console.log('='.repeat(80));
  console.log('\n');

  const createdAgencies: Array<{userId: string, agencyName: string}> = [];
  let successCount = 0;
  let errorCount = 0;

  for (const account of agencyAccounts) {
    console.log(`📝 Creating: ${account.agency.company_name}`);

    // 1. Create auth user (required for agencies.id FK)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: account.user.email,
      email_confirm: true,
      user_metadata: {
        first_name: account.user.first_name,
        last_name: account.user.last_name,
        role: 'agency'
      }
    });

    if (authError || !authData.user) {
      console.log(`   ❌ Auth user creation failed: ${authError?.message}\n`);
      errorCount++;
      continue;
    }

    const userId = authData.user.id;
    console.log(`   ✅ Auth user created (ID: ${userId.substring(0, 8)}...)`);

    // 2. Create public.users record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: account.user.email,
        first_name: account.user.first_name,
        last_name: account.user.last_name,
        role: 'agency',
        onboarding_completed: true
      });

    if (userError) {
      console.log(`   ⚠️  Public user record: ${userError.message}`);
      // Continue anyway - agency might still work with just auth user
    } else {
      console.log(`   ✅ Public user record created`);
    }

    // 3. Create agency profile
    const { error: agencyError } = await supabase
      .from('agencies')
      .insert({
        id: userId, // Foreign key to auth.users.id
        ...account.agency
      });

    if (agencyError) {
      console.log(`   ❌ Agency profile failed: ${agencyError.message}`);
      // Clean up
      await supabase.from('users').delete().eq('id', userId);
      await supabase.auth.admin.deleteUser(userId);
      console.log(`   🧹 Cleaned up user account\n`);
      errorCount++;
      continue;
    }

    console.log(`   ✅ Agency profile created`);
    console.log(`   📧 Email: ${account.user.email}`);
    console.log(`   🏷️  Type: ${account.agency.agency_type}\n`);

    createdAgencies.push({
      userId,
      agencyName: account.agency.company_name
    });
    successCount++;
  }

  console.log('='.repeat(80));
  console.log(`📊 RESULTS: ${successCount}/${agencyAccounts.length} agencies created`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}\n`);

  if (createdAgencies.length > 0) {
    console.log('✅ CREATED AGENCIES:');
    createdAgencies.forEach(({ agencyName, userId }) => {
      console.log(`   • ${agencyName} (${userId.substring(0, 8)}...)`);
    });
    console.log('\n🔜 NEXT STEPS:');
    console.log('   1. Create campaigns for these agencies');
    console.log('   2. Create NIL deals for Sarah Johnson');
    console.log('   3. Generate agency-athlete matches');
    console.log('   4. Test matchmaking system\n');
  }

  return createdAgencies;
}

createAgencyAccounts().catch(console.error);
