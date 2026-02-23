/**
 * Document Categories — defines which uploads need compliance review.
 * Deal documents (contracts, offers) trigger the 6D compliance pipeline.
 * Other documents (tax forms, receipts, IDs) are stored without review.
 */

export interface DocumentCategory {
  id: string;
  label: string;
  description: string;
  requiresComplianceReview: boolean;
}

export const DOCUMENT_CATEGORIES: Record<string, DocumentCategory> = {
  // Deal documents — REQUIRE compliance review
  contract: {
    id: 'contract',
    label: 'Contract',
    description: 'Signed agreement with a brand or company',
    requiresComplianceReview: true,
  },
  offer_letter: {
    id: 'offer_letter',
    label: 'Offer Letter',
    description: 'Written offer from a brand or company',
    requiresComplianceReview: true,
  },
  sponsorship_agreement: {
    id: 'sponsorship_agreement',
    label: 'Sponsorship Agreement',
    description: 'Sponsorship or endorsement deal',
    requiresComplianceReview: true,
  },

  // Non-deal documents — no compliance review
  tax_document: {
    id: 'tax_document',
    label: 'Tax Document',
    description: '1099, W-9, or other tax forms',
    requiresComplianceReview: false,
  },
  school_form: {
    id: 'school_form',
    label: 'School Form',
    description: 'Permission slip, registration, or school paperwork',
    requiresComplianceReview: false,
  },
  dm_screenshot: {
    id: 'dm_screenshot',
    label: 'DM / Screenshot',
    description: 'Social media message or screenshot',
    requiresComplianceReview: false,
  },
  email_correspondence: {
    id: 'email_correspondence',
    label: 'Email',
    description: 'Email communication with brands',
    requiresComplianceReview: false,
  },
  id_verification: {
    id: 'id_verification',
    label: 'ID Verification',
    description: "Driver's license, passport, or school ID",
    requiresComplianceReview: false,
  },
  receipt: {
    id: 'receipt',
    label: 'Receipt / Invoice',
    description: 'Payment receipt or invoice',
    requiresComplianceReview: false,
  },
  other: {
    id: 'other',
    label: 'Other',
    description: 'Other document type',
    requiresComplianceReview: false,
  },
};

export const DEAL_DOCUMENT_TYPES = Object.values(DOCUMENT_CATEGORIES)
  .filter(c => c.requiresComplianceReview)
  .map(c => c.id);

export const NON_DEAL_DOCUMENT_TYPES = Object.values(DOCUMENT_CATEGORIES)
  .filter(c => !c.requiresComplianceReview)
  .map(c => c.id);

export function requiresComplianceReview(documentType: string): boolean {
  const category = DOCUMENT_CATEGORIES[documentType];
  return category?.requiresComplianceReview ?? false;
}
