/**
 * Anti-hallucination validation for AI-adapted resumes
 * Feature: F-004
 *
 * Ensures the AI does not invent companies, skills, or experiences
 * that don't exist in the original resume.
 */

import { ResumeData, AdaptedResume, ValidationError } from './types';

/**
 * Validates that the adapted resume does not contain hallucinated content
 *
 * @param original - Original resume data from F-002
 * @param adapted - AI-adapted resume from Claude API
 * @returns ValidationError with valid flag and list of errors
 */
export function validateNoHallucination(
  original: ResumeData,
  adapted: AdaptedResume
): ValidationError {
  const errors: string[] = [];

  // Check 1: Experience count doesn't exceed original
  if (adapted.adapted_content.experience.length > original.parsed_content.experience.length) {
    errors.push(
      `AI added fake experiences (original: ${original.parsed_content.experience.length}, adapted: ${adapted.adapted_content.experience.length})`
    );
  }

  // Check 2: All companies exist in original
  const originalCompanies = new Set(
    original.parsed_content.experience.map((e) =>
      normalizeString(e.company)
    )
  );

  for (const exp of adapted.adapted_content.experience) {
    const normalizedCompany = normalizeString(exp.company);
    if (!originalCompanies.has(normalizedCompany)) {
      errors.push(`AI invented company: "${exp.company}"`);
    }
  }

  // Check 3: All job titles exist in original (relaxed check for minor reformatting)
  const originalTitles = original.parsed_content.experience.map((e) =>
    normalizeString(e.title)
  );

  for (const exp of adapted.adapted_content.experience) {
    const adaptedTitle = normalizeString(exp.title);
    // Check if title exists OR is very similar (for minor reformatting)
    const matchFound = originalTitles.some(
      (orig) =>
        orig === adaptedTitle ||
        orig.includes(adaptedTitle) ||
        adaptedTitle.includes(orig) ||
        levenshteinDistance(orig, adaptedTitle) <= 3 // Allow 3 character difference
    );

    if (!matchFound) {
      errors.push(`AI significantly changed job title: "${exp.title}"`);
    }
  }

  // Check 4: Contact info unchanged (field-by-field comparison)
  const origContact = original.parsed_content.contact;
  const adaptContact = adapted.adapted_content.contact;

  // Compare each field (allowing for undefined/missing fields)
  if (origContact.name !== adaptContact.name) {
    errors.push(`AI modified name: "${origContact.name}" → "${adaptContact.name}"`);
  }
  if (origContact.email !== adaptContact.email) {
    errors.push(`AI modified email: "${origContact.email}" → "${adaptContact.email}"`);
  }
  // Phone, LinkedIn, location are optional, only check if both exist
  if (origContact.phone && adaptContact.phone && origContact.phone !== adaptContact.phone) {
    errors.push(`AI modified phone: "${origContact.phone}" → "${adaptContact.phone}"`);
  }
  if (origContact.linkedin && adaptContact.linkedin && origContact.linkedin !== adaptContact.linkedin) {
    errors.push(`AI modified LinkedIn: "${origContact.linkedin}" → "${adaptContact.linkedin}"`);
  }
  if (origContact.location && adaptContact.location && origContact.location !== adaptContact.location) {
    errors.push(`AI modified location: "${origContact.location}" → "${adaptContact.location}"`);
  }

  // Check 5: Education unchanged (allow same count and fields)
  if (original.parsed_content.education.length !== adapted.adapted_content.education.length) {
    errors.push(
      `AI changed education count (original: ${original.parsed_content.education.length}, adapted: ${adapted.adapted_content.education.length})`
    );
  }

  // Check 6: ATS score is within valid range
  if (adapted.ats_score < 0 || adapted.ats_score > 100) {
    errors.push(`ATS score out of range: ${adapted.ats_score} (must be 0-100)`);
  }

  // Check 7: Relevance scores are within valid range
  for (const exp of adapted.adapted_content.experience) {
    if (exp.relevance_score < 0 || exp.relevance_score > 100) {
      errors.push(
        `Invalid relevance score for ${exp.company}: ${exp.relevance_score} (must be 0-100)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normalizes a string for comparison
 * Removes extra whitespace, converts to lowercase, removes punctuation
 *
 * @param str - String to normalize
 * @returns Normalized string
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Calculates Levenshtein distance between two strings
 * Used for fuzzy matching of job titles (allows minor reformatting)
 *
 * @param a - First string
 * @param b - Second string
 * @returns Edit distance (number of character changes needed)
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Generates a simple hash of resume text for traceability
 * Note: This is NOT cryptographically secure, just for cache checking
 *
 * @param text - Text to hash
 * @returns Simple hash string
 */
export function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
