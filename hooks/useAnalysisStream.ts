/**
 * useAnalysisStream — SSE consumer hook for deal screenshot analysis
 *
 * Handles uploading an image to /api/library/analyze and consuming
 * the SSE stream of analysis events (status, extraction, compliance, complete).
 */

import { useCallback, useRef } from 'react';
import { useLibraryStore } from '@/lib/stores/library';
import { supabase } from '@/lib/supabase';
import type { DealAnalysis, DealExtraction, AnalysisStatus } from '@/lib/types/deal-analysis';
import type { ComplianceResult } from '@/lib/compliance/types';

export function useAnalysisStream() {
  const abortRef = useRef<AbortController | null>(null);

  const startAnalysis = useCallback(async (file: File): Promise<void> => {
    const store = useLibraryStore.getState();

    // Get auth token
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('Not authenticated');

    // Abort any previous analysis
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    // Reset state
    store.setAnalysisStreamStatus('uploading');
    store.setCurrentExtraction(null);
    store.setActiveAnalysisId(null);

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/library/analyze', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
      signal: abortRef.current.signal,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      store.setAnalysisStreamStatus('failed');
      throw new Error(errorBody.error || `Analysis failed: ${response.statusText}`);
    }

    if (!response.body) {
      store.setAnalysisStreamStatus('failed');
      throw new Error('No response stream');
    }

    // Parse SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let sseBuffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const messages = sseBuffer.split('\n\n');
        sseBuffer = messages.pop() || '';

        for (const message of messages) {
          for (const line of message.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') {
              store.setAnalysisStreamStatus(null);
              return;
            }

            try {
              const parsed = JSON.parse(data);

              switch (parsed.type) {
                case 'status':
                  store.setAnalysisStreamStatus(parsed.status as AnalysisStatus);
                  break;

                case 'extraction':
                  store.setCurrentExtraction(parsed.extraction as DealExtraction);
                  break;

                case 'compliance':
                  // Compliance result received — will be part of the complete event
                  break;

                case 'complete':
                  if (parsed.analysis) {
                    store.addAnalysis(parsed.analysis as DealAnalysis);
                    store.setActiveAnalysisId(parsed.analysisId);
                  }
                  store.setAnalysisStreamStatus(null);
                  store.setCurrentExtraction(null);
                  break;

                case 'error':
                  store.setAnalysisStreamStatus('failed');
                  console.error('Analysis error:', parsed.message);
                  break;
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        store.setAnalysisStreamStatus(null);
        return;
      }
      store.setAnalysisStreamStatus('failed');
      throw error;
    }
  }, []);

  const cancelAnalysis = useCallback(() => {
    abortRef.current?.abort();
    const store = useLibraryStore.getState();
    store.setAnalysisStreamStatus(null);
    store.setCurrentExtraction(null);
  }, []);

  return { startAnalysis, cancelAnalysis };
}
