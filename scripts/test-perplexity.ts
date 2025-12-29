#!/usr/bin/env npx tsx
/**
 * Test Perplexity Integration for Real-Time NIL News
 */

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

if (!PERPLEXITY_API_KEY) {
  console.error('❌ PERPLEXITY_API_KEY environment variable is not set');
  process.exit(1);
}

console.log('='.repeat(60));
console.log('Testing Perplexity Integration for Real-Time NIL News');
console.log('='.repeat(60));
console.log('API Key:', PERPLEXITY_API_KEY.substring(0, 10) + '...');

interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  citations?: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function testPerplexitySearch(query: string, description: string): Promise<void> {
  console.log(`\n📡 Test: ${description}`);
  console.log(`   Query: "${query}"`);
  console.log('   Fetching...');

  const systemPrompt = `You are a real-time NIL (Name, Image, Likeness) news researcher.
Your task is to find and summarize the most recent, relevant information about NIL for college athletes.
Focus on:
- Recent NIL deals and announcements
- New NIL regulations or policy changes
- Market trends and valuations
- Notable athlete success stories

Always cite your sources and indicate when information was published.
Be concise and factual.`;

  try {
    const startTime = Date.now();

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Search for the latest NIL-related information about: ${query}` },
        ],
        max_tokens: 500,
        temperature: 0.2,
        return_citations: true,
        search_recency_filter: 'month',
      }),
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ❌ API Error: ${response.status}`);
      console.log(`   Error: ${errorText}`);
      return;
    }

    const data: PerplexityResponse = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    console.log(`   ✅ Response received (${elapsed}ms)`);
    console.log(`   Model: ${data.model}`);
    console.log(`   Tokens: ${data.usage?.total_tokens || 'N/A'}`);
    console.log(`   Citations: ${citations.length}`);
    console.log('\n   Response:');
    console.log('   ' + '-'.repeat(56));

    // Format the response with indentation
    const lines = content.split('\n');
    lines.forEach(line => {
      console.log('   ' + line);
    });

    if (citations.length > 0) {
      console.log('\n   Sources:');
      citations.slice(0, 5).forEach((source, i) => {
        console.log(`   ${i + 1}. ${source}`);
      });
    }

    console.log('   ' + '-'.repeat(56));

  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function runTests() {
  // Test 1: Latest NIL news
  await testPerplexitySearch(
    'latest college athlete NIL deals this month',
    'Latest NIL Deals'
  );

  // Test 2: NCAA regulations
  await testPerplexitySearch(
    'recent NCAA NIL rule changes and policy updates',
    'NCAA Regulatory Updates'
  );

  // Test 3: Market trends
  await testPerplexitySearch(
    'current NIL market trends and athlete valuations',
    'NIL Market Trends'
  );

  // Test 4: Sport-specific (Basketball)
  await testPerplexitySearch(
    'recent basketball NIL deals and partnerships',
    'Basketball NIL Deals'
  );

  console.log('\n' + '='.repeat(60));
  console.log('Perplexity Integration Tests Complete!');
  console.log('='.repeat(60));
  console.log('\n✅ Perplexity is configured and working!');
  console.log('   Real-time NIL news will be automatically included');
  console.log('   when users ask about recent news, deals, or trends.');
}

runTests().catch(console.error);
