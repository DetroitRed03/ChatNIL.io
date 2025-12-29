/**
 * RAG (Retrieval Augmented Generation) Module
 *
 * This module handles retrieving relevant knowledge from the knowledge_base
 * table using semantic search to augment AI responses with accurate NIL information.
 */

import { supabaseAdmin } from '../supabase';
import { generateEmbedding } from './embeddings';
import {
  searchMemories,
  searchSessionSummaries,
  formatMemoriesForContext,
  formatSessionSummariesForContext,
  seedMemoriesFromProfile,
  type MemorySearchResult,
  type SessionSummary,
} from './memory';
import {
  getRealTimeContext,
  shouldUseRealTimeSearch,
  isPerplexityAvailable,
  searchPerplexity,
  searchRecentDeals,
  searchRegulatoryUpdates,
  searchMarketTrends,
  type PerplexitySearchResult,
} from './perplexity';
import type { UserContext } from './system-prompts';

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  content_type: string;
  category: string | null;
  metadata: Record<string, any>;
  similarity?: number;
  source?: string;
  source_url?: string;
  updated_at?: string;
}

export interface RAGContext {
  query: string;
  userContext: UserContext;
  maxResults?: number;
  minSimilarity?: number;
}

/**
 * Search the knowledge base for relevant content using vector similarity
 * Falls back to text search if embedding generation fails
 */
export async function searchKnowledgeBase(params: RAGContext): Promise<KnowledgeEntry[]> {
  const { query, userContext, maxResults = 5, minSimilarity = 0.65 } = params;

  if (!supabaseAdmin) {
    console.error('Supabase admin client not available for RAG');
    return [];
  }

  try {
    // Try vector similarity search first
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabaseAdmin.rpc('search_knowledge_base', {
      query_embedding: queryEmbedding,
      match_threshold: minSimilarity,
      match_count: maxResults,
      filter_roles: userContext.role ? [userContext.role] : null
    });

    if (error) {
      console.error('Vector search error, falling back to text search:', error);
      return textFallbackSearch(params);
    }

    if (data && data.length > 0) {
      // Filter out quiz study material from general searches (they have question-style titles)
      // Quiz content should only be returned when specifically requested via getQuizStudyMaterial()
      const filteredData = (data as KnowledgeEntry[]).filter(entry => {
        const category = entry.category || '';
        return !category.startsWith('quiz_');
      });

      console.log(`✅ Vector search found ${data.length} results (${filteredData.length} after filtering quiz content) for: "${query.substring(0, 50)}..."`);
      return filteredData;
    }

    // If no vector results, try text fallback
    console.log('No vector results, trying text fallback...');
    return textFallbackSearch(params);

  } catch (error: any) {
    // If embedding generation fails, fall back to text search
    console.error('Embedding generation failed, using text fallback:', error.message);
    return textFallbackSearch(params);
  }
}

/**
 * Text-based fallback search using ilike matching
 * Used when vector search is unavailable
 */
async function textFallbackSearch(params: RAGContext): Promise<KnowledgeEntry[]> {
  const { query, userContext, maxResults = 5 } = params;

  if (!supabaseAdmin) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('knowledge_base')
      .select('id, title, content, content_type, category, metadata, source, source_url, updated_at')
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(maxResults);

    if (error) {
      console.error('Text fallback search error:', error);
      return [];
    }

    // Filter by user role if specified in target_roles
    // Also filter out quiz content from general searches
    const filteredResults = (data || []).filter(entry => {
      // Exclude quiz study material
      const category = entry.category || '';
      if (category.startsWith('quiz_')) return false;

      // Filter by role if specified
      if (!entry.metadata?.target_roles) return true;
      return entry.metadata.target_roles.includes(userContext.role);
    });

    return filteredResults;

  } catch (error: any) {
    console.error('Unexpected error in textFallbackSearch:', error);
    return [];
  }
}

/**
 * Hybrid search combining vector similarity and keyword matching
 */
export async function hybridSearchKnowledgeBase(params: RAGContext): Promise<KnowledgeEntry[]> {
  const { query, userContext, maxResults = 5 } = params;

  if (!supabaseAdmin) {
    console.error('Supabase admin client not available for RAG');
    return [];
  }

  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabaseAdmin.rpc('hybrid_search_knowledge_base', {
      query_embedding: queryEmbedding,
      search_query: query,
      match_count: maxResults,
      vector_weight: 0.7,
      text_weight: 0.3
    });

    if (error) {
      console.error('Hybrid search error:', error);
      return textFallbackSearch(params);
    }

    // Filter out quiz study material from general searches
    const filteredData = ((data || []) as KnowledgeEntry[]).filter(entry => {
      const category = entry.category || '';
      return !category.startsWith('quiz_');
    });

    return filteredData;

  } catch (error: any) {
    console.error('Hybrid search failed:', error.message);
    return textFallbackSearch(params);
  }
}

/**
 * Extract keywords from user query for better search
 */
function extractKeywords(query: string): string[] {
  // Remove common words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about', 'what', 'how', 'can', 'do', 'does', 'is', 'are', 'was', 'were']);

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Format knowledge entries into context for the LLM with source attribution
 */
export function formatKnowledgeContext(entries: KnowledgeEntry[]): string {
  if (entries.length === 0) {
    return '';
  }

  const sections = entries.map((entry, index) => {
    const sourceInfo = entry.source ? `Source: ${entry.source}` : '';
    const lastUpdated = entry.updated_at
      ? `Last verified: ${new Date(entry.updated_at).toLocaleDateString()}`
      : '';
    const similarity = entry.similarity
      ? `(${Math.round(entry.similarity * 100)}% match)`
      : '';

    return `
[${index + 1}] ${entry.title} ${similarity}
Type: ${entry.content_type}${entry.category ? ` | Topic: ${entry.category}` : ''}
${sourceInfo}${lastUpdated ? ` | ${lastUpdated}` : ''}

${entry.content}

---`;
  });

  return `
# Relevant NIL Information

The following verified information from ChatNIL's knowledge base is relevant to your question:

${sections.join('\n')}
`;
}

/**
 * Main RAG function: search knowledge base and format context
 */
export async function getRAGContext(params: RAGContext): Promise<string> {
  const entries = await searchKnowledgeBase(params);
  return formatKnowledgeContext(entries);
}

/**
 * Get state-specific NIL rules
 */
export async function getStateNILRules(stateCode: string): Promise<KnowledgeEntry | null> {
  if (!supabaseAdmin) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('content_type', 'state_law')
      .eq('category', stateCode.toUpperCase())
      .single();

    if (error || !data) {
      console.error(`No NIL rules found for state: ${stateCode}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching state NIL rules:', error);
    return null;
  }
}

/**
 * Get quiz study material for a specific category
 */
export async function getQuizStudyMaterial(category: string): Promise<KnowledgeEntry[]> {
  if (!supabaseAdmin) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('content_type', 'educational_article')
      .eq('category', `quiz_${category}`)
      .limit(10);

    if (error) {
      console.error(`Error fetching quiz material for ${category}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getQuizStudyMaterial:', error);
    return [];
  }
}

/**
 * Detect if query is asking about a specific state
 */
export function detectStateInQuery(query: string): string | null {
  const stateNames: Record<string, string> = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
    'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
    'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
    'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
    'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
    'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
    'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
    'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
    'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
    'wisconsin': 'WI', 'wyoming': 'WY'
  };

  const lowerQuery = query.toLowerCase();

  // Check for state names
  for (const [name, code] of Object.entries(stateNames)) {
    if (lowerQuery.includes(name)) {
      return code;
    }
  }

  // Check for state codes (CA, NY, TX, etc.)
  const stateCodeMatch = lowerQuery.match(/\b([A-Z]{2})\b/);
  if (stateCodeMatch) {
    const code = stateCodeMatch[1];
    if (Object.values(stateNames).includes(code)) {
      return code;
    }
  }

  return null;
}

/**
 * Detect if query is asking about a quiz topic
 */
export function detectQuizTopicInQuery(query: string): string | null {
  const quizTopics = [
    'nil_basics',
    'contracts',
    'branding',
    'social_media',
    'compliance',
    'tax_finance',
    'negotiation',
    'legal',
    'marketing',
    'athlete_rights'
  ];

  const lowerQuery = query.toLowerCase();

  for (const topic of quizTopics) {
    const topicName = topic.replace(/_/g, ' ');
    if (lowerQuery.includes(topicName) || lowerQuery.includes(topic)) {
      return topic;
    }
  }

  return null;
}

/**
 * Extended RAG context including conversation memory and real-time search
 */
export interface EnhancedRAGParams extends RAGContext {
  userId?: string;
  includeMemories?: boolean;
  includeSessionSummaries?: boolean;
  includeRealTimeSearch?: boolean;
}

export interface EnhancedRAGResult {
  knowledgeContext: string;
  memoryContext: string;
  sessionContext: string;
  realTimeContext: string;
  combinedContext: string;
  sources: {
    knowledge: KnowledgeEntry[];
    memories: MemorySearchResult[];
    sessions: SessionSummary[];
    hasRealTimeData: boolean;
  };
}

/**
 * Get comprehensive RAG context including knowledge base, conversation memory, and real-time search
 */
export async function getEnhancedRAGContext(params: EnhancedRAGParams): Promise<EnhancedRAGResult> {
  const {
    query,
    userContext,
    userId,
    maxResults = 5,
    minSimilarity = 0.65,
    includeMemories = true,
    includeSessionSummaries = true,
    includeRealTimeSearch = true,
  } = params;

  // Seed profile memories on first use (runs in background, doesn't block)
  if (userId && includeMemories) {
    seedMemoriesFromProfile(userId).catch(err => {
      console.error('Error seeding profile memories:', err);
    });
  }

  // Determine if we should fetch real-time data
  const shouldFetchRealTime = includeRealTimeSearch &&
    isPerplexityAvailable() &&
    shouldUseRealTimeSearch(query);

  // Run all searches in parallel for better performance
  const [knowledgeEntries, memories, sessions, realTimeData] = await Promise.all([
    // Knowledge base search
    searchKnowledgeBase({ query, userContext, maxResults, minSimilarity }),

    // Memory search (if user ID provided)
    userId && includeMemories
      ? searchMemories({ userId, query, maxResults: 5, matchThreshold: 0.7 })
      : Promise.resolve([]),

    // Session summary search (if user ID provided)
    userId && includeSessionSummaries
      ? searchSessionSummaries({ userId, query, maxResults: 3, matchThreshold: 0.6 })
      : Promise.resolve([]),

    // Real-time search (if query needs current information)
    shouldFetchRealTime
      ? getRealTimeContext(query)
      : Promise.resolve(''),
  ]);

  // Format each context type
  const knowledgeContext = formatKnowledgeContext(knowledgeEntries);
  const memoryContext = formatMemoriesForContext(memories);
  const sessionContext = formatSessionSummariesForContext(sessions);
  const realTimeContext = realTimeData || '';

  // Combine all contexts
  const contextParts: string[] = [];

  if (memoryContext) {
    contextParts.push(`# What I Know About You\n\n${memoryContext}`);
  }

  if (sessionContext) {
    contextParts.push(`# Relevant Past Conversations\n\n${sessionContext}`);
  }

  // Real-time info comes before static knowledge base
  if (realTimeContext) {
    contextParts.push(realTimeContext);
  }

  if (knowledgeContext) {
    contextParts.push(knowledgeContext);
  }

  return {
    knowledgeContext,
    memoryContext,
    sessionContext,
    realTimeContext,
    combinedContext: contextParts.join('\n\n'),
    sources: {
      knowledge: knowledgeEntries,
      memories,
      sessions,
      hasRealTimeData: !!realTimeContext,
    },
  };
}

/**
 * Simplified function for chat endpoint - returns combined context string
 */
export async function getChatContext(params: {
  query: string;
  userContext: UserContext;
  userId?: string;
  includeRealTimeSearch?: boolean;
}): Promise<string> {
  const result = await getEnhancedRAGContext({
    ...params,
    maxResults: 5,
    minSimilarity: 0.65,
    includeMemories: !!params.userId,
    includeSessionSummaries: !!params.userId,
    includeRealTimeSearch: params.includeRealTimeSearch ?? true,
  });

  return result.combinedContext;
}

// Re-export Perplexity functions for direct use
export {
  searchPerplexity,
  searchRecentDeals,
  searchRegulatoryUpdates,
  searchMarketTrends,
  isPerplexityAvailable,
  shouldUseRealTimeSearch,
} from './perplexity';
