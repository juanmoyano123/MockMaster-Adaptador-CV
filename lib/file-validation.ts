/**
 * File validation utilities for resume uploads
 * Feature: F-002
 */

import { ValidationResult } from '@/lib/types';

// Allowed MIME types for resume uploads
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc (legacy)
];

// File size limits
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_LENGTH = 50 * 1024; // 50KB characters

/**
 * Validates an uploaded file for type and size constraints
 */
export function validateFile(file: File): ValidationResult {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload PDF or DOCX.',
      errorCode: 'INVALID_TYPE',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB.`,
      errorCode: 'FILE_TOO_LARGE',
    };
  }

  return { valid: true };
}

/**
 * Validates extracted text length to prevent excessive API calls
 */
export function validateTextLength(text: string): ValidationResult {
  if (text.length > MAX_TEXT_LENGTH) {
    const maxSizeKB = MAX_TEXT_LENGTH / 1024;
    return {
      valid: false,
      error: `Resume text is too long. Maximum is ${maxSizeKB}KB. Please shorten your resume or paste text instead.`,
      errorCode: 'TEXT_TOO_LONG',
    };
  }

  if (text.trim().length === 0) {
    return {
      valid: false,
      error: 'Resume text is empty. Please check your file or paste text manually.',
      errorCode: 'INVALID_FORMAT',
    };
  }

  return { valid: true };
}

/**
 * Checks if a file extension is supported
 */
export function isSupportedExtension(filename: string): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  return ext === 'pdf' || ext === 'docx' || ext === 'doc';
}

/**
 * Gets a user-friendly file type name
 */
export function getFileTypeName(file: File): string {
  if (file.type === 'application/pdf') return 'PDF';
  if (file.type.includes('wordprocessingml')) return 'Word Document';
  if (file.type === 'application/msword') return 'Word Document (Legacy)';
  return 'Unknown';
}
