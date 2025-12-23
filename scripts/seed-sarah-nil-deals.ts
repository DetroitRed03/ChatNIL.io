/**
 * Seed NIL deals for Sarah Johnson
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function seedDeals() {
  console.log('=== SEEDING NIL DEALS FOR SARAH ===\n');

  // Get Sarah's ID
  const { data: sarah, error: sarahErr } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (sarahErr || !sarah) {
    console.log('ERROR: Sarah not found:', sarahErr?.message);
    return;
  }

  console.log('Sarah ID:', sarah.id);

  // Check table structure first
  const { data: tableInfo, error: tableErr } = await supabase
    .from('nil_deals')
    .select('*')
    .limit(1);

  if (tableErr) {
    console.log('Table access error:', tableErr.message);
    console.log('\nAttempting to check table columns...');
  } else {
    console.log('Table accessible. Sample row columns:', tableInfo && tableInfo[0] ? Object.keys(tableInfo[0]).join(', ') : 'No rows');
  }

  // Get an agency ID for the brand
  const { data: agency } = await supabase
    .from('users')
    .select('id, first_name')
    .eq('role', 'agency')
    .limit(1)
    .single();

  console.log('Agency:', agency?.first_name || 'NOT FOUND');

  // Create NIL deals
  const nilDeals = [
    {
      athlete_id: sarah.id,
      brand_id: agency?.id,
      title: 'Nike Basketball Sponsorship',
      description: 'Social media partnership featuring basketball gear and apparel',
      value: 25000,
      status: 'completed',
      deal_type: 'sponsorship',
      start_date: '2024-01-15',
      end_date: '2024-06-15',
      contract_terms: { posts_required: 12, exclusivity: true },
      deliverables: ['6 Instagram posts', '4 TikTok videos', '2 YouTube features']
    },
    {
      athlete_id: sarah.id,
      brand_id: agency?.id,
      title: 'Local Car Dealership Appearance',
      description: 'In-person appearance and social media promotion',
      value: 5000,
      status: 'completed',
      deal_type: 'appearance',
      start_date: '2024-02-01',
      end_date: '2024-02-01',
      contract_terms: { hours: 4 },
      deliverables: ['4-hour meet & greet', '2 Instagram stories']
    },
    {
      athlete_id: sarah.id,
      brand_id: agency?.id,
      title: 'Sports Drink Brand Ambassador',
      description: 'Ongoing partnership as brand ambassador',
      value: 15000,
      status: 'active',
      deal_type: 'endorsement',
      start_date: '2024-03-01',
      end_date: '2024-12-31',
      contract_terms: { monthly_posts: 2, exclusive_category: true },
      deliverables: ['Monthly social content', 'Event appearances', 'Product reviews']
    },
    {
      athlete_id: sarah.id,
      brand_id: agency?.id,
      title: 'Training App Partnership',
      description: 'Content creation for fitness app',
      value: 8500,
      status: 'pending',
      deal_type: 'content',
      start_date: '2024-06-01',
      end_date: '2024-08-31',
      contract_terms: { videos: 5 },
      deliverables: ['5 workout tutorial videos', '10 tips posts']
    }
  ];

  // Check existing deals
  const { data: existing, error: existErr } = await supabase
    .from('nil_deals')
    .select('id')
    .eq('athlete_id', sarah.id);

  if (existErr) {
    console.log('\nError checking existing deals:', existErr.message);
    console.log('Code:', existErr.code);
    console.log('Details:', existErr.details);
    console.log('Hint:', existErr.hint);
    return;
  }

  if (existing && existing.length > 0) {
    console.log(`\nSarah already has ${existing.length} deals. Updating values...`);

    const values = [25000, 5000, 15000, 8500];
    for (let i = 0; i < existing.length; i++) {
      const { error } = await supabase
        .from('nil_deals')
        .update({ value: values[i % values.length] })
        .eq('id', existing[i].id);

      if (error) {
        console.log('   Update error:', error.message);
      } else {
        console.log(`   Updated deal ${i + 1}: $${values[i % values.length]}`);
      }
    }
  } else {
    console.log('\nInserting new NIL deals...');

    const { data: inserted, error: insertErr } = await supabase
      .from('nil_deals')
      .insert(nilDeals)
      .select();

    if (insertErr) {
      console.log('Insert error:', insertErr.message);
      console.log('Code:', insertErr.code);
      console.log('Details:', insertErr.details);
    } else {
      console.log(`Inserted ${inserted?.length || 0} deals`);
      inserted?.forEach(d => console.log(`   - ${d.title}: $${d.value}`));
    }
  }

  // Verify final state
  const { data: final, error: finalErr } = await supabase
    .from('nil_deals')
    .select('id, title, value, status')
    .eq('athlete_id', sarah.id);

  if (finalErr) {
    console.log('\nFinal verification error:', finalErr.message);
  } else {
    console.log('\n=== FINAL STATE ===');
    console.log(`Sarah has ${final?.length || 0} NIL deals:`);
    final?.forEach(d => console.log(`   - ${d.title}: $${d.value} (${d.status})`));
    console.log('Total value: $' + (final?.reduce((sum, d) => sum + (d.value || 0), 0) || 0));
  }
}

seedDeals().catch(console.error);
