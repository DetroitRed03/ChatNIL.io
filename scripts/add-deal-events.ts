import { supabaseAdmin } from '../lib/supabase';

async function addEventData() {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available');
    return;
  }

  // Get Sarah's active deal (Local Sporting Goods Store)
  const { data: deal } = await supabaseAdmin
    .from('nil_deals')
    .select('id, brand_name')
    .eq('athlete_id', 'ca05429a-0f32-4280-8b71-99dc5baee0dc')
    .eq('status', 'active')
    .single();

  if (!deal) {
    console.log('No active deal found');
    return;
  }

  console.log('Adding events to:', deal.brand_name);

  // Calculate future dates
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const twoWeeks = new Date();
  twoWeeks.setDate(twoWeeks.getDate() + 14);

  // Add deliverables
  const { error } = await supabaseAdmin
    .from('nil_deals')
    .update({
      deliverables: [
        {
          type: 'Social Media Post',
          description: 'Post product photo on Instagram',
          deadline: tomorrow.toISOString(),
          completed: false
        },
        {
          type: 'Store Appearance',
          description: 'Meet & greet at flagship store',
          deadline: nextWeek.toISOString(),
          completed: false
        },
        {
          type: 'Content Creation',
          description: 'Create video testimonial',
          deadline: twoWeeks.toISOString(),
          completed: false
        }
      ]
    })
    .eq('id', deal.id);

  if (error) {
    console.error('Error updating deal:', error);
    return;
  }

  console.log('✅ Events added successfully!');
  console.log('- Social Media Post (tomorrow)');
  console.log('- Store Appearance (next week)');
  console.log('- Content Creation (2 weeks)');
}

addEventData().catch(console.error);
