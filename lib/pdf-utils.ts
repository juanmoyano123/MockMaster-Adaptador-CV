/**
 * PDF Utilities for Template Rendering
 * Feature: F-006
 */

import { TemplateType } from './types';

/**
 * Generate PDF filename based on company name and date
 */
export function generatePDFFilename(companyName: string): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const sanitizedCompany = companyName
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 50); // Limit length

  return `Resume_${sanitizedCompany}_${date}.pdf`;
}

/**
 * Validate PDF generation request
 */
export function validatePDFRequest(data: unknown): {
  valid: boolean;
  error?: string;
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request data' };
  }

  const request = data as Record<string, unknown>;

  if (!request.adapted_content) {
    return { valid: false, error: 'Missing adapted_content' };
  }

  if (!request.template) {
    return { valid: false, error: 'Missing template' };
  }

  if (!request.company_name) {
    return { valid: false, error: 'Missing company_name' };
  }

  const validTemplates: TemplateType[] = ['clean', 'modern', 'compact'];
  if (!validTemplates.includes(request.template as TemplateType)) {
    return {
      valid: false,
      error: `Invalid template. Must be one of: ${validTemplates.join(', ')}`,
    };
  }

  return { valid: true };
}
