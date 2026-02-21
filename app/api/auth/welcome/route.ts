import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email/send';

export async function POST(request: Request) {
  try {
    const { email, name, role } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    // Map signup role to email role type
    const roleMap: Record<string, 'athlete' | 'parent' | 'compliance_officer'> = {
      'hs_student': 'athlete',
      'hs_athlete': 'athlete',
      'college_athlete': 'athlete',
      'parent': 'parent',
      'compliance_officer': 'compliance_officer',
    };

    const emailRole = roleMap[role] || 'athlete';

    await sendWelcomeEmail(email, name, emailRole);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
