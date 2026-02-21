/**
 * POST /api/library/analyze
 *
 * Upload a screenshot and analyze it for NIL deal details.
 * Returns an SSE stream with real-time progress events.
 *
 * Flow: Upload → GPT-4o extraction → 6D compliance scoring → store results
 */

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { analyzeScreenshot } from '@/lib/ai/deal-screenshot-analyzer';
import { calculateComplianceScore } from '@/lib/compliance/calculate-score';
import type { DealInput, AthleteContext } from '@/lib/compliance/types';
import type { DealExtraction } from '@/lib/types/deal-analysis';
import { mapDbRowToAnalysis } from '@/lib/types/deal-analysis';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const encoder = new TextEncoder();

  // Auth check
  const cookieStore = await cookies();
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  let { data: { user } } = await supabase.auth.getUser();
  if (!user && bearerToken) {
    const { data: { user: tokenUser } } = await supabase.auth.getUser(bearerToken);
    if (tokenUser) user = tokenUser;
  }

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parse form data
  let file: File;
  try {
    const formData = await request.formData();
    const f = formData.get('file');
    if (!f || !(f instanceof File)) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    file = f;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid form data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate file
  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(
      JSON.stringify({ error: `Unsupported file type: ${file.type}. Please upload an image (JPEG, PNG, WebP, or GIF).` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  if (file.size > MAX_SIZE) {
    return new Response(
      JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get image buffer
  const arrayBuffer = await file.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);
  const userId = user.id;

  // SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let analysisId: string | null = null;

      try {
        // Step 1: Upload to storage
        send({ type: 'status', status: 'uploading', message: 'Uploading screenshot...' });

        const fileExt = file.name.split('.').pop() || 'png';
        const storagePath = `${userId}/analyses/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('user-documents')
          .upload(storagePath, imageBuffer, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('user-documents')
          .getPublicUrl(storagePath);

        // Create DB record
        const { data: row, error: dbError } = await supabaseAdmin
          .from('deal_analyses')
          .insert({
            user_id: userId,
            image_url: publicUrl,
            image_filename: file.name,
            image_mime_type: file.type,
            image_size_bytes: file.size,
            analysis_status: 'extracting',
          })
          .select()
          .single();

        if (dbError || !row) {
          throw new Error(`Database error: ${dbError?.message || 'No row returned'}`);
        }
        analysisId = row.id;

        // Step 2: GPT-4o extraction
        send({ type: 'status', status: 'extracting', message: 'AI is analyzing your screenshot...' });

        const extraction = await analyzeScreenshot(imageBuffer, file.type);
        send({ type: 'extraction', extraction });

        // Update DB with extraction
        await supabaseAdmin
          .from('deal_analyses')
          .update({
            extraction_result: extraction as any,
            extracted_brand: extraction.brand,
            extracted_compensation: extraction.compensation,
            extracted_deal_type: extraction.dealType,
            extracted_deliverables: extraction.deliverables,
            extracted_red_flags: extraction.redFlags,
            extraction_confidence: extraction.confidence,
            analysis_status: 'scoring',
          })
          .eq('id', analysisId);

        // Step 3: Compliance scoring
        send({ type: 'status', status: 'scoring', message: 'Running compliance check...' });

        const complianceResult = await runComplianceCheck(userId, extraction);

        send({ type: 'compliance', result: complianceResult });

        // Update DB with compliance results
        const processingTimeMs = Date.now() - startTime;
        const { data: finalRow } = await supabaseAdmin
          .from('deal_analyses')
          .update({
            compliance_result: complianceResult as any,
            compliance_score: complianceResult.totalScore,
            compliance_status: complianceResult.status,
            analysis_status: 'completed',
            processing_time_ms: processingTimeMs,
          })
          .eq('id', analysisId)
          .select()
          .single();

        send({
          type: 'complete',
          analysisId,
          analysis: finalRow ? mapDbRowToAnalysis(finalRow) : null,
        });

      } catch (error: any) {
        console.error('Analysis error:', error);
        send({ type: 'error', message: error.message || 'Analysis failed' });

        // Mark as failed in DB
        if (analysisId) {
          await supabaseAdmin
            .from('deal_analyses')
            .update({
              analysis_status: 'failed',
              error_message: error.message || 'Unknown error',
              processing_time_ms: Date.now() - startTime,
            })
            .eq('id', analysisId);
        }
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Build DealInput from extraction and run 6D compliance scoring
 */
async function runComplianceCheck(userId: string, extraction: DealExtraction) {
  // Get athlete profile
  const { data: profile } = await supabaseAdmin
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Auto-detect booster/performance flags from red flags
  const boosterKeywords = ['booster', 'collective', 'alumni fund', 'donor'];
  const perfKeywords = ['per touchdown', 'per win', 'performance bonus', 'per game', 'per start'];

  const isBoosterConnected = extraction.redFlags.some(f =>
    boosterKeywords.some(k => f.toLowerCase().includes(k))
  );
  const performanceBased = extraction.redFlags.some(f =>
    perfKeywords.some(k => f.toLowerCase().includes(k))
  );

  const dealInput: DealInput = {
    athleteId: userId,
    dealType: extraction.dealType,
    thirdPartyName: extraction.brand,
    thirdPartyType: extraction.brandType,
    compensation: extraction.compensation || 0,
    deliverables: extraction.deliverables,
    state: profile?.primary_state || 'CA',
    startDate: extraction.startDate,
    endDate: extraction.endDate,
    isSchoolAffiliated: false,
    isBoosterConnected,
    performanceBased,
  };

  const athleteContext: AthleteContext = {
    id: userId,
    role: profile?.role === 'hs_student' ? 'hs_student' : 'college_athlete',
    isMinor: profile?.role === 'hs_student',
    state: profile?.primary_state || 'CA',
    sport: profile?.primary_sport || 'Other',
    followers: profile?.social_followers || profile?.instagram_followers || 0,
    engagementRate: profile?.engagement_rate || 0.03,
    consentStatus: profile?.consent_status || undefined,
    hasAcknowledgedTaxObligations: profile?.tax_acknowledged || false,
  };

  return await calculateComplianceScore(dealInput, athleteContext);
}
