/**
 * Deal Document Analyzer — GPT-4o Vision + Text
 *
 * Accepts an image buffer (screenshot of a DM, email, contract)
 * and extracts structured deal information using GPT-4o vision.
 * Also supports PDFs and Word documents via text extraction + GPT-4o text analysis.
 * Falls back to Tesseract OCR + regex if GPT-4o fails for images.
 */

import OpenAI from 'openai';
import type { DealExtraction } from '@/lib/types/deal-analysis';
import { detectRedFlags, extractKeyTerms, extractParties } from '@/lib/ai/contract-analysis';

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const DEAL_EXTRACTION_PROMPT = `You are an expert NIL (Name, Image, Likeness) deal analyst. You are analyzing a screenshot of a potential NIL deal offer. This could be a DM on Instagram/Twitter, an email, a text message, or a contract document.

Extract deal information and respond with ONLY valid JSON (no markdown fences):
{
  "brand": "Company or individual name offering the deal (string)",
  "brandType": "brand|agency|local_business|individual|unknown",
  "compensation": null or number in USD (e.g., 500),
  "compensationDescription": "Full compensation description (e.g., '$500 + free products')",
  "dealType": "social_post|appearance|endorsement|brand_ambassador|merchandise|other",
  "deliverables": "What the athlete would need to do",
  "timeline": "When the deal would happen or duration",
  "startDate": "YYYY-MM-DD or null if not specified",
  "endDate": "YYYY-MM-DD or null if not specified",
  "exclusivity": true or false,
  "redFlags": ["Array of concerning elements found"],
  "rawText": "ALL readable text from the image, transcribed verbatim",
  "confidence": 0.0 to 1.0 (how confident you are this is a deal offer),
  "summary": "One-sentence summary of the deal"
}

Red flags to identify:
- Perpetual or unlimited rights grants
- Exclusive clauses without time limits
- No compensation specified for significant work
- Pressure tactics ("limited time", "act now")
- Vague or unclear deliverables
- Requesting personal/financial info upfront
- Performance-based pay (per win, per touchdown)
- Booster or collective language
- Non-compete clauses
- Assignment of all IP rights

If this does NOT appear to be a deal offer, still extract the text and set confidence below 0.3.`;

const DEAL_TEXT_EXTRACTION_PROMPT = `You are an expert NIL (Name, Image, Likeness) deal analyst. You are analyzing the text content of a document (PDF, Word doc, or other) that may contain a potential NIL deal offer. This could be a contract, email, offer letter, or agreement.

Extract deal information and respond with ONLY valid JSON (no markdown fences):
{
  "brand": "Company or individual name offering the deal (string)",
  "brandType": "brand|agency|local_business|individual|unknown",
  "compensation": null or number in USD (e.g., 500),
  "compensationDescription": "Full compensation description (e.g., '$500 + free products')",
  "dealType": "social_post|appearance|endorsement|brand_ambassador|merchandise|other",
  "deliverables": "What the athlete would need to do",
  "timeline": "When the deal would happen or duration",
  "startDate": "YYYY-MM-DD or null if not specified",
  "endDate": "YYYY-MM-DD or null if not specified",
  "exclusivity": true or false,
  "redFlags": ["Array of concerning elements found"],
  "rawText": "Key excerpts from the document (first 500 chars)",
  "confidence": 0.0 to 1.0 (how confident you are this is a deal offer),
  "summary": "One-sentence summary of the deal"
}

Red flags to identify:
- Perpetual or unlimited rights grants
- Exclusive clauses without time limits
- No compensation specified for significant work
- Pressure tactics ("limited time", "act now")
- Vague or unclear deliverables
- Requesting personal/financial info upfront
- Performance-based pay (per win, per touchdown)
- Booster or collective language
- Non-compete clauses
- Assignment of all IP rights

If this does NOT appear to be a deal offer, still analyze the text and set confidence below 0.3.`;

/**
 * Analyze a screenshot using GPT-4o vision
 */
export async function analyzeScreenshot(
  imageBuffer: Buffer,
  mimeType: string
): Promise<DealExtraction> {
  try {
    return await analyzeWithGPT4o(imageBuffer, mimeType);
  } catch (error) {
    console.warn('GPT-4o vision failed, falling back to OCR:', error);
    return await fallbackToOCR(imageBuffer);
  }
}

async function analyzeWithGPT4o(
  imageBuffer: Buffer,
  mimeType: string
): Promise<DealExtraction> {
  const openai = getOpenAI();
  const base64 = imageBuffer.toString('base64');
  const mediaType = mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 2000,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mediaType};base64,${base64}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: DEAL_EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from GPT-4o');
  }

  const parsed = JSON.parse(content);

  // Build the extraction result
  const extraction: DealExtraction = {
    brand: parsed.brand || 'Unknown',
    brandType: parsed.brandType || 'unknown',
    compensation: typeof parsed.compensation === 'number' ? parsed.compensation : null,
    compensationDescription: parsed.compensationDescription || '',
    dealType: parsed.dealType || 'other',
    deliverables: parsed.deliverables || '',
    timeline: parsed.timeline || '',
    startDate: parsed.startDate || undefined,
    endDate: parsed.endDate || undefined,
    exclusivity: parsed.exclusivity === true,
    redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
    rawText: parsed.rawText || '',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    summary: parsed.summary || '',
  };

  // Post-process: merge local regex-based red flags from rawText
  if (extraction.rawText.length > 20) {
    const localRedFlags = detectRedFlags(extraction.rawText);
    const localFlagTexts = localRedFlags
      .filter(f => f.severity === 'critical' || f.severity === 'warning')
      .map(f => f.issue);

    // Deduplicate
    for (const flag of localFlagTexts) {
      const alreadyPresent = extraction.redFlags.some(
        existing => existing.toLowerCase().includes(flag.toLowerCase()) ||
                    flag.toLowerCase().includes(existing.toLowerCase())
      );
      if (!alreadyPresent) {
        extraction.redFlags.push(flag);
      }
    }
  }

  return extraction;
}

/**
 * Analyze a document (PDF, Word, text) by extracting text first, then sending to GPT-4o.
 */
export async function analyzeDocumentText(
  documentText: string
): Promise<DealExtraction> {
  try {
    const openai = getOpenAI();

    // Truncate very long docs to stay within token limits
    const truncatedText = documentText.length > 15000
      ? documentText.slice(0, 15000) + '\n\n[...document truncated...]'
      : documentText;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2000,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${DEAL_TEXT_EXTRACTION_PROMPT}\n\n--- DOCUMENT TEXT ---\n${truncatedText}`,
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from GPT-4o');
    }

    const parsed = JSON.parse(content);

    const extraction: DealExtraction = {
      brand: parsed.brand || 'Unknown',
      brandType: parsed.brandType || 'unknown',
      compensation: typeof parsed.compensation === 'number' ? parsed.compensation : null,
      compensationDescription: parsed.compensationDescription || '',
      dealType: parsed.dealType || 'other',
      deliverables: parsed.deliverables || '',
      timeline: parsed.timeline || '',
      startDate: parsed.startDate || undefined,
      endDate: parsed.endDate || undefined,
      exclusivity: parsed.exclusivity === true,
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
      rawText: parsed.rawText || documentText.slice(0, 500),
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      summary: parsed.summary || '',
    };

    // Post-process: merge local regex-based red flags
    if (documentText.length > 20) {
      const localRedFlags = detectRedFlags(documentText);
      const localFlagTexts = localRedFlags
        .filter(f => f.severity === 'critical' || f.severity === 'warning')
        .map(f => f.issue);

      for (const flag of localFlagTexts) {
        const alreadyPresent = extraction.redFlags.some(
          existing => existing.toLowerCase().includes(flag.toLowerCase()) ||
                      flag.toLowerCase().includes(existing.toLowerCase())
        );
        if (!alreadyPresent) {
          extraction.redFlags.push(flag);
        }
      }
    }

    return extraction;
  } catch (error) {
    console.warn('GPT-4o text analysis failed, falling back to regex:', error);
    return fallbackToRegex(documentText);
  }
}

/**
 * Fallback: Use regex to extract deal info from text
 */
function fallbackToRegex(rawText: string): DealExtraction {
  const redFlags = rawText ? detectRedFlags(rawText) : [];
  const keyTerms = rawText ? extractKeyTerms(rawText) : [];
  const parties = rawText ? extractParties(rawText) : [];

  const compTerm = keyTerms.find(t => t.term === 'Compensation Amount');
  const compMatch = compTerm?.value?.match(/\$?([\d,]+)/);
  const compensation = compMatch ? parseInt(compMatch[1].replace(/,/g, ''), 10) : null;

  return {
    brand: parties[0] || 'Unknown',
    brandType: 'unknown',
    compensation,
    compensationDescription: compTerm?.value || '',
    dealType: 'other',
    deliverables: keyTerms.find(t => t.term === 'Deliverables')?.value || '',
    timeline: keyTerms.find(t => t.term === 'Contract Duration')?.value || '',
    startDate: undefined,
    endDate: undefined,
    exclusivity: redFlags.some(f => f.issue.toLowerCase().includes('exclusive')),
    redFlags: redFlags
      .filter(f => f.severity === 'critical' || f.severity === 'warning')
      .map(f => f.issue),
    rawText: rawText.slice(0, 500),
    confidence: 0.4,
    summary: `Regex-extracted from document (${rawText.length} chars)`,
  };
}

/**
 * Fallback: Use Tesseract OCR + regex to extract deal info
 */
async function fallbackToOCR(imageBuffer: Buffer): Promise<DealExtraction> {
  let rawText = '';

  try {
    const { extractText } = await import('@/lib/documents/extractor');
    const result = await extractText(imageBuffer, 'image/png');
    if (result.success && result.document) {
      rawText = result.document.fullText || '';
    }
  } catch (e) {
    console.warn('Tesseract OCR also failed:', e);
  }

  // Try regex-based extraction on whatever text we got
  const redFlags = rawText ? detectRedFlags(rawText) : [];
  const keyTerms = rawText ? extractKeyTerms(rawText) : [];
  const parties = rawText ? extractParties(rawText) : [];

  // Extract compensation from key terms
  const compTerm = keyTerms.find(t => t.term === 'Compensation Amount');
  const compMatch = compTerm?.value?.match(/\$?([\d,]+)/);
  const compensation = compMatch ? parseInt(compMatch[1].replace(/,/g, ''), 10) : null;

  return {
    brand: parties[0] || 'Unknown',
    brandType: 'unknown',
    compensation,
    compensationDescription: compTerm?.value || '',
    dealType: 'other',
    deliverables: keyTerms.find(t => t.term === 'Deliverables')?.value || '',
    timeline: keyTerms.find(t => t.term === 'Contract Duration')?.value || '',
    startDate: undefined,
    endDate: undefined,
    exclusivity: redFlags.some(f => f.issue.toLowerCase().includes('exclusive')),
    redFlags: redFlags
      .filter(f => f.severity === 'critical' || f.severity === 'warning')
      .map(f => f.issue),
    rawText,
    confidence: 0.3, // Low confidence for OCR fallback
    summary: rawText ? `OCR-extracted text from screenshot (${rawText.length} chars)` : 'Could not extract text from image',
  };
}
