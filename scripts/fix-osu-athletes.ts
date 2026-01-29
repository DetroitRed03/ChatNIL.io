import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    });
  } catch (e) {}
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function fixAthletes() {
  console.log('=== Fixing OSU Athletes ===\n');

  const institutionId = '8789bfd2-4e63-4cae-9ccd-3591161c1336';
  const agencyId = '3f270e9b-cc2b-48a0-b82e-52fdf1094879';

  // Check the FK reference by looking at existing data
  const { data: existingDeal } = await supabase
    .from('nil_deals')
    .select('athlete_id')
    .limit(1)
    .single();

  console.log('Existing deal athlete_id:', existingDeal?.athlete_id);

  // Check if it matches user_id in athlete_profiles
  const { data: matchedProfile } = await supabase
    .from('athlete_profiles')
    .select('id, user_id, username')
    .eq('user_id', existingDeal?.athlete_id || '')
    .single();

  console.log('Matched profile:', matchedProfile);
  console.log('FK appears to reference: athlete_profiles.user_id');

  // Get OSU athletes
  const { data: athletes } = await supabase
    .from('athlete_profiles')
    .select('id, username, user_id')
    .eq('institution_id', institutionId)
    .eq('role', 'college_athlete');

  console.log('\nFound', athletes?.length, 'OSU athletes');

  // Check auth.users
  const { data: authData } = await supabase.auth.admin.listUsers();
  const authIds = new Set(authData.users.map(u => u.id));

  console.log('\nChecking OSU athletes in auth.users:');
  for (const a of athletes || []) {
    console.log('  ' + a.username + ': user_id=' + a.user_id + ', in_auth=' + authIds.has(a.user_id));
  }

  for (const athlete of athletes || []) {
    console.log('\nProcessing:', athlete.username, '(user_id:', athlete.user_id, ')');

    // Check if they have a profiles entry
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', athlete.user_id)
      .maybeSingle();

    if (!profile) {
      console.log('  Creating profiles entry...');
      const { error: createErr } = await supabase
        .from('profiles')
        .insert({
          id: athlete.user_id,
          role: 'college_athlete',
          institution_id: institutionId
        });

      if (createErr) {
        console.log('  Error creating profile:', createErr.message);
        continue;
      }
      console.log('  Profile created');
    } else {
      console.log('  Profile already exists');
    }

    // Check for existing deals
    const { data: existingDeals } = await supabase
      .from('nil_deals')
      .select('id')
      .eq('athlete_id', athlete.user_id);

    if (existingDeals && existingDeals.length > 0) {
      console.log('  Already has', existingDeals.length, 'deals');
      continue;
    }

    // Add a deal
    const deals = [
      { title: 'Nike Sponsorship', brand: 'Nike', amount: 5000, status: 'green' },
      { title: 'Car Dealership', brand: 'Bobs Auto', amount: 2500, status: 'yellow' },
      { title: 'Energy Drink', brand: 'PowerBoost', amount: 1500, status: 'red' },
    ];
    const deal = deals[Math.floor(Math.random() * deals.length)];

    const { error: dealErr } = await supabase.from('nil_deals').insert({
      athlete_id: athlete.user_id,
      agency_id: agencyId,
      deal_title: deal.title,
      third_party_name: deal.brand,
      brand_name: deal.brand,
      compensation_amount: deal.amount,
      deal_type: 'sponsorship',
      status: 'active',
      institution_id: institutionId
    });

    if (dealErr) {
      console.log('  Error adding deal:', dealErr.message);
    } else {
      console.log('  Added deal:', deal.title);

      // Get the deal and add compliance score
      const { data: newDeal } = await supabase
        .from('nil_deals')
        .select('id')
        .eq('athlete_id', athlete.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (newDeal) {
        const scoreVal = deal.status === 'green' ? 85 : deal.status === 'yellow' ? 65 : 35;
        await supabase.from('compliance_scores').insert({
          deal_id: newDeal.id,
          user_id: athlete.user_id,
          total_score: scoreVal,
          status: deal.status,
          policy_fit_score: scoreVal,
          document_score: scoreVal,
          fmv_score: scoreVal
        });
        console.log('  Added compliance score:', deal.status);
      }
    }
  }

  console.log('\n=== Done ===');
}

fixAthletes().catch(console.error);
