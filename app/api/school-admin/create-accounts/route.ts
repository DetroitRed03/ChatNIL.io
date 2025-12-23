import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface StudentAccount {
  first_name: string;
  last_name: string;
  school_email: string;
  graduation_year: number;
  sport: string;
}

/**
 * POST /api/school-admin/create-accounts
 * Bulk create student-athlete accounts for a school
 *
 * Body:
 * - students: StudentAccount[] (array of student objects)
 *
 * Requirements:
 * - User must be a school administrator
 * - Must have can_create_accounts permission
 * - Batch size must not exceed max_accounts_per_batch
 *
 * Response:
 * - success: number of accounts created
 * - failed: number of accounts that failed
 * - results: array of created accounts with setup codes
 * - errors: array of errors for failed accounts
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a school admin
    const { data: schoolAdmin, error: adminError } = await supabase
      .from('school_administrators')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (adminError || !schoolAdmin) {
      return NextResponse.json(
        { error: 'Not authorized as school administrator' },
        { status: 403 }
      );
    }

    // Check permissions
    const permissions = schoolAdmin.permissions as any;
    if (!permissions?.can_create_accounts) {
      return NextResponse.json(
        { error: 'Account creation not permitted for this administrator' },
        { status: 403 }
      );
    }

    const { students } = await request.json();

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: 'Students array required and must not be empty' },
        { status: 400 }
      );
    }

    // Check batch size limit
    const maxBatchSize = schoolAdmin.max_accounts_per_batch || 100;
    if (students.length > maxBatchSize) {
      return NextResponse.json(
        {
          error: `Batch size exceeds limit`,
          max_allowed: maxBatchSize,
          provided: students.length
        },
        { status: 400 }
      );
    }

    // Validate student data
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      if (!student.first_name || !student.last_name || !student.school_email || !student.graduation_year || !student.sport) {
        return NextResponse.json(
          {
            error: `Invalid student data at index ${i}`,
            required: ['first_name', 'last_name', 'school_email', 'graduation_year', 'sport']
          },
          { status: 400 }
        );
      }
    }

    const serviceClient = createServiceRoleClient();
    const results = [];
    const errors = [];

    // Create batch record
    const { data: batch, error: batchError } = await serviceClient
      .from('school_account_batches')
      .insert({
        school_admin_id: schoolAdmin.id,
        school_name: schoolAdmin.school_name,
        accounts_requested: students.length,
        status: 'processing',
        created_by: user.id
      })
      .select()
      .single();

    if (batchError) {
      console.error('Error creating batch record:', batchError);
      return NextResponse.json(
        { error: 'Failed to create batch record' },
        { status: 500 }
      );
    }

    // Process each student
    for (let i = 0; i < students.length; i++) {
      const student = students[i] as StudentAccount;

      try {
        // Generate temporary password (simple for now, should be more secure in production)
        const tempPassword = `${student.first_name.toLowerCase()}${student.graduation_year}!`;

        // Generate setup code
        const setupCode = `${schoolAdmin.school_name.replace(/\s/g, '')}-${Date.now()}-${i}`;

        // Create auth user
        const { data: authUser, error: authErr } = await serviceClient.auth.admin.createUser({
          email: student.school_email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            school_created: true,
            created_by_admin: user.id,
            school_name: schoolAdmin.school_name
          }
        });

        if (authErr) throw authErr;

        // Create user profile (minimal data for FERPA compliance)
        const { error: profileErr } = await serviceClient
          .from('users')
          .insert({
            id: authUser.user.id,
            email: student.school_email,
            role: 'athlete',
            first_name: student.first_name,
            last_name: student.last_name,
            graduation_year: student.graduation_year,
            primary_sport: student.sport,
            school_name: schoolAdmin.school_name,
            school_created: true,
            profile_completion_tier: 'basic',
            school_setup_code: setupCode,
            school_admin_id: user.id,
            home_completion_required: true,
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileErr) throw profileErr;

        results.push({
          email: student.school_email,
          name: `${student.first_name} ${student.last_name}`,
          setup_code: setupCode,
          temp_password: tempPassword,
          success: true,
          user_id: authUser.user.id
        });
      } catch (err: any) {
        console.error(`Error creating account for ${student.school_email}:`, err);
        errors.push({
          row: i,
          email: student.school_email,
          name: `${student.first_name} ${student.last_name}`,
          error: err.message || 'Unknown error',
          success: false
        });
      }
    }

    // Update batch with results
    if (batch) {
      const batchUpdate = {
        success_count: results.length,
        failure_count: errors.length,
        status: errors.length === 0 ? 'completed' : (results.length === 0 ? 'failed' : 'partial'),
        created_user_ids: results.map(r => r.user_id),
        error_log: errors,
        completed_at: new Date().toISOString()
      };

      await serviceClient
        .from('school_account_batches')
        .update(batchUpdate)
        .eq('id', batch.id);
    }

    // Update admin's account count
    await serviceClient
      .from('school_administrators')
      .update({
        accounts_created_count: schoolAdmin.accounts_created_count + results.length,
        last_batch_created_at: new Date().toISOString()
      })
      .eq('id', schoolAdmin.id);

    return NextResponse.json({
      success: true,
      batch_id: batch?.id,
      results: {
        successful: results.length,
        failed: errors.length,
        total: students.length
      },
      accounts: results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully created ${results.length} of ${students.length} accounts`
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/school-admin/create-accounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/school-admin/create-accounts
 * Get batch history for the school admin
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a school admin
    const { data: schoolAdmin, error: adminError } = await supabase
      .from('school_administrators')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !schoolAdmin) {
      return NextResponse.json(
        { error: 'Not authorized as school administrator' },
        { status: 403 }
      );
    }

    // Get batches
    const { data: batches, error } = await supabase
      .from('school_account_batches')
      .select('*')
      .eq('school_admin_id', schoolAdmin.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching batches:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      batches: batches || [],
      count: batches?.length || 0
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/school-admin/create-accounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
