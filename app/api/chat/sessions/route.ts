import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Chat session types (local since chat_sessions table isn't in generated Database types)
interface ChatSession {
  id: string;
  user_id: string;
  title?: string;
  role_context?: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  draft?: string;
  created_at: string;
  updated_at: string;
}

interface ChatSessionInsert {
  id?: string;
  user_id: string;
  title?: string;
  role_context?: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  draft?: string;
  created_at?: string;
  updated_at?: string;
}

// Error response helper for consistent error formatting
function errorResponse(message: string, status: number, details?: string) {
  return NextResponse.json(
    {
      error: message,
      details: details || null,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

// Validate UUID format
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Use service role client to bypass RLS (same as profile API)
// Note: Using untyped client because chat_sessions isn't in Database types
const getSupabaseAdmin = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate userId parameter
    if (!userId) {
      return errorResponse('Missing required parameter', 400, 'userId query parameter is required');
    }

    if (!isValidUUID(userId)) {
      return errorResponse('Invalid parameter format', 400, 'userId must be a valid UUID');
    }

    console.log('✅ GET /api/chat/sessions - User ID from query:', userId);

    // Initialize Supabase client
    let supabaseAdmin;
    try {
      supabaseAdmin = getSupabaseAdmin();
    } catch (envError) {
      console.error('❌ Supabase configuration error:', envError);
      return errorResponse('Server configuration error', 500, 'Database connection not configured');
    }

    // Fetch user's chat sessions using service role (bypasses RLS)
    const { data: sessions, error } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching chat sessions:', error);

      // Handle specific Supabase errors
      if (error.code === 'PGRST301') {
        return errorResponse('Database connection failed', 503, 'Unable to connect to database');
      }
      if (error.code === '42P01') {
        return errorResponse('Table not found', 500, 'chat_sessions table may not exist');
      }

      return errorResponse('Failed to fetch chat sessions', 500, error.message);
    }

    console.log(`✅ Found ${sessions?.length || 0} chat sessions for user`);
    return NextResponse.json({
      sessions: sessions || [],
      count: sessions?.length || 0
    });
  } catch (error) {
    console.error('❌ Chat sessions API error:', error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid request format', 400, 'Request could not be parsed');
    }

    return errorResponse(
      'Internal server error',
      500,
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return errorResponse('Invalid request body', 400, 'Request body must be valid JSON');
    }

    const { userId, title } = body;

    // Validate required fields
    if (!userId) {
      return errorResponse('Missing required field', 400, 'userId is required in request body');
    }

    if (!title) {
      return errorResponse('Missing required field', 400, 'title is required in request body');
    }

    // Validate userId format
    if (!isValidUUID(userId)) {
      return errorResponse('Invalid field format', 400, 'userId must be a valid UUID');
    }

    // Validate title length
    if (typeof title !== 'string' || title.trim().length === 0) {
      return errorResponse('Invalid field value', 400, 'title must be a non-empty string');
    }

    if (title.length > 255) {
      return errorResponse('Invalid field value', 400, 'title must be 255 characters or less');
    }

    console.log('✅ POST /api/chat/sessions - User ID from body:', userId);

    // Initialize Supabase client
    let supabaseAdmin;
    try {
      supabaseAdmin = getSupabaseAdmin();
    } catch (envError) {
      console.error('❌ Supabase configuration error:', envError);
      return errorResponse('Server configuration error', 500, 'Database connection not configured');
    }

    // Create new chat session using service role
    const sessionData: ChatSessionInsert = {
      user_id: userId,
      title: title.trim()
    };

    const { data: newSession, error } = await supabaseAdmin
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error creating chat session:', error);

      // Handle specific Supabase errors
      if (error.code === '23503') {
        return errorResponse('User not found', 404, 'The specified user does not exist');
      }
      if (error.code === '23505') {
        return errorResponse('Duplicate session', 409, 'A session with this ID already exists');
      }
      if (error.code === 'PGRST301') {
        return errorResponse('Database connection failed', 503, 'Unable to connect to database');
      }

      return errorResponse('Failed to create chat session', 500, error.message);
    }

    console.log('✅ Created new chat session:', newSession.id);
    return NextResponse.json({
      session: newSession,
      message: 'Chat session created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Chat sessions API error:', error);

    return errorResponse(
      'Internal server error',
      500,
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}
