import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    const { dealId } = await params;

    // Get auth token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify user owns this deal
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: deal, error: dealError } = await supabase
      .from('nil_deals')
      .select('id, athlete_id')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Check athlete ownership
    const { data: athlete } = await supabase
      .from('athlete_profiles')
      .select('user_id')
      .eq('id', deal.athlete_id)
      .single();

    if (athlete?.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Process the file upload
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, Word, or image files.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const fileExt = file.name.split('.').pop() || 'pdf';
    const fileName = `contracts/${dealId}/${Date.now()}-contract.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Update deal with contract URL
    const { error: updateError } = await supabase
      .from('nil_deals')
      .update({
        contract_url: publicUrl,
        contract_uploaded_at: new Date().toISOString(),
        // Bump document hygiene score since contract is uploaded
        updated_at: new Date().toISOString(),
      })
      .eq('id', dealId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
    }

    // Log to audit trail
    await supabase.from('compliance_audit_log').insert({
      deal_id: dealId,
      athlete_id: deal.athlete_id,
      action: 'contract_uploaded',
      details: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
      },
    }).catch(err => console.warn('Audit log failed:', err));

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: 'Contract uploaded successfully',
    });
  } catch (error) {
    console.error('Upload contract error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
