/**
 * AI-Powered Chat API with RAG (Retrieval Augmented Generation)
 *
 * This endpoint replaces mock responses with real AI using:
 * - OpenAI GPT-4 for natural language generation
 * - RAG for accurate NIL information from knowledge base
 * - Role-aware system prompts tailored to user type
 * - Streaming responses for better UX
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackEventServer } from '@/lib/analytics-server';
import { estimateTokenCount, estimateCost, categorizePrompt } from '@/lib/analytics';
import { getSystemPrompt, type UserContext } from '@/lib/ai/system-prompts';
import { getRAGContext, detectStateInQuery, detectQuizTopicInQuery, getStateNILRules, getQuizStudyMaterial } from '@/lib/ai/rag';
import { withRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: any[];
}

interface ChatRequest {
  messages: Message[];
  userId?: string;
  userRole?: 'athlete' | 'parent' | 'coach' | 'school_admin' | 'agency';
  userState?: string;
  userName?: string;
  athleteName?: string;
  sport?: string;
  schoolLevel?: string;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const USE_MOCK_RESPONSES = !OPENAI_API_KEY; // Fallback to mock if no API key

// Mock responses for development (same as original)
const NIL_RESPONSES = [
  "NIL (Name, Image, and Likeness) allows student-athletes to profit from their personal brand. This includes sponsorship deals, social media partnerships, autograph signings, and personal appearances.",
  "For high school athletes, NIL rules vary by state. Some states allow high school NIL activities, while others don't. It's crucial to check your state's specific regulations.",
  "Student-athletes must be careful about NIL compliance. Key rules include: no pay-for-play arrangements, proper disclosure of deals, and adherence to your school's NIL policies.",
];

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: ChatRequest = await request.json();
    const { messages, userId, userRole, userState, userName, athleteName, sport, schoolLevel } = body;

    // ========================================
    // RATE LIMITING - Protect OpenAI costs
    // ========================================
    const rateLimitResult = await withRateLimit(userId || null, RATE_LIMITS.CHAT_AI);
    if (!rateLimitResult.allowed) {
      console.warn('⚠️ Rate limit exceeded for chat AI:', {
        userId,
        limit: RATE_LIMITS.CHAT_AI.maxRequests,
        window: `${RATE_LIMITS.CHAT_AI.windowMinutes} minutes`
      });
      return rateLimitResponse(rateLimitResult);
    }

    console.log('🤖 AI Chat API - Request:', {
      messageCount: messages?.length,
      userRole,
      userState,
      useAI: !USE_MOCK_RESPONSES
    });

    // Validation
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Invalid request: last message must be from user' },
        { status: 400 }
      );
    }

    // Build user context
    const userContext: UserContext = {
      role: userRole || 'athlete',
      state: userState,
      name: userName,
      athleteName,
      sport,
      schoolLevel
    };

    // Track analytics
    const sessionId = `${userId || 'anonymous'}-${Date.now()}`;
    const promptLength = lastMessage.content.length;
    const category = categorizePrompt(lastMessage.content);

    if (userId && userRole) {
      trackEventServer('ai_prompt_sent', {
        user_id: userId,
        role: userRole as any,
        prompt_length: promptLength,
        category,
        session_id: sessionId,
      });
    }

    // Create streaming response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let responseText = '';

          if (USE_MOCK_RESPONSES) {
            // Mock response for development
            console.log('📝 Using mock response (no OpenAI API key)');
            responseText = NIL_RESPONSES[Math.floor(Math.random() * NIL_RESPONSES.length)];

          } else {
            // Real AI response with RAG
            console.log('🧠 Generating AI response with RAG...');

            // 1. Get role-aware system prompt
            const systemPrompt = getSystemPrompt(userContext);

            // 2. Detect query intent and fetch relevant knowledge
            let ragContext = '';
            const stateCode = detectStateInQuery(lastMessage.content) || userState;
            const quizTopic = detectQuizTopicInQuery(lastMessage.content);

            // Try to get specific state rules if mentioned
            if (stateCode) {
              console.log(`🗺️  Detected state query: ${stateCode}`);
              const stateRules = await getStateNILRules(stateCode);
              if (stateRules) {
                ragContext += `\n\n# State-Specific Information\n${stateRules.content}\n`;
              }
            }

            // Try to get quiz study material if topic mentioned
            if (quizTopic) {
              console.log(`📚 Detected quiz topic: ${quizTopic}`);
              const studyMaterial = await getQuizStudyMaterial(quizTopic);
              if (studyMaterial.length > 0) {
                ragContext += `\n\n# Study Material for ${quizTopic.replace(/_/g, ' ')}\n`;
                studyMaterial.slice(0, 3).forEach(entry => {
                  ragContext += `\n${entry.content}\n`;
                });
              }
            }

            // General RAG search if no specific intent detected
            if (!ragContext) {
              console.log('🔍 Performing general knowledge base search...');
              ragContext = await getRAGContext({
                query: lastMessage.content,
                userContext,
                maxResults: 3
              });
            }

            // 3. Build messages for OpenAI
            const systemMessage = {
              role: 'system' as const,
              content: systemPrompt + (ragContext ? `\n\n${ragContext}` : '')
            };

            // Include conversation history (last 6 messages for context)
            const conversationHistory = messages.slice(-6).map(msg => ({
              role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
              content: msg.content
            }));

            const openAIMessages = [systemMessage, ...conversationHistory];

            console.log('📤 Sending to OpenAI:', {
              systemPromptLength: systemMessage.content.length,
              messageCount: openAIMessages.length,
              hasRAGContext: !!ragContext
            });

            // 4. Call OpenAI API with streaming
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
              },
              body: JSON.stringify({
                model: 'gpt-4',
                messages: openAIMessages,
                temperature: 0.7,
                max_tokens: 1000,
                stream: true
              })
            });

            if (!response.ok) {
              const error = await response.text();
              console.error('OpenAI API error:', error);
              throw new Error(`OpenAI API error: ${response.status}`);
            }

            // 5. Stream the response
            const reader = response.body?.getReader();
            if (!reader) {
              throw new Error('No response body from OpenAI');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(data);
                    const token = parsed.choices?.[0]?.delta?.content;
                    if (token) {
                      responseText += token;
                      const chunk = `data: ${JSON.stringify({ token })}\n\n`;
                      controller.enqueue(encoder.encode(chunk));
                    }
                  } catch (e) {
                    // Skip parsing errors
                  }
                }
              }
            }
          }

          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();

          // Track analytics
          const responseTime = Date.now() - startTime;
          const tokenCount = estimateTokenCount(responseText);
          const cost = estimateCost(tokenCount);

          console.log('✅ Response complete:', {
            responseTime: `${responseTime}ms`,
            tokens: tokenCount,
            cost: `$${cost.toFixed(4)}`
          });

          if (userId && userRole) {
            trackEventServer('ai_response_generated', {
              user_id: userId,
              role: userRole as any,
              response_time_ms: responseTime,
              token_count_estimate: tokenCount,
              cost_estimate_usd: cost,
              session_id: sessionId,
            });
          }

        } catch (error: any) {
          console.error('❌ Error in stream:', error);
          const errorMsg = `I apologize, but I encountered an error: ${error.message}. Please try again.`;
          const chunk = `data: ${JSON.stringify({ token: errorMsg })}\n\n`;
          controller.enqueue(encoder.encode(chunk));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    status: 'AI Chat API Ready',
    mode: USE_MOCK_RESPONSES ? 'mock' : 'ai-powered',
    features: {
      rag: true,
      roleAwarePrompts: true,
      streaming: true,
      stateDetection: true,
      quizIntegration: true
    }
  });
}
