import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Fetch all athletes
    const { data: athletes, error: athletesError } = await supabase
      .from('users')
      .select('id, first_name, last_name, primary_sport, school_name')
      .eq('user_type', 'athlete');

    if (athletesError) {
      console.error('Error fetching athletes:', athletesError);
      return NextResponse.json(
        { error: athletesError.message },
        { status: 500 }
      );
    }

    if (!athletes || athletes.length === 0) {
      return NextResponse.json(
        { error: 'No athletes found' },
        { status: 404 }
      );
    }

    // Create athlete public profiles
    const profiles = athletes.map(athlete => ({
      user_id: athlete.id,
      visibility: 'public',
      bio: `${athlete.first_name} ${athlete.last_name} - ${athlete.primary_sport} athlete at ${athlete.school_name || 'University'}`,
      achievements: [`${athlete.primary_sport} team member`],
    }));

    const { error: profilesError } = await supabase
      .from('athlete_public_profiles')
      .upsert(profiles, { onConflict: 'user_id' });

    if (profilesError) {
      console.error('Error creating profiles:', profilesError);
      return NextResponse.json(
        { error: profilesError.message },
        { status: 500 }
      );
    }

    // Create sample agency campaigns
    // First, create a demo agency user
    const { data: agencyUser, error: agencyError } = await supabase
      .from('users')
      .upsert([
        {
          email: 'demo-agency@chatnil.io',
          first_name: 'Demo',
          last_name: 'Agency',
          user_type: 'agency',
        }
      ], { onConflict: 'email' })
      .select()
      .single();

    if (agencyError) {
      console.error('Error creating agency:', agencyError);
      return NextResponse.json(
        { error: agencyError.message },
        { status: 500 }
      );
    }

    const campaigns = [
      {
        agency_id: agencyUser.id,
        title: 'Nike Campus Athletes 2024',
        brand_name: 'Nike',
        description: 'Looking for dynamic college athletes to represent Nike on campus. Ideal candidates are leaders in their sport with strong social media presence.',
        campaign_type: 'Brand Ambassador',
        target_sports: ['Football', 'Basketball', 'Track and Field', 'Soccer'],
        budget_min: 5000,
        budget_max: 25000,
        brand_values: ['Innovation', 'Performance', 'Empowerment', 'Excellence'],
        target_demographics: {
          age_range: [18, 24],
          interests: ['Athletics', 'Fashion', 'Fitness', 'Social Media']
        },
        status: 'active'
      },
      {
        agency_id: agencyUser.id,
        title: 'Gatorade Performance Series',
        brand_name: 'Gatorade',
        description: 'Seeking high-performing athletes across multiple sports to showcase Gatorade\'s sports nutrition products. Focus on endurance and recovery.',
        campaign_type: 'Product Endorsement',
        target_sports: ['Football', 'Basketball', 'Soccer', 'Lacrosse', 'Swimming'],
        budget_min: 3000,
        budget_max: 15000,
        brand_values: ['Performance', 'Recovery', 'Endurance', 'Victory'],
        target_demographics: {
          age_range: [18, 23],
          interests: ['Sports Science', 'Training', 'Nutrition', 'Competition']
        },
        status: 'active'
      },
      {
        agency_id: agencyUser.id,
        title: 'Adidas Originals College Collective',
        brand_name: 'Adidas',
        description: 'Building a community of college athletes who embody street style and athletic excellence. Looking for authentic voices in fashion and sports.',
        campaign_type: 'Brand Ambassador',
        target_sports: ['Basketball', 'Soccer', 'Track and Field', 'Baseball'],
        budget_min: 7500,
        budget_max: 30000,
        brand_values: ['Creativity', 'Diversity', 'Authenticity', 'Style'],
        target_demographics: {
          age_range: [18, 24],
          interests: ['Fashion', 'Streetwear', 'Music', 'Social Media', 'Athletics']
        },
        status: 'active'
      },
      {
        agency_id: agencyUser.id,
        title: 'Red Bull Student Athletes',
        brand_name: 'Red Bull',
        description: 'Red Bull is looking for adventurous, high-energy athletes in extreme and traditional sports. Must have creative content skills.',
        campaign_type: 'Content Creation',
        target_sports: ['Skateboarding', 'BMX', 'Snowboarding', 'Football', 'Basketball'],
        budget_min: 4000,
        budget_max: 20000,
        brand_values: ['Adventure', 'Energy', 'Creativity', 'Fearlessness'],
        target_demographics: {
          age_range: [18, 24],
          interests: ['Extreme Sports', 'Content Creation', 'Adventure', 'Events']
        },
        status: 'active'
      },
      {
        agency_id: agencyUser.id,
        title: 'Under Armour WILL Campaign',
        brand_name: 'Under Armour',
        description: 'Seeking determined college athletes with inspiring stories of overcoming adversity. Must embody the WILL to succeed against all odds.',
        campaign_type: 'Brand Ambassador',
        target_sports: ['Football', 'Basketball', 'Lacrosse', 'Baseball', 'Softball'],
        budget_min: 6000,
        budget_max: 22000,
        brand_values: ['Determination', 'Resilience', 'Innovation', 'Empowerment'],
        target_demographics: {
          age_range: [18, 24],
          interests: ['Training', 'Leadership', 'Community', 'Inspiration']
        },
        status: 'active'
      },
      {
        agency_id: agencyUser.id,
        title: 'Degree #BreakingLimits',
        brand_name: 'Degree',
        description: 'Looking for female athletes breaking barriers in their sports. Campaign focuses on empowerment and pushing past limitations.',
        campaign_type: 'Social Media Campaign',
        target_sports: ['Basketball', 'Soccer', 'Track and Field', 'Volleyball', 'Softball'],
        budget_min: 2500,
        budget_max: 12000,
        brand_values: ['Empowerment', 'Confidence', 'Equality', 'Innovation'],
        target_demographics: {
          age_range: [18, 24],
          interests: ['Empowerment', 'Social Causes', 'Athletics', 'Social Media']
        },
        status: 'active'
      }
    ];

    const { error: campaignsError } = await supabase
      .from('agency_campaigns')
      .insert(campaigns);

    if (campaignsError) {
      console.error('Error creating campaigns:', campaignsError);
      return NextResponse.json(
        { error: campaignsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      athletesCreated: profiles.length,
      campaignsCreated: campaigns.length
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { error: error.message || 'Seeding failed' },
      { status: 500 }
    );
  }
}
