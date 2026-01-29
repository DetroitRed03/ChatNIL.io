import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// US State codes for validation
const US_STATE_CODES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

// Supported sports list
const SUPPORTED_SPORTS = [
  'Basketball', 'Football', 'Soccer', 'Baseball', 'Softball',
  'Volleyball', 'Tennis', 'Golf', 'Swimming', 'Track & Field',
  'Cross Country', 'Wrestling', 'Lacrosse', 'Hockey', 'Field Hockey',
  'Gymnastics', 'Cheerleading', 'Dance', 'Esports', 'Other'
];

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

interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

interface ValidationWarning {
  row: number;
  field: string;
  value: string;
  message: string;
}

interface ValidatedRow extends AthleteRow {
  row_number: number;
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  is_duplicate: boolean;
  existing_user_id?: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateDate(dateStr: string): boolean {
  if (!dateStr) return true; // Optional field
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

function validateGraduationYear(yearStr: string): boolean {
  if (!yearStr) return true; // Optional field
  const year = parseInt(yearStr, 10);
  const currentYear = new Date().getFullYear();
  return !isNaN(year) && year >= currentYear && year <= currentYear + 10;
}

function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

function normalizeHandle(handle: string): string {
  return handle.startsWith('@') ? handle.slice(1) : handle;
}

/**
 * POST /api/compliance/import/validate
 *
 * Validates CSV data for bulk athlete import.
 * Returns validation results with errors, warnings, and preview data.
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
      .select('role, institution_info, school_name')
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
    const { rows, column_mapping } = body as {
      rows: Record<string, string>[];
      column_mapping?: Record<string, string>;
    };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'No data provided. Please upload a CSV file with athlete data.' },
        { status: 400 }
      );
    }

    // Check row limit
    if (rows.length > 2000) {
      return NextResponse.json(
        { error: `Too many rows. Maximum allowed is 2000, received ${rows.length}.` },
        { status: 400 }
      );
    }

    // 4. Apply column mapping if provided
    const mappedRows: AthleteRow[] = rows.map(row => {
      const mapped: Record<string, string> = {};
      for (const [key, value] of Object.entries(row)) {
        const mappedKey = column_mapping?.[key] || key.toLowerCase().replace(/\s+/g, '_');
        mapped[mappedKey] = value?.toString().trim() || '';
      }
      return mapped as unknown as AthleteRow;
    });

    // 5. Collect all emails for duplicate checking
    const emails = mappedRows
      .map(row => row.email?.toLowerCase())
      .filter(Boolean);

    // Check for existing users with these emails
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id, email')
      .in('email', emails);

    const existingEmailMap = new Map(
      (existingUsers || []).map(u => [u.email.toLowerCase(), u.id])
    );

    // Track duplicates within the file
    const seenEmails = new Set<string>();

    // 6. Validate each row
    const validatedRows: ValidatedRow[] = mappedRows.map((row, index) => {
      const rowNumber = index + 2; // +2 for 1-indexed + header row
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];
      let isDuplicate = false;
      let existingUserId: string | undefined;

      // Required field: email
      if (!row.email) {
        errors.push({
          row: rowNumber,
          field: 'email',
          value: '',
          message: 'Email is required'
        });
      } else if (!validateEmail(row.email)) {
        errors.push({
          row: rowNumber,
          field: 'email',
          value: row.email,
          message: 'Invalid email format'
        });
      } else {
        const emailLower = row.email.toLowerCase();
        // Check for duplicates within file
        if (seenEmails.has(emailLower)) {
          errors.push({
            row: rowNumber,
            field: 'email',
            value: row.email,
            message: 'Duplicate email in file'
          });
          isDuplicate = true;
        } else {
          seenEmails.add(emailLower);
        }

        // Check for existing users
        if (existingEmailMap.has(emailLower)) {
          warnings.push({
            row: rowNumber,
            field: 'email',
            value: row.email,
            message: 'User with this email already exists'
          });
          existingUserId = existingEmailMap.get(emailLower);
        }
      }

      // Required field: first_name
      if (!row.first_name) {
        errors.push({
          row: rowNumber,
          field: 'first_name',
          value: '',
          message: 'First name is required'
        });
      }

      // Required field: last_name
      if (!row.last_name) {
        errors.push({
          row: rowNumber,
          field: 'last_name',
          value: '',
          message: 'Last name is required'
        });
      }

      // Required field: sport
      if (!row.sport) {
        errors.push({
          row: rowNumber,
          field: 'sport',
          value: '',
          message: 'Sport is required'
        });
      } else {
        const sportNormalized = row.sport.trim();
        const matchedSport = SUPPORTED_SPORTS.find(
          s => s.toLowerCase() === sportNormalized.toLowerCase()
        );
        if (!matchedSport) {
          warnings.push({
            row: rowNumber,
            field: 'sport',
            value: row.sport,
            message: `Sport "${row.sport}" not in standard list. Will be imported as-is.`
          });
        }
      }

      // Required field: state
      if (!row.state) {
        errors.push({
          row: rowNumber,
          field: 'state',
          value: '',
          message: 'State is required'
        });
      } else {
        const stateUpper = row.state.toUpperCase().trim();
        if (!US_STATE_CODES.includes(stateUpper)) {
          errors.push({
            row: rowNumber,
            field: 'state',
            value: row.state,
            message: `Invalid state code. Must be a valid US state abbreviation (e.g., CA, NY)`
          });
        }
      }

      // Optional: graduation_year
      if (row.graduation_year && !validateGraduationYear(row.graduation_year)) {
        errors.push({
          row: rowNumber,
          field: 'graduation_year',
          value: row.graduation_year,
          message: 'Invalid graduation year. Must be a valid year between now and 10 years from now.'
        });
      }

      // Optional: date_of_birth
      if (row.date_of_birth && !validateDate(row.date_of_birth)) {
        errors.push({
          row: rowNumber,
          field: 'date_of_birth',
          value: row.date_of_birth,
          message: 'Invalid date format. Use YYYY-MM-DD format.'
        });
      }

      // Optional: phone - just warn about format
      if (row.phone) {
        const cleanedPhone = cleanPhoneNumber(row.phone);
        if (cleanedPhone.length < 10 || cleanedPhone.length > 11) {
          warnings.push({
            row: rowNumber,
            field: 'phone',
            value: row.phone,
            message: 'Phone number may be invalid. Expected 10-11 digits.'
          });
        }
      }

      // Normalize social handles
      if (row.instagram) {
        row.instagram = normalizeHandle(row.instagram);
      }
      if (row.tiktok) {
        row.tiktok = normalizeHandle(row.tiktok);
      }
      if (row.twitter) {
        row.twitter = normalizeHandle(row.twitter);
      }

      // Use compliance officer's school if not provided
      if (!row.school_name && userProfile.school_name) {
        row.school_name = userProfile.school_name;
      }

      return {
        ...row,
        row_number: rowNumber,
        is_valid: errors.length === 0,
        errors,
        warnings,
        is_duplicate: isDuplicate,
        existing_user_id: existingUserId,
      };
    });

    // 7. Calculate summary statistics
    const totalRows = validatedRows.length;
    const validRows = validatedRows.filter(r => r.is_valid).length;
    const invalidRows = totalRows - validRows;
    const rowsWithWarnings = validatedRows.filter(r => r.warnings.length > 0).length;
    const duplicatesInFile = validatedRows.filter(r => r.is_duplicate).length;
    const existingUsersCount = validatedRows.filter(r => r.existing_user_id).length;

    const allErrors = validatedRows.flatMap(r => r.errors);
    const allWarnings = validatedRows.flatMap(r => r.warnings);

    // 8. Return validation results
    return NextResponse.json({
      success: true,
      validation: {
        is_valid: invalidRows === 0,
        summary: {
          total_rows: totalRows,
          valid_rows: validRows,
          invalid_rows: invalidRows,
          rows_with_warnings: rowsWithWarnings,
          duplicates_in_file: duplicatesInFile,
          existing_users: existingUsersCount,
          total_errors: allErrors.length,
          total_warnings: allWarnings.length,
        },
        errors: allErrors.slice(0, 100), // Limit to first 100 errors
        warnings: allWarnings.slice(0, 100), // Limit to first 100 warnings
        preview: validatedRows.slice(0, 10), // Preview first 10 rows
      },
      meta: {
        compliance_officer_id: authUser.id,
        default_school: userProfile.school_name,
        validated_at: new Date().toISOString(),
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
