/**
 * Type definitions for MockMaster Resume Upload & Parsing
 * Feature: F-002
 */

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  location?: string;
}

export interface ExperienceItem {
  company: string;
  title: string;
  dates: string;
  bullets: string[];
}

export interface EducationItem {
  school: string;
  degree: string;
  year: string;
}

export interface ParsedContent {
  contact: ContactInfo;
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
}

export interface ResumeData {
  name: string;                // Original filename
  original_text: string;        // Raw extracted text
  parsed_content: ParsedContent;
  uploaded_at: string;          // ISO 8601 timestamp
}

export type ValidationErrorCode =
  | 'INVALID_TYPE'
  | 'FILE_TOO_LARGE'
  | 'FILE_CORRUPTED'
  | 'TEXT_TOO_LONG'
  | 'INVALID_FORMAT';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: ValidationErrorCode;
}

export type ParsingErrorCode =
  | 'TEXT_TOO_LONG'
  | 'INVALID_FORMAT'
  | 'PARSING_FAILED'
  | 'CLAUDE_API_ERROR'
  | 'INTERNAL_ERROR';

export interface APIError {
  error: string;
  code: ParsingErrorCode;
}
