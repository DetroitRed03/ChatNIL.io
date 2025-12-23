/**
 * Input Validation Utilities
 *
 * Provides validation functions for API endpoints to prevent:
 * - SQL injection
 * - XSS attacks
 * - Data type mismatches
 * - Invalid input lengths
 */

// Maximum lengths for various field types
export const MAX_LENGTHS = {
  title: 200,
  description: 5000,
  notes: 2000,
  name: 100,
  email: 254,
  url: 2048,
  shortText: 500,
  mediumText: 1000,
  uuid: 36,
} as const;

// Validation result type
export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: unknown;
}

/**
 * Validates a UUID string
 */
export function validateUUID(value: unknown, fieldName: string = 'id'): ValidationResult {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    return { valid: false, error: `${fieldName} must be a valid UUID` };
  }

  return { valid: true, sanitized: value.toLowerCase() };
}

/**
 * Validates a string with length constraints
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
  } = {}
): ValidationResult {
  const { required = false, minLength = 0, maxLength = MAX_LENGTHS.mediumText, pattern, patternMessage } = options;

  if (value === undefined || value === null || value === '') {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true, sanitized: undefined };
  }

  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  // Trim whitespace
  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} must be at most ${maxLength} characters` };
  }

  if (pattern && !pattern.test(trimmed)) {
    return { valid: false, error: patternMessage || `${fieldName} has invalid format` };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validates a number with range constraints
 */
export function validateNumber(
  value: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}
): ValidationResult {
  const { required = false, min, max, integer = false } = options;

  if (value === undefined || value === null || value === '') {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true, sanitized: undefined };
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }

  if (integer && !Number.isInteger(num)) {
    return { valid: false, error: `${fieldName} must be an integer` };
  }

  if (min !== undefined && num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { valid: true, sanitized: num };
}

/**
 * Validates an enum value
 */
export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[],
  options: { required?: boolean } = {}
): ValidationResult {
  const { required = false } = options;

  if (value === undefined || value === null || value === '') {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true, sanitized: undefined };
  }

  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  if (!allowedValues.includes(value as T)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`
    };
  }

  return { valid: true, sanitized: value };
}

/**
 * Validates a date string (ISO format)
 */
export function validateDate(
  value: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    minDate?: Date;
    maxDate?: Date;
  } = {}
): ValidationResult {
  const { required = false, minDate, maxDate } = options;

  if (value === undefined || value === null || value === '') {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true, sanitized: undefined };
  }

  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName} must be a valid date` };
  }

  if (minDate && date < minDate) {
    return { valid: false, error: `${fieldName} must be after ${minDate.toISOString()}` };
  }

  if (maxDate && date > maxDate) {
    return { valid: false, error: `${fieldName} must be before ${maxDate.toISOString()}` };
  }

  return { valid: true, sanitized: date.toISOString() };
}

/**
 * Validates an array with item validation
 */
export function validateArray<T>(
  value: unknown,
  fieldName: string,
  itemValidator: (item: unknown, index: number) => ValidationResult,
  options: {
    required?: boolean;
    minItems?: number;
    maxItems?: number;
  } = {}
): ValidationResult {
  const { required = false, minItems = 0, maxItems = 100 } = options;

  if (value === undefined || value === null) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true, sanitized: [] };
  }

  if (!Array.isArray(value)) {
    return { valid: false, error: `${fieldName} must be an array` };
  }

  if (value.length < minItems) {
    return { valid: false, error: `${fieldName} must have at least ${minItems} items` };
  }

  if (value.length > maxItems) {
    return { valid: false, error: `${fieldName} must have at most ${maxItems} items` };
  }

  const sanitizedItems: T[] = [];
  for (let i = 0; i < value.length; i++) {
    const itemResult = itemValidator(value[i], i);
    if (!itemResult.valid) {
      return { valid: false, error: `${fieldName}[${i}]: ${itemResult.error}` };
    }
    sanitizedItems.push(itemResult.sanitized as T);
  }

  return { valid: true, sanitized: sanitizedItems };
}

/**
 * Validates compensation amount (positive decimal with 2 decimal places)
 */
export function validateCompensation(
  value: unknown,
  fieldName: string = 'compensation_amount',
  options: { required?: boolean; max?: number } = {}
): ValidationResult {
  const { required = false, max = 100000000 } = options; // Max $100 million

  if (value === undefined || value === null || value === '') {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true, sanitized: undefined };
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }

  if (num < 0) {
    return { valid: false, error: `${fieldName} must be positive` };
  }

  if (num > max) {
    return { valid: false, error: `${fieldName} exceeds maximum allowed value` };
  }

  // Round to 2 decimal places
  const sanitized = Math.round(num * 100) / 100;

  return { valid: true, sanitized };
}

/**
 * Sanitizes HTML/script content from strings to prevent XSS
 */
export function sanitizeHtml(value: string): string {
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates and sanitizes a URL
 */
export function validateUrl(
  value: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    allowedProtocols?: string[];
  } = {}
): ValidationResult {
  const { required = false, allowedProtocols = ['http:', 'https:'] } = options;

  if (value === undefined || value === null || value === '') {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true, sanitized: undefined };
  }

  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  if (value.length > MAX_LENGTHS.url) {
    return { valid: false, error: `${fieldName} is too long` };
  }

  try {
    const url = new URL(value);
    if (!allowedProtocols.includes(url.protocol)) {
      return { valid: false, error: `${fieldName} must use ${allowedProtocols.join(' or ')}` };
    }
    return { valid: true, sanitized: url.toString() };
  } catch {
    return { valid: false, error: `${fieldName} must be a valid URL` };
  }
}

/**
 * Batch validate multiple fields and collect all errors
 */
export function validateAll(
  validations: Array<{ result: ValidationResult; field: string }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const { result, field } of validations) {
    if (!result.valid && result.error) {
      errors.push(result.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Deal type enum values
export const DEAL_TYPES = [
  'sponsorship',
  'endorsement',
  'appearance',
  'content_creation',
  'social_media',
  'merchandise',
  'licensing',
  'event',
  'other'
] as const;

export type DealType = typeof DEAL_TYPES[number];

// Deal status enum values
export const DEAL_STATUSES = [
  'draft',
  'pending',
  'active',
  'completed',
  'cancelled',
  'expired',
  'on_hold'
] as const;

export type DealStatus = typeof DEAL_STATUSES[number];

// Match status enum values
export const MATCH_STATUSES = [
  'suggested',
  'saved',
  'contacted',
  'interested',
  'in_discussion',
  'partnered',
  'rejected',
  'expired'
] as const;

export type MatchStatus = typeof MATCH_STATUSES[number];

// Response status enum values
export const RESPONSE_STATUSES = [
  'interested',
  'declined',
  'not_interested',
  'more_info_needed'
] as const;

export type ResponseStatus = typeof RESPONSE_STATUSES[number];
