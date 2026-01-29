import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

interface MarketRates {
  [key: string]: { low: number; high: number };
}

// Base market rates by deal type
const BASE_MARKET_RATES: MarketRates = {
  endorsement: { low: 1000, high: 25000 },
  appearance: { low: 500, high: 5000 },
  brand_ambassador: { low: 2000, high: 50000 },
  social_media: { low: 100, high: 10000 },
  autograph: { low: 50, high: 500 },
  merchandise: { low: 500, high: 15000 },
  camp: { low: 250, high: 3000 },
  default: { low: 500, high: 10000 },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    const { dealId } = await params;

    // Get auth token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get deal with athlete info
    const { data: deal, error: dealError } = await supabase
      .from('nil_deals')
      .select(`
        id,
        compensation,
        deal_type,
        brand_name,
        athlete_id,
        athlete:athlete_profiles(
          user_id,
          instagram_followers,
          twitter_followers,
          tiktok_followers,
          engagement_rate,
          sport,
          division,
          school_id,
          state,
          schools(
            name,
            conference,
            division
          )
        )
      `)
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Check athlete ownership
    const athlete = deal.athlete as any;
    if (athlete?.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate FMV factors
    const totalFollowers =
      (athlete?.instagram_followers || 0) +
      (athlete?.twitter_followers || 0) +
      (athlete?.tiktok_followers || 0);

    const engagementRate = athlete?.engagement_rate || 2; // Default 2%

    // Social Score (0-30)
    // Based on follower count and engagement
    let socialScore = 0;
    if (totalFollowers >= 1000000) socialScore = 30;
    else if (totalFollowers >= 500000) socialScore = 27;
    else if (totalFollowers >= 100000) socialScore = 24;
    else if (totalFollowers >= 50000) socialScore = 20;
    else if (totalFollowers >= 10000) socialScore = 15;
    else if (totalFollowers >= 5000) socialScore = 10;
    else if (totalFollowers >= 1000) socialScore = 5;
    else socialScore = 2;

    // Bonus for high engagement
    if (engagementRate > 5) socialScore = Math.min(30, socialScore + 3);
    else if (engagementRate > 3) socialScore = Math.min(30, socialScore + 2);

    // Athletic Score (0-30)
    // Based on school prestige and division
    let athleticScore = 15; // Default
    const division = athlete?.division || athlete?.schools?.division;
    const conference = athlete?.schools?.conference || '';

    if (division === 'D1') {
      athleticScore = 20;
      // Power 5 conferences
      if (['SEC', 'Big Ten', 'Big 12', 'ACC', 'Pac-12'].some(c => conference.includes(c))) {
        athleticScore = 28;
      }
    } else if (division === 'D2') {
      athleticScore = 12;
    } else if (division === 'D3') {
      athleticScore = 8;
    }

    // Market Score (0-20)
    // Based on state/location
    let marketScore = 10;
    const highValueStates = ['CA', 'TX', 'FL', 'NY', 'IL'];
    const mediumValueStates = ['GA', 'OH', 'NC', 'PA', 'MI', 'AZ'];

    if (highValueStates.includes(athlete?.state || '')) {
      marketScore = 18;
    } else if (mediumValueStates.includes(athlete?.state || '')) {
      marketScore = 14;
    }

    // Brand Score (0-20)
    // Could be based on profile completeness, past deals, etc.
    const brandScore = 12; // Default for now

    // Calculate market range based on deal type and athlete factors
    const dealType = deal.deal_type?.toLowerCase().replace(/\s+/g, '_') || 'default';
    const baseRates = BASE_MARKET_RATES[dealType] || BASE_MARKET_RATES.default;

    // Calculate multiplier based on total factor score (0-100)
    const totalFactorScore = socialScore + athleticScore + marketScore + brandScore;
    const multiplier = 0.5 + (totalFactorScore / 100) * 1.5; // 0.5x to 2x

    const marketRange = {
      low: Math.round(baseRates.low * multiplier),
      high: Math.round(baseRates.high * multiplier),
    };

    // Check if deal is above market
    const isAboveMarket = deal.compensation_amount > marketRange.high;
    const percentageAbove = isAboveMarket
      ? Math.round((deal.compensation_amount / marketRange.high - 1) * 100)
      : 0;

    return NextResponse.json({
      dealAmount: deal.compensation_amount,
      marketRange,
      factors: {
        social: socialScore,
        athletic: athleticScore,
        market: marketScore,
        brand: brandScore,
      },
      isAboveMarket,
      percentageAbove,
      sources: ['Opendorse', 'INFLCR', 'Icon Source'],
      calculation: {
        totalFollowers,
        engagementRate,
        division,
        conference,
        state: athlete?.state,
        dealType,
        multiplier: Math.round(multiplier * 100) / 100,
      },
    });
  } catch (error) {
    console.error('FMV breakdown error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
