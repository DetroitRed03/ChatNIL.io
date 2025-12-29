/**
 * Document Upload API
 *
 * POST /api/documents/upload
 *
 * Handles document uploads and initiates processing.
 * Supports PDF, Word docs, and images.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processDocument } from '@/lib/documents/processor';
import { isSupportedFileType, type DocumentSource } from '@/lib/documents/types';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const source = (formData.get('source') as DocumentSource) || 'library';
    const chatId = formData.get('chatId') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isSupportedFileType(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported file type. Supported: PDF, Word (.docx, .doc), Images (.jpg, .png)',
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process document
    console.log(`Processing document: ${file.name} (${file.type})`);

    const result = await processDocument(buffer, file.name, file.type, {
      userId: user.id,
      source,
      chatId: chatId || undefined,
      generateEmbeddings: true,
      detectDocumentType: true,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Processing failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documentId: result.documentId,
      document: result.document,
      message: 'Document uploaded and processed successfully',
    });

  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
