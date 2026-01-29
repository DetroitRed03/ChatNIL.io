import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { generateScoreSummary, ComplianceScoreResult } from '@/lib/compliance';

export const dynamic = 'force-dynamic';

/**
 * GET /api/compliance/summary?dealId=xxx
 * Generate a formatted compliance summary report
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('dealId');
    const format = searchParams.get('format') || 'json'; // json, markdown, or html

    if (!dealId) {
      return NextResponse.json(
        { error: 'dealId query parameter is required' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    let { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user && bearerToken) {
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(bearerToken);
      if (tokenUser && !tokenError) {
        user = tokenUser;
        authError = null;
      }
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch compliance score
    const { data: score, error: scoreError } = await supabase
      .from('compliance_scores')
      .select('*')
      .eq('deal_id', dealId)
      .single();

    if (scoreError || !score) {
      return NextResponse.json(
        { error: 'Score not found. Run /api/compliance/score first.' },
        { status: 404 }
      );
    }

    // Fetch deal info for context
    const { data: deal } = await supabase
      .from('nil_deals')
      .select('brand_name, company_name, compensation_amount, deal_type')
      .eq('id', dealId)
      .single();

    // Convert DB record to ComplianceScoreResult format
    const result: ComplianceScoreResult = {
      dealId: score.deal_id,
      athleteId: score.user_id,
      totalScore: score.total_score,
      weightedScore: score.weighted_score,
      riskTier: score.status,
      policyFitScore: score.policy_fit_score,
      documentHygieneScore: score.document_score,
      fmvVerificationScore: score.fmv_score,
      taxReadinessScore: score.tax_score,
      brandSafetyScore: score.brand_safety_score,
      guardianConsentScore: score.guardian_consent_score,
      dimensionDetails: [
        {
          dimension: 'policy_fit',
          score: score.policy_fit_score,
          weight: score.policy_fit_weight,
          weightedContribution: score.policy_fit_score * score.policy_fit_weight,
          subScores: [],
          flags: [],
          notes: score.policy_fit_notes || '',
        },
        {
          dimension: 'document_hygiene',
          score: score.document_score,
          weight: score.document_weight,
          weightedContribution: score.document_score * score.document_weight,
          subScores: [],
          flags: [],
          notes: score.document_notes || '',
        },
        {
          dimension: 'fmv_verification',
          score: score.fmv_score,
          weight: score.fmv_weight,
          weightedContribution: score.fmv_score * score.fmv_weight,
          subScores: [],
          flags: [],
          notes: score.fmv_notes || '',
        },
        {
          dimension: 'tax_readiness',
          score: score.tax_score,
          weight: score.tax_weight,
          weightedContribution: score.tax_score * score.tax_weight,
          subScores: [],
          flags: [],
          notes: score.tax_notes || '',
        },
        {
          dimension: 'brand_safety',
          score: score.brand_safety_score,
          weight: score.brand_safety_weight,
          weightedContribution: score.brand_safety_score * score.brand_safety_weight,
          subScores: [],
          flags: [],
          notes: score.brand_safety_notes || '',
        },
        {
          dimension: 'guardian_consent',
          score: score.guardian_consent_score,
          weight: score.guardian_consent_weight,
          weightedContribution: score.guardian_consent_score * score.guardian_consent_weight,
          subScores: [],
          flags: [],
          notes: score.guardian_consent_notes || '',
        },
      ],
      criticalIssues: score.critical_issues || [],
      warnings: score.warnings || [],
      fixRecommendations: (score.fix_recommendations || []).map((r: string) => {
        const parts = r.split(': ');
        return {
          priority: parts[0] as 'critical' | 'high' | 'medium' | 'low',
          dimension: 'policy_fit',
          issue: parts[1]?.split(' - ')[0] || r,
          action: parts[1]?.split(' - ')[1] || r,
          impact: '',
        };
      }),
      reasonCodes: score.reason_codes || [],
      scoredAt: score.scored_at,
      scoreVersion: `v${score.score_version}`,
      processingTimeMs: 0,
    };

    // Return based on format
    if (format === 'markdown') {
      const markdown = generateScoreSummary(result);
      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="compliance-report-${dealId}.md"`,
        },
      });
    }

    if (format === 'html') {
      const markdown = generateScoreSummary(result);
      const html = markdownToHtml(markdown, deal);
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    // Default: JSON
    return NextResponse.json({
      score: result,
      deal: {
        brandName: deal?.brand_name || deal?.company_name,
        value: deal?.compensation_amount,
        type: deal?.deal_type,
      },
      summary: generateScoreSummary(result),
    });
  } catch (error) {
    console.error('Error generating compliance summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function markdownToHtml(markdown: string, deal: any): string {
  // Simple markdown to HTML conversion
  let html = markdown
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
    });

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Compliance Report - ${deal?.brand_name || 'NIL Deal'}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; }
    h3 { color: #555; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    li { margin: 5px 0; }
    .green { color: #22c55e; }
    .yellow { color: #eab308; }
    .red { color: #ef4444; }
  </style>
</head>
<body>
  ${html}
  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
    Generated by ChatNIL Compliance Engine | ${new Date().toLocaleString()}
  </footer>
</body>
</html>`;
}
