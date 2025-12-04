import { supabaseAdmin } from '../lib/supabase';

async function fixAgencyNames() {
  console.log('🔧 Fixing Agency Names...\n');

  const agencyUpdates = [
    {
      email: 'nike.agency@test.com',
      first_name: 'Nike',
      last_name: 'Agency'
    },
    {
      email: 'gatorade.agency@test.com',
      first_name: 'Gatorade',
      last_name: 'Agency'
    },
    {
      email: 'localbusiness.agency@test.com',
      first_name: 'Local Business',
      last_name: 'Agency'
    }
  ];

  for (const update of agencyUpdates) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        first_name: update.first_name,
        last_name: update.last_name
      })
      .eq('email', update.email)
      .select()
      .single();

    if (error) {
      console.error(`❌ Error updating ${update.email}:`, error.message);
    } else {
      console.log(`✅ Updated ${update.email} to "${update.first_name} ${update.last_name}"`);
    }
  }

  console.log('\n🎉 Agency names updated!');
}

fixAgencyNames().catch(err => {
  console.error('💥 Fatal error:', err.message);
  process.exit(1);
});
