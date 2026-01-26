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

/**
 * Type definitions for Job Description Analysis
 * Feature: F-003
 */

export interface JobAnalysis {
  raw_text: string;
  text_hash: string;
  analysis: {
    job_title: string;
    company_name: string;
    required_skills: string[];
    preferred_skills: string[];
    responsibilities: string[];
    seniority_level: string;
    industry: string;
  };
  analyzed_at: string;
}

export type JobAnalysisErrorCode =
  | 'INVALID_INPUT'
  | 'TEXT_TOO_SHORT'
  | 'TEXT_TOO_LONG'
  | 'CLAUDE_API_ERROR'
  | 'JSON_PARSE_ERROR'
  | 'INTERNAL_ERROR';

export interface JobAnalysisAPIError {
  error: string;
  code: JobAnalysisErrorCode;
}
