/**
 * Deal Analysis Hub — Type Definitions
 *
 * Types for the screenshot analysis pipeline:
 * Image → GPT-4o extraction → 6D compliance scoring → deal conversion
 */

import type { ComplianceResult } from '@/lib/compliance/types';

// ============================================================================
// Analysis Status
// ============================================================================

export type AnalysisStatus = 'pending' | 'uploading' | 'extracting' | 'scoring' | 'completed' | 'failed';

// ============================================================================
// GPT-4o Extraction Result
// ============================================================================

export interface DealExtraction {
  brand: string;
  brandType: 'brand' | 'agency' | 'local_business' | 'individual' | 'unknown';
  compensation: number | null;
  compensationDescription: string;
  dealType: 'social_post' | 'appearance' | 'endorsement' | 'brand_ambassador' | 'merchandise' | 'other';
  deliverables: string;
  timeline: string;
  startDate?: string;
  endDate?: string;
  exclusivity: boolean;
  redFlags: string[];
  rawText: string;
  confidence: number; // 0-1
  summary: string;
}

// ============================================================================
// Database Row
// ============================================================================

export interface DealAnalysis {
  id: string;
  userId: string;
  imageUrl: string;
  imageFilename: string;
  imageMimeType: string | null;
  imageSizeBytes: number | null;

  extractionResult: DealExtraction | null;
  extractedBrand: string | null;
  extractedCompensation: number | null;
  extractedDealType: string | null;
  extractedDeliverables: string | null;
  extractedRedFlags: string[];
  extractionConfidence: number | null;

  complianceResult: ComplianceResult | null;
  complianceScore: number | null;
  complianceStatus: 'green' | 'yellow' | 'red' | null;

  convertedToDealId: string | null;
  convertedAt: string | null;

  analysisStatus: AnalysisStatus;
  errorMessage: string | null;
  processingTimeMs: number | null;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// SSE Streaming Events
// ============================================================================

export interface AnalysisStatusEvent {
  type: 'status';
  status: AnalysisStatus;
  message: string;
}

export interface AnalysisExtractionEvent {
  type: 'extraction';
  extraction: DealExtraction;
}

export interface AnalysisComplianceEvent {
  type: 'compliance';
  result: ComplianceResult;
}

export interface AnalysisCompleteEvent {
  type: 'complete';
  analysisId: string;
  analysis: DealAnalysis;
}

export interface AnalysisErrorEvent {
  type: 'error';
  message: string;
}

export type AnalysisEvent =
  | AnalysisStatusEvent
  | AnalysisExtractionEvent
  | AnalysisComplianceEvent
  | AnalysisCompleteEvent
  | AnalysisErrorEvent;

// ============================================================================
// Helper: Map DB snake_case → camelCase
// ============================================================================

export function mapDbRowToAnalysis(row: any): DealAnalysis {
  return {
    id: row.id,
    userId: row.user_id,
    imageUrl: row.image_url,
    imageFilename: row.image_filename,
    imageMimeType: row.image_mime_type,
    imageSizeBytes: row.image_size_bytes,
    extractionResult: row.extraction_result,
    extractedBrand: row.extracted_brand,
    extractedCompensation: row.extracted_compensation ? parseFloat(row.extracted_compensation) : null,
    extractedDealType: row.extracted_deal_type,
    extractedDeliverables: row.extracted_deliverables,
    extractedRedFlags: row.extracted_red_flags || [],
    extractionConfidence: row.extraction_confidence ? parseFloat(row.extraction_confidence) : null,
    complianceResult: row.compliance_result,
    complianceScore: row.compliance_score,
    complianceStatus: row.compliance_status,
    convertedToDealId: row.converted_to_deal_id,
    convertedAt: row.converted_at,
    analysisStatus: row.analysis_status,
    errorMessage: row.error_message,
    processingTimeMs: row.processing_time_ms,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
