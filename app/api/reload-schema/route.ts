import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reload-schema
 * Reloads the PostgREST schema cache via DIRECT PostgreSQL connection
 * (bypasses PostgREST entirely — uses the pg driver)
 */
export async function POST() {
  // Parse DATABASE_URL and log for debugging
  const dbUrl = process.env.DATABASE_URL || '';
  console.log('🔗 DATABASE_URL host:', dbUrl.match(/@([^:\/]+)/)?.[1]);
  console.log('🔗 DATABASE_URL port:', dbUrl.match(/:(\d+)\//)?.[1]);
  console.log('🔗 DATABASE_URL user:', dbUrl.match(/\/\/([^:]+):/)?.[1]);
  console.log('🔗 DATABASE_URL password length:', (dbUrl.match(/\/\/[^:]+:([^@]+)@/)?.[1] || '').length);

  // Try using the connection string directly
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 15000,
  });

  try {
    console.log('🔄 Reloading PostgREST schema cache via direct PostgreSQL connection...');

    const client = await pool.connect();

    try {
      // 1. Send NOTIFY to reload PostgREST schema cache
      await client.query("NOTIFY pgrst, 'reload schema'");
      console.log('✅ NOTIFY pgrst sent successfully');

      // 2. Check which Migration 016 columns exist on users table
      const colResult = await client.query(`
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND (
            (table_name = 'users' AND column_name IN (
              'brand_affinity', 'causes_care_about', 'content_creation_interests',
              'hobbies', 'lifestyle_interests', 'social_media_stats', 'total_followers'
            ))
            OR (table_name = 'social_media_stats' AND column_name IN (
              'last_updated', 'updated_at', 'created_at', 'user_id', 'platform', 'handle', 'followers', 'engagement_rate'
            ))
            OR (table_name = 'athlete_public_profiles' AND column_name IN (
              'total_followers', 'school_level', 'instagram_followers', 'tiktok_followers'
            ))
          )
        ORDER BY table_name, column_name;
      `);
      console.log('📊 Columns found:', JSON.stringify(colResult.rows, null, 2));

      // 3. Check constraints on social_media_stats table
      const constraintResult = await client.query(`
        SELECT conname, conrelid::regclass::text as table_name, pg_get_constraintdef(oid) as definition
        FROM pg_constraint
        WHERE conrelid = 'social_media_stats'::regclass
          AND contype IN ('u', 'p')
      `);
      console.log('🔑 social_media_stats constraints:', JSON.stringify(constraintResult.rows, null, 2));

      // 4. Check actual data in athlete_public_profiles for our test user
      const dataResult = await client.query(`
        SELECT user_id, display_name, instagram_followers, tiktok_followers,
               twitter_followers, youtube_subscribers, total_followers,
               instagram_handle, tiktok_handle, twitter_handle,
               avg_engagement_rate, updated_at
        FROM athlete_public_profiles
        WHERE user_id = '64c3cd8b-1919-4e22-bc2c-65107d78c35d'
      `);
      console.log('👤 athlete_public_profiles data:', JSON.stringify(dataResult.rows, null, 2));

      // 5. Check social_media_stats table for test user
      const smResult = await client.query(`
        SELECT * FROM social_media_stats
        WHERE user_id = '64c3cd8b-1919-4e22-bc2c-65107d78c35d'
      `);
      console.log('📱 social_media_stats data:', JSON.stringify(smResult.rows, null, 2));

      // 6. Check users table social columns for test user
      const userResult = await client.query(`
        SELECT id, social_media_stats, total_followers, brand_affinity,
               content_creation_interests, hobbies, lifestyle_interests, causes_care_about
        FROM users
        WHERE id = '64c3cd8b-1919-4e22-bc2c-65107d78c35d'
      `);
      console.log('👤 users table social data:', JSON.stringify(userResult.rows, null, 2));

      // Wait for schema cache to reload
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 7. Test if PostgREST now recognizes the columns
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      const testRes = await fetch(`${supabaseUrl}/rest/v1/users?select=brand_affinity&limit=1`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      });
      const testStatus = testRes.status;
      const testBody = await testRes.text();
      console.log('🧪 PostgREST brand_affinity test:', testStatus, testBody.substring(0, 200));

      return NextResponse.json({
        success: true,
        schema_notify: 'sent',
        columns: colResult.rows,
        social_media_stats_constraints: constraintResult.rows,
        athlete_public_profiles_data: dataResult.rows,
        social_media_stats_data: smResult.rows,
        users_social_data: userResult.rows,
        postgrest_test: {
          brand_affinity_column: testStatus === 200 ? 'accessible' : 'still_stale',
          status: testStatus,
          body: testBody.substring(0, 500),
        },
      });
    } finally {
      try { client.release(); } catch (_) {}
    }
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: error.message, stack: error.stack?.substring(0, 500) }, { status: 500 });
  } finally {
    await pool.end();
  }
}
