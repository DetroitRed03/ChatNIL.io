import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/compliance/import/template
 *
 * Returns a CSV template for bulk athlete import.
 * Only accessible by compliance officers.
 */
export async function GET(request: NextRequest) {
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
      .select('role, institution_info')
      .eq('id', authUser.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if user has compliance officer role
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

    // 3. Generate CSV template
    const csvHeaders = [
      'email',           // Required - Must be valid email
      'first_name',      // Required
      'last_name',       // Required
      'sport',           // Required - Primary sport
      'state',           // Required - State code (e.g., CA, NY)
      'school_name',     // Optional - defaults to compliance officer's institution
      'position',        // Optional - Position in sport
      'graduation_year', // Optional - Expected graduation year
      'phone',           // Optional - Contact phone
      'instagram',       // Optional - Instagram handle
      'tiktok',          // Optional - TikTok handle
      'twitter',         // Optional - Twitter/X handle
      'date_of_birth',   // Optional - YYYY-MM-DD format
    ];

    // Create sample data rows
    const sampleRows = [
      [
        'john.doe@school.edu',
        'John',
        'Doe',
        'Basketball',
        'CA',
        'Central High School',
        'Point Guard',
        '2025',
        '555-123-4567',
        '@johndoe_hoops',
        '@johndoe',
        '@johnd',
        '2007-05-15',
      ],
      [
        'jane.smith@school.edu',
        'Jane',
        'Smith',
        'Soccer',
        'CA',
        'Central High School',
        'Forward',
        '2026',
        '',
        '@janesmith',
        '',
        '',
        '2008-11-22',
      ],
    ];

    // Build CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...sampleRows.map(row => row.map(cell =>
        // Quote cells that contain commas
        cell.includes(',') ? `"${cell}"` : cell
      ).join(',')),
    ].join('\n');

    // 4. Return CSV file
    const response = new NextResponse(csvContent);
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set('Content-Disposition', 'attachment; filename="athlete_import_template.csv"');

    return response;

  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
