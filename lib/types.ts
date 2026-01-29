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

/**
 * Type definitions for AI Resume Adaptation
 * Feature: F-004
 */

export interface AdaptedExperienceItem extends ExperienceItem {
  relevance_score: number; // 0-100, calculated by AI
}

export interface AdaptedContent {
  contact: ContactInfo;
  summary: string;
  experience: AdaptedExperienceItem[];
  education: EducationItem[];
  skills: string[];
}

export interface ChangesSummary {
  skills_highlighted: number;
  bullets_reformulated: number;
  experiences_reordered: boolean;
}

/**
 * Detailed breakdown of ATS score components
 * Feature: F-005
 */
export interface ATSScoreBreakdown {
  // Component scores (0-100 each)
  total_score: number;           // Weighted average of all components
  keyword_score: number;         // How many job keywords appear in resume
  skills_score: number;          // Required skills match rate
  experience_score: number;      // Relevance of experience (AI-scored)
  format_score: number;          // Always 100 (our templates are ATS-friendly)

  // Keyword details
  keywords_matched: number;      // e.g., 17
  keywords_total: number;        // e.g., 20
  missing_keywords: string[];    // Top 10 missing keywords

  // Skills details
  skills_matched: string[];      // ["Python", "AWS", "Docker"]
  skills_missing: string[];      // ["Kubernetes", "Terraform"]

  // Actionable suggestions
  suggestions: string[];         // Max 5 suggestions for improvement
}

export interface AdaptedResume {
  original_resume_hash: string;
  job_analysis_hash: string;
  adapted_content: AdaptedContent;
  ats_score: number;
  ats_breakdown?: ATSScoreBreakdown;    // NEW: Detailed breakdown (optional for migration)
  changes_summary: ChangesSummary;
  adapted_at: string;
}

export type AdaptationErrorCode =
  | 'MISSING_RESUME'
  | 'MISSING_JOB_ANALYSIS'
  | 'INVALID_INPUT'
  | 'CLAUDE_API_ERROR'
  | 'JSON_PARSE_ERROR'
  | 'VALIDATION_FAILED'
  | 'INTERNAL_ERROR';

export interface AdaptationAPIError {
  error: string;
  code: AdaptationErrorCode;
}

export interface ValidationError {
  valid: boolean;
  errors: string[];
}

/**
 * Type definitions for PDF Export with Templates
 * Feature: F-006
 */

export type TemplateType = 'clean' | 'modern' | 'compact';

export interface PDFGenerationRequest {
  adapted_content: AdaptedContent;
  template: TemplateType;
  company_name: string;
}

export type PDFErrorCode =
  | 'INVALID_INPUT'
  | 'CONTENT_TOO_LONG'
  | 'PDF_GENERATION_ERROR'
  | 'TIMEOUT_ERROR'
  | 'INTERNAL_ERROR';

export interface PDFAPIError {
  error: string;
  code: PDFErrorCode;
  details?: string;
}

export interface TemplatePreferences {
  preferred_template: TemplateType;
  show_tutorial?: boolean;
}

/**
 * Type definitions for Job Description Library
 * Feature: F-007
 */

export interface SavedJobDescription {
  id: string;                      // UUID
  name: string;                    // User-defined name (e.g., "Comercial B2B", "Account Manager SaaS")
  tags: string[];                  // Tags for categorization (e.g., ["ventas", "tech", "remoto"])
  raw_text: string;                // Original job description text
  text_hash: string;               // Hash for deduplication
  analysis: JobAnalysis['analysis']; // Parsed analysis data
  created_at: string;              // ISO 8601 timestamp
  last_used_at: string;            // ISO 8601 timestamp (updated when used for adaptation)
}

export interface JobLibraryStats {
  total_saved: number;
  total_tags: number;
  most_recent: string | null;      // ISO 8601 timestamp
}

/**
 * Type definitions for Subscription System
 * Feature: F-009
 */

export type SubscriptionTier = 'free' | 'pro';

export type SubscriptionStatus =
  | 'active'
  | 'inactive'
  | 'trialing'
  | 'past_due'
  | 'cancelled';

export interface UserSubscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  mp_subscription_id: string | null;
  mp_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionUsage {
  user_id: string;
  period_start: string;
  adaptations_count: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  limits: {
    adaptations_per_month: number; // -1 = unlimited
  };
}

export type SubscriptionErrorCode =
  | 'UNAUTHORIZED'
  | 'SUBSCRIPTION_REQUIRED'
  | 'LIMIT_EXCEEDED'
  | 'PAYMENT_FAILED'
  | 'WEBHOOK_ERROR'
  | 'INTERNAL_ERROR';

export interface SubscriptionAPIError {
  error: string;
  code: SubscriptionErrorCode;
}
