import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { splitProfileUpdates, mergeProfileData } from '@/lib/profile-field-mapper';
import { calculateProfileCompletion } from '@/lib/profile-completion';

export const dynamic = 'force-dynamic';

// Use service role client to bypass RLS
// Note: Using untyped client because some tables aren't in Database types
// CRITICAL: Must disable Next.js fetch caching — supabase-js uses fetch internally
// and Next.js App Router caches all fetch() by default, causing stale reads after writes.
function getSupabaseAdmin() {
  return createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      fetch: (url: any, opts: any) => fetch(url, { ...opts, cache: 'no-store' as any }),
    }
  }
);
}

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    console.log('📋 GET /api/profile - User ID:', userId);

    // Fetch user data from users table
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('❌ Error fetching user:', userError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch athlete profile data from athlete_profiles table
    const { data: athleteProfile, error: athleteError } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (athleteError) {
      console.error('⚠️  Error fetching athlete profile:', athleteError);
      // Don't fail if athlete profile doesn't exist - just continue with user data
    }
    // Fetch social media stats from athlete_public_profiles via direct REST API
    // NOTE: supabase-js client silently returns null for tables not fully recognized
    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const appUrl = `${supabaseUrl}/rest/v1/athlete_public_profiles?user_id=eq.${userId}&select=instagram_followers,tiktok_followers,twitter_followers,youtube_subscribers,total_followers,avg_engagement_rate,instagram_handle,tiktok_handle,twitter_handle,youtube_channel,instagram_engagement_rate,tiktok_engagement_rate,brand_values,content_categories,brand_preferences,nil_interests,nil_concerns,nil_goals,nil_preferences`;
    const appRes = await fetch(appUrl, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Accept': 'application/json' },
      cache: 'no-store', // Disable Next.js fetch caching — must always read fresh data
    });
    const appRows = appRes.ok ? await appRes.json() : [];
    const publicProfileData = Array.isArray(appRows) && appRows.length > 0 ? appRows[0] : null;

    // Merge user data with athlete profile data
    let profile = mergeProfileData(user, athleteProfile);

    // Add social media stats from athlete_public_profiles
    if (publicProfileData) {
      const hasAnySocial = publicProfileData.instagram_followers || publicProfileData.tiktok_followers ||
                           publicProfileData.twitter_followers || publicProfileData.youtube_subscribers ||
                           publicProfileData.instagram_handle || publicProfileData.tiktok_handle ||
                           publicProfileData.twitter_handle || publicProfileData.youtube_channel;

      if (hasAnySocial) {
        profile.social_media_stats = {};

        if (publicProfileData.instagram_followers || publicProfileData.instagram_handle) {
          profile.social_media_stats.instagram = {
            handle: publicProfileData.instagram_handle || '',
            followers: publicProfileData.instagram_followers || 0,
            engagement_rate: publicProfileData.instagram_engagement_rate || publicProfileData.avg_engagement_rate || 0,
          };
        }

        if (publicProfileData.tiktok_followers || publicProfileData.tiktok_handle) {
          profile.social_media_stats.tiktok = {
            handle: publicProfileData.tiktok_handle || '',
            followers: publicProfileData.tiktok_followers || 0,
            engagement_rate: publicProfileData.tiktok_engagement_rate || publicProfileData.avg_engagement_rate || 0,
          };
        }

        if (publicProfileData.twitter_followers || publicProfileData.twitter_handle) {
          profile.social_media_stats.twitter = {
            handle: publicProfileData.twitter_handle || '',
            followers: publicProfileData.twitter_followers || 0,
            engagement_rate: publicProfileData.avg_engagement_rate || 0,
          };
        }

        if (publicProfileData.youtube_subscribers || publicProfileData.youtube_channel) {
          profile.social_media_stats.youtube = {
            handle: publicProfileData.youtube_channel || '',
            subscribers: publicProfileData.youtube_subscribers || 0,
          };
        }

        profile.total_followers = publicProfileData.total_followers;
        profile.avg_engagement_rate = publicProfileData.avg_engagement_rate;
      }
    }

    // Merge interest/personality fields from athlete_public_profiles
    if (publicProfileData) {
      // brand_affinity stored in brand_values column
      if (publicProfileData.brand_values) {
        profile.brand_affinity = publicProfileData.brand_values;
      }
      // content_creation_interests stored in content_categories column
      if (publicProfileData.content_categories) {
        profile.content_creation_interests = publicProfileData.content_categories;
      }
      // hobbies, lifestyle_interests, causes_care_about stored in brand_preferences JSONB
      const bp = publicProfileData.brand_preferences;
      if (bp && typeof bp === 'object') {
        if (bp.hobbies) profile.hobbies = bp.hobbies;
        if (bp.lifestyle_interests) profile.lifestyle_interests = bp.lifestyle_interests;
        if (bp.causes_care_about) profile.causes_care_about = bp.causes_care_about;
      }
      // NIL fields from athlete_public_profiles
      if (publicProfileData.nil_interests) profile.nil_interests = publicProfileData.nil_interests;
      if (publicProfileData.nil_concerns) profile.nil_concerns = publicProfileData.nil_concerns;
      if (publicProfileData.nil_goals) profile.nil_goals = publicProfileData.nil_goals;
      if (publicProfileData.nil_preferences && Object.keys(publicProfileData.nil_preferences).length > 0) {
        profile.nil_preferences = publicProfileData.nil_preferences;
      }
    }

    // Check if NIL is allowed in athlete's state (for portfolio visibility)
    // State may be on users table, athlete_profiles, or athlete_public_profiles
    const athleteState = profile.state || profile.primary_state || user.state;
    let stateNilAllowed = true; // Default: show portfolio
    if (user.role === 'hs_student' && athleteState && athleteState !== 'Unknown') {
      const nilRulesUrl = `${supabaseUrl}/rest/v1/state_nil_rules?state_code=eq.${athleteState}&select=high_school_allowed&limit=1`;
      const nilRulesRes = await fetch(nilRulesUrl, {
        headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Accept': 'application/json' },
        cache: 'no-store',
      });
      const nilRulesRows = nilRulesRes.ok ? await nilRulesRes.json() : [];
      if (Array.isArray(nilRulesRows) && nilRulesRows.length > 0) {
        stateNilAllowed = nilRulesRows[0].high_school_allowed === true;
      }
    }
    profile.state_nil_allowed = stateNilAllowed;

    console.log('✅ Profile fetched successfully', athleteProfile ? '(with athlete data)' : '(user data only)');
    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('💥 Profile API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'updates object is required' }, { status: 400 });
    }

    console.log('📝 PUT /api/profile - User ID:', userId);
    console.log('📊 Updates:', Object.keys(updates));

    // Extract interest/personality and NIL fields BEFORE splitProfileUpdates.
    // These are written to athlete_public_profiles JSONB columns via raw fetch.
    // Reason: Migration 016 users columns don't exist; athlete_profiles columns may also be missing.
    const INTEREST_FIELDS = ['hobbies', 'content_creation_interests', 'lifestyle_interests', 'causes_care_about', 'brand_affinity'];
    const NIL_FIELDS = ['nil_interests', 'nil_concerns', 'nil_goals', 'nil_preferences'];
    const interestUpdates: Record<string, any> = {};
    for (const field of [...INTEREST_FIELDS, ...NIL_FIELDS]) {
      if (updates[field] !== undefined) {
        interestUpdates[field] = updates[field];
        delete updates[field]; // Remove so splitProfileUpdates won't route to wrong table
      }
    }

    // Split updates between users and athlete_profiles tables using shared utility
    const { usersUpdates, athleteUpdates, unmapped } = splitProfileUpdates(updates);

    if (unmapped.length > 0) {
      console.log('⚠️  Unmapped fields (skipping):', unmapped);
    }

    // Update users table if there are changes
    // Retry loop strips columns not in PostgREST schema cache (PGRST204)
    if (Object.keys(usersUpdates).length > 0) {
      console.log('📝 Updating users table:', Object.keys(usersUpdates));
      let pendingUpdates = { ...usersUpdates };
      let attempts = 0;
      const maxAttempts = 5;

      while (Object.keys(pendingUpdates).length > 0 && attempts < maxAttempts) {
        attempts++;
        const { error: usersError } = await supabaseAdmin
          .from('users')
          .update({ ...pendingUpdates, updated_at: new Date().toISOString() } as any)
          .eq('id', userId);

        if (!usersError) break; // Success

        if (usersError.code === 'PGRST204' && usersError.message) {
          const match = usersError.message.match(/Could not find the '(\w+)' column/);
          if (match) {
            console.warn(`⚠️ Column '${match[1]}' not in schema cache, stripping and retrying...`);
            delete pendingUpdates[match[1]];
            continue;
          }
        }
        console.error('❌ Error updating users table:', usersError);
        break; // Non-PGRST204 error, stop retrying
      }
    }

    // Update athlete_profiles table if there are changes
    // First ensure the row exists (upsert safety)
    if (Object.keys(athleteUpdates).length > 0) {
      console.log('📝 Updating athlete_profiles table:', Object.keys(athleteUpdates));
      console.log('📝 athlete_profiles values:', JSON.stringify(athleteUpdates));

      // Ensure athlete_profiles row exists before updating
      const { data: existingAP } = await supabaseAdmin
        .from('athlete_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingAP) {
        console.log('⚠️ No athlete_profiles row found — creating one');
        const { error: insertAPError } = await supabaseAdmin
          .from('athlete_profiles')
          .insert({
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        if (insertAPError) {
          console.error('❌ Error creating athlete_profiles row:', insertAPError);
        }
      }

      // Retry loop: strip columns that don't exist in PostgREST schema cache
      let pendingAthleteUpdates = { ...athleteUpdates };
      let athleteAttempts = 0;
      const maxAthleteAttempts = 5;

      while (Object.keys(pendingAthleteUpdates).length > 0 && athleteAttempts < maxAthleteAttempts) {
        athleteAttempts++;
        const { data: updatedRows, error: athleteError } = await supabaseAdmin
          .from('athlete_profiles')
          .update({
            ...pendingAthleteUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select('user_id');

        if (!athleteError) {
          console.log(`✅ athlete_profiles updated (${updatedRows?.length || 0} rows matched)`);
          break;
        }

        // Handle missing column errors — strip bad column and retry
        if ((athleteError.code === 'PGRST204' || athleteError.code === '42703') && athleteError.message) {
          const match = athleteError.message.match(/Could not find the '(\w+)' column/) ||
                        athleteError.message.match(/column "(\w+)" .* does not exist/);
          if (match) {
            console.warn(`⚠️ athlete_profiles column '${match[1]}' not in schema, stripping and retrying...`);
            delete pendingAthleteUpdates[match[1]];
            continue;
          }
        }

        console.error('❌ Error updating athlete_profiles table:', athleteError);
        break;
      }
    }

    // Fetch the updated complete profile
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: athleteProfile } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Handle social media stats — write to athlete_public_profiles table
    if (updates.social_media_stats && typeof updates.social_media_stats === 'object') {
      const sm = updates.social_media_stats;

      const socialColumns: Record<string, any> = {
        instagram_handle: sm.instagram?.handle || null,
        instagram_followers: sm.instagram?.followers || 0,
        instagram_engagement_rate: sm.instagram?.engagement_rate || null,
        tiktok_handle: sm.tiktok?.handle || null,
        tiktok_followers: sm.tiktok?.followers || 0,
        tiktok_engagement_rate: sm.tiktok?.engagement_rate || null,
        twitter_handle: sm.twitter?.handle || null,
        twitter_followers: sm.twitter?.followers || 0,
        youtube_channel: sm.youtube?.handle || null,
        youtube_subscribers: sm.youtube?.subscribers || 0,
        // NOTE: total_followers is a GENERATED ALWAYS column — auto-calculated from individual platform followers
        updated_at: new Date().toISOString(),
      };

      // Calculate average engagement rate
      const engRates = [
        sm.instagram?.engagement_rate,
        sm.tiktok?.engagement_rate,
        sm.twitter?.engagement_rate,
      ].filter((r): r is number => typeof r === 'number' && r > 0);

      if (engRates.length > 0) {
        socialColumns.avg_engagement_rate = +(engRates.reduce((a, b) => a + b, 0) / engRates.length).toFixed(2);
      }

      // Try to update existing row first (only social columns)
      const { data: updated } = await supabaseAdmin
        .from('athlete_public_profiles')
        .update(socialColumns)
        .eq('user_id', userId)
        .select('id');

      if (!updated || updated.length === 0) {
        // No existing row — create one with required fields from profile data
        const { error: insertError } = await supabaseAdmin
          .from('athlete_public_profiles')
          .insert({
            user_id: userId,
            display_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Athlete',
            sport: athleteProfile?.sport || 'Not set',
            school_name: user?.school_name || athleteProfile?.school_name || 'Not set',
            school_level: user?.school_level || (user?.role === 'hs_student' ? 'high_school' : 'college'),
            state: user?.state || 'Unknown',
            ...socialColumns,
          });

        if (insertError) {
          console.error('⚠️ Error creating athlete_public_profiles row:', insertError);
          // Non-critical — don't fail the whole request
        }
      }

      // Also write to users.social_media_stats (JSONB array format)
      // Migration 016 trigger auto-calculates total_followers, avg_engagement_rate, profile_completion_score
      const socialStatsArray: any[] = [];
      if (sm.instagram?.handle || sm.instagram?.followers) {
        socialStatsArray.push({
          platform: 'instagram',
          handle: sm.instagram.handle || '',
          followers: sm.instagram.followers || 0,
          engagement_rate: sm.instagram.engagement_rate || 0,
        });
      }
      if (sm.tiktok?.handle || sm.tiktok?.followers) {
        socialStatsArray.push({
          platform: 'tiktok',
          handle: sm.tiktok.handle || '',
          followers: sm.tiktok.followers || 0,
          engagement_rate: sm.tiktok.engagement_rate || 0,
        });
      }
      if (sm.twitter?.handle || sm.twitter?.followers) {
        socialStatsArray.push({
          platform: 'twitter',
          handle: sm.twitter.handle || '',
          followers: sm.twitter.followers || 0,
          engagement_rate: sm.twitter.engagement_rate || 0,
        });
      }

      const { error: usersSocialError } = await supabaseAdmin
        .from('users')
        .update({
          social_media_stats: socialStatsArray,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', userId);

      if (usersSocialError) {
        console.warn('⚠️ users.social_media_stats write failed (schema cache), using social_media_stats table fallback');
        // Fallback: write to dedicated social_media_stats table (one row per platform)
        // Only include columns we're confident exist in schema cache
        for (const stat of socialStatsArray) {
          const { error: statError } = await supabaseAdmin
            .from('social_media_stats')
            .upsert({
              user_id: userId,
              platform: stat.platform,
              handle: stat.handle.startsWith('@') ? stat.handle : `@${stat.handle}`,
              followers: stat.followers || 0,
              engagement_rate: stat.engagement_rate || 0,
            }, { onConflict: 'user_id,platform' });
          if (statError) {
            console.warn(`⚠️ Failed to save ${stat.platform} to social_media_stats:`, statError.message);
          }
        }
      }

      console.log('📱 Social media stats saved to athlete_public_profiles');
    }

    // Write interest/personality + NIL fields to athlete_public_profiles via raw fetch
    // Column mapping: brand_affinity→brand_values, content_creation_interests→content_categories,
    // hobbies/lifestyle/causes→brand_preferences, nil_interests/concerns/goals/preferences→direct columns
    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (Object.keys(interestUpdates).length > 0) {
      console.log('🎯 Writing interest/NIL fields to athlete_public_profiles:', Object.keys(interestUpdates));

      const interestPatch: Record<string, any> = {};

      // brand_affinity → brand_values column (JSONB)
      if (interestUpdates.brand_affinity !== undefined) {
        interestPatch.brand_values = interestUpdates.brand_affinity;
      }

      // content_creation_interests → content_categories column (JSONB)
      if (interestUpdates.content_creation_interests !== undefined) {
        interestPatch.content_categories = interestUpdates.content_creation_interests;
      }

      // hobbies, lifestyle_interests, causes_care_about → brand_preferences column (JSONB object)
      const personalInterests: Record<string, any> = {};
      if (interestUpdates.hobbies !== undefined) personalInterests.hobbies = interestUpdates.hobbies;
      if (interestUpdates.lifestyle_interests !== undefined) personalInterests.lifestyle_interests = interestUpdates.lifestyle_interests;
      if (interestUpdates.causes_care_about !== undefined) personalInterests.causes_care_about = interestUpdates.causes_care_about;
      if (Object.keys(personalInterests).length > 0) {
        interestPatch.brand_preferences = personalInterests;
      }

      // NIL fields → direct columns on athlete_public_profiles
      if (interestUpdates.nil_interests !== undefined) interestPatch.nil_interests = interestUpdates.nil_interests;
      if (interestUpdates.nil_concerns !== undefined) interestPatch.nil_concerns = interestUpdates.nil_concerns;
      if (interestUpdates.nil_goals !== undefined) interestPatch.nil_goals = interestUpdates.nil_goals;
      if (interestUpdates.nil_preferences !== undefined) interestPatch.nil_preferences = interestUpdates.nil_preferences;

      interestPatch.updated_at = new Date().toISOString();

      // Try PATCH first (update existing row)
      // Use return=representation to detect if a row was actually matched
      const patchRes = await fetch(
        `${supabaseUrl}/rest/v1/athlete_public_profiles?user_id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            'Accept': 'application/json',
          },
          body: JSON.stringify(interestPatch),
        }
      );

      const patchBody = patchRes.ok ? await patchRes.json() : [];
      const rowUpdated = Array.isArray(patchBody) && patchBody.length > 0;

      if (rowUpdated) {
        console.log('✅ Interest fields saved to athlete_public_profiles');
      } else {
        // Row might not exist yet — create it
        const insertData = {
          user_id: userId,
          display_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Athlete',
          sport: athleteProfile?.sport || 'Not set',
          school_name: user?.school_name || 'Not set',
          school_level: user?.school_level || (user?.role === 'hs_student' ? 'high_school' : 'college'),
          state: user?.state || 'Unknown',
          ...interestPatch,
        };

        const insertRes = await fetch(
          `${supabaseUrl}/rest/v1/athlete_public_profiles`,
          {
            method: 'POST',
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify(insertData),
          }
        );

        if (insertRes.ok) {
          console.log('✅ Interest fields saved (new athlete_public_profiles row created)');
        } else {
          const errBody = await insertRes.text();
          console.warn('⚠️ Failed to save interest fields:', insertRes.status, errBody);
        }
      }
    }

    // Re-fetch user after social media write (trigger may have updated total_followers etc.)
    const { data: freshUser } = updates.social_media_stats
      ? await supabaseAdmin.from('users').select('*').eq('id', userId).single()
      : { data: user };

    const completeProfile = mergeProfileData(freshUser || user, athleteProfile);

    // Re-read ALL athlete_public_profiles data (social media + interests) for accurate merge
    const fullAppUrl = `${supabaseUrl}/rest/v1/athlete_public_profiles?user_id=eq.${userId}&select=instagram_followers,tiktok_followers,twitter_followers,youtube_subscribers,total_followers,avg_engagement_rate,instagram_handle,tiktok_handle,twitter_handle,youtube_channel,instagram_engagement_rate,tiktok_engagement_rate,brand_values,content_categories,brand_preferences,nil_interests,nil_concerns,nil_goals,nil_preferences`;
    const fullAppRes = await fetch(fullAppUrl, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Accept': 'application/json' },
      cache: 'no-store',
    });
    const fullAppRows = fullAppRes.ok ? await fullAppRes.json() : [];
    const fullPublicData = Array.isArray(fullAppRows) && fullAppRows.length > 0 ? fullAppRows[0] : null;

    // Merge social media stats from athlete_public_profiles (same logic as GET handler)
    if (fullPublicData) {
      const hasAnySocial = fullPublicData.instagram_followers || fullPublicData.tiktok_followers ||
                           fullPublicData.twitter_followers || fullPublicData.youtube_subscribers ||
                           fullPublicData.instagram_handle || fullPublicData.tiktok_handle ||
                           fullPublicData.twitter_handle || fullPublicData.youtube_channel;
      if (hasAnySocial) {
        completeProfile.social_media_stats = {};
        if (fullPublicData.instagram_followers || fullPublicData.instagram_handle) {
          completeProfile.social_media_stats.instagram = {
            handle: fullPublicData.instagram_handle || '',
            followers: fullPublicData.instagram_followers || 0,
            engagement_rate: fullPublicData.instagram_engagement_rate || fullPublicData.avg_engagement_rate || 0,
          };
        }
        if (fullPublicData.tiktok_followers || fullPublicData.tiktok_handle) {
          completeProfile.social_media_stats.tiktok = {
            handle: fullPublicData.tiktok_handle || '',
            followers: fullPublicData.tiktok_followers || 0,
            engagement_rate: fullPublicData.tiktok_engagement_rate || fullPublicData.avg_engagement_rate || 0,
          };
        }
        if (fullPublicData.twitter_followers || fullPublicData.twitter_handle) {
          completeProfile.social_media_stats.twitter = {
            handle: fullPublicData.twitter_handle || '',
            followers: fullPublicData.twitter_followers || 0,
            engagement_rate: fullPublicData.avg_engagement_rate || 0,
          };
        }
        if (fullPublicData.youtube_subscribers || fullPublicData.youtube_channel) {
          completeProfile.social_media_stats.youtube = {
            handle: fullPublicData.youtube_channel || '',
            subscribers: fullPublicData.youtube_subscribers || 0,
          };
        }
        completeProfile.total_followers = fullPublicData.total_followers;
        completeProfile.avg_engagement_rate = fullPublicData.avg_engagement_rate;
      }

      // Merge interest data
      if (fullPublicData.brand_values) completeProfile.brand_affinity = fullPublicData.brand_values;
      if (fullPublicData.content_categories) completeProfile.content_creation_interests = fullPublicData.content_categories;
      const bp = fullPublicData.brand_preferences;
      if (bp && typeof bp === 'object') {
        if (bp.hobbies) completeProfile.hobbies = bp.hobbies;
        if (bp.lifestyle_interests) completeProfile.lifestyle_interests = bp.lifestyle_interests;
        if (bp.causes_care_about) completeProfile.causes_care_about = bp.causes_care_about;
      }
      if (fullPublicData.nil_interests) completeProfile.nil_interests = fullPublicData.nil_interests;
      if (fullPublicData.nil_concerns) completeProfile.nil_concerns = fullPublicData.nil_concerns;
      if (fullPublicData.nil_goals) completeProfile.nil_goals = fullPublicData.nil_goals;
      if (fullPublicData.nil_preferences && Object.keys(fullPublicData.nil_preferences).length > 0) {
        completeProfile.nil_preferences = fullPublicData.nil_preferences;
      }
    }

    // Recalculate and persist profile completion score
    // State may live on completeProfile (from athlete_profiles/athlete_public_profiles merge)
    const putAthleteState = completeProfile.state || completeProfile.primary_state || (freshUser || user)?.state;
    let nilAllowed = true; // Default: show portfolio
    if ((freshUser || user)?.role === 'hs_student' && putAthleteState && putAthleteState !== 'Unknown') {
      const nilCheckUrl = `${supabaseUrl}/rest/v1/state_nil_rules?state_code=eq.${putAthleteState}&select=high_school_allowed&limit=1`;
      const nilCheckRes = await fetch(nilCheckUrl, {
        headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Accept': 'application/json' },
        cache: 'no-store',
      });
      const nilCheckRows = nilCheckRes.ok ? await nilCheckRes.json() : [];
      nilAllowed = Array.isArray(nilCheckRows) && nilCheckRows.length > 0
        ? nilCheckRows[0].high_school_allowed === true : true;
    }
    const completion = calculateProfileCompletion(completeProfile, { nilAllowedInState: nilAllowed });
    completeProfile.profile_completion_score = completion.percentage;
    completeProfile.state_nil_allowed = nilAllowed;

    // Write score to athlete_profiles
    await supabaseAdmin
      .from('athlete_profiles')
      .update({ profile_completion_score: completion.percentage })
      .eq('user_id', userId);

    console.log('✅ Profile updated successfully (completion:', completion.percentage + '%)');
    return NextResponse.json({ profile: completeProfile });
  } catch (error: any) {
    console.error('💥 Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
