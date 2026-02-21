/**
 * Conversation Memory Management for ChatNIL AI Brain
 *
 * Provides cross-session memory storage and retrieval using vector embeddings.
 * Memory types:
 * - preference: User likes/dislikes (e.g., "prefers simple explanations")
 * - context: User's situation (e.g., "is a D1 basketball player at Duke")
 * - fact: Stated information (e.g., "signed with Nike last month")
 * - goal: User objectives (e.g., "looking to maximize NIL earnings")
 */

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from './embeddings';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Memory types that can be stored
export type MemoryType = 'preference' | 'context' | 'fact' | 'goal';

export interface ConversationMemory {
  id: string;
  user_id: string;
  memory_type: MemoryType;
  content: string;
  embedding?: number[];
  source_session_id?: string;
  source_message_ids?: string[];
  importance_score: number;
  usage_count: number;
  last_used_at?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionSummary {
  session_id: string;
  title: string;
  summary: string;
  role_context: string;
  similarity: number;
  created_at: string;
}

export interface MemorySearchResult {
  id: string;
  memory_type: MemoryType;
  content: string;
  importance_score: number;
  similarity: number;
  source_session_id?: string;
}

/**
 * Get Supabase admin client for memory operations
 */
function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials for memory operations');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      fetch: (url: any, opts: any) => fetch(url, { ...opts, cache: 'no-store' as any }),
    }
  });
}

/**
 * Store a new memory for a user
 */
export async function storeMemory(params: {
  userId: string;
  memoryType: MemoryType;
  content: string;
  sourceSessionId?: string;
  sourceMessageIds?: string[];
  importanceScore?: number;
  expiresAt?: Date;
}): Promise<ConversationMemory | null> {
  const supabase = getSupabaseAdmin();

  try {
    // Generate embedding for the memory content
    const embedding = await generateEmbedding(params.content);

    const { data, error } = await supabase
      .from('conversation_memory')
      .insert({
        user_id: params.userId,
        memory_type: params.memoryType,
        content: params.content,
        embedding,
        source_session_id: params.sourceSessionId,
        source_message_ids: params.sourceMessageIds || [],
        importance_score: params.importanceScore ?? 0.5,
        expires_at: params.expiresAt?.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to store memory:', error);
      return null;
    }

    return data as ConversationMemory;
  } catch (error) {
    console.error('Error storing memory:', error);
    return null;
  }
}

/**
 * Search for relevant memories using semantic similarity
 */
export async function searchMemories(params: {
  userId: string;
  query: string;
  memoryTypes?: MemoryType[];
  matchThreshold?: number;
  maxResults?: number;
}): Promise<MemorySearchResult[]> {
  const supabase = getSupabaseAdmin();

  try {
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(params.query);

    const { data, error } = await supabase.rpc('search_conversation_memory', {
      p_user_id: params.userId,
      query_embedding: queryEmbedding,
      match_threshold: params.matchThreshold ?? 0.7,
      match_count: params.maxResults ?? 5,
      memory_types: params.memoryTypes ?? null,
    });

    if (error) {
      console.error('Failed to search memories:', error);
      return [];
    }

    return (data || []) as MemorySearchResult[];
  } catch (error) {
    console.error('Error searching memories:', error);
    return [];
  }
}

/**
 * Search for relevant past session summaries
 */
export async function searchSessionSummaries(params: {
  userId: string;
  query: string;
  matchThreshold?: number;
  maxResults?: number;
}): Promise<SessionSummary[]> {
  const supabase = getSupabaseAdmin();

  try {
    const queryEmbedding = await generateEmbedding(params.query);

    const { data, error } = await supabase.rpc('search_session_summaries', {
      p_user_id: params.userId,
      query_embedding: queryEmbedding,
      match_threshold: params.matchThreshold ?? 0.6,
      match_count: params.maxResults ?? 3,
    });

    if (error) {
      console.error('Failed to search session summaries:', error);
      return [];
    }

    return (data || []) as SessionSummary[];
  } catch (error) {
    console.error('Error searching session summaries:', error);
    return [];
  }
}

/**
 * Get all active memories for a user (without semantic search)
 */
export async function getUserMemories(params: {
  userId: string;
  memoryTypes?: MemoryType[];
  limit?: number;
}): Promise<ConversationMemory[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('conversation_memory')
    .select('*')
    .eq('user_id', params.userId)
    .eq('is_active', true)
    .order('importance_score', { ascending: false })
    .order('created_at', { ascending: false });

  if (params.memoryTypes && params.memoryTypes.length > 0) {
    query = query.in('memory_type', params.memoryTypes);
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to get user memories:', error);
    return [];
  }

  return (data || []) as ConversationMemory[];
}

/**
 * Update memory importance based on usage
 */
export async function incrementMemoryUsage(memoryId: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  try {
    await supabase.rpc('increment_memory_usage', { memory_id: memoryId });
  } catch (error) {
    console.error('Error incrementing memory usage:', error);
  }
}

/**
 * Deactivate a memory (soft delete)
 */
export async function deactivateMemory(memoryId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('conversation_memory')
    .update({ is_active: false })
    .eq('id', memoryId)
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to deactivate memory:', error);
    return false;
  }

  return true;
}

/**
 * Update a session's summary and generate its embedding
 */
export async function updateSessionSummary(params: {
  sessionId: string;
  summary: string;
  messageCountAtSummary: number;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  try {
    // Generate embedding for the summary
    const summaryEmbedding = await generateEmbedding(params.summary);

    const { error } = await supabase
      .from('chat_sessions')
      .update({
        summary: params.summary,
        summary_embedding: summaryEmbedding,
        last_summarized_at: new Date().toISOString(),
        message_count_at_summary: params.messageCountAtSummary,
      })
      .eq('id', params.sessionId);

    if (error) {
      console.error('Failed to update session summary:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating session summary:', error);
    return false;
  }
}

/**
 * Extract memories from a conversation using AI analysis
 * Uses GPT to intelligently identify facts, preferences, context, and goals
 */
export async function extractMemoriesFromMessages(params: {
  userId: string;
  sessionId: string;
  messages: { role: string; content: string }[];
}): Promise<ConversationMemory[]> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    console.warn('OpenAI API key not available for memory extraction');
    return [];
  }

  // Only extract from conversations with at least 2 user messages
  const userMessages = params.messages.filter(m => m.role === 'user');
  if (userMessages.length < 2) {
    return [];
  }

  // Format conversation for analysis
  const conversationText = params.messages
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  const extractionPrompt = `Extract ONLY explicit personal information the USER directly stated about themselves in this conversation.

RULES:
- ONLY extract what the USER explicitly said about THEMSELVES (statements starting with "I", "my", "I'm")
- DO NOT extract general information from the assistant's responses
- DO NOT infer or assume anything not directly stated
- DO NOT extract information about NIL rules or general topics discussed
- Return [] if user didn't share personal information

Memory types:
- context: Their identity (sport, school, position) - ONLY if user said "I play...", "I'm a...", "I go to..."
- fact: Specific personal data (follower count, deals, agent) - ONLY if user stated it
- preference: What they explicitly prefer or dislike
- goal: What they explicitly said they want to achieve

JSON format (no markdown):
[{"type": "context|fact|preference|goal", "content": "User statement", "importance": 0.5-1.0}]

Conversation:
${conversationText}

Return ONLY the JSON array:`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Use mini for cost efficiency
        messages: [
          { role: 'system', content: 'You are a memory extraction assistant. Extract key user information from conversations. Return only valid JSON.' },
          { role: 'user', content: extractionPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error during memory extraction');
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return [];
    }

    // Parse the JSON response (handle markdown code blocks)
    let extractedData: Array<{ type: MemoryType; content: string; importance: number }>;
    try {
      // Remove markdown code blocks if present
      let jsonContent = content;
      if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/```json?\n?/g, '').replace(/```\n?$/g, '').trim();
      }
      extractedData = JSON.parse(jsonContent);
    } catch {
      console.error('Failed to parse memory extraction response:', content);
      return [];
    }

    if (!Array.isArray(extractedData) || extractedData.length === 0) {
      return [];
    }

    // Store each extracted memory
    const storedMemories: ConversationMemory[] = [];

    for (const item of extractedData.slice(0, 5)) { // Max 5 memories
      // Validate memory type
      if (!['context', 'fact', 'preference', 'goal'].includes(item.type)) {
        continue;
      }

      // Check for duplicates before storing
      const isDuplicate = await checkDuplicateMemory(params.userId, item.content);
      if (isDuplicate) {
        console.log(`⏭️ Skipping duplicate memory: "${item.content.substring(0, 40)}..."`);
        continue;
      }

      const memory = await storeMemory({
        userId: params.userId,
        memoryType: item.type as MemoryType,
        content: item.content,
        sourceSessionId: params.sessionId,
        importanceScore: Math.min(1, Math.max(0.5, item.importance || 0.7)),
      });

      if (memory) {
        console.log(`🧠 Extracted memory [${item.type}]: "${item.content.substring(0, 50)}..."`);
        storedMemories.push(memory);
      }
    }

    return storedMemories;
  } catch (error) {
    console.error('Error extracting memories:', error);
    return [];
  }
}

/**
 * Check if a similar memory already exists for the user
 */
async function checkDuplicateMemory(userId: string, content: string): Promise<boolean> {
  try {
    const embedding = await generateEmbedding(content);
    const supabase = getSupabaseAdmin();

    const { data } = await supabase.rpc('search_conversation_memory', {
      p_user_id: userId,
      query_embedding: embedding,
      match_threshold: 0.9, // High threshold = very similar
      match_count: 1,
      memory_types: null
    });

    return data && data.length > 0;
  } catch {
    return false; // On error, allow the memory to be stored
  }
}

/**
 * Generate a summary for a chat session
 */
export async function generateSessionSummary(params: {
  sessionId: string;
  messages: { role: string; content: string }[];
}): Promise<string | null> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey || params.messages.length < 3) {
    return null;
  }

  const conversationText = params.messages
    .slice(-10) // Last 10 messages
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Summarize this NIL-related conversation in 1-2 sentences. Focus on what the user asked about and any decisions made.' },
          { role: 'user', content: conversationText }
        ],
        temperature: 0.3,
        max_tokens: 100
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Process a completed conversation - extract memories and generate summary
 * Call this when a chat session ends or after significant exchanges
 */
export async function processConversation(params: {
  userId: string;
  sessionId: string;
  messages: { role: string; content: string }[];
}): Promise<{
  memoriesExtracted: number;
  summaryGenerated: boolean;
}> {
  console.log(`🧠 Processing conversation for memory extraction (${params.messages.length} messages)...`);

  // Extract memories
  const memories = await extractMemoriesFromMessages(params);

  // Generate and store session summary
  let summaryGenerated = false;
  if (params.messages.length >= 4) {
    const summary = await generateSessionSummary(params);
    if (summary) {
      const success = await updateSessionSummary({
        sessionId: params.sessionId,
        summary,
        messageCountAtSummary: params.messages.length
      });
      summaryGenerated = success;
      if (success) {
        console.log(`📝 Session summary generated: "${summary.substring(0, 60)}..."`);
      }
    }
  }

  return {
    memoriesExtracted: memories.length,
    summaryGenerated
  };
}

/**
 * Format memories for injection into AI context
 */
export function formatMemoriesForContext(memories: MemorySearchResult[]): string {
  if (!memories || memories.length === 0) {
    return '';
  }

  const grouped: Record<MemoryType, string[]> = {
    preference: [],
    context: [],
    fact: [],
    goal: [],
  };

  for (const memory of memories) {
    grouped[memory.memory_type].push(memory.content);
  }

  const sections: string[] = [];

  if (grouped.context.length > 0) {
    sections.push(`User Context: ${grouped.context.join('; ')}`);
  }
  if (grouped.fact.length > 0) {
    sections.push(`Known Facts: ${grouped.fact.join('; ')}`);
  }
  if (grouped.preference.length > 0) {
    sections.push(`User Preferences: ${grouped.preference.join('; ')}`);
  }
  if (grouped.goal.length > 0) {
    sections.push(`User Goals: ${grouped.goal.join('; ')}`);
  }

  return sections.join('\n');
}

/**
 * Format session summaries for injection into AI context
 */
export function formatSessionSummariesForContext(summaries: SessionSummary[]): string {
  if (!summaries || summaries.length === 0) {
    return '';
  }

  return summaries
    .map(s => `Previous conversation "${s.title}": ${s.summary}`)
    .join('\n');
}

/**
 * Seed memories from a user's profile data including ALL onboarding information
 * Call this once when a user first uses the chat, or after profile updates
 *
 * Extracts from onboarding:
 * - Sport, position, school (context)
 * - NIL interests, goals, concerns (preferences/goals)
 * - NIL preferences (deal types, compensation, content types)
 * - Achievements, bio, major, GPA (facts)
 * - Social media stats (facts)
 */
export async function seedMemoriesFromProfile(userId: string): Promise<number> {
  const supabase = getSupabaseAdmin();

  // Check if profile memories already exist
  const { data: existingMemories } = await supabase
    .from('conversation_memory')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (existingMemories && existingMemories.length > 0) {
    console.log('Profile memories already exist for user');
    return 0;
  }

  // Fetch athlete profile directly (join doesn't work due to FK config)
  const { data: athleteProfile, error: profileError } = await supabase
    .from('athlete_profiles')
    .select(`
      sport,
      position,
      school,
      school_level,
      graduation_year,
      year,
      state,
      bio,
      major,
      gpa,
      achievements,
      secondary_sports,
      estimated_fmv,
      nil_interests,
      nil_concerns,
      nil_goals,
      nil_preferences,
      content_samples
    `)
    .eq('user_id', userId)
    .single();

  if (profileError || !athleteProfile) {
    console.error('Failed to fetch athlete profile for memory seeding:', profileError?.message);
    return 0;
  }

  const memories: Array<{ type: MemoryType; content: string; importance: number }> = [];

  if (athleteProfile) {
    // === CONTEXT MEMORIES ===

    // Sport and position
    if (athleteProfile.sport) {
      let sportContext = `Plays ${athleteProfile.sport}`;
      if (athleteProfile.position) {
        sportContext += ` as a ${athleteProfile.position}`;
      }
      memories.push({ type: 'context', content: sportContext, importance: 0.95 });
    }

    // Secondary sports (can be array of strings or objects with {sport, position})
    if (athleteProfile.secondary_sports && Array.isArray(athleteProfile.secondary_sports) && athleteProfile.secondary_sports.length > 0) {
      const sportsList = athleteProfile.secondary_sports.map((s: any) => {
        if (typeof s === 'string') return s;
        if (s.sport) return s.position ? `${s.sport} (${s.position})` : s.sport;
        return null;
      }).filter(Boolean);

      if (sportsList.length > 0) {
        memories.push({
          type: 'context',
          content: `Also plays: ${sportsList.join(', ')}`,
          importance: 0.6
        });
      }
    }

    // School
    if (athleteProfile.school) {
      let schoolContext = `Attends ${athleteProfile.school}`;
      if (athleteProfile.school_level) {
        schoolContext += ` (${athleteProfile.school_level})`;
      }
      if (athleteProfile.state) {
        schoolContext += ` in ${athleteProfile.state}`;
      }
      if (athleteProfile.year) {
        schoolContext += ` - ${athleteProfile.year}`;
      }
      memories.push({ type: 'context', content: schoolContext, importance: 0.9 });
    }

    // Graduation year
    if (athleteProfile.graduation_year) {
      memories.push({
        type: 'context',
        content: `Expected graduation year: ${athleteProfile.graduation_year}`,
        importance: 0.7
      });
    }

    // Major and GPA
    if (athleteProfile.major) {
      let academicContext = `Majoring in ${athleteProfile.major}`;
      if (athleteProfile.gpa) {
        academicContext += ` with a ${athleteProfile.gpa} GPA`;
      }
      memories.push({ type: 'context', content: academicContext, importance: 0.7 });
    }

    // Bio (if substantial)
    if (athleteProfile.bio && athleteProfile.bio.length > 20) {
      memories.push({
        type: 'context',
        content: `Personal bio: ${athleteProfile.bio}`,
        importance: 0.75
      });
    }

    // NIL concerns (as context about their situation)
    if (athleteProfile.nil_concerns && Array.isArray(athleteProfile.nil_concerns) && athleteProfile.nil_concerns.length > 0) {
      memories.push({
        type: 'context',
        content: `NIL concerns: ${athleteProfile.nil_concerns.join(', ')}`,
        importance: 0.85
      });
    }

    // === FACT MEMORIES ===

    // Achievements
    if (athleteProfile.achievements && Array.isArray(athleteProfile.achievements) && athleteProfile.achievements.length > 0) {
      memories.push({
        type: 'fact',
        content: `Athletic achievements: ${athleteProfile.achievements.join('; ')}`,
        importance: 0.85
      });
    }

    // Estimated FMV (Fair Market Value)
    if (athleteProfile.estimated_fmv) {
      memories.push({
        type: 'fact',
        content: `Estimated NIL fair market value: $${athleteProfile.estimated_fmv.toLocaleString()}`,
        importance: 0.8
      });
    }

    // Content samples (sponsored content experience)
    if (athleteProfile.content_samples && Array.isArray(athleteProfile.content_samples)) {
      const sponsoredContent = athleteProfile.content_samples.filter((c: any) => c.sponsored);
      if (sponsoredContent.length > 0) {
        const brands = sponsoredContent
          .map((c: any) => c.brand)
          .filter((b: string) => b)
          .join(', ');
        if (brands) {
          memories.push({
            type: 'fact',
            content: `Has done sponsored content with: ${brands}`,
            importance: 0.85
          });
        }
      }
    }

    // === PREFERENCE MEMORIES ===

    // NIL interests (categories they're interested in)
    if (athleteProfile.nil_interests && Array.isArray(athleteProfile.nil_interests) && athleteProfile.nil_interests.length > 0) {
      memories.push({
        type: 'preference',
        content: `Interested in NIL opportunities related to: ${athleteProfile.nil_interests.join(', ')}`,
        importance: 0.9
      });
    }

    // NIL preferences (detailed preferences from onboarding)
    if (athleteProfile.nil_preferences && typeof athleteProfile.nil_preferences === 'object') {
      const prefs = athleteProfile.nil_preferences as Record<string, any>;

      // Preferred deal types
      if (prefs.preferred_deal_types && Array.isArray(prefs.preferred_deal_types) && prefs.preferred_deal_types.length > 0) {
        memories.push({
          type: 'preference',
          content: `Preferred NIL deal types: ${prefs.preferred_deal_types.join(', ')}`,
          importance: 0.9
        });
      }

      // Content types willing to create
      if (prefs.content_types_willing && Array.isArray(prefs.content_types_willing) && prefs.content_types_willing.length > 0) {
        memories.push({
          type: 'preference',
          content: `Willing to create content types: ${prefs.content_types_willing.join(', ')}`,
          importance: 0.8
        });
      }

      // Compensation range preferences
      if (prefs.min_compensation !== undefined || prefs.max_compensation !== undefined) {
        let compPref = 'NIL compensation preferences:';
        if (prefs.min_compensation !== undefined && prefs.min_compensation > 0) {
          compPref += ` minimum $${prefs.min_compensation.toLocaleString()}`;
        }
        if (prefs.max_compensation !== undefined) {
          compPref += ` up to $${prefs.max_compensation.toLocaleString()}`;
        }
        memories.push({
          type: 'preference',
          content: compPref,
          importance: 0.75
        });
      }

      // Travel willingness
      if (prefs.travel_willing !== undefined) {
        memories.push({
          type: 'preference',
          content: prefs.travel_willing
            ? 'Willing to travel for NIL opportunities'
            : 'Prefers local NIL opportunities (not willing to travel)',
          importance: 0.7
        });
      }

      // Exclusivity preferences
      if (prefs.exclusivity_preference) {
        memories.push({
          type: 'preference',
          content: `Exclusivity preference: ${prefs.exclusivity_preference}`,
          importance: 0.75
        });
      }

      // Industries to avoid
      if (prefs.industries_avoid && Array.isArray(prefs.industries_avoid) && prefs.industries_avoid.length > 0) {
        memories.push({
          type: 'preference',
          content: `Industries/brands to avoid: ${prefs.industries_avoid.join(', ')}`,
          importance: 0.85
        });
      }
    }

    // === GOAL MEMORIES ===

    // NIL goals from onboarding
    if (athleteProfile.nil_goals && Array.isArray(athleteProfile.nil_goals) && athleteProfile.nil_goals.length > 0) {
      memories.push({
        type: 'goal',
        content: `NIL goals: ${athleteProfile.nil_goals.join('; ')}`,
        importance: 0.95
      });
    }
  }

  // Store each memory
  let storedCount = 0;
  for (const mem of memories) {
    const result = await storeMemory({
      userId,
      memoryType: mem.type,
      content: mem.content,
      importanceScore: mem.importance,
    });
    if (result) {
      console.log(`🧠 Seeded profile memory [${mem.type}]: "${mem.content}"`);
      storedCount++;
    }
  }

  console.log(`✅ Seeded ${storedCount} memories from user profile`);
  return storedCount;
}

/**
 * Format follower count for display (e.g., 50000 -> "50K")
 */
function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`;
  }
  return count.toString();
}
