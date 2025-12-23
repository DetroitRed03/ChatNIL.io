import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/documents/[id]/download
 * Generate a secure, signed URL for downloading a specific document
 * URL is time-limited (expires in 60 seconds) for security
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient();
    const documentId = params.id;

    // Get authenticated user
    const routeClient = await createClient();
    const { data: { user }, error: authError } = await routeClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get document to verify ownership and get storage path
    const { data: document, error: fetchError } = await supabase
      .from('chat_attachments')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !document) {
      console.error('Document fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Document not found or unauthorized' },
        { status: 404 }
      );
    }

    // Generate signed URL (expires in 60 seconds)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('user-documents')
      .createSignedUrl(document.storage_path, 60);

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL generation error:', signedUrlError);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: signedUrlData.signedUrl,
      fileName: document.file_name,
      fileSize: document.file_size,
      fileType: document.file_type,
      expiresIn: 60, // seconds
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/documents/[id]/download:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
