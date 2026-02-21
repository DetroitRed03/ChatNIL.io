import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Get user's role from metadata
      const role = user.user_metadata?.role;

      // Redirect based on role to the appropriate onboarding page
      const redirectMap: Record<string, string> = {
        'hs_student': '/onboarding/hs-student',
        'hs_athlete': '/onboarding/hs-student',
        'college_athlete': '/onboarding/college-athlete',
        'parent': '/onboarding/parent',
        'compliance_officer': '/onboarding/compliance-officer',
      };

      const redirectTo = redirectMap[role] || '/onboarding/role-selection';
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    }
  }

  // Something went wrong, redirect to signup with error
  return NextResponse.redirect(new URL('/signup?error=verification_failed', requestUrl.origin));
}
