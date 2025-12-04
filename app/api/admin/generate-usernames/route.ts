import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    console.log('🚀 Starting username generation...');

    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Fetch all athletes
    console.log('📝 Fetching athletes...');
    const { data: athletes, error: fetchError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, username')
      .eq('role', 'athlete');

    if (fetchError) {
      console.error('Failed to fetch athletes:', fetchError);
      return NextResponse.json(
        { error: `Failed to fetch athletes: ${fetchError.message}` },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${athletes.length} athletes`);

    const results = [];
    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    // Generate username for each athlete
    for (const athlete of athletes) {
      // Skip if already has username
      if (athlete.username) {
        console.log(`⏭️  Skipped: ${athlete.first_name} ${athlete.last_name} (already has username: ${athlete.username})`);
        results.push({
          name: `${athlete.first_name} ${athlete.last_name}`,
          username: athlete.username,
          status: 'skipped',
          message: 'Already has username'
        });
        skippedCount++;
        continue;
      }

      if (athlete.first_name && athlete.last_name) {
        let username = `${athlete.first_name.toLowerCase().replace(/\s+/g, '-')}-${athlete.last_name.toLowerCase().replace(/\s+/g, '-')}`;

        const { error: updateError } = await supabase
          .from('users')
          .update({ username })
          .eq('id', athlete.id);

        if (updateError) {
          // Handle duplicate username
          if (updateError.code === '23505') {
            let attempt = 1;
            let success = false;

            while (attempt <= 10 && !success) {
              const numberedUsername = `${username}-${attempt}`;
              const { error: retryError } = await supabase
                .from('users')
                .update({ username: numberedUsername })
                .eq('id', athlete.id);

              if (!retryError) {
                console.log(`✅ ${athlete.first_name} ${athlete.last_name} → ${numberedUsername}`);
                results.push({
                  name: `${athlete.first_name} ${athlete.last_name}`,
                  username: numberedUsername,
                  status: 'success'
                });
                successCount++;
                success = true;
              }
              attempt++;
            }

            if (!success) {
              console.log(`❌ Failed: ${athlete.first_name} ${athlete.last_name} (couldn't find unique username)`);
              results.push({
                name: `${athlete.first_name} ${athlete.last_name}`,
                username: null,
                status: 'failed',
                message: 'Could not find unique username'
              });
              failCount++;
            }
          } else {
            console.log(`❌ Failed: ${athlete.first_name} ${athlete.last_name} - ${updateError.message}`);
            results.push({
              name: `${athlete.first_name} ${athlete.last_name}`,
              username: null,
              status: 'failed',
              message: updateError.message
            });
            failCount++;
          }
        } else {
          console.log(`✅ ${athlete.first_name} ${athlete.last_name} → ${username}`);
          results.push({
            name: `${athlete.first_name} ${athlete.last_name}`,
            username,
            status: 'success'
          });
          successCount++;
        }
      }
    }

    // Get Sarah's username
    const { data: sarah } = await supabase
      .from('users')
      .select('username, first_name, last_name')
      .eq('email', 'sarah.johnson@test.com')
      .single();

    console.log(`\n📊 Results: ${successCount} successful, ${skippedCount} skipped, ${failCount} failed`);

    return NextResponse.json({
      success: true,
      summary: {
        total: athletes.length,
        successful: successCount,
        skipped: skippedCount,
        failed: failCount
      },
      results,
      sarahProfile: sarah ? {
        username: sarah.username,
        url: `http://localhost:3000/athletes/${sarah.username}`
      } : null
    });

  } catch (error: any) {
    console.error('❌ Error generating usernames:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
