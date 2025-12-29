/**
 * Contract Analysis Module
 *
 * Detects contract-related documents and identifies red flags,
 * key terms, and provides NIL-specific guidance.
 */

import type {
  ContractAnalysis,
  ContractTerm,
  RedFlag,
  DocumentType
} from '../documents/types';

// ============================================
// Contract Detection
// ============================================

/**
 * Patterns that indicate a document is a contract
 */
const CONTRACT_INDICATORS = [
  /agreement\s+(between|by\s+and\s+between)/i,
  /name,?\s*image,?\s*(and\s*)?likeness/i,
  /nil\s+(agreement|contract|deal)/i,
  /endorsement\s+agreement/i,
  /sponsorship\s+agreement/i,
  /hereby\s+agrees?/i,
  /terms\s+and\s+conditions/i,
  /compensation|payment|consideration/i,
  /exclusivity|exclusive\s+rights/i,
  /termination|terminate/i,
  /representations?\s+and\s+warranties/i,
  /indemnif(y|ication)/i,
  /governing\s+law/i,
  /force\s+majeure/i,
  /intellectual\s+property/i,
  /confidentiality|non-?disclosure/i,
];

/**
 * Detect if text is likely a contract
 */
export function isLikelyContract(text: string): { isContract: boolean; confidence: number } {
  const matches = CONTRACT_INDICATORS.filter(pattern => pattern.test(text));
  const confidence = Math.min(matches.length / 5, 1); // 5+ matches = 100% confidence

  return {
    isContract: matches.length >= 3,
    confidence,
  };
}

/**
 * Detect document type from text content
 */
export function detectDocumentType(text: string): DocumentType {
  const lowerText = text.toLowerCase();

  // Check for specific document types
  if (/amendment\s+(to|of)/i.test(text) || /first\s+amendment/i.test(text)) {
    return 'amendment';
  }

  if (/endorsement\s+agreement/i.test(text) || /brand\s+ambassador/i.test(text)) {
    return 'endorsement';
  }

  if (/letter\s+of\s+intent/i.test(text) || /offer\s+letter/i.test(text)) {
    return 'letter';
  }

  const contractCheck = isLikelyContract(text);
  if (contractCheck.isContract) {
    // More specific contract type detection
    if (/nil\s+(agreement|deal|contract)/i.test(text)) {
      return 'contract';
    }
    if (/general\s+agreement/i.test(text) || /master\s+agreement/i.test(text)) {
      return 'agreement';
    }
    return 'contract';
  }

  return 'other';
}

// ============================================
// Red Flag Detection
// ============================================

interface RedFlagPattern {
  pattern: RegExp;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  recommendation: string;
}

const RED_FLAG_PATTERNS: RedFlagPattern[] = [
  // Critical Red Flags
  {
    pattern: /perpetual|in\s+perpetuity|forever|indefinitely/i,
    issue: 'Perpetual rights clause detected',
    severity: 'critical',
    recommendation: 'Negotiate for time-limited rights (1-3 years maximum). Perpetual rights mean you can never regain control of your NIL.',
  },
  {
    pattern: /exclusive\s+(rights?|license|agreement)/i,
    issue: 'Exclusive rights or license',
    severity: 'critical',
    recommendation: 'Understand what exclusivity means - it may prevent other NIL opportunities. Consider limiting exclusivity to specific categories or time periods.',
  },
  {
    pattern: /non-?compete|non-?competition/i,
    issue: 'Non-compete clause found',
    severity: 'critical',
    recommendation: 'Non-competes can severely limit your NIL opportunities. Negotiate narrow scope (same industry only) and short duration.',
  },
  {
    pattern: /assignment\s+of\s+(all\s+)?rights/i,
    issue: 'Full assignment of rights',
    severity: 'critical',
    recommendation: 'Avoid assigning all rights - prefer licensing. Assignment transfers ownership permanently.',
  },
  {
    pattern: /no\s+(additional\s+)?compensation|without\s+(additional\s+)?payment/i,
    issue: 'Work without additional compensation',
    severity: 'critical',
    recommendation: 'Ensure you are fairly compensated for all uses. Avoid unlimited use for a flat fee.',
  },

  // Warning Level
  {
    pattern: /automatic(ally)?\s+renew/i,
    issue: 'Automatic renewal clause',
    severity: 'warning',
    recommendation: 'Be aware of auto-renewal terms and cancellation windows. Mark your calendar to review before renewal.',
  },
  {
    pattern: /terminate\s+(for\s+)?any\s+reason|termination\s+at\s+will/i,
    issue: 'One-sided termination rights',
    severity: 'warning',
    recommendation: 'Ensure termination rights are mutual. You should be able to exit if the brand can.',
  },
  {
    pattern: /moral(ity)?\s+clause/i,
    issue: 'Morality clause present',
    severity: 'warning',
    recommendation: 'Review morality clause carefully - it could allow termination for minor issues. Negotiate clear, objective standards.',
  },
  {
    pattern: /indemnif(y|ication)\s+and\s+hold\s+harmless/i,
    issue: 'Indemnification clause',
    severity: 'warning',
    recommendation: 'Understand what you are agreeing to cover. Limit indemnification to your own actions, not the company\'s negligence.',
  },
  {
    pattern: /liquidated\s+damages/i,
    issue: 'Liquidated damages clause',
    severity: 'warning',
    recommendation: 'Check the penalty amounts - they should be reasonable. Excessive damages can be challenged.',
  },
  {
    pattern: /governing\s+law.{1,50}(delaware|nevada|wyoming)/i,
    issue: 'Out-of-state governing law',
    severity: 'warning',
    recommendation: 'Consider negotiating for your home state\'s laws or a neutral jurisdiction.',
  },

  // Informational
  {
    pattern: /confidential(ity)?|non-?disclosure/i,
    issue: 'Confidentiality/NDA provisions',
    severity: 'info',
    recommendation: 'Understand what you cannot discuss. This may limit talking about the deal publicly.',
  },
  {
    pattern: /arbitration/i,
    issue: 'Arbitration clause',
    severity: 'info',
    recommendation: 'Arbitration replaces court litigation. It\'s often faster but may favor the company. Consider if you prefer court option.',
  },
  {
    pattern: /right\s+of\s+first\s+refusal/i,
    issue: 'Right of first refusal',
    severity: 'info',
    recommendation: 'Company gets to match competing offers before you can accept them. This can slow down other deals.',
  },
];

/**
 * Scan text for contract red flags
 */
export function detectRedFlags(text: string): RedFlag[] {
  const redFlags: RedFlag[] = [];
  const textLower = text.toLowerCase();

  for (const pattern of RED_FLAG_PATTERNS) {
    const match = pattern.pattern.exec(text);
    if (match) {
      // Extract context around the match
      const start = Math.max(0, match.index - 50);
      const end = Math.min(text.length, match.index + match[0].length + 100);
      const excerpt = text.slice(start, end).trim();

      redFlags.push({
        issue: pattern.issue,
        severity: pattern.severity,
        excerpt: `...${excerpt}...`,
        recommendation: pattern.recommendation,
      });
    }
  }

  return redFlags;
}

// ============================================
// Key Terms Extraction
// ============================================

interface TermPattern {
  pattern: RegExp;
  term: string;
  importance: 'high' | 'medium' | 'low';
}

const KEY_TERM_PATTERNS: TermPattern[] = [
  // High importance
  { pattern: /compensation\s*[:=]?\s*\$?[\d,]+/i, term: 'Compensation Amount', importance: 'high' },
  { pattern: /term\s*[:=]?\s*(\d+)\s*(year|month|day)/i, term: 'Contract Duration', importance: 'high' },
  { pattern: /effective\s+date\s*[:=]?\s*([a-z]+\s+\d+,?\s*\d*)/i, term: 'Effective Date', importance: 'high' },
  { pattern: /termination\s+date|expires?\s*[:=]?\s*([a-z]+\s+\d+,?\s*\d*)/i, term: 'End Date', importance: 'high' },

  // Medium importance
  { pattern: /deliverables?\s*[:=]?\s*(.{10,100})/i, term: 'Deliverables', importance: 'medium' },
  { pattern: /social\s+media\s+posts?\s*[:=]?\s*(\d+)/i, term: 'Social Media Posts Required', importance: 'medium' },
  { pattern: /appearances?\s*[:=]?\s*(\d+)/i, term: 'Appearance Requirements', importance: 'medium' },
  { pattern: /renewal\s+term\s*[:=]?\s*(\d+\s*(?:year|month))/i, term: 'Renewal Term', importance: 'medium' },

  // Lower importance but useful
  { pattern: /notice\s+period\s*[:=]?\s*(\d+\s*days?)/i, term: 'Notice Period', importance: 'low' },
  { pattern: /payment\s+schedule|paid\s+(monthly|quarterly|annually)/i, term: 'Payment Schedule', importance: 'low' },
];

/**
 * Extract key terms from contract text
 */
export function extractKeyTerms(text: string): ContractTerm[] {
  const terms: ContractTerm[] = [];

  for (const pattern of KEY_TERM_PATTERNS) {
    const match = pattern.pattern.exec(text);
    if (match) {
      terms.push({
        term: pattern.term,
        value: match[1] || match[0],
        importance: pattern.importance,
      });
    }
  }

  return terms;
}

// ============================================
// Party Detection
// ============================================

/**
 * Extract parties mentioned in a contract
 */
export function extractParties(text: string): string[] {
  const parties: string[] = [];

  // Common patterns for party names
  const patterns = [
    /agreement\s+between\s+([A-Z][^,]+),?\s+(?:a|an)/i,
    /("([^"]+)"\s*,?\s*(?:hereinafter|the\s+"(?:company|sponsor|brand)"))/gi,
    /between\s+([A-Z][A-Za-z\s.,]+(?:Inc|LLC|Corp|Company|University))/i,
  ];

  for (const pattern of patterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      const party = (match[2] || match[1]).trim();
      if (party && party.length > 2 && !parties.includes(party)) {
        parties.push(party);
      }
    }
  }

  return parties.slice(0, 4); // Limit to 4 parties
}

// ============================================
// Full Contract Analysis
// ============================================

/**
 * Perform comprehensive contract analysis
 */
export function analyzeContract(text: string): ContractAnalysis {
  const contractCheck = isLikelyContract(text);

  if (!contractCheck.isContract) {
    return {
      isContract: false,
      confidence: contractCheck.confidence,
    };
  }

  const contractType = detectDocumentType(text);
  const parties = extractParties(text);
  const keyTerms = extractKeyTerms(text);
  const redFlags = detectRedFlags(text);

  // Generate summary based on findings
  const summary = generateContractSummary(parties, keyTerms, redFlags);

  return {
    isContract: true,
    confidence: contractCheck.confidence,
    contractType: contractType === 'other' ? undefined : contractType,
    parties,
    keyTerms,
    redFlags,
    summary,
  };
}

function generateContractSummary(
  parties: string[],
  terms: ContractTerm[],
  flags: RedFlag[]
): string {
  const parts: string[] = [];

  if (parties.length > 0) {
    parts.push(`This appears to be an agreement involving ${parties.join(' and ')}.`);
  }

  const compensation = terms.find(t => t.term === 'Compensation Amount');
  const duration = terms.find(t => t.term === 'Contract Duration');

  if (compensation) {
    parts.push(`Compensation: ${compensation.value}.`);
  }

  if (duration) {
    parts.push(`Duration: ${duration.value}.`);
  }

  const criticalFlags = flags.filter(f => f.severity === 'critical');
  if (criticalFlags.length > 0) {
    parts.push(`⚠️ ${criticalFlags.length} critical issue(s) require attention.`);
  }

  return parts.join(' ');
}
