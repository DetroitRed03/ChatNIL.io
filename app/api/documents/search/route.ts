/**
 * Document Search API
 *
 * POST /api/documents/search
 *
 * Semantic search over user's documents.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { searchDocuments } from '@/lib/documents/retriever';
import type { DocumentType } from '@/lib/documents/types';

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { query, maxResults, minSimilarity, documentTypes, documentIds } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Verify user
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Search documents
    const results = await searchDocuments({
      userId: user.id,
      query,
      maxResults: maxResults || 5,
      minSimilarity: minSimilarity || 0.7,
      documentTypes: documentTypes as DocumentType[] | undefined,
      documentIds,
    });

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
    });

  } catch (error: any) {
    console.error('Document search error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
