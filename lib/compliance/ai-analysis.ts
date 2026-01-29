/**
 * AI Contract Analysis Integration for Compliance Scoring
 * ========================================================
 * Integrates AI-powered contract analysis with the compliance scoring engine.
 * This module checks if AI analysis is enabled for an institution and
 * runs contract analysis when appropriate.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  analyzeContract,
  isLikelyContract
} from '../ai/contract-analysis';

// Types for AI analysis results
export interface AIAnalysisResult {
  enabled: boolean;
  analyzed: boolean;
  contractDetected: boolean;
  confidence: number;
  redFlags: AIRedFlag[];
  keyTerms: AIKeyTerm[];
  summary: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  analyzedAt: string;
  error?: string;
}

export interface AIRedFlag {
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  excerpt?: string;
  recommendation: string;
}

export interface AIKeyTerm {
  term: string;
  value: string;
  importance: 'high' | 'medium' | 'low';
}

/**
 * Check if AI analysis is enabled for a compliance officer's institution
 */
export async function isAIAnalysisEnabled(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    // First check if user has compliance settings
    const { data: settings, error } = await supabase
      .from('compliance_settings')
      .select('enable_ai_deal_analysis, institution_id')
      .eq('user_id', userId)
      .single();

    if (error || !settings) {
      // Default to false if no settings found
      return false;
    }

    return (settings as { enable_ai_deal_analysis?: boolean }).enable_ai_deal_analysis === true;
  } catch (err) {
    console.error('Error checking AI analysis setting:', err);
    return false;
  }
}

/**
 * Check if AI analysis is enabled for an institution
 */
export async function isAIAnalysisEnabledForInstitution(
  supabase: SupabaseClient,
  institutionId: string
): Promise<boolean> {
  try {
    // Check any compliance officer at this institution has AI enabled
    const { data: settings, error } = await supabase
      .from('compliance_settings')
      .select('enable_ai_deal_analysis')
      .eq('institution_id', institutionId)
      .eq('enable_ai_deal_analysis', true)
      .limit(1)
      .single();

    if (error || !settings) {
      return false;
    }

    return (settings as { enable_ai_deal_analysis?: boolean }).enable_ai_deal_analysis === true;
  } catch (err) {
    return false;
  }
}

/**
 * Run AI contract analysis on deal contract text
 */
export async function runAIContractAnalysis(
  contractText: string | undefined | null
): Promise<AIAnalysisResult> {
  const now = new Date().toISOString();

  // Return disabled result if no contract text
  if (!contractText || contractText.trim().length < 50) {
    return {
      enabled: true,
      analyzed: false,
      contractDetected: false,
      confidence: 0,
      redFlags: [],
      keyTerms: [],
      summary: 'No contract text available for analysis.',
      recommendations: ['Upload a contract document to enable AI analysis.'],
      riskLevel: 'low',
      analyzedAt: now,
    };
  }

  try {
    // Check if the text is a contract
    const contractCheck = isLikelyContract(contractText);

    if (!contractCheck.isContract) {
      return {
        enabled: true,
        analyzed: true,
        contractDetected: false,
        confidence: contractCheck.confidence,
        redFlags: [],
        keyTerms: [],
        summary: 'The provided text does not appear to be a contract document.',
        recommendations: ['Ensure you upload the actual contract or agreement document.'],
        riskLevel: 'low',
        analyzedAt: now,
      };
    }

    // Run full contract analysis
    const analysis = analyzeContract(contractText);

    // Map red flags to our format
    const redFlags: AIRedFlag[] = (analysis.redFlags || []).map(flag => ({
      issue: flag.issue,
      severity: flag.severity,
      excerpt: flag.excerpt,
      recommendation: flag.recommendation,
    }));

    // Map key terms
    const keyTerms: AIKeyTerm[] = (analysis.keyTerms || []).map(term => ({
      term: term.term,
      value: term.value,
      importance: term.importance,
    }));

    // Determine overall risk level based on red flags
    const criticalCount = redFlags.filter(f => f.severity === 'critical').length;
    const warningCount = redFlags.filter(f => f.severity === 'warning').length;

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalCount >= 2) {
      riskLevel = 'critical';
    } else if (criticalCount >= 1) {
      riskLevel = 'high';
    } else if (warningCount >= 2) {
      riskLevel = 'medium';
    }

    // Build recommendations
    const recommendations: string[] = [];

    if (criticalCount > 0) {
      recommendations.push(`Review ${criticalCount} critical contract issue(s) before approving.`);
    }

    if (warningCount > 0) {
      recommendations.push(`Address ${warningCount} warning-level concern(s) in the contract.`);
    }

    // Add specific recommendations from red flags
    redFlags
      .filter(f => f.severity === 'critical')
      .slice(0, 3)
      .forEach(flag => {
        recommendations.push(flag.recommendation);
      });

    if (recommendations.length === 0) {
      recommendations.push('Contract analysis did not identify significant concerns.');
    }

    return {
      enabled: true,
      analyzed: true,
      contractDetected: true,
      confidence: analysis.confidence || contractCheck.confidence,
      redFlags,
      keyTerms,
      summary: analysis.summary || 'Contract analyzed successfully.',
      recommendations,
      riskLevel,
      analyzedAt: now,
    };
  } catch (error) {
    console.error('AI contract analysis error:', error);
    return {
      enabled: true,
      analyzed: false,
      contractDetected: false,
      confidence: 0,
      redFlags: [],
      keyTerms: [],
      summary: 'AI analysis encountered an error.',
      recommendations: ['Manual contract review recommended.'],
      riskLevel: 'medium',
      analyzedAt: now,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Run AI analysis for a deal if enabled
 * Returns null if AI analysis is disabled
 */
export async function getAIAnalysisForDeal(
  supabase: SupabaseClient,
  options: {
    userId?: string;
    institutionId?: string;
    contractText?: string | null;
  }
): Promise<AIAnalysisResult | null> {
  const { userId, institutionId, contractText } = options;

  // Check if AI analysis is enabled
  let enabled = false;

  if (userId) {
    enabled = await isAIAnalysisEnabled(supabase, userId);
  } else if (institutionId) {
    enabled = await isAIAnalysisEnabledForInstitution(supabase, institutionId);
  }

  if (!enabled) {
    return null;
  }

  // Run the analysis
  return runAIContractAnalysis(contractText);
}

/**
 * Get AI risk score contribution
 * This can be used to adjust the compliance score based on AI findings
 */
export function getAIRiskScoreAdjustment(analysis: AIAnalysisResult): number {
  if (!analysis.analyzed || !analysis.contractDetected) {
    return 0;
  }

  const criticalCount = analysis.redFlags.filter(f => f.severity === 'critical').length;
  const warningCount = analysis.redFlags.filter(f => f.severity === 'warning').length;

  // Each critical issue reduces score by 10, warnings by 3
  // Max penalty is -30 points
  const penalty = Math.min(30, (criticalCount * 10) + (warningCount * 3));

  return -penalty;
}
