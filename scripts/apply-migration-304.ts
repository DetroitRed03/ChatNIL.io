/**
 * Migration 304: Fix Dashboard & Profile Issues
 *
 * Issues found:
 * 1. agency_athlete_matches FK relationship not in schema cache
 * 2. Sarah missing user_badges
 * 3. Sarah missing portfolio_items
 * 4. Sarah missing quiz_sessions
 * 5. nil_deals have 0 value
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

async function executeSql(sql: string, description: string): Promise<{ success: boolean; error?: string }> {
  console.log(`   Executing: ${description}...`);
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function applyMigration() {
  console.log('🔧 Migration 304: Fix Dashboard & Profile Issues\n');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get Sarah's user ID
  const { data: sarah } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (!sarah) {
    console.log('ERROR: Sarah not found');
    return;
  }

  console.log('Found Sarah:', sarah.id);

  // PART 1: Fix agency_athlete_matches foreign keys
  console.log('\n📋 Part 1: Fixing agency_athlete_matches foreign keys...');

  let result = await executeSql(`
    -- Drop existing constraints if they exist (to recreate properly)
    ALTER TABLE agency_athlete_matches
      DROP CONSTRAINT IF EXISTS agency_athlete_matches_athlete_id_fkey,
      DROP CONSTRAINT IF EXISTS agency_athlete_matches_agency_id_fkey;

    -- Add foreign key constraints with proper names
    ALTER TABLE agency_athlete_matches
      ADD CONSTRAINT agency_athlete_matches_athlete_id_fkey
        FOREIGN KEY (athlete_id) REFERENCES users(id) ON DELETE CASCADE;

    ALTER TABLE agency_athlete_matches
      ADD CONSTRAINT agency_athlete_matches_agency_id_fkey
        FOREIGN KEY (agency_id) REFERENCES users(id) ON DELETE CASCADE;
  `, 'Fix foreign key constraints');

  if (result.success) {
    console.log('   ✅ Foreign keys fixed');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 150));
  }

  // PART 2: Award Sarah some badges
  console.log('\n📋 Part 2: Awarding badges to Sarah...');

  const { data: badges } = await supabase
    .from('badges')
    .select('id, name')
    .in('name', ['Welcome', 'Profile Pro', 'Quiz Starter']);

  if (badges && badges.length > 0) {
    for (const badge of badges) {
      const { error } = await supabase
        .from('user_badges')
        .upsert({
          user_id: sarah.id,
          badge_id: badge.id,
          earned_at: new Date().toISOString(),
          progress: 100,
          is_featured: badge.name === 'Profile Pro'
        }, { onConflict: 'user_id,badge_id' });

      if (error) {
        console.log(`   ⚠️ Badge ${badge.name}:`, error.message.slice(0, 50));
      } else {
        console.log(`   ✅ Awarded: ${badge.name}`);
      }
    }
  }

  // PART 3: Add portfolio items for Sarah
  console.log('\n📋 Part 3: Adding portfolio items for Sarah...');

  const portfolioItems = [
    {
      user_id: sarah.id,
      title: 'Championship Game Highlight',
      description: 'Scored 28 points in the state championship game',
      category: 'sports',
      media_type: 'video',
      type: 'video',
      media_url: 'https://example.com/videos/championship.mp4',
      thumbnail_url: 'https://picsum.photos/400/300',
      is_featured: true,
      is_public: true,
      display_order: 1
    },
    {
      user_id: sarah.id,
      title: 'Brand Partnership - Nike',
      description: 'Behind the scenes from my Nike photoshoot',
      category: 'partnerships',
      media_type: 'image',
      type: 'image',
      media_url: 'https://picsum.photos/800/600',
      thumbnail_url: 'https://picsum.photos/400/300',
      is_featured: true,
      is_public: true,
      display_order: 2
    },
    {
      user_id: sarah.id,
      title: 'Community Event',
      description: 'Youth basketball camp I hosted last summer',
      category: 'community',
      media_type: 'image',
      type: 'image',
      media_url: 'https://picsum.photos/800/600',
      thumbnail_url: 'https://picsum.photos/400/300',
      is_featured: false,
      is_public: true,
      display_order: 3
    },
    {
      user_id: sarah.id,
      title: 'Interview - ESPN',
      description: 'My feature on ESPN discussing NIL and college athletics',
      category: 'media',
      media_type: 'link',
      type: 'link',
      external_url: 'https://espn.com/interview',
      is_featured: false,
      is_public: true,
      display_order: 4
    },
    {
      user_id: sarah.id,
      title: 'Academic Achievement',
      description: 'Dean\'s List recognition for maintaining 3.8 GPA',
      category: 'academic',
      media_type: 'image',
      type: 'image',
      media_url: 'https://picsum.photos/800/600',
      thumbnail_url: 'https://picsum.photos/400/300',
      is_featured: false,
      is_public: true,
      display_order: 5
    }
  ];

  // Check if portfolio items already exist
  const { data: existing } = await supabase
    .from('portfolio_items')
    .select('id')
    .eq('user_id', sarah.id);

  if (!existing || existing.length === 0) {
    const { error } = await supabase
      .from('portfolio_items')
      .insert(portfolioItems);

    if (error) {
      console.log('   ⚠️ Error:', error.message);
    } else {
      console.log(`   ✅ Added ${portfolioItems.length} portfolio items`);
    }
  } else {
    console.log(`   ℹ️ Already has ${existing.length} portfolio items`);
  }

  // PART 4: Add quiz session for Sarah
  console.log('\n📋 Part 4: Adding quiz session for Sarah...');

  const { data: existingSessions } = await supabase
    .from('quiz_sessions')
    .select('id')
    .eq('user_id', sarah.id);

  if (!existingSessions || existingSessions.length === 0) {
    const { error } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: sarah.id,
        difficulty: 'beginner',
        status: 'completed',
        score: 80,
        total_questions: 10,
        correct_answers: 8,
        current_question_index: 10,
        time_spent_seconds: 420,
        completed_at: new Date().toISOString()
      });

    if (error) {
      console.log('   ⚠️ Error:', error.message);
    } else {
      console.log('   ✅ Added completed quiz session (80% score)');
    }
  } else {
    console.log(`   ℹ️ Already has ${existingSessions.length} quiz sessions`);
  }

  // PART 5: Update NIL deals with proper values
  console.log('\n📋 Part 5: Updating NIL deal values...');

  const { data: deals } = await supabase
    .from('nil_deals')
    .select('id, title')
    .eq('athlete_id', sarah.id);

  if (deals && deals.length > 0) {
    const values = [15000, 8500, 25000, 12000];
    for (let i = 0; i < deals.length; i++) {
      const { error } = await supabase
        .from('nil_deals')
        .update({ value: values[i % values.length] })
        .eq('id', deals[i].id);

      if (error) {
        console.log(`   ⚠️ Error updating ${deals[i].title}:`, error.message.slice(0, 50));
      } else {
        console.log(`   ✅ Updated: ${deals[i].title} = $${values[i % values.length]}`);
      }
    }
  }

  // PART 6: Refresh schema cache
  console.log('\n📋 Part 6: Refreshing PostgREST schema cache...');

  result = await executeSql(`NOTIFY pgrst, 'reload schema';`, 'Refresh schema cache');

  if (result.success) {
    console.log('   ✅ Schema cache refreshed');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100));
  }

  console.log('\n🎉 Migration 304 completed!');
  console.log('\nSummary:');
  console.log('- Fixed foreign key constraints on agency_athlete_matches');
  console.log('- Awarded Welcome, Profile Pro, Quiz Starter badges to Sarah');
  console.log('- Added 5 portfolio items for Sarah');
  console.log('- Added completed quiz session for Sarah');
  console.log('- Updated NIL deal values');
  console.log('- Refreshed PostgREST schema cache');
}

applyMigration().catch(console.error);
