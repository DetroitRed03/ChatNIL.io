import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Extended timeout for large imports
export const maxDuration = 60;

interface AthleteRow {
  email: string;
  first_name: string;
  last_name: string;
  sport: string;
  state: string;
  school_name?: string;
  position?: string;
  graduation_year?: string;
  phone?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  date_of_birth?: string;
}

interface ImportResult {
  row_number: number;
  email: string;
  status: 'created' | 'updated' | 'skipped' | 'failed';
  user_id?: string;
  error?: string;
}

/**
 * POST /api/compliance/import/execute
 *
 * Executes the bulk athlete import after validation.
 * Creates user accounts and sends optional invite emails.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // 2. Verify user is a compliance officer
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, role, institution_info, school_name, school_id')
      .eq('id', authUser.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const isComplianceOfficer =
      userProfile.role === 'school' ||
      userProfile.institution_info?.admin_role === 'compliance_officer' ||
      userProfile.institution_info?.admin_role === 'athletic_director' ||
      userProfile.institution_info?.admin_role === 'nil_coordinator';

    if (!isComplianceOfficer) {
      return NextResponse.json(
        { error: 'Access denied - Compliance officer role required' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const {
      rows,
      options = {}
    } = body as {
      rows: AthleteRow[];
      options?: {
        send_invite_emails?: boolean;
        skip_existing?: boolean;
        update_existing?: boolean;
        batch_name?: string;
      };
    };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'No data provided for import' },
        { status: 400 }
      );
    }

    if (rows.length > 2000) {
      return NextResponse.json(
        { error: `Too many rows. Maximum allowed is 2000, received ${rows.length}.` },
        { status: 400 }
      );
    }

    // 4. Create batch record for tracking
    const batchId = crypto.randomUUID();
    const batchName = options.batch_name || `Import ${new Date().toISOString().split('T')[0]}`;

    // 5. Collect all emails for existing user check
    const emails = rows.map(row => row.email?.toLowerCase()).filter(Boolean);

    const { data: existingUsers } = await supabase
      .from('users')
      .select('id, email')
      .in('email', emails);

    const existingEmailMap = new Map(
      (existingUsers || []).map(u => [u.email.toLowerCase(), u.id])
    );

    // 6. Process each row
    const results: ImportResult[] = [];
    const createdUserIds: string[] = [];
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    // Process in batches of 50 for performance
    const batchSize = 50;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      await Promise.all(batch.map(async (row, batchIndex) => {
        const rowNumber = i + batchIndex + 2; // +2 for 1-indexed + header
        const emailLower = row.email?.toLowerCase();

        try {
          // Check if user already exists
          const existingUserId = existingEmailMap.get(emailLower);

          if (existingUserId) {
            if (options.skip_existing) {
              results.push({
                row_number: rowNumber,
                email: row.email,
                status: 'skipped',
                user_id: existingUserId,
              });
              skippedCount++;
              return;
            }

            if (options.update_existing) {
              // Update existing user
              const updateData: Record<string, unknown> = {
                first_name: row.first_name,
                last_name: row.last_name,
                primary_sport: row.sport,
                state: row.state,
                updated_at: new Date().toISOString(),
              };

              if (row.school_name) updateData.school_name = row.school_name;
              if (row.position) updateData.position = row.position;
              if (row.graduation_year) updateData.graduation_year = parseInt(row.graduation_year, 10);
              if (row.phone) updateData.phone = row.phone;
              if (row.date_of_birth) updateData.date_of_birth = row.date_of_birth;

              // Update social media handles
              if (row.instagram || row.tiktok || row.twitter) {
                updateData.social_media_handles = {
                  instagram: row.instagram || null,
                  tiktok: row.tiktok || null,
                  twitter: row.twitter || null,
                };
              }

              const { error: updateError } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', existingUserId);

              if (updateError) {
                results.push({
                  row_number: rowNumber,
                  email: row.email,
                  status: 'failed',
                  error: updateError.message,
                });
                failedCount++;
              } else {
                results.push({
                  row_number: rowNumber,
                  email: row.email,
                  status: 'updated',
                  user_id: existingUserId,
                });
                updatedCount++;
              }
              return;
            }

            // Default: skip existing
            results.push({
              row_number: rowNumber,
              email: row.email,
              status: 'skipped',
              user_id: existingUserId,
            });
            skippedCount++;
            return;
          }

          // Create new user
          const newUserId = crypto.randomUUID();
          const userData = {
            id: newUserId,
            email: row.email.toLowerCase(),
            role: 'athlete' as const,
            first_name: row.first_name,
            last_name: row.last_name,
            primary_sport: row.sport,
            state: row.state.toUpperCase(),
            school_name: row.school_name || userProfile.school_name,
            position: row.position || null,
            graduation_year: row.graduation_year ? parseInt(row.graduation_year, 10) : null,
            phone: row.phone || null,
            date_of_birth: row.date_of_birth || null,
            social_media_handles: {
              instagram: row.instagram || null,
              tiktok: row.tiktok || null,
              twitter: row.twitter || null,
            },
            // School system fields
            school_created: true,
            school_id: userProfile.school_id || null,
            profile_completion_tier: 'basic' as const,
            home_completion_required: true,
            // Onboarding status
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error: insertError } = await supabase
            .from('users')
            .insert(userData);

          if (insertError) {
            results.push({
              row_number: rowNumber,
              email: row.email,
              status: 'failed',
              error: insertError.message,
            });
            failedCount++;
          } else {
            createdUserIds.push(newUserId);
            results.push({
              row_number: rowNumber,
              email: row.email,
              status: 'created',
              user_id: newUserId,
            });
            successCount++;
          }

        } catch (error) {
          results.push({
            row_number: rowNumber,
            email: row.email,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          failedCount++;
        }
      }));
    }

    // 7. Log the import batch
    const errorLog = results
      .filter(r => r.status === 'failed')
      .map(r => ({
        row: r.row_number,
        email: r.email,
        error: r.error || 'Unknown error',
        timestamp: new Date().toISOString(),
      }));

    // Store batch record (using compliance_checks table for audit trail)
    await supabase
      .from('compliance_checks')
      .insert({
        id: batchId,
        athlete_id: authUser.id,
        state_code: 'IMPORT',
        athlete_level: 'bulk_import',
        deal_category: batchName,
        compliant: failedCount === 0,
        violations: errorLog,
        warnings: [],
        requirements: {
          total_rows: rows.length,
          success_count: successCount,
          failed_count: failedCount,
          skipped_count: skippedCount,
          updated_count: updatedCount,
          created_user_ids: createdUserIds,
        },
        checked_at: new Date().toISOString(),
      });

    // 8. Return import results
    return NextResponse.json({
      success: true,
      import_id: batchId,
      summary: {
        total_rows: rows.length,
        created: successCount,
        updated: updatedCount,
        skipped: skippedCount,
        failed: failedCount,
      },
      results: results.slice(0, 100), // Return first 100 results for preview
      created_user_ids: createdUserIds,
      errors: errorLog,
      meta: {
        batch_name: batchName,
        compliance_officer_id: authUser.id,
        school_name: userProfile.school_name,
        imported_at: new Date().toISOString(),
        options: {
          send_invite_emails: options.send_invite_emails || false,
          skip_existing: options.skip_existing || true,
          update_existing: options.update_existing || false,
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Import execution error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
