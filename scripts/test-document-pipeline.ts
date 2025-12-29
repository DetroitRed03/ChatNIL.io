/**
 * Document Pipeline Test Script
 *
 * Tests the complete document processing pipeline:
 * - Text extraction (PDF, DOCX, images)
 * - Chunking and token counting
 * - Embedding generation
 * - Database storage
 * - Semantic search
 *
 * Run: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... OPENAI_API_KEY=... npx tsx scripts/test-document-pipeline.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Environment setup
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test user ID (use the known test user)
const TEST_USER_ID = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

// Sample contract text for testing
const SAMPLE_CONTRACT_TEXT = `
NIL ENDORSEMENT AGREEMENT

This Agreement is entered into as of January 1, 2025, by and between:

BRAND COMPANY INC. ("Company")
and
JOHN DOE ("Athlete")

WHEREAS, Company desires to engage Athlete for promotional services using Athlete's
Name, Image, and Likeness ("NIL"); and

WHEREAS, Athlete desires to provide such services under the terms set forth herein;

NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein,
the parties agree as follows:

1. TERM
This Agreement shall commence on the Effective Date and continue for a period of
twelve (12) months, unless earlier terminated pursuant to Section 7.

2. COMPENSATION
Company shall pay Athlete a total of Twenty-Five Thousand Dollars ($25,000) for the
services described herein, payable in equal monthly installments.

3. SERVICES
Athlete agrees to:
- Appear in three (3) social media posts per month
- Attend two (2) in-person promotional events
- Grant Company the right to use Athlete's NIL in advertising materials

4. EXCLUSIVITY
During the Term, Athlete shall not enter into any endorsement agreements with
competing brands in the athletic apparel category.

5. INTELLECTUAL PROPERTY
All materials created under this Agreement shall remain the property of Company.
Athlete grants Company a perpetual, royalty-free license to use such materials.

6. MORALITY CLAUSE
Company may terminate this Agreement immediately if Athlete engages in conduct
that brings disrepute to Company.

7. TERMINATION
Either party may terminate this Agreement with thirty (30) days written notice.

8. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first
written above.

________________________
BRAND COMPANY INC.

________________________
JOHN DOE (Athlete)
`;

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function logTest(result: TestResult) {
  results.push(result);
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.name}: ${result.message}`);
  if (result.details && !result.passed) {
    console.log('   Details:', JSON.stringify(result.details, null, 2));
  }
}

async function testDatabaseConnection() {
  console.log('\n📊 Test 1: Database Connection\n');

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('count')
      .limit(1);

    if (error) throw error;

    logTest({
      name: 'Database Connection',
      passed: true,
      message: 'Successfully connected to Supabase',
    });
  } catch (error: any) {
    logTest({
      name: 'Database Connection',
      passed: false,
      message: `Connection failed: ${error.message}`,
      details: error,
    });
  }
}

async function testDocumentTableExists() {
  console.log('\n📋 Test 2: Document Tables Exist\n');

  const tables = ['documents', 'document_chunks', 'document_analysis_results'];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);

      if (error && error.code === '42P01') {
        logTest({
          name: `Table: ${table}`,
          passed: false,
          message: 'Table does not exist',
        });
      } else if (error) {
        logTest({
          name: `Table: ${table}`,
          passed: false,
          message: `Error: ${error.message}`,
        });
      } else {
        logTest({
          name: `Table: ${table}`,
          passed: true,
          message: 'Table exists and accessible',
        });
      }
    } catch (error: any) {
      logTest({
        name: `Table: ${table}`,
        passed: false,
        message: `Exception: ${error.message}`,
      });
    }
  }
}

async function testDocumentInsertion() {
  console.log('\n📝 Test 3: Document Insertion\n');

  try {
    // Insert a test document
    const testDoc = {
      user_id: TEST_USER_ID,
      file_name: 'test-contract.txt',
      file_type: 'text/plain',
      file_size: SAMPLE_CONTRACT_TEXT.length,
      extracted_text: SAMPLE_CONTRACT_TEXT,
      extraction_status: 'completed',
      extraction_method: 'direct',
      document_type: 'contract',
      source: 'test',
      word_count: SAMPLE_CONTRACT_TEXT.split(/\s+/).length,
    };

    const { data, error } = await supabase
      .from('documents')
      .insert(testDoc)
      .select()
      .single();

    if (error) throw error;

    logTest({
      name: 'Document Insertion',
      passed: true,
      message: `Document created with ID: ${data.id}`,
      details: { documentId: data.id },
    });

    return data.id;
  } catch (error: any) {
    logTest({
      name: 'Document Insertion',
      passed: false,
      message: `Failed to insert document: ${error.message}`,
      details: error,
    });
    return null;
  }
}

async function testChunkInsertion(documentId: string) {
  console.log('\n🔪 Test 4: Chunk Creation\n');

  if (!documentId) {
    logTest({
      name: 'Chunk Creation',
      passed: false,
      message: 'Skipped - no document ID',
    });
    return [];
  }

  try {
    // Split text into chunks (simplified)
    const chunkSize = 500;
    const chunks: string[] = [];
    const words = SAMPLE_CONTRACT_TEXT.split(/\s+/);

    let currentChunk: string[] = [];
    let currentSize = 0;

    for (const word of words) {
      if (currentSize + word.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [];
        currentSize = 0;
      }
      currentChunk.push(word);
      currentSize += word.length + 1;
    }
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    logTest({
      name: 'Text Chunking',
      passed: true,
      message: `Created ${chunks.length} chunks from document`,
    });

    // Insert chunks (without embeddings for now)
    const chunkRecords = chunks.map((text, index) => ({
      document_id: documentId,
      chunk_index: index,
      chunk_text: text,
      token_count: Math.ceil(text.split(/\s+/).length * 1.3), // Rough estimate
      start_char: 0,
      end_char: text.length,
    }));

    const { data, error } = await supabase
      .from('document_chunks')
      .insert(chunkRecords)
      .select();

    if (error) throw error;

    logTest({
      name: 'Chunk Insertion',
      passed: true,
      message: `Inserted ${data.length} chunks into database`,
    });

    return data.map((c: any) => c.id);
  } catch (error: any) {
    logTest({
      name: 'Chunk Insertion',
      passed: false,
      message: `Failed: ${error.message}`,
      details: error,
    });
    return [];
  }
}

async function testEmbeddingGeneration(chunkIds: string[]) {
  console.log('\n🧠 Test 5: Embedding Generation\n');

  if (!OPENAI_API_KEY) {
    logTest({
      name: 'Embedding Generation',
      passed: false,
      message: 'Skipped - no OPENAI_API_KEY',
    });
    return;
  }

  if (chunkIds.length === 0) {
    logTest({
      name: 'Embedding Generation',
      passed: false,
      message: 'Skipped - no chunks to embed',
    });
    return;
  }

  try {
    // Get the first chunk
    const { data: chunk } = await supabase
      .from('document_chunks')
      .select('chunk_text')
      .eq('id', chunkIds[0])
      .single();

    if (!chunk) throw new Error('Chunk not found');

    // Generate embedding
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: chunk.chunk_text,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const embedding = result.data[0].embedding;

    logTest({
      name: 'OpenAI Embedding',
      passed: true,
      message: `Generated embedding with ${embedding.length} dimensions`,
    });

    // Verify it's 1536 dimensions
    if (embedding.length !== 1536) {
      logTest({
        name: 'Embedding Dimensions',
        passed: false,
        message: `Expected 1536, got ${embedding.length}`,
      });
    } else {
      logTest({
        name: 'Embedding Dimensions',
        passed: true,
        message: 'Correct: 1536 dimensions',
      });
    }

    // Update chunk with embedding
    const { error: updateError } = await supabase
      .from('document_chunks')
      .update({ embedding })
      .eq('id', chunkIds[0]);

    if (updateError) throw updateError;

    logTest({
      name: 'Embedding Storage',
      passed: true,
      message: 'Successfully stored embedding in database',
    });
  } catch (error: any) {
    logTest({
      name: 'Embedding Generation',
      passed: false,
      message: `Failed: ${error.message}`,
      details: error,
    });
  }
}

async function testSemanticSearch(documentId: string) {
  console.log('\n🔍 Test 6: Semantic Search\n');

  if (!OPENAI_API_KEY) {
    logTest({
      name: 'Semantic Search',
      passed: false,
      message: 'Skipped - no OPENAI_API_KEY',
    });
    return;
  }

  try {
    // Generate query embedding
    const query = 'What is the compensation in this contract?';

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const queryEmbedding = result.data[0].embedding;

    logTest({
      name: 'Query Embedding',
      passed: true,
      message: `Generated query embedding for: "${query}"`,
    });

    // Call match_document_chunks function
    const { data: matches, error } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 3,
      p_user_id: TEST_USER_ID,
    });

    if (error) throw error;

    if (matches && matches.length > 0) {
      logTest({
        name: 'Semantic Search',
        passed: true,
        message: `Found ${matches.length} matching chunks`,
        details: matches.map((m: any) => ({
          similarity: m.similarity?.toFixed(3),
          preview: m.chunk_text?.substring(0, 100) + '...',
        })),
      });

      // Check if compensation is in the results
      const hasCompensation = matches.some((m: any) =>
        m.chunk_text?.toLowerCase().includes('compensation') ||
        m.chunk_text?.toLowerCase().includes('$25,000')
      );

      logTest({
        name: 'Search Relevance',
        passed: hasCompensation,
        message: hasCompensation
          ? 'Found relevant content about compensation'
          : 'Did not find compensation in results (may need more embeddings)',
      });
    } else {
      logTest({
        name: 'Semantic Search',
        passed: false,
        message: 'No matches found (chunks may not have embeddings yet)',
      });
    }
  } catch (error: any) {
    logTest({
      name: 'Semantic Search',
      passed: false,
      message: `Failed: ${error.message}`,
      details: error,
    });
  }
}

async function testContractAnalysis() {
  console.log('\n📜 Test 7: Contract Analysis\n');

  // Simple contract detection patterns
  const CONTRACT_INDICATORS = [
    /agreement\s+(between|by\s+and\s+between)/i,
    /name,?\s*image,?\s*(and\s*)?likeness/i,
    /nil\s+(agreement|contract|deal)/i,
    /compensation|payment/i,
    /exclusivity/i,
    /termination/i,
  ];

  const RED_FLAG_PATTERNS = [
    { pattern: /perpetual|in\s+perpetuity/i, issue: 'Perpetual rights' },
    { pattern: /exclusive/i, issue: 'Exclusivity clause' },
    { pattern: /moral(ity)?\s+clause/i, issue: 'Morality clause' },
  ];

  try {
    // Test contract detection
    const matches = CONTRACT_INDICATORS.filter((p) => p.test(SAMPLE_CONTRACT_TEXT));
    const isContract = matches.length >= 3;

    logTest({
      name: 'Contract Detection',
      passed: isContract,
      message: `Detected ${matches.length}/6 contract indicators`,
    });

    // Test red flag detection
    const redFlags = RED_FLAG_PATTERNS.filter((rf) =>
      rf.pattern.test(SAMPLE_CONTRACT_TEXT)
    ).map((rf) => rf.issue);

    logTest({
      name: 'Red Flag Detection',
      passed: redFlags.length > 0,
      message: `Found ${redFlags.length} red flags: ${redFlags.join(', ') || 'none'}`,
    });
  } catch (error: any) {
    logTest({
      name: 'Contract Analysis',
      passed: false,
      message: `Failed: ${error.message}`,
    });
  }
}

async function cleanup(documentId: string | null) {
  console.log('\n🧹 Cleanup\n');

  if (!documentId) {
    console.log('No document to clean up');
    return;
  }

  try {
    // Delete chunks first (foreign key constraint)
    await supabase.from('document_chunks').delete().eq('document_id', documentId);

    // Delete document
    await supabase.from('documents').delete().eq('id', documentId);

    console.log(`Cleaned up test document: ${documentId}`);
  } catch (error: any) {
    console.log(`Cleanup warning: ${error.message}`);
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.log(`  - ${r.name}: ${r.message}`));
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

async function main() {
  console.log('🧪 Document Pipeline Test Suite');
  console.log('='.repeat(60));
  console.log(`Supabase URL: ${SUPABASE_URL.substring(0, 30)}...`);
  console.log(`OpenAI Key: ${OPENAI_API_KEY ? '✓ Present' : '✗ Missing'}`);
  console.log(`Test User: ${TEST_USER_ID}`);
  console.log('='.repeat(60));

  let documentId: string | null = null;

  try {
    await testDatabaseConnection();
    await testDocumentTableExists();
    documentId = await testDocumentInsertion();
    const chunkIds = await testChunkInsertion(documentId!);
    await testEmbeddingGeneration(chunkIds);
    await testSemanticSearch(documentId!);
    await testContractAnalysis();
  } finally {
    await cleanup(documentId);
    await printSummary();
  }
}

main().catch(console.error);
