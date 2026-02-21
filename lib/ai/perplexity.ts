/**
 * Perplexity AI Integration for Real-Time NIL News and Updates
 *
 * This module provides real-time search capabilities for:
 * - Latest NIL news and developments
 * - Recent regulatory changes
 * - Current market trends and deal announcements
 * - Breaking NIL stories
 */

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export interface PerplexitySearchResult {
  content: string;
  sources: string[];
  query: string;
  timestamp: string;
}

export interface PerplexitySearchParams {
  query: string;
  context?: string;
  maxTokens?: number;
}

/**
 * Check if Perplexity API is available
 */
export function isPerplexityAvailable(): boolean {
  return !!PERPLEXITY_API_KEY;
}

/**
 * Search for real-time NIL news and information using Perplexity
 */
export async function searchPerplexity(params: PerplexitySearchParams): Promise<PerplexitySearchResult | null> {
  if (!PERPLEXITY_API_KEY) {
    console.log('Perplexity API key not configured - skipping real-time search');
    return null;
  }

  const { query, context, maxTokens = 500 } = params;

  // Construct a focused NIL-related search prompt
  const systemPrompt = `You are a real-time NIL (Name, Image, Likeness) news researcher.
Your task is to find and summarize the most recent, relevant information about NIL for college athletes.
Focus on:
- Recent NIL deals and announcements
- New NIL regulations or policy changes
- Market trends and valuations
- Notable athlete success stories
- Compliance updates from NCAA, conferences, or states

Always cite your sources and indicate when information was published.
Be concise and factual. If you can't find recent relevant information, say so.`;

  const userPrompt = context
    ? `Context: ${context}\n\nSearch for the latest information about: ${query}`
    : `Search for the latest NIL-related information about: ${query}`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar', // Lightweight, cost-effective search model with grounding
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.2, // Low temperature for factual responses
        return_citations: true,
        search_recency_filter: 'month', // Focus on recent content
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    if (!content) {
      console.log('Perplexity returned empty response');
      return null;
    }

    console.log(`✅ Perplexity search complete: "${query.substring(0, 40)}..." (${citations.length} sources)`);

    return {
      content,
      sources: citations,
      query,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Perplexity search error:', error.message);
    return null;
  }
}

/**
 * Detect if a query would benefit from real-time web search
 *
 * This should be SELECTIVE — only trigger for queries that truly need
 * current/real-time information. Regular NIL education questions should
 * be answered from the knowledge base and system prompt, not web search.
 *
 * Triggers for:
 * - Explicit recency words: "latest", "recent", "news", "today", "this week"
 * - State rules + "rules"/"laws"/"legal" (verify current state laws)
 * - Brand verification: "is [brand] legit", "is [company] real"
 * - Specific deal valuations: "how much is [athlete]'s deal worth"
 * - Rule changes: "new rule", "rule change", "ncaa settlement"
 */
export function shouldUseRealTimeSearch(query: string): boolean {
  const lowerQuery = query.toLowerCase();

  // 1. Explicit recency indicators — always trigger
  const recencyWords = [
    'latest', 'recent', 'news', 'today', 'this week', 'this month',
    'this year', 'breaking', 'announced', 'just happened',
    'trending', 'right now',
  ];
  if (recencyWords.some(word => lowerQuery.includes(word))) {
    return true;
  }

  // 2. Rule/regulation verification — trigger when asking about current rules
  const rulePatterns = [
    /(?:state|current|new)\s+(?:nil\s+)?(?:rules?|laws?|regulations?|policy|policies)/,
    /(?:rules?|laws?|regulations?)\s+(?:in|for)\s+\w+/,
    /rule\s+change/,
    /ncaa\s+(?:settlement|ruling|decision|policy|update)/,
  ];
  if (rulePatterns.some(pattern => pattern.test(lowerQuery))) {
    return true;
  }

  // 3. Brand/company verification — "is [brand] legit/real/legitimate"
  const brandVerification = /(?:is|are)\s+[\w\s]+(?:legit|legitimate|real|trustworthy|a scam|safe)/;
  if (brandVerification.test(lowerQuery)) {
    return true;
  }

  // 4. Specific deal valuations — "how much" + deal/worth/paid
  const dealValuation = /how\s+much\s+(?:is|was|did|are|were).*(?:deal|worth|paid|earn|make|sign)/;
  if (dealValuation.test(lowerQuery)) {
    return true;
  }

  // 5. Market data requests
  const marketPatterns = [
    /(?:nil\s+)?market\s+(?:trends?|size|growth|data)/,
    /average\s+(?:nil\s+)?deal\s+(?:value|size|worth)/,
  ];
  if (marketPatterns.some(pattern => pattern.test(lowerQuery))) {
    return true;
  }

  return false;
}

/**
 * Search for recent NIL deals and partnerships
 */
export async function searchRecentDeals(athleteOrBrand?: string): Promise<PerplexitySearchResult | null> {
  const query = athleteOrBrand
    ? `Recent NIL deals involving ${athleteOrBrand}`
    : 'Latest college athlete NIL deals and partnerships this month';

  return searchPerplexity({
    query,
    context: 'Focus on deal values, brand partnerships, and notable signings.',
    maxTokens: 600,
  });
}

/**
 * Search for NIL regulatory updates
 */
export async function searchRegulatoryUpdates(state?: string): Promise<PerplexitySearchResult | null> {
  const query = state
    ? `Recent NIL regulation changes in ${state}`
    : 'Latest NIL regulatory updates and NCAA policy changes';

  return searchPerplexity({
    query,
    context: 'Focus on new laws, NCAA rules, and compliance requirements.',
    maxTokens: 600,
  });
}

/**
 * Search for NIL market trends
 */
export async function searchMarketTrends(sport?: string): Promise<PerplexitySearchResult | null> {
  const query = sport
    ? `Current NIL market trends for ${sport} athletes`
    : 'Current NIL market trends and athlete valuations';

  return searchPerplexity({
    query,
    context: 'Focus on market size, average deal values, and growth trends.',
    maxTokens: 600,
  });
}

/**
 * Format Perplexity search results for inclusion in AI context
 */
export function formatPerplexityContext(result: PerplexitySearchResult | null): string {
  if (!result || !result.content) {
    return '';
  }

  let context = `# Real-Time NIL Information\n\n`;
  context += `*Retrieved: ${new Date(result.timestamp).toLocaleDateString()}*\n\n`;
  context += result.content;

  if (result.sources && result.sources.length > 0) {
    context += '\n\n**Sources:**\n';
    result.sources.slice(0, 5).forEach((source, i) => {
      context += `${i + 1}. ${source}\n`;
    });
  }

  return context;
}

/**
 * Get real-time context for a user query
 * Only fetches if the query seems to need real-time information
 */
export async function getRealTimeContext(query: string): Promise<string> {
  if (!isPerplexityAvailable()) {
    return '';
  }

  if (!shouldUseRealTimeSearch(query)) {
    return '';
  }

  console.log(`🔍 Fetching real-time context for: "${query.substring(0, 50)}..."`);

  const result = await searchPerplexity({
    query,
    maxTokens: 500,
  });

  return formatPerplexityContext(result);
}
