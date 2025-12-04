/**
 * RAG (Retrieval Augmented Generation) Module
 *
 * This module handles retrieving relevant knowledge from the knowledge_base
 * table using semantic search to augment AI responses with accurate NIL information.
 */

import { supabaseAdmin } from '../supabase';
import type { UserContext } from './system-prompts';

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  content_type: string;
  category: string | null;
  metadata: Record<string, any>;
  similarity?: number;
}

export interface RAGContext {
  query: string;
  userContext: UserContext;
  maxResults?: number;
  minSimilarity?: number;
}

/**
 * Search the knowledge base for relevant content
 *
 * Note: This currently uses basic text matching. In production, you would:
 * 1. Generate an embedding for the query using OpenAI's embedding API
 * 2. Use pgvector's similarity search with the embedding
 * 3. Return the most relevant matches
 */
export async function searchKnowledgeBase(params: RAGContext): Promise<KnowledgeEntry[]> {
  const { query, userContext, maxResults = 5, minSimilarity = 0.7 } = params;

  if (!supabaseAdmin) {
    console.error('Supabase admin client not available for RAG');
    return [];
  }

  try {
    // For now, use full-text search until we add embedding generation
    // This is a temporary solution - see Phase 2 for embedding integration
    const { data, error } = await supabaseAdmin
      .from('knowledge_base')
      .select('id, title, content, content_type, category, metadata')
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(maxResults);

    if (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }

    // Filter by user role if specified in target_roles
    const filteredResults = (data || []).filter(entry => {
      if (!entry.metadata?.target_roles) return true;
      return entry.metadata.target_roles.includes(userContext.role);
    });

    // TODO: Add state filtering for state-specific content
    // if (userContext.state && entry.category === userContext.state) { ... }

    return filteredResults;

  } catch (error: any) {
    console.error('Unexpected error in searchKnowledgeBase:', error);
    return [];
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
 * Format knowledge entries into context for the LLM
 */
export function formatKnowledgeContext(entries: KnowledgeEntry[]): string {
  if (entries.length === 0) {
    return '';
  }

  const sections = entries.map((entry, index) => {
    return `
[Source ${index + 1}]: ${entry.title}
Category: ${entry.content_type}
${entry.category ? `State/Topic: ${entry.category}` : ''}

${entry.content}

---`;
  });

  return `
# Relevant NIL Information

The following information from our knowledge base may help answer the user's question:

${sections.join('\n\n')}

Please use this information to provide an accurate, helpful response. Cite sources when referencing specific information.
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
