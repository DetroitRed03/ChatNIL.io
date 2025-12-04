import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import type { UserDocument, DocumentsStats } from '@/types';

const STORAGE_LIMIT_MB = 100;
const STORAGE_LIMIT_BYTES = STORAGE_LIMIT_MB * 1024 * 1024;

/**
 * GET /api/documents
 * Fetch all documents for the authenticated user
 * Query params:
 *   - sessionId: Filter by specific chat session
 *   - limit: Limit number of results
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Build query
    let query = supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter by session if provided
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }

    const { data: documents, error: queryError } = await query;

    if (queryError) {
      console.error('Error fetching documents:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    // Transform database records to UserDocument interface
    const userDocuments: UserDocument[] = (documents || []).map((doc: any) => ({
      id: doc.id,
      fileName: doc.file_name,
      fileSize: doc.file_size,
      fileType: doc.file_type,
      storagePath: doc.storage_path,
      publicUrl: doc.public_url,
      createdAt: doc.created_at,
      sessionId: doc.session_id,
      sessionTitle: doc.session_title || 'Untitled Chat',
      messageId: doc.message_id,
      userId: doc.user_id,
    }));

    // Calculate stats
    const stats: DocumentsStats = calculateDocumentStats(userDocuments);

    return NextResponse.json({
      documents: userDocuments,
      stats,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents
 * Upload a new document to Supabase Storage
 * Requires multipart/form-data with:
 *   - file: The file to upload
 *   - sessionId: Chat session ID
 *   - messageId: (optional) Message ID this file is attached to
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient(); // Use service role for storage upload

    // Get authenticated user
    const routeClient = await createClient();
    const { data: { user }, error: authError } = await routeClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;
    const messageId = formData.get('messageId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Validate file size (50MB limit per file)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Check user's total storage usage
    const { data: existingDocs } = await supabase
      .from('chat_attachments')
      .select('file_size')
      .eq('user_id', user.id);

    const totalUsage = (existingDocs || []).reduce((sum: number, doc: any) => sum + doc.file_size, 0);

    if (totalUsage + file.size > STORAGE_LIMIT_BYTES) {
      return NextResponse.json(
        { error: `Storage limit exceeded. ${STORAGE_LIMIT_MB}MB maximum per user.` },
        { status: 413 }
      );
    }

    // Create unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${user.id}/${sessionId}/${fileName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-documents')
      .getPublicUrl(filePath);

    // Create database record
    const { data: attachment, error: dbError } = await supabase
      .from('chat_attachments')
      .insert({
        user_id: user.id,
        session_id: sessionId,
        message_id: messageId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: filePath,
        public_url: publicUrl,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up uploaded file
      await supabase.storage.from('user-documents').remove([filePath]);
      return NextResponse.json(
        { error: 'Failed to save file metadata' },
        { status: 500 }
      );
    }

    // Get session title for response
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('title')
      .eq('id', sessionId)
      .single();

    const document: UserDocument = {
      id: attachment.id,
      fileName: attachment.file_name,
      fileSize: attachment.file_size,
      fileType: attachment.file_type,
      storagePath: attachment.storage_path,
      publicUrl: attachment.public_url,
      createdAt: attachment.created_at,
      sessionId: attachment.session_id,
      sessionTitle: session?.title || 'Untitled Chat',
      messageId: attachment.message_id,
      userId: attachment.user_id,
    };

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents?id={documentId}
 * Delete a document from storage and database
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();

    // Get authenticated user
    const routeClient = await createClient();
    const { data: { user }, error: authError } = await routeClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get document ID from query
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
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
      return NextResponse.json(
        { error: 'Document not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user-documents')
      .remove([document.storage_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue with DB deletion even if storage delete fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('chat_attachments')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Database delete error:', dbError);
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to calculate document statistics
 */
function calculateDocumentStats(documents: UserDocument[]): DocumentsStats {
  const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
  const documentsByType: Record<string, number> = {};

  documents.forEach((doc) => {
    const type = doc.fileType.split('/')[0] || 'other';
    documentsByType[type] = (documentsByType[type] || 0) + 1;
  });

  return {
    totalDocuments: documents.length,
    totalSize,
    storageLimit: STORAGE_LIMIT_BYTES,
    storageUsedPercentage: (totalSize / STORAGE_LIMIT_BYTES) * 100,
    documentsByType,
    recentDocumentsCount: documents.filter((doc) => {
      const createdDate = new Date(doc.createdAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return createdDate > sevenDaysAgo;
    }).length,
  };
}
