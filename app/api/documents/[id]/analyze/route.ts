/**
 * Document Analysis API
 *
 * POST /api/documents/[id]/analyze
 *
 * Triggers AI analysis on a document (contract review, red flags, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { analyzeContract, detectRedFlags, extractKeyTerms } from '@/lib/ai/contract-analysis';

interface RouteParams {
  params: Promise<{ id: string }>;
}

type AnalysisType = 'contract_review' | 'red_flags' | 'summary' | 'key_terms';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: documentId } = await params;

    // Get auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const analysisType: AnalysisType = body.analysisType || 'contract_review';

    // Verify user and get document
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get document
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    if (!doc.extracted_text) {
      return NextResponse.json(
        { success: false, error: 'Document text not yet extracted' },
        { status: 400 }
      );
    }

    // Check for cached analysis
    const { data: existingAnalysis } = await supabase
      .from('document_analysis_results')
      .select('*')
      .eq('document_id', documentId)
      .eq('analysis_type', analysisType)
      .single();

    if (existingAnalysis) {
      return NextResponse.json({
        success: true,
        analysis: existingAnalysis,
        cached: true,
      });
    }

    // Perform analysis based on type
    let analysisResult: Record<string, any>;

    switch (analysisType) {
      case 'contract_review':
        analysisResult = await performFullContractReview(doc.extracted_text);
        break;

      case 'red_flags':
        const redFlags = detectRedFlags(doc.extracted_text);
        analysisResult = { redFlags };
        break;

      case 'key_terms':
        const keyTerms = extractKeyTerms(doc.extracted_text);
        analysisResult = { keyTerms };
        break;

      case 'summary':
        analysisResult = await generateDocumentSummary(doc.extracted_text, doc.document_type);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid analysis type' },
          { status: 400 }
        );
    }

    // Store analysis result
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('document_analysis_results')
      .insert({
        document_id: documentId,
        analysis_type: analysisType,
        analysis_result: analysisResult,
        model_used: 'gpt-4',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save analysis:', saveError);
    }

    return NextResponse.json({
      success: true,
      analysis: savedAnalysis || { analysis_result: analysisResult },
      cached: false,
    });

  } catch (error: any) {
    console.error('Document analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}

/**
 * Perform comprehensive contract review using AI
 */
async function performFullContractReview(text: string): Promise<Record<string, any>> {
  // First, run local analysis
  const localAnalysis = analyzeContract(text);

  if (!localAnalysis.isContract) {
    return {
      isContract: false,
      message: 'This document does not appear to be a contract.',
      localAnalysis,
    };
  }

  // Enhance with AI analysis
  try {
    // Truncate text if too long for API
    const truncatedText = text.length > 15000 ? text.substring(0, 15000) + '...' : text;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert NIL (Name, Image, Likeness) contract analyst helping college athletes understand their agreements. Analyze contracts for:
1. Key terms and obligations
2. Compensation structure
3. Duration and termination rights
4. Exclusivity and restrictions
5. Red flags or concerning clauses
6. Overall recommendations

Be thorough but explain in simple, athlete-friendly language. Highlight anything that could limit future opportunities.`,
        },
        {
          role: 'user',
          content: `Please analyze this NIL-related contract and provide a comprehensive review:\n\n${truncatedText}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const aiReview = response.choices[0]?.message?.content || '';

    return {
      isContract: true,
      contractType: localAnalysis.contractType,
      parties: localAnalysis.parties,
      keyTerms: localAnalysis.keyTerms,
      redFlags: localAnalysis.redFlags,
      aiReview,
      summary: localAnalysis.summary,
    };

  } catch (error: any) {
    console.error('AI review failed:', error);
    // Return local analysis if AI fails
    return {
      ...localAnalysis,
      aiReviewError: error.message,
    };
  }
}

/**
 * Generate a summary of the document
 */
async function generateDocumentSummary(
  text: string,
  documentType: string
): Promise<Record<string, any>> {
  try {
    const truncatedText = text.length > 12000 ? text.substring(0, 12000) + '...' : text;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are helping a college athlete understand a ${documentType}. Provide a clear, concise summary that covers:
- What this document is about
- Key points the athlete needs to understand
- Any action items or deadlines
- Important terms explained simply`,
        },
        {
          role: 'user',
          content: `Please summarize this document in simple terms:\n\n${truncatedText}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    return {
      summary: response.choices[0]?.message?.content || 'Summary generation failed.',
      documentType,
      wordCount: text.split(/\s+/).length,
    };

  } catch (error: any) {
    return {
      summary: 'Failed to generate AI summary.',
      error: error.message,
    };
  }
}
