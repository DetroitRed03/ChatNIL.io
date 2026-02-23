/**
 * POST /api/library/upload-document
 *
 * Upload a non-deal document (tax form, receipt, ID, etc.)
 * Stores file without triggering compliance review.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { ACCEPTED_MIME_TYPES } from '@/lib/uploads/file-types';
import { requiresComplianceReview } from '@/lib/documents/categories';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(request: NextRequest) {
  // Auth check
  const cookieStore = await cookies();
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  let { data: { user } } = await supabase.auth.getUser();
  if (!user && bearerToken) {
    const { data: { user: tokenUser } } = await supabase.auth.getUser(bearerToken);
    if (tokenUser) user = tokenUser;
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse form data
  let file: File;
  let documentType: string;
  try {
    const formData = await request.formData();
    const f = formData.get('file');
    const dt = formData.get('documentType');
    if (!f || !(f instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!dt || typeof dt !== 'string') {
      return NextResponse.json({ error: 'No document type specified' }, { status: 400 });
    }
    file = f;
    documentType = dt;
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  // Validate
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}` },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 25MB.' }, { status: 400 });
  }

  // Reject deal documents through this route — they should use /api/library/analyze
  if (requiresComplianceReview(documentType)) {
    return NextResponse.json(
      { error: 'Deal documents should be uploaded through the analysis flow.' },
      { status: 400 }
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const fileExt = file.name.split('.').pop() || 'bin';
    const storagePath = `${user.id}/documents/${crypto.randomUUID()}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('user-documents')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('user-documents')
      .getPublicUrl(storagePath);

    // Store in athlete_documents table
    const { data: doc, error: dbError } = await supabaseAdmin
      .from('athlete_documents')
      .insert({
        athlete_id: user.id,
        document_type: documentType,
        file_name: file.name,
        file_url: publicUrl,
        file_path: storagePath,
        file_size_bytes: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    return NextResponse.json({
      success: true,
      document: doc,
      requiresReview: false,
    });
  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
