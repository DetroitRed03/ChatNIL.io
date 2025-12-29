/**
 * Assessment Questions Data and Utilities
 *
 * Functions for loading and working with assessment questions.
 */

import { supabaseAdmin } from '../supabase';
import type {
  AssessmentQuestion,
  AssessmentQuestionRow,
  CoreTrait,
  CoreTraitRow,
  TraitArchetype,
  TraitArchetypeRow,
  mapAssessmentQuestionRow,
  mapCoreTraitRow,
  mapTraitArchetypeRow,
} from './types';

// ============================================================
// Data Loading Functions
// ============================================================

/**
 * Load all active assessment questions from the database
 */
export async function loadQuestions(): Promise<AssessmentQuestion[]> {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available');
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('assessment_questions')
      .select('*')
      .eq('is_active', true)
      .order('question_order', { ascending: true });

    if (error) {
      console.error('Error loading assessment questions:', error);
      return [];
    }

    return (data || []).map((row: AssessmentQuestionRow) => ({
      id: row.id,
      questionText: row.question_text,
      questionType: row.question_type as 'scale' | 'choice' | 'ranking',
      options: row.options,
      traitWeights: row.trait_weights,
      questionOrder: row.question_order,
      section: row.section || undefined,
      isRequired: row.is_required,
      helpText: row.help_text || undefined,
      isActive: row.is_active,
    }));
  } catch (error) {
    console.error('Error loading questions:', error);
    return [];
  }
}

/**
 * Load all core traits from the database
 */
export async function loadTraits(): Promise<CoreTrait[]> {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available');
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('core_traits')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error loading core traits:', error);
      return [];
    }

    return (data || []).map((row: CoreTraitRow) => ({
      id: row.id,
      traitCode: row.trait_code as CoreTrait['traitCode'],
      traitName: row.trait_name,
      traitDescription: row.trait_description,
      category: row.category as CoreTrait['category'],
      iconName: row.icon_name || 'Circle',
      colorHex: row.color_hex || '#6B7280',
      displayOrder: row.display_order,
    }));
  } catch (error) {
    console.error('Error loading traits:', error);
    return [];
  }
}

/**
 * Load all trait archetypes from the database
 */
export async function loadArchetypes(): Promise<TraitArchetype[]> {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available');
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin.from('trait_archetypes').select('*');

    if (error) {
      console.error('Error loading trait archetypes:', error);
      return [];
    }

    return (data || []).map((row: TraitArchetypeRow) => ({
      id: row.id,
      code: row.archetype_code,
      name: row.archetype_name,
      description: row.archetype_description,
      definingTraits: row.defining_traits,
      exampleAthletes: row.example_athletes || [],
      aiPersonalityHint: row.ai_personality_hint || '',
      iconName: row.icon_name || 'Circle',
      colorHex: row.color_hex || '#6B7280',
    }));
  } catch (error) {
    console.error('Error loading archetypes:', error);
    return [];
  }
}

// ============================================================
// Question Utilities
// ============================================================

/**
 * Get questions grouped by section
 */
export function getQuestionsBySection(
  questions: AssessmentQuestion[]
): Map<string, AssessmentQuestion[]> {
  const sections = new Map<string, AssessmentQuestion[]>();

  for (const question of questions) {
    const section = question.section || 'General';
    if (!sections.has(section)) {
      sections.set(section, []);
    }
    sections.get(section)!.push(question);
  }

  return sections;
}

/**
 * Get all unique sections in order of first appearance
 */
export function getSectionOrder(questions: AssessmentQuestion[]): string[] {
  const sections: string[] = [];
  const seen = new Set<string>();

  for (const question of questions) {
    const section = question.section || 'General';
    if (!seen.has(section)) {
      seen.add(section);
      sections.push(section);
    }
  }

  return sections;
}

/**
 * Get the section for a specific question index
 */
export function getSectionForQuestion(
  questions: AssessmentQuestion[],
  index: number
): string | undefined {
  if (index < 0 || index >= questions.length) return undefined;
  return questions[index].section;
}

/**
 * Get progress within the current section
 */
export function getSectionProgress(
  questions: AssessmentQuestion[],
  currentIndex: number
): { current: number; total: number; section: string } | null {
  if (currentIndex < 0 || currentIndex >= questions.length) return null;

  const currentSection = questions[currentIndex].section || 'General';
  const sectionQuestions = questions.filter((q) => (q.section || 'General') === currentSection);
  const currentInSection =
    sectionQuestions.findIndex((q) => q.id === questions[currentIndex].id) + 1;

  return {
    current: currentInSection,
    total: sectionQuestions.length,
    section: currentSection,
  };
}

/**
 * Check if a question is a choice type with weighted options
 */
export function hasWeightedOptions(question: AssessmentQuestion): boolean {
  if (question.questionType !== 'choice') return false;
  if (!question.options || question.options.length === 0) return false;
  return 'weights' in question.options[0];
}

/**
 * Get the display text for a response value
 */
export function getResponseDisplayText(
  question: AssessmentQuestion,
  responseValue: { value: number | string | string[] }
): string {
  const { value } = responseValue;

  switch (question.questionType) {
    case 'scale':
      const scaleValue = value as number;
      const scaleLabels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
      return scaleLabels[scaleValue - 1] || `${scaleValue}/5`;

    case 'choice':
      const choiceValue = value as string;
      const option = question.options?.find((opt) => opt.value === choiceValue);
      return option?.label || choiceValue;

    case 'ranking':
      const rankingValue = value as string[];
      return rankingValue
        .map((v, i) => {
          const opt = question.options?.find((o) => o.value === v);
          return `${i + 1}. ${opt?.label || v}`;
        })
        .join(', ');

    default:
      return String(value);
  }
}

// ============================================================
// Validation
// ============================================================

/**
 * Validate a response value for a given question
 */
export function validateResponse(
  question: AssessmentQuestion,
  responseValue: { value: number | string | string[] }
): { valid: boolean; error?: string } {
  const { value } = responseValue;

  switch (question.questionType) {
    case 'scale':
      if (typeof value !== 'number') {
        return { valid: false, error: 'Scale response must be a number' };
      }
      if (value < 1 || value > 5) {
        return { valid: false, error: 'Scale response must be between 1 and 5' };
      }
      return { valid: true };

    case 'choice':
      if (typeof value !== 'string') {
        return { valid: false, error: 'Choice response must be a string' };
      }
      const validChoices = question.options?.map((o) => o.value) || [];
      if (!validChoices.includes(value)) {
        return { valid: false, error: 'Invalid choice selected' };
      }
      return { valid: true };

    case 'ranking':
      if (!Array.isArray(value)) {
        return { valid: false, error: 'Ranking response must be an array' };
      }
      const validRankings = question.options?.map((o) => o.value) || [];
      if (value.length !== validRankings.length) {
        return { valid: false, error: 'All items must be ranked' };
      }
      const allValid = value.every((v) => validRankings.includes(v));
      if (!allValid) {
        return { valid: false, error: 'Invalid ranking items' };
      }
      const uniqueValues = new Set(value);
      if (uniqueValues.size !== value.length) {
        return { valid: false, error: 'Duplicate rankings not allowed' };
      }
      return { valid: true };

    default:
      return { valid: false, error: 'Unknown question type' };
  }
}

// ============================================================
// Trait Utilities
// ============================================================

/**
 * Get a trait by its code
 */
export function getTraitByCode(traits: CoreTrait[], code: string): CoreTrait | undefined {
  return traits.find((t) => t.traitCode === code);
}

/**
 * Get traits grouped by category
 */
export function getTraitsByCategory(traits: CoreTrait[]): Map<string, CoreTrait[]> {
  const categories = new Map<string, CoreTrait[]>();

  for (const trait of traits) {
    if (!categories.has(trait.category)) {
      categories.set(trait.category, []);
    }
    categories.get(trait.category)!.push(trait);
  }

  return categories;
}

/**
 * Get the display name for a trait code
 */
export function getTraitDisplayName(traits: CoreTrait[], code: string): string {
  const trait = getTraitByCode(traits, code);
  return trait?.traitName || code.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Get the icon name for a trait
 */
export function getTraitIcon(traits: CoreTrait[], code: string): string {
  const trait = getTraitByCode(traits, code);
  return trait?.iconName || 'Circle';
}

/**
 * Get the color for a trait
 */
export function getTraitColor(traits: CoreTrait[], code: string): string {
  const trait = getTraitByCode(traits, code);
  return trait?.colorHex || '#6B7280';
}
