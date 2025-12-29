/**
 * AI-Powered Chat API with RAG (Retrieval Augmented Generation)
 *
 * This endpoint replaces mock responses with real AI using:
 * - OpenAI GPT-4 for natural language generation
 * - RAG for accurate NIL information from knowledge base
 * - Role-aware system prompts tailored to user type
 * - Streaming responses for better UX
 * - Status updates for UI feedback
 * - Source citations from RAG and Perplexity
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { trackEventServer } from '@/lib/analytics-server';
import { estimateTokenCount, estimateCost, categorizePrompt } from '@/lib/analytics';
import { getSystemPrompt, type UserContext } from '@/lib/ai/system-prompts';
import { getEnhancedRAGContext, detectStateInQuery, detectQuizTopicInQuery, getStateNILRules, getQuizStudyMaterial } from '@/lib/ai/rag';
import { withRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit';
import { getCachedResponse, cacheResponse, isCacheable } from '@/lib/ai/cache';
import { retrieveDocumentContext } from '@/lib/documents/retriever';

// Helper to fetch user's assessment results
async function getUserAssessmentResults(userId: string): Promise<{
  archetypeCode?: string;
  archetypeName?: string;
  topTraits?: string[];
  traitScores?: Record<string, number>;
} | null> {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('user_trait_results')
      .select('archetype_code, archetype_name, top_traits, trait_scores')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      archetypeCode: data.archetype_code,
      archetypeName: data.archetype_name,
      topTraits: data.top_traits,
      traitScores: data.trait_scores,
    };
  } catch (err) {
    console.warn('Failed to fetch assessment results:', err);
    return null;
  }
}

// Status event types for UI feedback
type StatusEvent = {
  type: 'status';
  status: 'thinking' | 'searching_knowledge' | 'searching_memory' | 'searching_news' | 'searching_documents' | 'generating';
  message: string;
};

type SourcesEvent = {
  type: 'sources';
  sources: {
    knowledge: { title: string; category: string }[];
    memories: { content: string; type: string }[];
    documents: { fileName: string; documentType: string }[];
    hasRealTimeData: boolean;
  };
};

type TokenEvent = {
  type?: 'token';
  token: string;
};

export const dynamic = 'force-dynamic';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: any[];
  documentIds?: string[]; // Server document IDs for attached files
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
  documentIds?: string[]; // Document IDs for the current message
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
    const { messages, userId, userRole, userState, userName, athleteName, sport, schoolLevel, documentIds } = body;

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

    // Build user context with assessment results
    let assessmentResults = null;
    if (userId && userRole === 'athlete') {
      assessmentResults = await getUserAssessmentResults(userId);
    }

    const userContext: UserContext = {
      role: userRole || 'athlete',
      state: userState,
      name: userName,
      athleteName,
      sport,
      schoolLevel,
      // Include assessment results if available
      archetypeCode: assessmentResults?.archetypeCode,
      archetypeName: assessmentResults?.archetypeName,
      topTraits: assessmentResults?.topTraits,
      traitScores: assessmentResults?.traitScores,
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
          let hadRAGContext = false;
          let ragSources: SourcesEvent['sources'] = {
            knowledge: [],
            memories: [],
            documents: [],
            hasRealTimeData: false
          };

          // Helper to send status events
          const sendStatus = (status: StatusEvent['status'], message: string) => {
            const event: StatusEvent = { type: 'status', status, message };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          };

          // Helper to send sources
          const sendSources = (sources: SourcesEvent['sources']) => {
            const event: SourcesEvent = { type: 'sources', sources };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          };

          // Check for cached response first
          const queryText = lastMessage.content;
          const effectiveRole = userRole || 'athlete';

          if (isCacheable(queryText)) {
            console.log('🔍 Checking cache for query...');
            const cachedEntry = await getCachedResponse(queryText, effectiveRole);

            if (cachedEntry) {
              console.log('✅ Cache HIT - returning cached response');
              sendStatus('generating', 'Found a quick answer...');

              // Send cached sources if available in metadata
              if (cachedEntry.metadata?.sources) {
                console.log('📚 Sending cached sources');
                sendSources(cachedEntry.metadata.sources);
              }

              // Stream the cached response with a natural typing effect
              const words = cachedEntry.response_text.split(' ');
              for (let i = 0; i < words.length; i++) {
                const word = words[i] + (i < words.length - 1 ? ' ' : '');
                responseText += word;
                const chunk = `data: ${JSON.stringify({ token: word })}\n\n`;
                controller.enqueue(encoder.encode(chunk));
                // Small delay for natural feel (faster than real generation)
                await new Promise(r => setTimeout(r, 15));
              }

              // Send completion
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();

              // Track analytics for cache hit
              if (userId && userRole) {
                trackEventServer('ai_cache_hit', {
                  user_id: userId,
                  role: userRole as any,
                  query_hash: cachedEntry.query_hash,
                  session_id: sessionId,
                });
              }

              return;
            } else {
              console.log('❌ Cache MISS - generating new response');
            }
          }

          if (USE_MOCK_RESPONSES) {
            // Mock response for development
            console.log('📝 Using mock response (no OpenAI API key)');
            sendStatus('thinking', 'Thinking...');
            await new Promise(r => setTimeout(r, 500)); // Simulate delay
            responseText = NIL_RESPONSES[Math.floor(Math.random() * NIL_RESPONSES.length)];

          } else {
            // Real AI response with RAG
            console.log('🧠 Generating AI response with RAG...');
            sendStatus('thinking', 'Thinking...');

            // 1. Get role-aware system prompt
            const systemPrompt = getSystemPrompt(userContext);

            // 2. Detect query intent and fetch relevant knowledge
            let ragContext = '';
            let documentContext = '';
            const stateCode = detectStateInQuery(lastMessage.content) || userState;
            const quizTopic = detectQuizTopicInQuery(lastMessage.content);

            // Try to get specific state rules if mentioned
            if (stateCode) {
              console.log(`🗺️  Detected state query: ${stateCode}`);
              sendStatus('searching_knowledge', `Looking up ${stateCode} NIL rules...`);
              const stateRules = await getStateNILRules(stateCode);
              if (stateRules) {
                ragContext += `\n\n# State-Specific Information\n${stateRules.content}\n`;
                ragSources.knowledge.push({
                  title: stateRules.title,
                  category: stateRules.category || 'State Law'
                });
              }
            }

            // Try to get quiz study material if topic mentioned
            // Note: Quiz study material enhances context but we don't add individual questions as sources
            // since their titles are questions (e.g., "Can you negotiate...?") which look bad in the UI
            if (quizTopic) {
              console.log(`📚 Detected quiz topic: ${quizTopic}`);
              sendStatus('searching_knowledge', `Finding study material for ${quizTopic.replace(/_/g, ' ')}...`);
              const studyMaterial = await getQuizStudyMaterial(quizTopic);
              if (studyMaterial.length > 0) {
                ragContext += `\n\n# Study Material for ${quizTopic.replace(/_/g, ' ')}\n`;
                studyMaterial.slice(0, 3).forEach(entry => {
                  ragContext += `\n${entry.content}\n`;
                });
                // Add a single, clean source entry for the study material category
                // instead of individual quiz questions with question-style titles
                const topicDisplayName = quizTopic.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                ragSources.knowledge.push({
                  title: `NIL Study Guide: ${topicDisplayName}`,
                  category: 'Study Material'
                });
              }
            }

            // General RAG search with memory context if no specific intent detected
            if (!ragContext) {
              console.log('🔍 Performing enhanced knowledge base search with memory...');
              sendStatus('searching_knowledge', 'Searching knowledge base...');

              const enhancedRAG = await getEnhancedRAGContext({
                query: lastMessage.content,
                userContext,
                userId,
                includeMemories: !!userId,
                includeSessionSummaries: !!userId,
                includeRealTimeSearch: true,
              });

              ragContext = enhancedRAG.combinedContext;

              // Build sources for UI
              ragSources.knowledge = enhancedRAG.sources.knowledge.map(k => ({
                title: k.title,
                category: k.category || k.content_type
              }));
              ragSources.memories = enhancedRAG.sources.memories.map(m => ({
                content: m.content.substring(0, 100) + (m.content.length > 100 ? '...' : ''),
                type: m.memory_type
              }));
              ragSources.hasRealTimeData = enhancedRAG.sources.hasRealTimeData;

              // Send memory status if we searched memories
              if (userId && enhancedRAG.sources.memories.length > 0) {
                sendStatus('searching_memory', 'Recalling what I know about you...');
              }

              // Send news status if we fetched real-time data
              if (enhancedRAG.sources.hasRealTimeData) {
                sendStatus('searching_news', 'Fetching latest NIL news...');
              }
            }

            // Search user's uploaded documents for relevant context
            if (userId) {
              try {
                sendStatus('searching_documents', 'Checking your uploaded documents...');

                // First, check if there are specific document IDs from chat attachments
                if (documentIds && documentIds.length > 0) {
                  console.log(`📎 Fetching ${documentIds.length} attached documents by ID`);

                  // Create Supabase client to fetch documents
                  const { createClient } = await import('@supabase/supabase-js');
                  const supabaseAdmin = createClient(
                    process.env.SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                  );

                  const { data: attachedDocs, error: docError } = await supabaseAdmin
                    .from('documents')
                    .select('id, file_name, document_type, extracted_text')
                    .in('id', documentIds)
                    .eq('user_id', userId);

                  if (!docError && attachedDocs && attachedDocs.length > 0) {
                    // Format attached documents as context
                    const attachedContext = attachedDocs.map(doc => {
                      const text = doc.extracted_text || '';
                      // Truncate to ~3000 chars per document to stay within context limits
                      const truncatedText = text.length > 3000
                        ? text.substring(0, 3000) + '\n... [document truncated]'
                        : text;
                      return `## ${doc.file_name} (${doc.document_type || 'document'})\n${truncatedText}`;
                    }).join('\n\n---\n\n');

                    documentContext = attachedContext;
                    ragSources.documents = attachedDocs.map(d => ({
                      fileName: d.file_name,
                      documentType: d.document_type || 'document',
                    }));

                    console.log(`📄 Included ${attachedDocs.length} attached documents in context`);
                  }
                }

                // Also do semantic search across all user documents if no specific docs attached
                // or to supplement the attached docs
                if (!documentContext || documentIds?.length === 0) {
                  const docResult = await retrieveDocumentContext(lastMessage.content, userId, {
                    maxChunks: 5,
                    minSimilarity: 0.7,
                  });

                  if (docResult.chunks.length > 0) {
                    documentContext = docResult.formattedContext;
                    ragSources.documents = docResult.chunks.map(c => ({
                      fileName: c.fileName,
                      documentType: c.documentType,
                    }));
                    console.log(`📄 Found ${docResult.chunks.length} relevant document chunks via semantic search`);
                  }
                }
              } catch (docError: any) {
                console.warn('Document search skipped:', docError.message);
                // Continue without document context - not critical
              }
            }

            // Send sources to the client
            if (ragSources.knowledge.length > 0 || ragSources.memories.length > 0 || ragSources.documents.length > 0 || ragSources.hasRealTimeData) {
              sendSources(ragSources);
            }

            // Track if we used RAG context for cache metadata
            hadRAGContext = !!ragContext || !!documentContext;

            // 3. Build messages for OpenAI
            // Include document context if user has relevant uploaded documents
            let fullContext = systemPrompt;
            if (documentContext) {
              fullContext += `\n\n# USER'S UPLOADED DOCUMENTS\nThe user has uploaded documents that may be relevant to their question. Here are the relevant excerpts:\n\n${documentContext}`;
            }
            if (ragContext) {
              fullContext += `\n\n${ragContext}`;
            }

            const systemMessage = {
              role: 'system' as const,
              content: fullContext
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
              hasRAGContext: !!ragContext,
              hasDocumentContext: !!documentContext
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
            sendStatus('generating', 'Generating response...');
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

          // Cache the response for future queries (in background)
          if (responseText && isCacheable(queryText)) {
            cacheResponse(queryText, responseText, effectiveRole, {
              tokenCount,
              responseTimeMs: responseTime,
              hasRAGContext: hadRAGContext,
              sources: ragSources, // Include sources in cache for future retrieval
            }).then(cached => {
              if (cached) {
                console.log('💾 Response cached for future queries (with sources)');
              }
            }).catch(err => {
              console.error('Cache storage error:', err);
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
      quizIntegration: true,
      conversationMemory: true,
      sessionSummaries: true,
      responseCache: true,
      documentAnalysis: true
    }
  });
}
