require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndFixOfficer() {
  // Find Robert Chen by email
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const robert = authUsers?.users?.find(u => u.email === 'robert.chen@test.chatnil.com');

  if (!robert) {
    console.log('Robert Chen not found in auth.users');
    return;
  }

  console.log('Found Robert Chen, ID:', robert.id);

  // Check his athlete_profiles record
  const { data: profile, error } = await supabase
    .from('athlete_profiles')
    .select('id, username, role, institution_id, school_name')
    .eq('id', robert.id)
    .single();

  if (error) {
    console.log('Profile error:', error.message);
    console.log('Creating profile...');

    // Create the profile
    const { error: insertError } = await supabase
      .from('athlete_profiles')
      .insert({
        id: robert.id,
        username: 'Robert Chen',
        full_name: 'Robert Chen',
        role: 'compliance_officer',
        institution_id: 'ohio-state-001',
        school_name: 'Ohio State University',
        email: 'robert.chen@test.chatnil.com'
      });

    if (insertError) {
      console.log('Insert error:', insertError.message);
    } else {
      console.log('Profile created with role: compliance_officer');
    }
  } else {
    console.log('Current profile:', JSON.stringify(profile, null, 2));

    if (profile.role !== 'compliance_officer') {
      // Update the role
      const { error: updateError } = await supabase
        .from('athlete_profiles')
        .update({
          role: 'compliance_officer',
          institution_id: profile.institution_id || 'ohio-state-001',
          school_name: profile.school_name || 'Ohio State University'
        })
        .eq('id', robert.id);

      if (updateError) {
        console.log('Update error:', updateError.message);
      } else {
        console.log('Updated role to: compliance_officer');
      }
    } else {
      console.log('Role is already compliance_officer');
    }
  }
}

checkAndFixOfficer().catch(console.error);
