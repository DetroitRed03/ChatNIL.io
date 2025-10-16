import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  console.log('🚀 === API ROUTE: SAVE PARTIAL PROGRESS ===');

  try {
    const { userId, partialData } = await request.json();

    console.log('📋 Partial progress save request:', {
      userId,
      hasPartialData: !!partialData
    });

    if (!userId || !partialData) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing userId or partialData' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      console.log('❌ Service role client not available');
      return NextResponse.json(
        { error: 'Service role client not configured' },
        { status: 500 }
      );
    }

    console.log('🔍 Verifying user exists in auth...');
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser?.user) {
      console.log('❌ User verification failed:', authError);
      return NextResponse.json(
        { error: 'User not found or invalid' },
        { status: 404 }
      );
    }

    console.log('✅ User verified in auth system');

    console.log('💾 Saving partial progress with admin privileges...');
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(partialData)
      .eq('id', userId)
      .select('id')
      .single();

    if (error) {
      console.error('❌ Database update failed:', error);
      return NextResponse.json(
        { error: 'Failed to save partial progress', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Partial progress saved successfully:', userId);

    return NextResponse.json({
      success: true,
      userId,
      message: 'Partial progress saved successfully'
    });

  } catch (error: any) {
    console.error('💥 Partial progress save failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}