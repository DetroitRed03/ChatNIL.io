/**
 * Process Memory API - Extract memories from conversations
 *
 * This endpoint processes a chat session to:
 * 1. Extract user memories (facts, preferences, context, goals)
 * 2. Generate session summary with embedding
 *
 * Call this after a conversation ends or reaches a significant length.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processConversation } from '@/lib/ai/memory';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface ProcessMemoryRequest {
  userId: string;
  sessionId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessMemoryRequest = await request.json();
    const { userId, sessionId } = body;

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'userId and sessionId are required' },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch messages for the session
    const { data: messages, error: fetchError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Failed to fetch messages:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    if (!messages || messages.length < 2) {
      return NextResponse.json({
        success: true,
        message: 'Not enough messages to process',
        memoriesExtracted: 0,
        summaryGenerated: false
      });
    }

    // Process the conversation
    console.log(`🧠 Processing memory for session ${sessionId} (${messages.length} messages)`);

    const result = await processConversation({
      userId,
      sessionId,
      messages: messages.map(m => ({ role: m.role, content: m.content }))
    });

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error processing memory:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for status/testing
export async function GET() {
  return NextResponse.json({
    status: 'Memory Processing API Ready',
    description: 'POST with { userId, sessionId } to process a conversation and extract memories'
  });
}
