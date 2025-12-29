#!/usr/bin/env npx tsx
/**
 * Re-seed profile memories for a user
 * Clears existing memories and re-seeds from profile with all onboarding data
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !openaiKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sarah Johnson's user ID
const TEST_USER_ID = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text.slice(0, 8000)
    })
  });
  const data = await response.json();
  return data.data[0].embedding;
}

type MemoryType = 'preference' | 'context' | 'fact' | 'goal';

async function storeMemory(params: {
  userId: string;
  memoryType: MemoryType;
  content: string;
  importanceScore: number;
}) {
  const embedding = await generateEmbedding(params.content);

  const { data, error } = await supabase
    .from('conversation_memory')
    .insert({
      user_id: params.userId,
      memory_type: params.memoryType,
      content: params.content,
      embedding,
      importance_score: params.importanceScore,
      is_active: true
    })
    .select('id')
    .single();

  if (error) {
    console.log(`  ❌ Failed: ${error.message}`);
    return null;
  }
  return data;
}

async function reseedProfileMemories() {
  console.log('='.repeat(60));
  console.log('Re-seeding Profile Memories for Sarah Johnson');
  console.log('='.repeat(60));
  console.log('User ID:', TEST_USER_ID);

  // Step 1: Clear existing memories
  console.log('\n🗑️  Step 1: Clearing existing memories...');
  const { error: deleteError, count } = await supabase
    .from('conversation_memory')
    .delete()
    .eq('user_id', TEST_USER_ID);

  if (deleteError) {
    console.error('Failed to delete existing memories:', deleteError);
  } else {
    console.log(`  ✓ Deleted existing memories`);
  }

  // Step 2: Fetch full profile
  console.log('\n📋 Step 2: Fetching full profile with onboarding data...');

  // Fetch user info
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('id', TEST_USER_ID)
    .single();

  if (userError || !user) {
    console.error('Failed to fetch user:', userError);
    process.exit(1);
  }

  // Fetch athlete profile separately (direct query)
  const { data: athleteProfile, error: profileError } = await supabase
    .from('athlete_profiles')
    .select(`
      sport,
      position,
      school,
      school_level,
      graduation_year,
      year,
      state,
      bio,
      major,
      gpa,
      achievements,
      secondary_sports,
      estimated_fmv,
      nil_interests,
      nil_concerns,
      nil_goals,
      nil_preferences,
      content_samples
    `)
    .eq('user_id', TEST_USER_ID)
    .single();

  if (profileError || !athleteProfile) {
    console.error('Failed to fetch athlete profile:', profileError);
    process.exit(1);
  }

  console.log('  ✓ Profile fetched for:', user.full_name);

  console.log('\n📊 Profile Data Found:');
  console.log('  Sport:', athleteProfile.sport);
  console.log('  School:', athleteProfile.school);
  console.log('  Year:', athleteProfile.year);
  console.log('  State:', athleteProfile.state);
  console.log('  NIL Interests:', athleteProfile.nil_interests);
  console.log('  NIL Concerns:', athleteProfile.nil_concerns);
  console.log('  NIL Goals:', athleteProfile.nil_goals);
  console.log('  NIL Preferences:', JSON.stringify(athleteProfile.nil_preferences, null, 2));
  console.log('  Achievements:', athleteProfile.achievements);
  console.log('  Bio:', athleteProfile.bio?.substring(0, 50) + '...');
  console.log('  Major:', athleteProfile.major);
  console.log('  GPA:', athleteProfile.gpa);
  console.log('  Estimated FMV:', athleteProfile.estimated_fmv);

  // Step 3: Build memories from profile
  console.log('\n🧠 Step 3: Creating memories from profile...');

  const memories: Array<{ type: MemoryType; content: string; importance: number }> = [];

  // === CONTEXT MEMORIES ===
  if (athleteProfile.sport) {
    let sportContext = `Plays ${athleteProfile.sport}`;
    if (athleteProfile.position) {
      sportContext += ` as a ${athleteProfile.position}`;
    }
    memories.push({ type: 'context', content: sportContext, importance: 0.95 });
  }

  // Secondary sports (can be array of strings or objects with {sport, position})
  if (athleteProfile.secondary_sports?.length > 0) {
    const sportsList = athleteProfile.secondary_sports.map((s: any) => {
      if (typeof s === 'string') return s;
      if (s.sport) return s.position ? `${s.sport} (${s.position})` : s.sport;
      return null;
    }).filter(Boolean);

    if (sportsList.length > 0) {
      memories.push({
        type: 'context',
        content: `Also plays: ${sportsList.join(', ')}`,
        importance: 0.6
      });
    }
  }

  if (athleteProfile.school) {
    let schoolContext = `Attends ${athleteProfile.school}`;
    if (athleteProfile.school_level) {
      schoolContext += ` (${athleteProfile.school_level})`;
    }
    if (athleteProfile.state) {
      schoolContext += ` in ${athleteProfile.state}`;
    }
    if (athleteProfile.year) {
      schoolContext += ` - ${athleteProfile.year}`;
    }
    memories.push({ type: 'context', content: schoolContext, importance: 0.9 });
  }

  if (athleteProfile.graduation_year) {
    memories.push({
      type: 'context',
      content: `Expected graduation year: ${athleteProfile.graduation_year}`,
      importance: 0.7
    });
  }

  if (athleteProfile.major) {
    let academicContext = `Majoring in ${athleteProfile.major}`;
    if (athleteProfile.gpa) {
      academicContext += ` with a ${athleteProfile.gpa} GPA`;
    }
    memories.push({ type: 'context', content: academicContext, importance: 0.7 });
  }

  if (athleteProfile.bio && athleteProfile.bio.length > 20) {
    memories.push({
      type: 'context',
      content: `Personal bio: ${athleteProfile.bio}`,
      importance: 0.75
    });
  }

  if (athleteProfile.nil_concerns?.length > 0) {
    memories.push({
      type: 'context',
      content: `NIL concerns: ${athleteProfile.nil_concerns.join(', ')}`,
      importance: 0.85
    });
  }

  // === FACT MEMORIES ===
  if (athleteProfile.achievements?.length > 0) {
    memories.push({
      type: 'fact',
      content: `Athletic achievements: ${athleteProfile.achievements.join('; ')}`,
      importance: 0.85
    });
  }

  if (athleteProfile.estimated_fmv) {
    memories.push({
      type: 'fact',
      content: `Estimated NIL fair market value: $${athleteProfile.estimated_fmv.toLocaleString()}`,
      importance: 0.8
    });
  }

  // Content samples (sponsored content experience)
  if (athleteProfile.content_samples && Array.isArray(athleteProfile.content_samples)) {
    const sponsoredContent = athleteProfile.content_samples.filter((c: any) => c.sponsored);
    if (sponsoredContent.length > 0) {
      const brands = sponsoredContent
        .map((c: any) => c.brand)
        .filter((b: string) => b)
        .join(', ');
      if (brands) {
        memories.push({
          type: 'fact',
          content: `Has done sponsored content with: ${brands}`,
          importance: 0.85
        });
      }
    }
  }

  // === PREFERENCE MEMORIES ===
  if (athleteProfile.nil_interests?.length > 0) {
    memories.push({
      type: 'preference',
      content: `Interested in NIL opportunities related to: ${athleteProfile.nil_interests.join(', ')}`,
      importance: 0.9
    });
  }

  if (athleteProfile.nil_preferences && typeof athleteProfile.nil_preferences === 'object') {
    const prefs = athleteProfile.nil_preferences as Record<string, any>;

    if (prefs.preferred_deal_types?.length > 0) {
      memories.push({
        type: 'preference',
        content: `Preferred NIL deal types: ${prefs.preferred_deal_types.join(', ')}`,
        importance: 0.9
      });
    }

    if (prefs.content_types_willing?.length > 0) {
      memories.push({
        type: 'preference',
        content: `Willing to create content types: ${prefs.content_types_willing.join(', ')}`,
        importance: 0.8
      });
    }

    if (prefs.min_compensation !== undefined || prefs.max_compensation !== undefined) {
      let compPref = 'NIL compensation preferences:';
      if (prefs.min_compensation !== undefined && prefs.min_compensation > 0) {
        compPref += ` minimum $${prefs.min_compensation.toLocaleString()}`;
      }
      if (prefs.max_compensation !== undefined) {
        compPref += ` up to $${prefs.max_compensation.toLocaleString()}`;
      }
      memories.push({ type: 'preference', content: compPref, importance: 0.75 });
    }

    if (prefs.travel_willing !== undefined) {
      memories.push({
        type: 'preference',
        content: prefs.travel_willing
          ? 'Willing to travel for NIL opportunities'
          : 'Prefers local NIL opportunities (not willing to travel)',
        importance: 0.7
      });
    }

    if (prefs.exclusivity_preference) {
      memories.push({
        type: 'preference',
        content: `Exclusivity preference: ${prefs.exclusivity_preference}`,
        importance: 0.75
      });
    }

    if (prefs.industries_avoid?.length > 0) {
      memories.push({
        type: 'preference',
        content: `Industries/brands to avoid: ${prefs.industries_avoid.join(', ')}`,
        importance: 0.85
      });
    }
  }

  // === GOAL MEMORIES ===
  if (athleteProfile.nil_goals?.length > 0) {
    memories.push({
      type: 'goal',
      content: `NIL goals: ${athleteProfile.nil_goals.join('; ')}`,
      importance: 0.95
    });
  }

  // Step 4: Store all memories
  console.log(`\n💾 Step 4: Storing ${memories.length} memories...`);

  let storedCount = 0;
  for (const mem of memories) {
    const result = await storeMemory({
      userId: TEST_USER_ID,
      memoryType: mem.type,
      content: mem.content,
      importanceScore: mem.importance,
    });
    if (result) {
      console.log(`  ✓ [${mem.type}] ${mem.content.substring(0, 60)}...`);
      storedCount++;
    }
  }

  // Step 5: Verify
  console.log('\n📊 Step 5: Verification...');
  const { data: allMemories } = await supabase
    .from('conversation_memory')
    .select('id, memory_type, content')
    .eq('user_id', TEST_USER_ID)
    .eq('is_active', true);

  const byType: Record<string, number> = {};
  for (const m of (allMemories || [])) {
    byType[m.memory_type] = (byType[m.memory_type] || 0) + 1;
  }

  console.log('  Total memories stored:', allMemories?.length || 0);
  console.log('  By type:', byType);

  console.log('\n' + '='.repeat(60));
  console.log('Profile Memory Re-seed Complete!');
  console.log('='.repeat(60));
  console.log('\nNow when Sarah chats, the AI will know:');
  console.log('- Her sport, school, and position');
  console.log('- Her NIL interests and preferred deal types');
  console.log('- Her NIL goals and concerns');
  console.log('- Her achievements and social media stats');
  console.log('- Her compensation preferences');
}

reseedProfileMemories().catch(console.error);
