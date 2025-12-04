import { createClient } from '@supabase/supabase-js';
import { calculateProfileCompletion } from '../lib/profile-completion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function recalculateProfileCompletionScores() {
  console.log('🔄 Recalculating profile completion scores...\n');

  // Get all athlete users
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'athlete');

  if (error) {
    console.error('❌ Error fetching users:', error);
    return;
  }

  console.log(`📊 Found ${users.length} athlete profiles to recalculate\n`);

  let updated = 0;
  let errors = 0;

  for (const user of users) {
    try {
      // Calculate the completion score
      const result = calculateProfileCompletion(user);

      console.log(`👤 ${user.first_name} ${user.last_name} (${user.email})`);
      console.log(`   Old Score: ${user.profile_completion_score || 0}`);
      console.log(`   New Score: ${result.percentage}`);
      console.log(`   Missing Sections: ${result.incompleteSections.length}`);

      if (result.incompleteSections.length > 0) {
        console.log('   Top missing:');
        result.incompleteSections.slice(0, 3).forEach(section => {
          console.log(`     - ${section.label} (+${section.boost} pts)`);
        });
      }

      // Update the score in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          profile_completion_score: result.percentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error(`   ❌ Error updating: ${updateError.message}`);
        errors++;
      } else {
        console.log(`   ✅ Updated successfully\n`);
        updated++;
      }
    } catch (err) {
      console.error(`   ❌ Error processing user:`, err);
      errors++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Successfully updated: ${updated}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📈 Total processed: ${users.length}`);
}

recalculateProfileCompletionScores();
